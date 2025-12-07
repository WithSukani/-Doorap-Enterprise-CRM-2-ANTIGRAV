import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Wallet, Plus, CheckCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface AccountCarouselProps {
    accounts: any[];
    selectedAccountId: string | null;
    onSelectAccount: (id: string | null) => void;
    onLinkAccount: () => void;
    linking: boolean;
}

export function AccountCarousel({ accounts, selectedAccountId, onSelectAccount, onLinkAccount, linking }: AccountCarouselProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Your Wallet & Accounts</h2>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectAccount(null)}
                        className={cn("text-xs", !selectedAccountId ? "bg-zinc-800 text-white" : "text-zinc-400")}
                    >
                        All Trans.
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {/* Add Account Card */}
                <Card
                    className="min-w-[280px] h-[160px] border-dashed border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 cursor-pointer transition-colors flex flex-col items-center justify-center snap-center"
                    onClick={onLinkAccount}
                >
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-zinc-400 font-medium">Link Bank Account</p>
                </Card>

                {/* Account Cards */}
                {accounts.map((acc) => (
                    <Card
                        key={acc.id}
                        onClick={() => onSelectAccount(acc.id)}
                        className={cn(
                            "min-w-[300px] h-[160px] border-zinc-800 bg-zinc-900/50 transition-all cursor-pointer snap-center relative overflow-hidden",
                            selectedAccountId === acc.id && "ring-2 ring-blue-500 bg-zinc-900"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-4">
                            {/* Logo placeholder or Type icon */}
                            <Building2 className="w-8 h-8 text-zinc-700 opacity-50" />
                        </div>

                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-white font-medium flex items-center gap-2">
                                {acc.institution_name}
                                {acc.status === 'active' && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                            </CardTitle>
                            <CardDescription>**** {acc.last4}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="mt-2">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Available Balance</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {acc.balance ?
                                        new Intl.NumberFormat('en-GB', { style: 'currency', currency: acc.balance.currency?.toUpperCase() || 'GBP' }).format((acc.balance.amount || 0) / 100)
                                        : '£ --'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
