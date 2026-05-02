"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4 px-4 text-center">
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="flex flex-col items-center p-6 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Terjadi Kesalahan</h2>
            <p className="text-sm text-muted-foreground">
              Maaf, sistem tidak dapat memproses permintaan Anda saat ini. Pastikan koneksi database sudah diatur.
            </p>
          </div>
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            variant="outline"
            className="w-full mt-2"
          >
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
