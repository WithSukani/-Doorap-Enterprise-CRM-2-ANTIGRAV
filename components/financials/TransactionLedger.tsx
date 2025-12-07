import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

interface TransactionLedgerProps {
    transactions: any[];
    loading: boolean;
}

export function TransactionLedger({ transactions, loading }: TransactionLedgerProps) {
    const handleExport = () => {
        if (!transactions.length) return;

        const headers = ["Date", "Description", "Amount", "Currency", "Status", "Type"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + transactions.map(t => {
                const date = new Date(t.created * 1000).toISOString();
                const amount = (t.amount / 100).toFixed(2);
                return [date, `"${t.description || 'Transfer'}"`, amount, t.currency, t.status, t.type].join(",");
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "transactions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>All your money in and out</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} className="border-zinc-700 text-zinc-300">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-10 text-zinc-500">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">
                        No transactions found. Create a payment link to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-950/50 text-zinc-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-4 text-zinc-300">
                                            {new Date(t.created * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-white max-w-[200px] truncate">
                                            {t.description || 'Stripe Transfer'}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={t.amount > 0 ? "text-green-500 font-bold" : "text-white"}>
                                                {t.amount > 0 ? "+" : ""}
                                                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: t.currency.toUpperCase() }).format(t.amount / 100)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 capitalize">
                                                {t.status === 'pending' ? <Clock className="w-3 h-3 mr-1" /> : null}
                                                {t.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
