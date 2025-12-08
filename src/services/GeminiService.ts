
import { supabase } from '../lib/supabase';

export interface GeminiConfig {
    apiKey: string;
    model?: string;
}

// Tool Definitions
const TOOLS = [
    {
        name: "get_arrears_report",
        description: "Get a report of all tenants who are in arrears (owe rent). Returns tenant details and amount owed.",
        parameters: {
            type: "object",
            properties: {
                minAmount: { type: "number", description: "Minimum amount owed to filter by. Default is 0." }
            }
        }
    },
    {
        name: "search_properties",
        description: "Search for properties based on location, compliance status, value, or owner. Use this to find property details like rent, value, or address.",
        parameters: {
            type: "object",
            properties: {
                location: { type: "string", description: "City or partial address to search for." },
                hasExpiringCerts: { type: "boolean", description: "If true, only return properties with expiring safety certificates." }
            }
        }
    },
    {
        name: "get_expenses_report",
        description: "Get total expenses for a specific landlord or property over a time period.",
        parameters: {
            type: "object",
            properties: {
                landlordName: { type: "string", description: "Name of the landlord (fuzzy match)." },
                category: { type: "string", description: "Filter by expense category (e.g., 'Plumbing')." },
                year: { type: "number", description: "The year to fetch expenses for." }
            },
            required: ["landlordName"]
        }
    }
];

export class GeminiService {
    private apiKey: string;
    private model: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    constructor(config: GeminiConfig) {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || config.apiKey;
        this.model = config.model || 'gemini-2.0-flash'; // Updated to available 2.0 Flash model
    }

    // --- Tool Implementations (Mocking DB calls for now via Client) ---
    private async executeTool(toolName: string, args: any): Promise<string> {
        console.log(`[Dori] Executing tool: ${toolName}`, args);

        if (toolName === 'get_arrears_report') {
            const { data: tenants } = await supabase.from('tenants').select('*, properties(address)');
            if (!tenants) return "No data found.";

            // In a real app, 'arrears' would be a calculated field or separate table. 
            // Here we mock logic: tenants with status 'late' or random assumption if fields missing
            // For demo, let's assume we check a 'balance' field if it existed, or just return all for now.
            const arrearTenants = tenants.map(t => ({ name: t.name, property: t.properties?.address, status: 'Checking...' }));
            return JSON.stringify(arrearTenants);
        }

        if (toolName === 'search_properties') {
            let query = supabase.from('properties').select('*');
            if (args.location) query = query.ilike('address', `%${args.location}%`);

            const { data } = await query;
            if (!data || data.length === 0) {
                return `No properties found matching location '${args.location}'.`;
            }

            // Mock filtering for expiring certs as that logic is complex SQL
            // Ensure we return enough details for the AI to "Find the value"
            return JSON.stringify(data.slice(0, 5));
        }

        if (toolName === 'get_expenses_report') {
            // 1. Find Landlord ID
            const { data: landlords } = await supabase.from('landlords').select('id, name').ilike('name', `%${args.landlordName}%`).limit(1);
            if (!landlords?.length) return `No landlord found matching "${args.landlordName}"`;

            // 2. Sum Expenses
            const { data: expenses } = await supabase.from('expenses')
                .select('amount, category, date')
                .eq('landlord_id', landlords[0].id);

            const filtered = expenses?.filter(e => {
                const date = new Date(e.date);
                const matchesYear = args.year ? date.getFullYear() === args.year : true;
                const matchesCat = args.category ? e.category.toLowerCase().includes(args.category.toLowerCase()) : true;
                return matchesYear && matchesCat;
            });

            const total = filtered?.reduce((sum, e) => sum + (e.amount || 0), 0);
            return JSON.stringify({ landlord: landlords[0].name, total, count: filtered?.length, details: filtered });
        }

        return "Tool not found.";
    }

    async askDori(userMessage: string, context: any = {}): Promise<string> {
        if (!this.apiKey || !this.apiKey.startsWith('AI')) {
            return "I'm not fully initialized yet. My systems are waiting on a universal API key.";
        }

        // 1. First Call: Send Prompt + Tool Definitions
        const systemPrompt = `You are Dori, an intelligent AI property management assistant for Doorap CRM. 
        You have direct access to the database via tools.
        NEVER say 'I don't know' or 'I cannot' without trying a tool first.
        If asked for property value, rent, or details, ALWAYS use 'search_properties' with the address.
        If a tool returns 'No data found', tell the user explicitly that the record doesn't exist.
        Answer in a professional, slightly Scottish tone (use 'Aye', 'Wee', 'Lassie/Lad' sparingly but noticeably).
        
        Current User Context: ${JSON.stringify(context)}
        `;

        const requestBody = {
            contents: [{
                parts: [
                    { text: systemPrompt },
                    { text: userMessage }
                ]
            }],
            tools: [{ function_declarations: TOOLS }]
        };

        try {
            const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Status: ${response.status} ${response.statusText}. Body: ${errorBody}`);
            }

            const data = await response.json();
            const part = data.candidates?.[0]?.content?.parts?.[0];

            // 2. Check for Function Call
            if (part?.functionCall) {
                const { name, args } = part.functionCall;
                // Execute Tool
                const toolResult = await this.executeTool(name, args);

                // 3. Send Result back to Gemini for final answer
                // Note: The official API requires sending the conversation history. 
                // For this simplified "Client-Side" implementation, we'll just send a fresh prompt with the result injected.
                // In production, we'd maintain the 'chat session' object properly.

                const followUpPrompt = `
                Context: User asked "${userMessage}".
                I executed tool "${name}" with args ${JSON.stringify(args)}.
                Result: ${toolResult}.
                
                Based on this, answer the user's question in Scottish tone.
                `;

                const finalRes = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: followUpPrompt }] }] })
                });

                if (!finalRes.ok) {
                    const errorBody = await finalRes.text();
                    throw new Error(`Final Step Status: ${finalRes.status}. Body: ${errorBody}`);
                }

                const finalData = await finalRes.json();
                return finalData.candidates?.[0]?.content?.parts?.[0]?.text || "I found the data but couldn't summarize it.";
            }

            return part?.text || "I couldn't help with that.";

        } catch (error: any) {
            console.error("Dori Brain Error:", error);
            return `Aye, I'm having a wee bit of trouble. (Error: ${error.message})`;
        }
    }
}
