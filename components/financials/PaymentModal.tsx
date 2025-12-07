import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Check } from "lucide-react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateLink: (data: { amount: number, description: string, type: 'one_time' | 'recurring', currency: string }) => Promise<void>;
}

export function PaymentModal({ isOpen, onClose, onCreateLink }: PaymentModalProps) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'one_time' | 'recurring'>('one_time');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onCreateLink({
                amount: parseFloat(amount),
                description,
                type,
                currency: 'gbp'
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-zinc-900">
                    <h2 className="text-xl font-semibold text-white">Create Payment Link</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setType('one_time')}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${type === 'one_time' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Single Payment
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('recurring')}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${type === 'recurring' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Recurring (Rent)
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Amount (GBP)</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 text-lg"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description / Reference</Label>
                        <Input
                            type="text"
                            placeholder="e.g. Rent Flat 4B"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-zinc-900 border-zinc-800"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 text-lg font-semibold"
                    >
                        {loading ? 'Creating...' : 'Generate Payment Link'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
