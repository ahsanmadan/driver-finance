import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";

interface TotalAssetHeroProps {
  totalAssets: number;
}

export function TotalAssetHero({ totalAssets }: TotalAssetHeroProps) {
  return (
    <Card className="bg-primary text-primary-foreground border-none shadow-lg mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-primary-foreground/80">Total Aset Saat Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {formatRupiah(totalAssets)}
        </div>
      </CardContent>
    </Card>
  );
}
