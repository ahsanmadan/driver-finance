"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getWallets, createCODTransaction, createTransfer, getSavingGoals, addFundToGoal } from "@/lib/queries";
import { formatRupiah, parseIntSafe } from "@/lib/format";
import { Wallet, SavingGoal } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function TransactionsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);

  // COD State
  const [codAmountStr, setCodAmountStr] = useState("");
  const codAmount = parseIntSafe(codAmountStr);

  // Transfer State
  const [transferAmountStr, setTransferAmountStr] = useState("");
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const transferAmount = parseIntSafe(transferAmountStr);

  // Tabungan State
  const [goalAmountStr, setGoalAmountStr] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [sourceWalletId, setSourceWalletId] = useState("");
  const goalAmount = parseIntSafe(goalAmountStr);

  useEffect(() => {
    // Load wallets and goals on mount
    getWallets().then(setWallets);
    getSavingGoals().then(setSavingGoals);
  }, []);

  const handleCODSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codAmountStr) {
      toast.error("Nominal COD tidak boleh kosong.");
      return;
    }
    if (codAmount <= 0) {
      toast.error("Nominal COD harus lebih besar dari 0.");
      return;
    }

    startTransition(async () => {
      try {
        await createCODTransaction(codAmount);
        toast.success("Setor COD berhasil dicatat!");
        setCodAmountStr("");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Gagal mencatat COD.");
      }
    });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromWalletId) {
      toast.error("Silakan pilih dompet asal transfer.");
      return;
    }
    if (!toWalletId) {
      toast.error("Silakan pilih dompet tujuan transfer.");
      return;
    }
    if (fromWalletId === toWalletId) {
      toast.error("Dompet asal dan tujuan tidak boleh sama.");
      return;
    }
    if (!transferAmountStr) {
      toast.error("Nominal transfer tidak boleh kosong.");
      return;
    }
    if (transferAmount <= 0) {
      toast.error("Nominal transfer harus lebih besar dari 0.");
      return;
    }

    startTransition(async () => {
      try {
        await createTransfer(fromWalletId, toWalletId, transferAmount);
        toast.success("Transfer berhasil!");
        setTransferAmountStr("");
        setFromWalletId("");
        setToWalletId("");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Gagal melakukan transfer.");
      }
    });
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) {
      toast.error("Silakan pilih target tabungan.");
      return;
    }
    if (!sourceWalletId) {
      toast.error("Silakan pilih dompet sumber dana.");
      return;
    }
    if (!goalAmountStr || goalAmount <= 0) {
      toast.error("Nominal alokasi tidak valid.");
      return;
    }

    startTransition(async () => {
      try {
        await addFundToGoal(selectedGoalId, goalAmount, sourceWalletId);
        toast.success("Dana berhasil dialokasikan ke tabungan!");
        setGoalAmountStr("");
        setSelectedGoalId("");
        setSourceWalletId("");
        // Refresh local state to show progress instantly
        getSavingGoals().then(setSavingGoals);
        getWallets().then(setWallets);
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Gagal mengalokasikan dana.");
      }
    });
  };

  return (
    <div className="flex flex-col space-y-6 pt-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saldo & COD</h1>
        <p className="text-muted-foreground text-sm">Kelola perputaran uang tunai dan saldo.</p>
      </div>

      <Tabs defaultValue="cod" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="cod">Setor COD</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="tabungan">Tabungan</TabsTrigger>
        </TabsList>

        <TabsContent value="cod">
          <Card className="bg-card/50 border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg">Setor Uang COD</CardTitle>
              <CardDescription>
                Catat penerimaan cash dari customer. Ini akan menambah Uang Cash dan mengurangi ShopeePay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCODSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codAmount">Nominal COD</Label>
                  <Input
                    id="codAmount"
                    type="number"
                    inputMode="numeric"
                    placeholder="Contoh: 35000"
                    value={codAmountStr}
                    onChange={(e) => setCodAmountStr(e.target.value)}
                    className="bg-background"
                  />
                  {codAmountStr && (
                    <p className="text-xs text-muted-foreground ml-1">{formatRupiah(codAmount)}</p>
                  )}
                </div>

                {codAmount > 0 && (
                  <div className="bg-background p-3 rounded-md border flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-emerald-500">
                      <ArrowUp size={16} />
                      <span>Uang Cash</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-500">
                      <span>ShopeePay</span>
                      <ArrowDown size={16} />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isPending || codAmount <= 0}>
                  {isPending ? "Memproses..." : "Catat COD"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
          <Card className="bg-card/50 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-lg">Transfer Saldo</CardTitle>
              <CardDescription>
                Pindahkan dana antar wallet (contoh: setor tunai ke BCA).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Dari Wallet</Label>
                  <Select value={fromWalletId} onValueChange={setFromWalletId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Pilih sumber dana" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} ({formatRupiah(w.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center py-2 text-muted-foreground">
                  <ArrowDown size={20} />
                </div>

                <div className="space-y-2">
                  <Label>Ke Wallet</Label>
                  <Select value={toWalletId} onValueChange={setToWalletId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Pilih tujuan dana" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="transferAmount">Nominal Transfer</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    inputMode="numeric"
                    placeholder="Contoh: 100000"
                    value={transferAmountStr}
                    onChange={(e) => setTransferAmountStr(e.target.value)}
                    className="bg-background"
                  />
                  {transferAmountStr && (
                    <p className="text-xs text-muted-foreground ml-1">{formatRupiah(transferAmount)}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isPending || transferAmount <= 0}>
                  {isPending ? "Memproses..." : "Transfer Sekarang"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabungan">
          <Card className="bg-card/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-lg">Target Tabungan</CardTitle>
              <CardDescription>
                Alokasikan dana untuk servis motor atau tujuan lainnya.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Progress Visuals */}
              {savingGoals.length > 0 ? (
                <div className="space-y-4">
                  {savingGoals.map((goal) => {
                    const percentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{goal.title}</span>
                          <span className="text-purple-500 font-bold">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatRupiah(goal.current_amount)}</span>
                          <span>Target: {formatRupiah(goal.target_amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center italic">Belum ada target tabungan.</p>
              )}

              <Separator className="opacity-50" />

              {/* Allocate Form */}
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Pilih Target Tabungan</Label>
                  <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Pilih target" />
                    </SelectTrigger>
                    <SelectContent>
                      {savingGoals.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dari Wallet</Label>
                  <Select value={sourceWalletId} onValueChange={setSourceWalletId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Pilih dompet sumber dana" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} ({formatRupiah(w.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="goalAmount">Nominal Alokasi</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    inputMode="numeric"
                    placeholder="Contoh: 50000"
                    value={goalAmountStr}
                    onChange={(e) => setGoalAmountStr(e.target.value)}
                    className="bg-background"
                  />
                  {goalAmountStr && (
                    <p className="text-xs text-muted-foreground ml-1">{formatRupiah(goalAmount)}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isPending || goalAmount <= 0}>
                  {isPending ? "Memproses..." : "Alokasikan Dana"}
                </Button>
              </form>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
