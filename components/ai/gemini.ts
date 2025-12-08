
import { GoogleGenAI, Type } from "@google/genai";
import { Tenant, CrmData, DocumentTemplate, Property, UserProfile, MarketAnalysis } from '../../types';

// Utility to convert file to base64
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const leaseSchema = {
    type: Type.OBJECT,
    properties: {
        tenantName: {
            type: Type.STRING,
            description: "The full name of the primary tenant.",
        },
        leaseStartDate: {
            type: Type.STRING,
            description: "The start date of the lease in YYYY-MM-DD format.",
        },
        leaseEndDate: {
            type: Type.STRING,
            description: "The end date of the lease in YYYY-MM-DD format. If not found, this can be omitted.",
        },
        rentAmount: {
            type: Type.NUMBER,
            description: "The monthly rent amount as a number, without currency symbols.",
        },
        securityDeposit: {
            type: Type.NUMBER,
            description: "The security deposit amount as a number, without currency symbols. If not found, this can be omitted.",
        },
    },
    required: ["tenantName", "leaseStartDate", "rentAmount"],
};


export const extractLeaseDetailsFromFile = async (file: File): Promise<Partial<Tenant>> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY environment variable not set.");
        throw new Error("AI features are not configured. Please contact support.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const filePart = await fileToGenerativePart(file);
    const prompt = "Analyze the provided lease agreement document (which could be an image, PDF, or Word document) and extract the tenant's name, lease start date, lease end date, monthly rent amount, and security deposit amount. Format the output as JSON according to the provided schema.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, filePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: leaseSchema,
            }
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);

        // Map the parsed JSON to the Tenant partial type
        const tenantData: Partial<Tenant> = {
            name: parsedJson.tenantName,
            leaseStartDate: parsedJson.leaseStartDate,
            leaseEndDate: parsedJson.leaseEndDate,
            rentAmount: parsedJson.rentAmount,
            securityDeposit: parsedJson.securityDeposit,
        };

        return tenantData;

    } catch (error) {
        console.error("Error extracting lease details from Gemini:", error);
        throw new Error("Failed to analyze the document. The document might be unclear or the format not recognized. Please try a clearer file or enter the information manually.");
    }
}

export const queryCrmData = async (
    query: string,
    crmData: CrmData,
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY environment variable not set.");
        throw new Error("AI features are not configured. Please contact support.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = "You are an expert AI assistant for the 'Doorap' property management platform. Analyze the provided comprehensive CRM data (in JSON format) to answer the user's question. Provide concise, natural language answers. Do not return JSON or code.";

    // Clean data to remove large, unnecessary fields and save tokens
    const cleanCrmData: Partial<CrmData> = {
        ...crmData,
        properties: crmData.properties.map(({ imageUrl, customFieldValues, ...p }) => p),
        tenants: crmData.tenants.map(({ avatarUrl, customFieldValues, ...t }) => t),
        documents: crmData.documents.map(({ fileUrl, content, ...d }) => d) // Remove potentially long fields
    };


    const dataContext = `
    Here is the complete CRM data for the portfolio:
    ${JSON.stringify(cleanCrmData, null, 2)}
  `;

    const userPrompt = `
    Based on the data provided, please answer the following question: "${query}"
  `;

    const fullPrompt = `${dataContext}\n\n${userPrompt}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;

    } catch (error) {
        console.error("Error querying CRM data from Gemini:", error);
        throw new Error("Failed to get insights from AI. The model may be busy or the query could not be processed. Please try again later.");
    }
};

export const generateVacancyDescription = async (keywords: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("AI features are not configured.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a compelling and professional property listing description for a rental property. Use the following keywords and features to craft the description: "${keywords}". The description should be engaging for potential tenants and highlight the best features. Do not use markdown or special formatting.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating vacancy description from Gemini:", error);
        throw new Error("Failed to generate description. Please try again.");
    }
};

export const generateDocumentFromTemplate = async (
    template: DocumentTemplate,
    context: {
        tenant?: Tenant;
        property?: Property;
        userProfile?: UserProfile;
    }
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("AI features are not configured.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = "You are an AI assistant that populates document templates. You will be given a template with placeholders like {{PLACEHOLDER}} and a JSON object with context data. Your task is to replace the placeholders with the correct data from the context. If a piece of data is missing from the context for a placeholder, replace the placeholder with 'N/A'. IMPORTANT: Return the FULL, EXPANDED document. Do not summarize. Do not truncate. The output must be the complete legal or professional document text ready for use.";

    const prompt = `
        Here is the document template:
        ---
        ${template.content}
        ---

        Here is the context data in JSON format:
        ---
        ${JSON.stringify(context, null, 2)}
        ---

        Please populate the template with the provided data and return the full document.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating document from Gemini:", error);
        throw new Error("Failed to generate the document. Please try again.");
    }
};


const templateGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        templateName: {
            type: Type.STRING,
            description: "A short, descriptive name for the document template.",
        },
        category: {
            type: Type.STRING,
            description: "A suitable category for this template, like 'Lease', 'Notice', 'Welcome', or 'Inspection'.",
        },
        content: {
            type: Type.STRING,
            description: "The full text content of the document template, including appropriate placeholders like {{TENANT_NAME}}, {{PROPERTY_ADDRESS}}, {{RENT_AMOUNT}}, {{USER_NAME}}, etc."
        }
    },
    required: ["templateName", "category", "content"],
}

export const generateDocumentTemplate = async (description: string): Promise<Partial<DocumentTemplate>> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("AI features are not configured.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = "You are an expert AI assistant that creates professional document templates for property managers. Based on the user's request, generate a document template. You must include common, relevant placeholders in double curly braces, e.g., {{TENANT_NAME}}, {{PROPERTY_ADDRESS}}, {{RENT_AMOUNT}}, {{USER_NAME}}, {{USER_COMPANY}}. Format the output as JSON according to the provided schema.";

    const prompt = `Generate a document template based on the following description: "${description}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: templateGenerationSchema,
                systemInstruction: systemInstruction,
            }
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        return parsedJson;

    } catch (error) {
        console.error("Error generating document template from Gemini:", error);
        throw new Error("Failed to generate the template. Please try again or rephrase your request.");
    }
};

const marketAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        estimatedSalePrice: {
            type: Type.NUMBER,
            description: "The estimated current market sale price for the property in GBP.",
        },
        estimatedAverageRent: {
            type: Type.NUMBER,
            description: "The estimated average monthly rent for a similar property in the same area in GBP.",
        },
        estimatedYieldPercentage: {
            type: Type.NUMBER,
            description: "The estimated annual rental yield as a percentage (e.g., 4.5)."
        },
        rentComparisonPercentage: {
            type: Type.NUMBER,
            description: "The percentage difference of the property's current rent compared to the market average. Positive if above average, negative if below. Omit if current rent is not provided or is zero."
        },
        marketTrendSummary: {
            type: Type.STRING,
            description: "A brief, 2-3 sentence summary of the current real estate market trends for the property's area (e.g., 'The rental market is strong with high demand...', 'Sales prices have seen a slight dip...')."
        },
        localMarketDemand: {
            type: Type.STRING,
            description: "The current rental demand in the area. Must be one of: 'Low', 'Medium', 'High'."
        },
        averageTimeToLetDays: {
            type: Type.NUMBER,
            description: "The average number of days a similar property is on the rental market before being let."
        },
        keyAmenities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 key local amenities or features that positively impact the property's value (e.g., 'Excellent transport links', 'Top-rated primary schools', 'Proximity to green spaces')."
        },
        investmentSummary: {
            type: Type.STRING,
            description: "A concise investment summary, covering 2-3 pros and cons for a potential buyer or landlord."
        },
        areaAnalysis: {
            type: Type.STRING,
            description: "A brief, 2-3 sentence analysis of the local area, mentioning key features like schools, transport, or amenities that affect property value."
        }
    },
    required: ["estimatedSalePrice", "estimatedAverageRent", "estimatedYieldPercentage", "marketTrendSummary", "localMarketDemand", "averageTimeToLetDays", "keyAmenities", "investmentSummary", "areaAnalysis"],
};

export const getMarketAnalysis = async (
    property: Property,
    tenants: Tenant[]
): Promise<MarketAnalysis> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("AI features are not configured.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const propertyTenants = tenants.filter(t => t.propertyId === property.id).map(t => ({ name: t.name, rentAmount: t.rentAmount }));
    const { customFieldValues, ...propertyDetails } = property; // Omit custom fields for brevity

    const systemInstruction = "You are an expert UK real estate investment analyst. Your responses must be based on realistic, current UK market data. Generate a deep and detailed market analysis for a potential investor based on the property data provided. The output must be a valid JSON object matching the provided schema exactly. Do not add extra explanations or text outside the JSON structure.";

    const prompt = `
        Please provide a deep market analysis for the following property, suitable for an investor. Include valuations, yield, market dynamics, local amenities, and an investment summary.
        Property Details: ${JSON.stringify(propertyDetails)}
        Current Tenants and Rent: ${JSON.stringify(propertyTenants)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: marketAnalysisSchema,
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as MarketAnalysis;

    } catch (error) {
        console.error("Error getting market analysis from Gemini:", error);
        throw new Error("Failed to generate market analysis. The model may be busy or the request could not be processed. Please try again.");
    }
};

