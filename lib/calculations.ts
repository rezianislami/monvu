import { Asset, Goal, Liability } from "./types";

export function formatRupiah(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatCompactRupiah(amount: number): string {
  const abs = Math.abs(amount);
  let result: string;
  if (abs >= 1_000_000_000) {
    result = `Rp${(abs / 1_000_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000_000) {
    result = `Rp${(abs / 1_000_000).toFixed(1)}jt`;
  } else if (abs >= 1_000) {
    result = `Rp${(abs / 1_000).toFixed(0)}rb`;
  } else {
    result = `Rp${abs}`;
  }
  return amount < 0 ? `-${result}` : result;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  // Parse as local midnight to avoid timezone shifting the day.
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function calculateProfitLoss(asset: Asset): number {
  return asset.current_value - asset.purchase_value;
}

export function calculateReturn(asset: Asset): number {
  if (asset.purchase_value === 0) return 0;
  return ((asset.current_value - asset.purchase_value) / asset.purchase_value) * 100;
}

export function calculateTotalModal(assets: Asset[]): number {
  return assets.reduce((sum, a) => sum + a.purchase_value, 0);
}

export function calculateTotalCurrentValue(assets: Asset[]): number {
  return assets.reduce((sum, a) => sum + a.current_value, 0);
}

export function calculateTotalProfitLoss(assets: Asset[]): number {
  return calculateTotalCurrentValue(assets) - calculateTotalModal(assets);
}

export function calculateTotalReturn(assets: Asset[]): number {
  const modal = calculateTotalModal(assets);
  if (modal === 0) return 0;
  return ((calculateTotalCurrentValue(assets) - modal) / modal) * 100;
}

export function calculateNetWorth(assets: Asset[], liabilities: Liability[]): number {
  const totalAssets = calculateTotalCurrentValue(assets);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remaining_balance, 0);
  return totalAssets - totalLiabilities;
}

export function calculateGoalProgress(goal: Goal): number {
  if (goal.target_amount === 0) return 0;
  return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
}

export function calculateOverallGoalCompletion(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, g) => sum + calculateGoalProgress(g), 0);
  return totalProgress / goals.length;
}

export function calculateEmergencyFundCoverage(cashReserve: number, monthlyExpense: number): number {
  if (monthlyExpense === 0) return 0;
  return cashReserve / monthlyExpense;
}

export function calculateFINumber(monthlyExpense: number): number {
  return monthlyExpense * 12 * 25;
}

export function calculateGoalETA(goal: Goal): string {
  const remaining = goal.target_amount - goal.current_amount;
  if (remaining <= 0) return "Tercapai!";
  
  const targetDate = new Date(goal.target_date);
  const now = new Date();
  const monthsLeft = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
  
  if (monthsLeft <= 0) return "Lewat tenggat";
  if (monthsLeft <= 12) return `${monthsLeft} bulan`;
  const years = Math.floor(monthsLeft / 12);
  const months = monthsLeft % 12;
  return months > 0 ? `${years} thn ${months} bln` : `${years} tahun`;
}

// Progress scale recolored to the pink/purple theme: more pink = closer to goal.
// Required monthly saving to reach a goal by its target date.
// Returns null if already reached; if the deadline is now/past, returns the
// full remaining amount (i.e. needed immediately).
export function calculateRequiredMonthlySaving(goal: Goal): number | null {
  const remaining = goal.target_amount - goal.current_amount;
  if (remaining <= 0) return null;
  const target = new Date(goal.target_date);
  const now = new Date();
  const monthsLeft =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  if (monthsLeft <= 0) return remaining;
  return remaining / monthsLeft;
}

export function getProgressColor(progress: number): string {
  if (progress >= 75) return "text-pink-400";
  if (progress >= 50) return "text-fuchsia-400";
  if (progress >= 25) return "text-purple-400";
  return "text-violet-300";
}

export function getProgressBgColor(progress: number): string {
  if (progress >= 75) return "bg-pink-400";
  if (progress >= 50) return "bg-fuchsia-400";
  if (progress >= 25) return "bg-purple-400";
  return "bg-violet-300";
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    gold: "Emas",
    stock: "Saham",
    money_market: "Pasar Uang",
    obligasi: "Obligasi",
    custom: "Custom",
  };
  return labels[category] || category;
}

// Effective label for display: custom assets show their user-typed label.
export function getEffectiveCategoryLabel(
  category: string,
  customCategory?: string | null
): string {
  if (category === "custom") return customCategory?.trim() || "Custom";
  return getCategoryLabel(category);
}

export function getCategoryColor(category: string): string {
  // Pink/purple girly palette.
  const colors: Record<string, string> = {
    gold: "#f0abfc", // fuchsia-300
    stock: "#ec4899", // pink-500
    money_market: "#a78bfa", // violet-400
    obligasi: "#d946ef", // fuchsia-500
    custom: "#f472b6", // pink-400
  };
  return colors[category] || "#9ca3af";
}

export function projectGrowth(
  currentValue: number,
  monthlyContribution: number,
  annualReturnRate: number,
  years: number
): { month: number; value: number }[] {
  const monthlyRate = annualReturnRate / 100 / 12;
  const data: { month: number; value: number }[] = [];
  let value = currentValue;

  for (let month = 0; month <= years * 12; month++) {
    data.push({ month, value: Math.round(value) });
    value = value * (1 + monthlyRate) + monthlyContribution;
  }

  return data;
}
