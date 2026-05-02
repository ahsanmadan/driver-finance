import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans" 
});

export const viewport: Viewport = {
  themeColor: "#EE4D2D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents zooming on inputs in iOS for native feel
  userScalable: false,
};

export const metadata: Metadata = {
  title: "DriverFinance",
  description: "Personal Finance Tracker for ShopeeFood Drivers",
  appleWebApp: {
    capable: true,
    title: "Driver",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${fontSans.variable} antialiased min-h-screen pb-32`}
      >
        <main className="max-w-md mx-auto p-4 min-h-screen pb-safe">
          {children}
        </main>
        <BottomNav />
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
