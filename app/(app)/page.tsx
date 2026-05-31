"use client";

import { useTheme } from "next-themes";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  formatRupiah,
  formatCompactRupiah,
  calculateTotalModal,
  calculateTotalCurrentValue,
  calculateTotalProfitLoss,
  calculateTotalReturn,
  calculateNetWorth,
  calculateOverallGoalCompletion,
  calculateGoalProgress,
  calculateGoalETA,
  calculateRequiredMonthlySaving,
  getEffectiveCategoryLabel,
  calculateProfitLoss,
  calculateReturn,
} from "@/lib/calculations";
import { useData } from "@/lib/data-store";
import type { Asset } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

// Hex for recharts only (charts render client-side → safe to be theme-computed).
const PINK = "#FF2D78";
const GREEN = "#00E5A0";
const YELLOW = "#FFE600";
const EXTRA = "#C026D3";

// CSS-var strings for DOM inline styles — identical on server & client (resolve
// per theme via CSS), so they never cause a hydration mismatch.
const V_PINK = "var(--nb-pink)";
const V_PURPLE = "var(--nb-purple)";
const V_GREEN = "var(--nb-green)";
const V_YELLOW = "var(--nb-yellow)";
const V_SERIES = [V_PINK, V_PURPLE, V_GREEN, V_YELLOW, EXTRA];

const card = "nb-card p-4 sm:p-5";
const label = "font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--nb-text-muted)]";
const heading = "font-display text-base font-bold uppercase";

function getAllocationData(assets: Asset[]) {
  const groups = new Map<string, number>();
  for (const a of assets) {
    const lbl = getEffectiveCategoryLabel(a.category, a.custom_category);
    groups.set(lbl, (groups.get(lbl) ?? 0) + a.current_value);
  }
  return [...groups.entries()]
    .map(([name, value], i) => ({ name, value, idx: i }))
    .filter((d) => d.value > 0);
}

