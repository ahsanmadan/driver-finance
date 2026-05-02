"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getWallets, createCODTransaction, createTransfer, getSavingGoals, addFundToGoal, getLivePortfolio, addPortfolioAsset, updateCustomLivePrice } from "@/lib/queries";
import { formatRupiah, parseIntSafe } from "@/lib/format";
import { Wallet, SavingGoal, LiveAssetInfo } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Plus, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  // Investasi State
  const [investSourceId, setInvestSourceId] = useState("");
  const [investAmountStr, setInvestAmountStr] = useState("");
  const [investNote, setInvestNote] = useState("");
  const investAmount = parseIntSafe(investAmountStr);

  // Portfolio State
  const [livePortfolio, setLivePortfolio] = useState<LiveAssetInfo[]>([]);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState("");
  const [newAssetLotStr, setNewAssetLotStr] = useState("");
  const [newAssetPriceStr, setNewAssetPriceStr] = useState("");
  
  const [isEditPriceOpen, setIsEditPriceOpen] = useState(false);
  const [editAssetId, setEditAssetId] = useState("");
  const [editPriceStr, setEditPriceStr] = useState("");
  
  const newAssetLot = parseFloat(newAssetLotStr) || 0;
  const newAssetPrice = parseFloat(newAssetPriceStr) || 0;

  const loadData = () => {
    getWallets().then(setWallets);
    getSavingGoals().then(setSavingGoals);
    getLivePortfolio().then(setLivePortfolio);
  };

  useEffect(() => {
    loadData();
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

  const handleInvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investSourceId) {
      toast.error("Silakan pilih dompet sumber dana.");
      return;
    }
    const investWallet = wallets.find((w) => w.name === "Portofolio Investasi");
    if (!investWallet) {
      toast.error("Dompet 'Portofolio Investasi' tidak ditemukan.");
      return;
    }
    if (investSourceId === investWallet.id) {
      toast.error("Dompet sumber tidak boleh Portofolio Investasi.");
      return;
    }
    if (!investAmountStr || investAmount <= 0) {
      toast.error("Nominal investasi tidak valid.");
      return;
    }
    if (!investNote.trim()) {
      toast.error("Catatan aset investasi wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        await createTransfer(investSourceId, investWallet.id, investAmount, investNote.trim());
        toast.success("Catatan portofolio berhasil ditambahkan!");
        setInvestAmountStr("");
        setInvestSourceId("");
        setInvestNote("");
        loadData();
        router.refresh();
      } catch (error: unknown) {
        toast.error((error as Error).message || "Gagal menyimpan investasi.");
      }
    });
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetTicker.trim()) return toast.error("Ticker wajib diisi.");
    if (newAssetLot <= 0) return toast.error("Lot tidak valid.");
    if (newAssetPrice <= 0) return toast.error("Harga tidak valid.");

    const investWallet = wallets.find((w) => w.name === "Portofolio Investasi");
    if (!investWallet) return toast.error("Dompet 'Portofolio Investasi' tidak ditemukan.");

    startTransition(async () => {
      try {
        await addPortfolioAsset(investWallet.id, newAssetTicker.trim(), newAssetLot, newAssetPrice);
        toast.success("Aset berhasil ditambahkan!");
        setIsAddAssetOpen(false);
        setNewAssetTicker("");
        setNewAssetLotStr("");
        setNewAssetPriceStr("");
        loadData();
        router.refresh();
      } catch (error: unknown) {
        toast.error((error as Error).message || "Gagal menambah aset.");
      }
    });
  };

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const customPrice = editPriceStr.trim() === "" ? null : parseFloat(editPriceStr);
        await updateCustomLivePrice(editAssetId, customPrice);
        toast.success(customPrice === null ? "Harga dikembalikan ke Auto API." : "Harga live manual berhasil diatur.");
        setIsEditPriceOpen(false);
        setEditAssetId("");
        setEditPriceStr("");
        loadData();
        router.refresh();
      } catch (error: unknown) {
        toast.error((error as Error).message || "Gagal mengupdate harga.");
      }
    });
  };

  const openEditPrice = (asset: LiveAssetInfo) => {
    setEditAssetId(asset.id);
    setEditPriceStr(asset.custom_live_price ? asset.custom_live_price.toString() : "");
    setIsEditPriceOpen(true);
  };

  const grandTotalValue = livePortfolio.reduce((sum, asset) => sum + asset.totalValue, 0);
  const grandTotalPnL = livePortfolio.reduce((sum, asset) => sum + asset.pnlAmount, 0);
  const isPnLPositive = grandTotalPnL >= 0;

  return (
    <div className="flex flex-col space-y-6 pt-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saldo & COD</h1>
        <p className="text-muted-foreground text-sm">Kelola perputaran uang tunai dan saldo.</p>
      </div>

      <Tabs defaultValue="cod" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 mb-6 bg-transparent">
          <TabsTrigger value="cod" className="flex-1 min-w-[80px] bg-card text-slate-400 data-[state=active]:bg-[#EE4D2D] data-[state=active]:text-white">COD</TabsTrigger>
          <TabsTrigger value="transfer" className="flex-1 min-w-[80px] bg-card text-slate-400 data-[state=active]:bg-[#EE4D2D] data-[state=active]:text-white">Transfer</TabsTrigger>
          <TabsTrigger value="tabungan" className="flex-1 min-w-[80px] bg-card text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Tabungan</TabsTrigger>
          <TabsTrigger value="investasi" className="flex-1 min-w-[80px] bg-card text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Investasi</TabsTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                  />
                  {goalAmountStr && (
                    <p className="text-xs text-muted-foreground ml-1">{formatRupiah(goalAmount)}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-[#EE4D2D] hover:bg-[#D74427] text-white" disabled={isPending || goalAmount <= 0}>
                  {isPending ? "Memproses..." : "Alokasikan Dana"}
                </Button>
              </form>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investasi" className="space-y-6">
          {/* Live Portfolio Display */}
          <Card className="bg-card/50 border-blue-500/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <CardHeader className="pb-4">
              <CardDescription>Live Portfolio Value</CardDescription>
              <CardTitle className="text-3xl tracking-tighter">{formatRupiah(grandTotalValue)}</CardTitle>
              {livePortfolio.length > 0 && (
                <div className={`text-sm font-semibold flex items-center space-x-1 ${isPnLPositive ? "text-emerald-500" : "text-rose-500"}`}>
                  {isPnLPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  <span>{formatRupiah(Math.abs(grandTotalPnL))} PnL</span>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Asset Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-300">Aset Anda</h3>
              <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                    <Plus className="h-4 w-4 mr-1" /> Tambah Aset
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Aset Baru</DialogTitle>
                    <DialogDescription>Masukkan detail pembelian aset untuk dilacak.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAsset} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticker">Ticker (Kode Emiten / Kripto)</Label>
                      <Input id="ticker" placeholder="BUMI.JK atau BTC-USD" value={newAssetTicker} onChange={(e) => setNewAssetTicker(e.target.value)} className="uppercase" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lot">Total Lot / Unit</Label>
                      <Input id="lot" type="number" step="any" placeholder="Contoh: 10 atau 0.5" value={newAssetLotStr} onChange={(e) => setNewAssetLotStr(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Harga Beli Rata-Rata (Avg)</Label>
                      <Input id="price" type="number" step="any" placeholder="Contoh: 150 atau 60000" value={newAssetPriceStr} onChange={(e) => setNewAssetPriceStr(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-[#EE4D2D] hover:bg-[#D74427] text-white" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan Aset"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditPriceOpen} onOpenChange={setIsEditPriceOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Override Harga Live</DialogTitle>
                    <DialogDescription>Masukkan harga manual jika API bermasalah. Kosongkan untuk kembali menggunakan Auto API (Yahoo Finance).</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdatePrice} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="manualPrice">Harga Live Manual (Rp)</Label>
                      <Input id="manualPrice" type="number" step="any" placeholder="Contoh: 1330" value={editPriceStr} onChange={(e) => setEditPriceStr(e.target.value)} />
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => { setEditPriceStr(""); handleUpdatePrice({ preventDefault: () => {} } as React.FormEvent); }} disabled={isPending}>
                        Reset ke Auto API
                      </Button>
                      <Button type="submit" className="bg-[#EE4D2D] hover:bg-[#D74427] text-white" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan Harga"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {livePortfolio.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-700 rounded-lg text-slate-500 text-sm">
                Belum ada aset. Tambahkan sekarang!
              </div>
            ) : (
              livePortfolio.map((asset) => {
                const pnlIsPositive = asset.pnlAmount >= 0;
                return (
                  <Card key={asset.id} className="bg-card/30 border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg leading-tight flex items-center">
                          {asset.ticker}
                          {asset.custom_live_price !== null && asset.custom_live_price !== undefined && (
                            <span className="ml-2 text-[10px] font-normal bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20">MANUAL</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{asset.total_lot} units • Avg {formatRupiah(asset.average_price)}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <p className="font-semibold">{formatRupiah(asset.livePrice)}</p>
                          <button onClick={() => openEditPrice(asset)} className="text-muted-foreground hover:text-white transition-colors" title="Override Harga">
                            <Edit2 size={12} />
                          </button>
                        </div>
                        <div className={`text-xs font-bold flex items-center justify-end space-x-1 ${pnlIsPositive ? "text-emerald-500" : "text-rose-500"}`}>
                          {pnlIsPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          <span>{formatRupiah(Math.abs(asset.pnlAmount))} ({Math.abs(asset.pnlPercentage).toFixed(2)}%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <Separator className="opacity-30" />

          {/* Existing Form */}
          <Card className="bg-card/20 border-slate-800 shadow-none">
            <CardHeader className="py-4">
              <CardTitle className="text-base text-slate-300">Setor Dana Cash</CardTitle>
              <CardDescription className="text-xs">
                Catat transfer dari dompet tunai/bank ke rekening RDN/Kripto Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Dari Wallet</Label>
                  <Select value={investSourceId} onValueChange={setInvestSourceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sumber dana" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.filter((w) => w.name !== "Portofolio Investasi").map((w) => (
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
                  <Input
                    disabled
                    value="📈 Portofolio Investasi"
                    className="opacity-70"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="investAmount">Nominal Investasi</Label>
                  <Input
                    id="investAmount"
                    type="number"
                    inputMode="numeric"
                    placeholder="Contoh: 1000000"
                    value={investAmountStr}
                    onChange={(e) => setInvestAmountStr(e.target.value)}
                  />
                  {investAmountStr && (
                    <p className="text-xs text-muted-foreground ml-1">{formatRupiah(investAmount)}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="investNote">Catatan Aset (Wajib)</Label>
                  <Input
                    id="investNote"
                    type="text"
                    placeholder="Contoh: Topup RDN Ajaib"
                    value={investNote}
                    onChange={(e) => setInvestNote(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full bg-[#EE4D2D] hover:bg-[#D74427] text-white" disabled={isPending || investAmount <= 0 || !investNote.trim()}>
                  {isPending ? "Memproses..." : "Catat Setoran"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
