"use server";

import { Wallet, Shift, SavingGoal, PortfolioAsset, LiveAssetInfo } from "./types";
import { createClient } from "./supabase/server";
import yahooFinance from "yahoo-finance2";

// ==========================================
// QUERIES
// ==========================================

export async function getWallets(): Promise<Wallet[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching wallets:", error);
    return [];
  }
  return data || [];
}

export async function getTotalAssets(): Promise<number> {
  const wallets = await getWallets();
  return wallets.reduce((sum, w) => sum + w.balance, 0);
}

export async function getRecentShifts(limit: number = 5): Promise<Shift[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching shifts:", error);
    return [];
  }
  return data || [];
}

export async function getSavingGoals(): Promise<SavingGoal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saving_goals")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching saving goals:", error);
    return [];
  }
  return data || [];
}

// ==========================================
// MUTATIONS (Server Actions)
// ==========================================

export async function createWallet(name: string, initialBalance: number = 0): Promise<Wallet | null> {
  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("wallets")
    .insert([{ name, balance: initialBalance }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If there's an initial balance > 0, record it as a transaction
  if (initialBalance > 0 && inserted) {
    await supabase.from("transactions").insert([
      { wallet_id: inserted.id, type: "income", amount: initialBalance, description: "Saldo Awal" },
    ]);
  }

  return inserted;
}

export async function createShift(data: Omit<Shift, "id" | "net_income">): Promise<Shift | null> {
  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("shifts")
    .insert([
      {
        date: data.date,
        platform: data.platform,
        gross_income: data.gross_income,
        fuel_expense: data.fuel_expense,
        food_expense: data.food_expense,
        parking_expense: data.parking_expense,
        maintenance_expense: data.maintenance_expense,
        notes: data.notes,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return inserted;
}

export async function createCODTransaction(amount: number): Promise<void> {
  const supabase = await createClient();

  // 1. Get current wallets
  const { data: wallets, error: wError } = await supabase
    .from("wallets")
    .select("*")
    .in("name", ["Uang Cash", "ShopeePay"]);

  if (wError || !wallets) throw new Error("Gagal mengambil data dompet.");

  const cashWallet = wallets.find((w) => w.name === "Uang Cash");
  const spayWallet = wallets.find((w) => w.name === "ShopeePay");

  if (!cashWallet || !spayWallet) throw new Error("Dompet 'Uang Cash' atau 'ShopeePay' tidak ditemukan.");
  if (spayWallet.balance < amount) throw new Error("Saldo ShopeePay tidak mencukupi.");

  // 2. Update balances (Sequential for simplicity in single-user app)
  const { error: e1 } = await supabase
    .from("wallets")
    .update({ balance: spayWallet.balance - amount })
    .eq("id", spayWallet.id);
  if (e1) throw new Error("Gagal memotong saldo ShopeePay.");

  const { error: e2 } = await supabase
    .from("wallets")
    .update({ balance: cashWallet.balance + amount })
    .eq("id", cashWallet.id);
  if (e2) throw new Error("Gagal menambah saldo Uang Cash.");

  // 3. Record transactions
  const { error: tError } = await supabase.from("transactions").insert([
    { wallet_id: cashWallet.id, type: "income", amount, description: "Setor COD" },
    { wallet_id: spayWallet.id, type: "expense", amount, description: "Potongan COD" },
  ]);

  if (tError) console.error("Warning: Gagal mencatat log transaksi COD", tError);
}

export async function createTransfer(fromId: string, toId: string, amount: number, customDescription?: string): Promise<void> {
  const supabase = await createClient();

  // 1. Get wallets
  const { data: wallets, error: wError } = await supabase
    .from("wallets")
    .select("*")
    .in("id", [fromId, toId]);

  if (wError || !wallets || wallets.length !== 2) throw new Error("Gagal mengambil data dompet.");

  const fromWallet = wallets.find((w) => w.id === fromId);
  const toWallet = wallets.find((w) => w.id === toId);

  if (!fromWallet || !toWallet) throw new Error("Dompet tidak ditemukan.");
  if (fromWallet.balance < amount) throw new Error(`Saldo ${fromWallet.name} tidak mencukupi.`);

  // 2. Update balances
  const { error: e1 } = await supabase
    .from("wallets")
    .update({ balance: fromWallet.balance - amount })
    .eq("id", fromWallet.id);
  if (e1) throw new Error(`Gagal memotong saldo ${fromWallet.name}.`);

  const { error: e2 } = await supabase
    .from("wallets")
    .update({ balance: toWallet.balance + amount })
    .eq("id", toWallet.id);
  if (e2) throw new Error(`Gagal menambah saldo ${toWallet.name}.`);

  // 3. Record transactions
  const outDesc = customDescription ? customDescription : `Transfer ke ${toWallet.name}`;
  const inDesc = customDescription ? customDescription : `Transfer dari ${fromWallet.name}`;

  const { error: tError } = await supabase.from("transactions").insert([
    { wallet_id: fromWallet.id, type: "transfer", amount: -amount, description: outDesc },
    { wallet_id: toWallet.id, type: "transfer", amount: amount, description: inDesc },
  ]);

  if (tError) console.error("Warning: Gagal mencatat log transfer", tError);
}

export async function addFundToGoal(goalId: string, amount: number, sourceWalletId: string): Promise<void> {
  const supabase = await createClient();

  // 1. Get wallet and goal
  const { data: wallet, error: wError } = await supabase.from("wallets").select("*").eq("id", sourceWalletId).single();
  const { data: goal, error: gError } = await supabase.from("saving_goals").select("*").eq("id", goalId).single();

  if (wError || !wallet) throw new Error("Dompet sumber tidak ditemukan.");
  if (gError || !goal) throw new Error("Target tabungan tidak ditemukan.");
  if (wallet.balance < amount) throw new Error(`Saldo ${wallet.name} tidak mencukupi untuk ditabung.`);

  // 2. Deduct from wallet
  const { error: e1 } = await supabase
    .from("wallets")
    .update({ balance: wallet.balance - amount })
    .eq("id", wallet.id);
  if (e1) throw new Error(`Gagal memotong saldo ${wallet.name}.`);

  // 3. Add to saving goal
  const { error: e2 } = await supabase
    .from("saving_goals")
    .update({ current_amount: goal.current_amount + amount })
    .eq("id", goal.id);
  if (e2) throw new Error("Gagal menambah saldo tabungan.");

  // 4. Record transaction
  const { error: tError } = await supabase.from("transactions").insert([
    { wallet_id: wallet.id, type: "transfer", amount: -amount, description: `Nabung untuk: ${goal.title}` },
  ]);

  if (tError) console.error("Warning: Gagal mencatat log transaksi nabung", tError);
}

// ==========================================
// CRUD (Wallets & Shifts)
// ==========================================

export async function updateWallet(id: string, name: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wallets")
    .update({ name })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteWallet(id: string): Promise<void> {
  const supabase = await createClient();
  
  // 1. Check for existing transactions
  const { count, error: countError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("wallet_id", id);
    
  if (countError) throw new Error("Gagal mengecek riwayat transaksi dompet.");
  
  // Enforce data integrity
  if (count !== null && count > 0) {
    throw new Error("Penghapusan ditolak: Dompet ini memiliki riwayat transaksi.");
  }
  
  // 2. Delete wallet if no transactions exist
  const { error } = await supabase
    .from("wallets")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateShift(id: string, data: Omit<Shift, "id" | "net_income">): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shifts")
    .update({
      date: data.date,
      platform: data.platform,
      gross_income: data.gross_income,
      fuel_expense: data.fuel_expense,
      food_expense: data.food_expense,
      parking_expense: data.parking_expense,
      maintenance_expense: data.maintenance_expense,
      notes: data.notes,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteShift(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shifts")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ==========================================
// PORTFOLIO ASSETS (V3.0)
// ==========================================

export async function addPortfolioAsset(walletId: string, ticker: string, totalLot: number, averagePrice: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio_assets")
    .insert([
      {
        wallet_id: walletId,
        ticker: ticker.toUpperCase(),
        total_lot: totalLot,
        average_price: averagePrice,
      },
    ]);
  if (error) throw new Error(error.message);
}

export async function updateCustomLivePrice(assetId: string, customPrice: number | null): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio_assets")
    .update({ custom_live_price: customPrice })
    .eq("id", assetId);
  if (error) throw new Error(error.message);
}

export async function getLivePortfolio(): Promise<LiveAssetInfo[]> {
  const supabase = await createClient();
  const { data: assets, error } = await supabase
    .from("portfolio_assets")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !assets) {
    console.error("Error fetching portfolio assets:", error);
    return [];
  }

  const livePortfolio: LiveAssetInfo[] = [];

  for (const asset of assets) {
    let livePrice = asset.average_price;

    if (asset.custom_live_price !== null && asset.custom_live_price !== undefined) {
      // Use Manual Override
      livePrice = asset.custom_live_price;
    } else {
      // Fetch from API
      try {
        const quote: any = await yahooFinance.quote(asset.ticker);
        livePrice = quote.regularMarketPrice || asset.average_price;
      } catch (err) {
        console.error(`Error fetching live data for ${asset.ticker}:`, err);
        // Fallback to average price (already set above)
      }
    }

    // Option B Logic: If .JK, multiply lot by 100
    const isIDX = asset.ticker.endsWith(".JK");
    const multiplier = isIDX ? 100 : 1;
    const totalUnits = asset.total_lot * multiplier;

    const totalValue = livePrice * totalUnits;
    const totalInvested = asset.average_price * totalUnits;
    
    const pnlAmount = totalValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? (pnlAmount / totalInvested) * 100 : 0;

    livePortfolio.push({
      ...asset,
      livePrice,
      totalValue,
      pnlAmount,
      pnlPercentage,
    });
  }

  return livePortfolio;
}
