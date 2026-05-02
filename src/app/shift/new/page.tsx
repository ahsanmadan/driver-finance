"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createShift } from "@/lib/queries";
import { formatRupiah, getTodayISO, parseIntSafe } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InputShiftPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState(getTodayISO());
  const [platform, setPlatform] = useState("ShopeeFood");
  const [grossIncomeStr, setGrossIncomeStr] = useState("");
  const [fuelExpenseStr, setFuelExpenseStr] = useState("");
  const [foodExpenseStr, setFoodExpenseStr] = useState("");
  const [parkingExpenseStr, setParkingExpenseStr] = useState("");
  const [maintenanceExpenseStr, setMaintenanceExpenseStr] = useState("");
  const [notes, setNotes] = useState("");

  const grossIncome = parseIntSafe(grossIncomeStr);
  const fuelExpense = parseIntSafe(fuelExpenseStr);
  const foodExpense = parseIntSafe(foodExpenseStr);
  const parkingExpense = parseIntSafe(parkingExpenseStr);
  const maintenanceExpense = parseIntSafe(maintenanceExpenseStr);

  const netIncome = grossIncome - fuelExpense - foodExpense - parkingExpense - maintenanceExpense;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error("Tanggal wajib diisi.");
      return;
    }
    if (!grossIncomeStr) {
      toast.error("Pendapatan Aplikasi tidak boleh kosong.");
      return;
    }
    if (!fuelExpenseStr) {
      toast.error("Pengeluaran Bensin tidak boleh kosong (isi 0 jika tidak ada).");
      return;
    }
    if (!foodExpenseStr) {
      toast.error("Pengeluaran Makan tidak boleh kosong (isi 0 jika tidak ada).");
      return;
    }
    if (!parkingExpenseStr) {
      toast.error("Pengeluaran Parkir tidak boleh kosong (isi 0 jika tidak ada).");
      return;
    }
    if (!maintenanceExpenseStr) {
      toast.error("Servis / Tambal Ban tidak boleh kosong (isi 0 jika tidak ada).");
      return;
    }
    if (grossIncome < 0 || fuelExpense < 0 || foodExpense < 0 || parkingExpense < 0 || maintenanceExpense < 0) {
      toast.error("Nominal tidak boleh bernilai negatif.");
      return;
    }

    startTransition(async () => {
      try {
        await createShift({
          date,
          platform,
          gross_income: grossIncome,
          fuel_expense: fuelExpense,
          food_expense: foodExpense,
          parking_expense: parkingExpense,
          maintenance_expense: maintenanceExpense,
          notes: notes.trim() !== "" ? notes.trim() : undefined,
        });
        
        toast.success("Shift berhasil disimpan!");
        router.push("/");
        router.refresh();
      } catch (error: any) {
        console.error("Failed to save shift", error);
        toast.error(error.message || "Gagal menyimpan shift.");
      }
    });
  };

  return (
    <div className="flex flex-col space-y-6 pt-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catat Shift</h1>
        <p className="text-muted-foreground text-sm">Masukkan detail pendapatan hari ini.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ShopeeFood">ShopeeFood</SelectItem>
                  <SelectItem value="Maxim">Maxim</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="grossIncome" className="text-zinc-300 font-medium">Pendapatan Aplikasi</Label>
              <Input
                id="grossIncome"
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 150000"
                value={grossIncomeStr}
                onChange={(e) => setGrossIncomeStr(e.target.value)}
              />
              {grossIncomeStr && (
                <p className="text-xs text-muted-foreground ml-1">{formatRupiah(grossIncome)}</p>
              )}
            </div>

            <Separator className="opacity-50 md:col-span-2" />

            <div className="space-y-2">
              <Label htmlFor="fuelExpense" className="text-zinc-300">Pengeluaran Bensin</Label>
              <Input
                id="fuelExpense"
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 20000"
                value={fuelExpenseStr}
                onChange={(e) => setFuelExpenseStr(e.target.value)}
              />
              {fuelExpenseStr && (
                <p className="text-xs text-muted-foreground ml-1">{formatRupiah(fuelExpense)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="foodExpense" className="text-zinc-300">Pengeluaran Makan</Label>
              <Input
                id="foodExpense"
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 15000"
                value={foodExpenseStr}
                onChange={(e) => setFoodExpenseStr(e.target.value)}
              />
              {foodExpenseStr && (
                <p className="text-xs text-muted-foreground ml-1">{formatRupiah(foodExpense)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parkingExpense" className="text-zinc-300">Pengeluaran Parkir</Label>
              <Input
                id="parkingExpense"
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 2000"
                value={parkingExpenseStr}
                onChange={(e) => setParkingExpenseStr(e.target.value)}
              />
              {parkingExpenseStr && (
                <p className="text-xs text-muted-foreground ml-1">{formatRupiah(parkingExpense)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceExpense" className="text-zinc-300">Servis / Tambal Ban</Label>
              <Input
                id="maintenanceExpense"
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 15000"
                value={maintenanceExpenseStr}
                onChange={(e) => setMaintenanceExpenseStr(e.target.value)}
              />
              {maintenanceExpenseStr && (
                <p className="text-xs text-muted-foreground ml-1">{formatRupiah(maintenanceExpense)}</p>
              )}
            </div>

            <Separator className="opacity-50 md:col-span-2" />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes" className="text-zinc-300">Catatan Tambahan (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Contoh: Makan Mie Gacoan, Ganti Oli..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none h-20"
              />
            </div>
            
            <div className="bg-primary text-primary-foreground border-none rounded-xl p-4 flex items-center justify-between md:col-span-2">
              <span className="font-medium text-primary-foreground/80">Pendapatan Bersih</span>
              <span className="text-2xl font-bold">{formatRupiah(netIncome)}</span>
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                className="w-full font-bold text-base h-12"
                disabled={isPending}
              >
                {isPending ? "Menyimpan..." : "Simpan Shift"}
              </Button>
            </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
