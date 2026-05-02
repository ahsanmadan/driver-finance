"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { WALLET_ICONS, WALLET_COLORS, Wallet } from "@/lib/types";
import { cn } from "@/lib/utils";
import { updateWallet, deleteWallet } from "@/lib/queries";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Edit state
  const [editName, setEditName] = useState(wallet.name);

  const icon = WALLET_ICONS[wallet.name] || "🏦";
  const colorClass = WALLET_COLORS[wallet.name] || "from-slate-500/20 to-slate-600/5 border-slate-500/20";

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Nama dompet tidak boleh kosong.");
      return;
    }

    startTransition(async () => {
      try {
        await updateWallet(wallet.id, editName.trim());
        toast.success("Dompet berhasil diperbarui.");
        setIsEditDialogOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Gagal memperbarui dompet.");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteWallet(wallet.id);
        toast.success("Dompet berhasil dihapus.");
        setIsDeleteDialogOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Gagal menghapus dompet.");
      }
    });
  };

  return (
    <>
      <Card className={cn("relative overflow-hidden border bg-gradient-to-br", colorClass)}>
        <CardContent className="px-2 py-3">
          
          {/* Dropdown Menu */}
          <div className="absolute top-1 right-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  <span>Edit Nama</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Hapus</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex flex-col space-y-1">
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[11px] font-medium text-muted-foreground leading-tight line-clamp-2 pr-4">{wallet.name}</span>
            </div>
            <p className="text-[13px] font-extrabold tracking-tight">{formatRupiah(wallet.balance)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Dompet</DialogTitle>
            <DialogDescription>
              Ubah nama dompet. Saldo hanya dapat diubah melalui transaksi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nama Dompet</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-background"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending || !editName.trim()} className="w-full">
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dompet Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus dompet &quot;{wallet.name}&quot;?
              Tindakan ini tidak dapat dibatalkan. Penghapusan akan ditolak jika dompet ini memiliki riwayat transaksi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