const inventoryComparisonSchema = {
    type: Type.OBJECT,
    properties: {
        aiAssessment: {
            type: Type.STRING,
            description: "The categorization of the change in condition. Must be one of: 'Fair Wear', 'Tenant Damage', 'Landlord Responsibility'.",
        },
        deductionAmount: {
            type: Type.NUMBER,
            description: "Estimated deduction cost in GBP if applicable (e.g. 50). Return 0 if no deduction.",
        },
        reasoning: {
            type: Type.STRING,
            description: "A brief explanation for the assessment.",
        }
    },
    required: ["aiAssessment", "deductionAmount", "reasoning"],
};

export const compareInventoryItems = async (
    item: string,
    checkInCondition: string,
    checkOutCondition: string
): Promise<{ aiAssessment: string; deductionAmount: number; reasoning: string }> => {
    // Fallback if direct item comparison is used
    return { aiAssessment: 'Fair Wear', deductionAmount: 0, reasoning: 'Manual check recommended.' };
}

export const compareInventoryDocuments = async (
    checkInFile: File,
    checkOutFile: File
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("AI features are not configured.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const checkInPart = await fileToGenerativePart(checkInFile);
    const checkOutPart = await fileToGenerativePart(checkOutFile);

    const prompt = `
        You are a tenancy deposit adjudicator. I have provided two documents:
        1. The Check-In Inventory (Original state).
        2. The Check-Out Inventory (Current state).

        Please compare them thoroughly. Identify any differences in condition for items listed in both.
        Categorize each difference as 'Fair Wear and Tear' (no deduction) or 'Tenant Damage' (deduction applies) or 'Cleaning Required'.
        Provide a summary list of damages with estimated reasonable deduction costs (GBP).
        
        Format the response as a clear, readable Markdown report.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, checkInPart, checkOutPart] },
        });

        return response.text;

    } catch (error) {
        console.error("Error comparing inventory documents:", error);
        throw new Error("Failed to analyze documents. Please try again.");
    }
};

const emergencyChecklistSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
};

export const generateEmergencyChecklist = async (
    title: string,
    description: string
): Promise<string[]> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("AI features are not configured.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = "You are an expert property manager and safety officer. Your job is to provide a concise, actionable checklist of 3-5 immediate steps required to handle a specific property emergency. Focus on safety, compliance (UK laws like RIDDOR/Gas Safety), and limiting damage. Return ONLY a JSON array of strings.";

    const prompt = `
        Emergency Title: ${title}
        Description: ${description}

        Generate the recommended next steps checklist.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: emergencyChecklistSchema,
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as string[];

    } catch (error) {
        console.error("Error generating emergency checklist:", error);
        // Fallback checklist if AI fails
        return [
            "Ensure tenant safety immediately.",
            "Contact appropriate emergency services or contractors.",
            "Inform the landlord.",
            "Document the incident with photos/notes."
        ];
    }
};
