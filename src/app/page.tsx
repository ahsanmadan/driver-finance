import { getWallets, getTotalAssets, getRecentShifts } from "@/lib/queries";
import { WalletCard } from "@/components/WalletCard";
import { ShiftListItem } from "@/components/ShiftListItem";
import { TotalAssetHero } from "@/components/TotalAssetHero";
import { IncomeChart } from "@/components/IncomeChart";
import { AddWalletDialog } from "@/components/AddWalletDialog";
import { Separator } from "@/components/ui/separator";

// Optional: force dynamic rendering if we want fresh data every time
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [wallets, totalAssets, recentShifts] = await Promise.all([
    getWallets(),
    getTotalAssets(),
    getRecentShifts(7), // Fetch 7 for the chart
  ]);

  return (
    <div className="flex flex-col space-y-6 pt-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Halo, Kawan 👋</h1>
        <p className="text-muted-foreground text-sm">Semangat narik hari ini!</p>
      </div>

      {/* Total Asset Hero */}
      <TotalAssetHero totalAssets={totalAssets} />

      {/* Analytics Chart */}
      {recentShifts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-1">Statistik Pendapatan</h2>
          <p className="text-[11px] text-muted-foreground mb-2">7 shift terakhir</p>
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <IncomeChart shifts={recentShifts} />
          </div>
        </div>
      )}

      {/* Wallets Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Saldo Anda</h2>
          <AddWalletDialog />
        </div>
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        ) : (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-center">
            <p className="text-sm text-destructive font-medium">Gagal memuat saldo.</p>
            <p className="text-xs text-muted-foreground mt-1">Pastikan kredensial Supabase sudah benar.</p>
          </div>
        )}
      </div>

      <Separator className="my-2 opacity-50" />

      {/* Recent Shifts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Shift Terakhir</h2>
        </div>
        {recentShifts.length > 0 ? (
          <div className="flex flex-col">
            {recentShifts.slice(0, 5).map((shift) => (
              <ShiftListItem key={shift.id} shift={shift} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-6">
            Belum ada data shift.
          </p>
        )}
      </div>
    </div>
  );
}
