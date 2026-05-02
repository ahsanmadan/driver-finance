"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

import { Shift } from "@/lib/types";
import { formatDateShort, formatRupiah, parseIntSafe } from "@/lib/format";
import { updateShift, deleteShift } from "@/lib/queries";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface ShiftListItemProps {
  shift: Shift;
}

export function ShiftListItem({ shift }: ShiftListItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit State
  const [date, setDate] = useState(shift.date);
  const [platform, setPlatform] = useState(shift.platform || "ShopeeFood");
  const [grossIncomeStr, setGrossIncomeStr] = useState(shift.gross_income.toString());
  const [fuelExpenseStr, setFuelExpenseStr] = useState(shift.fuel_expense.toString());
  const [foodExpenseStr, setFoodExpenseStr] = useState(shift.food_expense.toString());
  const [parkingExpenseStr, setParkingExpenseStr] = useState((shift.parking_expense || 0).toString());
  const [maintenanceExpenseStr, setMaintenanceExpenseStr] = useState((shift.maintenance_expense || 0).toString());

  const grossIncome = parseIntSafe(grossIncomeStr);
  const fuelExpense = parseIntSafe(fuelExpenseStr);
  const foodExpense = parseIntSafe(foodExpenseStr);
  const parkingExpense = parseIntSafe(parkingExpenseStr);
  const maintenanceExpense = parseIntSafe(maintenanceExpenseStr);
  const newNetIncome = grossIncome - fuelExpense - foodExpense - parkingExpense - maintenanceExpense;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grossIncome < 0 || fuelExpense < 0 || foodExpense < 0 || parkingExpense < 0 || maintenanceExpense < 0) {
      toast.error("Nominal tidak boleh negatif.");
      return;
    }

    startTransition(async () => {
      try {
        await updateShift(shift.id, {
          date,
          platform,
          gross_income: grossIncome,
          fuel_expense: fuelExpense,
          food_expense: foodExpense,
          parking_expense: parkingExpense,
          maintenance_expense: maintenanceExpense,
        });
        toast.success("Data shift berhasil diperbarui.");
        setIsEditDialogOpen(false);
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Gagal memperbarui shift.");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteShift(shift.id);
        toast.success("Data shift berhasil dihapus.");
        setIsDeleteDialogOpen(false);
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Gagal menghapus shift.");
      }
    });
  };

  return (
    <>
      <Card className="mb-3 bg-card/50 relative group">
        <CardContent className="p-4 flex items-center justify-between">
          
          <div className="absolute top-2 right-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  <span>Edit Data</span>
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

          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{formatDateShort(shift.date)}</span>
              {shift.platform && shift.platform !== "ShopeeFood" && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">{shift.platform}</Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30 px-1 py-0 h-4">
                Bensin: {formatRupiah(shift.fuel_expense)}
              </Badge>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30 px-1 py-0 h-4">
                Makan: {formatRupiah(shift.food_expense)}
              </Badge>
            </div>
          </div>
          <div className="text-right pr-6">
            <span className="text-xs text-muted-foreground block mb-0.5">Pendapatan Bersih</span>
            <span className="text-sm font-bold text-primary">{formatRupiah(shift.net_income)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Shift</DialogTitle>
            <DialogDescription>
              Ubah data pendapatan atau pengeluaran untuk shift ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ShopeeFood">ShopeeFood</SelectItem>
                    <SelectItem value="Maxim">Maxim</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pendapatan Kotor</Label>
              <Input type="number" value={grossIncomeStr} onChange={(e) => setGrossIncomeStr(e.target.value)} required />
            </div>
            
            <Separator className="opacity-50" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] text-orange-500">Bensin</Label>
                <Input type="number" value={fuelExpenseStr} onChange={(e) => setFuelExpenseStr(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] text-orange-500">Makan</Label>
                <Input type="number" value={foodExpenseStr} onChange={(e) => setFoodExpenseStr(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] text-orange-500">Parkir</Label>
                <Input type="number" value={parkingExpenseStr} onChange={(e) => setParkingExpenseStr(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] text-orange-500">Servis</Label>
                <Input type="number" value={maintenanceExpenseStr} onChange={(e) => setMaintenanceExpenseStr(e.target.value)} required />
              </div>
            </div>

            <div className="bg-primary/10 p-3 rounded-md flex justify-between items-center mt-2">
              <span className="text-sm font-medium">Net Income Baru:</span>
              <span className="text-lg font-bold text-primary">{formatRupiah(newNetIncome)}</span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isPending} className="w-full">
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
            <AlertDialogTitle>Hapus Data Shift?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data shift pada tanggal {formatDateShort(shift.date)}?
              Tindakan ini permanen dan akan mempengaruhi grafik statistik Anda.
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
