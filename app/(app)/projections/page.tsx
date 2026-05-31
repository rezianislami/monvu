"use client";

import { useState } from "react";
import { TrendingUp, Minus, Plus, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import {
  formatRupiah,
  formatCompactRupiah,
  calculateTotalCurrentValue,
  projectGrowth,
} from "@/lib/calculations";
import { useData } from "@/lib/data-store";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ScenarioKey = "conservative" | "moderate" | "aggressive";

const SCENARIOS: { key: ScenarioKey; label: string; rate: number; color: string }[] = [
  { key: "conservative", label: "Konservatif", rate: 6, color: "#a78bfa" }, // violet
  { key: "moderate", label: "Moderat", rate: 10, color: "#ec4899" }, // pink
  { key: "aggressive", label: "Agresif", rate: 15, color: "#d946ef" }, // fuchsia
];

const HORIZONS = [1, 5, 10];

export default function ProjectionsPage() {
  const { assets } = useData();
  const currentValue = calculateTotalCurrentValue(assets);
  const [scenario, setScenario] = useState<ScenarioKey>("moderate");
  const [monthlyContribution, setMonthlyContribution] = useState(5000000);

  const active = SCENARIOS.find((s) => s.key === scenario)!;

  // 10-year projection, sampled yearly for the chart
  const fullProjection = projectGrowth(currentValue, monthlyContribution, active.rate, 10);
  const chartData = fullProjection
    .filter((d) => d.month % 12 === 0)
    .map((d) => ({ year: d.month / 12, value: d.value }));

  const valueAt = (years: number) => {
    const point = fullProjection.find((d) => d.month === years * 12);
    return point?.value ?? 0;
  };

  const adjustContribution = (delta: number) => {
    setMonthlyContribution((prev) => Math.max(0, prev + delta));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proyeksi</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Simulasikan pertumbuhan aset berdasarkan skenario dan kontribusi bulanan
        </p>
      </div>

      {assets.length === 0 ? (
        <Card className="glass-card border-border/50 rounded-2xl">
          <CardContent className="py-2">
            <EmptyState
              icon={Wallet}
              title="Belum ada aset untuk diproyeksikan"
              description="Tambahkan aset di halaman Aset, lalu simulasikan pertumbuhannya di sini."
            />
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scenario selector */}
        <Card className="glass-card border-border/50 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Skenario Pertumbuhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {SCENARIOS.map((s) => {
                const isActive = scenario === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setScenario(s.key)}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      isActive
                        ? "border-transparent bg-primary/15"
                        : "border-border/50 hover:bg-accent/50"
                    }`}
                  >
                    <p
                      className="text-lg font-bold"
                      style={{ color: isActive ? s.color : undefined }}
                    >
                      {s.rate}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Asumsi return tahunan {active.rate}% ({active.label.toLowerCase()})
            </p>
          </CardContent>
        </Card>

        {/* Monthly contribution */}
        <Card className="glass-card border-border/50 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Kontribusi Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustContribution(-1000000)}
                className="rounded-xl bg-secondary p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold">{formatRupiah(monthlyContribution)}</p>
                <p className="text-xs text-muted-foreground">per bulan</p>
              </div>
              <button
                onClick={() => adjustContribution(1000000)}
                className="rounded-xl bg-secondary p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Nilai awal portofolio: {formatRupiah(currentValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Horizon summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {HORIZONS.map((years) => {
          const projected = valueAt(years);
          const contributed = currentValue + monthlyContribution * 12 * years;
          const growth = projected - contributed;
          return (
            <Card key={years} className="gradient-card-emerald border-0 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {years} Tahun
                  </p>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold mt-3">{formatRupiah(projected)}</p>
                <p className="text-xs text-emerald-400 font-medium mt-1">
                  +{formatRupiah(growth)} dari hasil investasi
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Projection chart */}
      <Card className="glass-card border-border/50 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Simulasi Pertumbuhan 10 Tahun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={active.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={active.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737373", fontSize: 12 }}
                tickFormatter={(v) => `${v}th`}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737373", fontSize: 12 }}
                tickFormatter={(v) => formatCompactRupiah(v as number)}
              />
              <RechartsTooltip
                content={({ active: act, payload, label }) => {
                  if (!act || !payload?.length) return null;
                  return (
                    <div className="rounded-lg bg-popover px-3 py-2 text-sm shadow-xl border border-border">
                      <p className="font-medium">Tahun ke-{label}</p>
                      <p style={{ color: active.color }}>
                        {formatRupiah(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={active.color}
                strokeWidth={2}
                fill="url(#projGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