export default function DashboardPage() {
  const { assets, goals } = useData();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";

  const PURPLE = dark ? "#A855F7" : "#7B00FF";
  const MUTED = dark ? "#C9A0FF" : "#5a3a7a";
  const BORDER = dark ? "#CC99FF" : "#1a0030";
  const HEX_SERIES = [PINK, PURPLE, GREEN, YELLOW, EXTRA]; // recharts cells

  const totalModal = calculateTotalModal(assets);
  const totalCurrentValue = calculateTotalCurrentValue(assets);
  const totalProfitLoss = calculateTotalProfitLoss(assets);
  const totalReturn = calculateTotalReturn(assets);
  const netWorth = calculateNetWorth(assets, []);
  const goalCompletion = calculateOverallGoalCompletion(goals);
  const allocationData = getAllocationData(assets);

  const plByCategory = (() => {
    const m = new Map<string, number>();
    for (const a of assets) {
      const lbl = getEffectiveCategoryLabel(a.category, a.custom_category);
      m.set(lbl, (m.get(lbl) ?? 0) + (a.current_value - a.purchase_value));
    }
    return [...m.entries()].map(([name, pl]) => ({ name, pl }));
  })();

  const ranked = [...assets].map((a) => ({ asset: a, ret: calculateReturn(a) })).sort((x, y) => y.ret - x.ret);
  const gainers = ranked.filter((r) => r.ret > 0).slice(0, 3);
  const losers = ranked.filter((r) => r.ret < 0).slice(-3).reverse();

  const kpis = [
    { title: "Total Modal", value: formatRupiah(totalModal), accent: V_PURPLE },
    { title: "Nilai Saat Ini", value: formatRupiah(totalCurrentValue), accent: V_PINK },
    {
      title: "Profit / Loss",
      value: `${totalProfitLoss >= 0 ? "+" : ""}${formatRupiah(totalProfitLoss)}`,
      accent: totalProfitLoss >= 0 ? V_GREEN : V_PINK,
      badge: `${totalReturn >= 0 ? "↑" : "↓"} ${Math.abs(totalReturn).toFixed(1)}%`,
      up: totalProfitLoss >= 0,
    },
    {
      title: "Return",
      value: `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%`,
      accent: totalReturn >= 0 ? V_GREEN : V_PINK,
    },
    { title: "Net Worth", value: formatRupiah(netWorth), accent: V_PURPLE },
    { title: "Pencapaian Target", value: `${goalCompletion.toFixed(0)}%`, accent: V_YELLOW },
  ];

  const axisTick = { fill: MUTED, fontSize: 11, fontFamily: "var(--font-space-mono)" };

  // Brutalist recharts tooltip.
  const tip = (l: string, v: string, color: string) => (
    <div className="nb-card !shadow-[3px_3px_0_0_var(--nb-shadow)] px-3 py-2">
      <p className="font-mono text-[11px] font-bold uppercase text-[var(--nb-text)]">{l}</p>
      <p className="font-mono text-xs font-bold" style={{ color }}>{v}</p>
    </div>
  );

  const empty = (text: string) => (
    <p className="py-8 text-center font-mono text-xs font-bold uppercase tracking-widest text-[var(--nb-text-muted)]">
      {text}
    </p>
  );

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">Dashboard</h1>
        <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--nb-text-muted)]">
          Ringkasan Portofolio
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <div key={k.title} className={`${card} nb-press border-t-[5px]`} style={{ borderTopColor: k.accent }}>
            <p className={`${label} mb-2`}>{k.title}</p>
            <p className="font-display text-base sm:text-xl font-bold leading-tight break-words">{k.value}</p>
            {k.badge && (
              <span
                className="mt-2 inline-block rounded-full border-2 border-[var(--nb-border)] px-2 py-0.5 font-mono text-[10px] font-bold"
                style={k.up ? { background: GREEN, color: "#003322" } : { background: PINK, color: "#fff" }}
              >
                {k.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Allocation */}
        <div className={card}>
          <h2 className={`${heading} mb-3`}>Alokasi Aset</h2>
          {allocationData.length === 0 ? (
            empty("Belum ada aset")
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={92}
                    dataKey="value"
                    stroke={BORDER}
                    strokeWidth={2.5}
                  >
                    {allocationData.map((e) => (
                      <Cell key={e.idx} fill={HEX_SERIES[e.idx % HEX_SERIES.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) =>
                      active && payload?.length
                        ? tip(
                            String(payload[0].name),
                            formatRupiah(payload[0].value as number),
                            HEX_SERIES[(payload[0].payload.idx as number) % HEX_SERIES.length]
                          )
                        : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid w-full grid-cols-1 sm:grid-cols-2 gap-2">
                {allocationData.map((item) => {
                  const pct = totalCurrentValue > 0 ? ((item.value / totalCurrentValue) * 100).toFixed(1) : "0.0";
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 rounded-full border-2 border-[var(--nb-border)] px-2.5 py-1 font-mono text-[11px] font-bold"
                    >
                      <span className="h-3 w-3 shrink-0 rounded-full border-2 border-[var(--nb-border)]" style={{ background: V_SERIES[item.idx % V_SERIES.length] }} />
                      <span className="truncate uppercase" title={item.name}>{item.name}</span>
                      <span className="ml-auto">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* P/L per category */}
        <div className={card}>
          <h2 className={`${heading} mb-3`}>Profit/Loss per Kategori</h2>
          {assets.length === 0 ? (
            empty("Belum ada aset")
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={plByCategory} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="0" stroke={MUTED} strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="name" axisLine={{ stroke: BORDER, strokeWidth: 2 }} tickLine={false} tick={axisTick} />
                <YAxis
                  axisLine={{ stroke: BORDER, strokeWidth: 2 }}
                  tickLine={false}
                  tick={axisTick}
                  width={56}
                  tickFormatter={(v) => formatCompactRupiah(v as number)}
                />
                <RechartsTooltip
                  cursor={{ fill: MUTED, fillOpacity: 0.12 }}
                  content={({ active, payload, label: l }) => {
                    if (!active || !payload?.length) return null;
                    const v = payload[0].value as number;
                    return tip(String(l), `${v >= 0 ? "+" : ""}${formatRupiah(v)}`, v >= 0 ? GREEN : PINK);
                  }}
                />
                <Bar dataKey="pl" stroke={BORDER} strokeWidth={2}>
                  {plByCategory.map((d, i) => (
                    <Cell key={i} fill={d.pl >= 0 ? GREEN : PINK} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top performers */}
      <div className={card}>
        <h2 className={`${heading} mb-3`}>Performa Teratas</h2>
        {assets.length === 0 ? (
          empty("Belum ada aset")
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { title: "Naik", icon: TrendingUp, color: GREEN, rows: gainers },
              { title: "Turun", icon: TrendingDown, color: PINK, rows: losers },
            ].map((col) => (
              <div key={col.title}>
                <p className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: col.color }}>
                  <col.icon className="h-3.5 w-3.5" /> {col.title}
                </p>
                {col.rows.length === 0 ? (
                  <p className="font-mono text-sm font-bold text-[var(--nb-text-muted)]">—</p>
                ) : (
                  col.rows.map(({ asset, ret }) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between gap-2 border-b-[1.5px] border-dashed border-[var(--nb-border)] py-2 last:border-0 font-mono text-xs font-bold"
                    >
                      <span className="truncate uppercase" title={asset.name}>{asset.name}</span>
                      <span className="shrink-0" style={{ color: col.color }}>
                        {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset table */}
      <div className={card}>
        <h2 className={`${heading} mb-3`}>Performa Aset</h2>
        {assets.length === 0 ? (
          empty("Belum ada aset")
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr style={{ background: PINK }} className="text-white">
                  {["Aset", "Kategori", "Modal", "Nilai Saat Ini", "Profit/Loss", "Return"].map((h, i) => (
                    <th
                      key={h}
                      className={`border-2 border-[var(--nb-border)] px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${i >= 2 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const pl = calculateProfitLoss(asset);
                  const ret = calculateReturn(asset);
                  return (
                    <tr key={asset.id} className="border-b-[1.5px] border-dashed border-[var(--nb-border)]">
                      <td className="px-3 py-2 font-bold">
                        <span className="block max-w-[150px] truncate uppercase" title={asset.name}>{asset.name}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-block max-w-[120px] truncate rounded-full border-2 border-[var(--nb-border)] px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: V_PURPLE }}
                          title={getEffectiveCategoryLabel(asset.category, asset.custom_category)}
                        >
                          {getEffectiveCategoryLabel(asset.category, asset.custom_category)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-[var(--nb-text-muted)]">{formatRupiah(asset.purchase_value)}</td>
                      <td className="px-3 py-2 text-right font-bold">{formatRupiah(asset.current_value)}</td>
                      <td className="px-3 py-2 text-right font-bold" style={{ color: pl >= 0 ? GREEN : PINK }}>
                        {pl >= 0 ? "+" : ""}{formatRupiah(pl)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold" style={{ color: ret >= 0 ? GREEN : PINK }}>
                        {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Goals */}
      <div>
        <h2 className={`${heading} mb-3`}>Progres Target</h2>
        {goals.length === 0 ? (
          <div className={card}>{empty("Belum ada target")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {goals.map((goal, i) => {
              const progress = calculateGoalProgress(goal);
              const eta = calculateGoalETA(goal);
              const reqMonthly = calculateRequiredMonthlySaving(goal);
              const fill = V_SERIES[i % V_SERIES.length];
              return (
                <div key={goal.id} className={`${card} nb-press`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--nb-border)] bg-[var(--nb-surface2)] text-2xl [box-shadow:2px_2px_0px_var(--nb-shadow)]">
                      {goal.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-display text-base font-extrabold uppercase" title={goal.name}>{goal.name}</h3>
                        <span className="shrink-0 font-display text-lg font-extrabold" style={{ color: fill }}>{progress.toFixed(0)}%</span>
                      </div>

                      {/* Progress bar (DESIGN §5.2) */}
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full border-2 border-[var(--nb-border)] bg-[var(--nb-surface2)]">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: fill }} />
                      </div>

                      <div className="mt-2 flex items-center justify-between font-mono text-[11px] font-bold text-[var(--nb-text-muted)]">
                        <span>{formatRupiah(goal.current_amount)}</span>
                        <span>{formatRupiah(goal.target_amount)}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t-[1.5px] border-dashed border-[var(--nb-border)] pt-2 font-mono text-xs font-bold">
                        <span className="text-[var(--nb-text-muted)] uppercase">
                          ETA: <span className="text-[var(--nb-text)]">{eta}</span>
                        </span>
                        <span style={{ color: PINK }}>
                          {reqMonthly === null ? "Tercapai" : `${formatRupiah(Math.round(reqMonthly))}/bln`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
