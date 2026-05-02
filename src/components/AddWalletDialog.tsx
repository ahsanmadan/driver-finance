"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createWallet } from "@/lib/queries";
import { parseIntSafe } from "@/lib/format";

export function AddWalletDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [initialBalanceStr, setInitialBalanceStr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama dompet/bank wajib diisi.");
      return;
    }

    const initialBalance = parseIntSafe(initialBalanceStr);
    if (initialBalance < 0) {
      toast.error("Saldo awal tidak boleh negatif.");
      return;
    }

    startTransition(async () => {
      try {
        await createWallet(name.trim(), initialBalance);
        toast.success(`Dompet ${name} berhasil ditambahkan!`);
        
        // Reset form & close dialog
        setName("");
        setInitialBalanceStr("");
        setOpen(false);
        
        // Refresh the page to fetch new wallets
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Gagal menambahkan dompet.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-dashed border-primary/50 hover:border-primary">
          <Plus className="h-3 w-3 mr-1" />
          Tambah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Dompet / Bank</DialogTitle>
          <DialogDescription>
            Masukkan nama bank atau e-wallet baru beserta saldo awalnya.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Dompet / Bank</Label>
            <Input
              id="name"
              placeholder="Contoh: Bank Mandiri, DANA, BSI..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialBalance">Saldo Awal</Label>
            <Input
              id="initialBalance"
              type="number"
              inputMode="numeric"
              placeholder="Contoh: 150000"
              value={initialBalanceStr}
              onChange={(e) => setInitialBalanceStr(e.target.value)}
              className="bg-background"
            />
            <p className="text-[11px] text-muted-foreground">Kosongkan jika saldo awal 0.</p>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isPending || !name.trim()} className="w-full">
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
