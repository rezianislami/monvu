"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Shield,
  Flame,
  CheckCircle2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/lib/data-store";
import {
  formatRupiah,
  calculateGoalProgress,
  calculateGoalETA,
  calculateRequiredMonthlySaving,
  calculateOverallGoalCompletion,
  calculateEmergencyFundCoverage,
  calculateFINumber,
  getProgressColor,
  getProgressBgColor,
} from "@/lib/calculations";
import type { Goal } from "@/lib/types";

const DEFAULT_MONTHLY_EXPENSE = 8_000_000;

const MILESTONES = [25, 50, 75, 100];

export default function GoalsPage() {
  const { goals, assets, addGoal, updateGoal, deleteGoal, isGuest } = useData();
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  // Manual input (not persisted) — drives the emergency-fund & FI metrics.
  const [monthlyExpense, setMonthlyExpense] = useState(String(DEFAULT_MONTHLY_EXPENSE));

  const expenseNum = Number(monthlyExpense) || 0;

  const overall = calculateOverallGoalCompletion(goals);

  // Emergency fund coverage uses the liquid reserve: cash + money market (pasar
  // uang) — the two most liquid vehicles.
  const cashReserve = assets
    .filter((a) => a.category === "cash" || a.category === "money_market")
    .reduce((sum, a) => sum + a.current_value, 0);
  const efCoverage = calculateEmergencyFundCoverage(cashReserve, expenseNum);
  const fiNumber = calculateFINumber(expenseNum);

  const completedCount = goals.filter((g) => calculateGoalProgress(g) >= 100).length;

  const stats = [
    {
      title: "Rata-rata Pencapaian",
      value: `${overall.toFixed(0)}%`,
      icon: Target,
      gradient: "gradient-card-purple",
      iconColor: "text-violet-400",
    },
    {
      title: "Target Tercapai",
      value: `${completedCount} / ${goals.length}`,
      icon: CheckCircle2,
      gradient: "gradient-card-emerald",
      iconColor: "text-emerald-400",
    },
    {
      title: "Dana Darurat",
      value: `${efCoverage.toFixed(1)} bulan`,
      icon: Shield,
      gradient: "gradient-card-blue",
      iconColor: "text-blue-400",
    },
    {
      title: "Financial Freedom",
      value: formatRupiah(fiNumber),
      icon: Flame,
      gradient: "gradient-card-gold",
      iconColor: "text-amber-400",
    },
  ];

  const openAdd = () => {
    // Guests can browse but not write — send them to register instead.
    if (isGuest) {
      router.push("/signup");
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditing(goal);
    setFormOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Target</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau progres dan estimasi pencapaian target finansial Anda
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full sm:w-auto">
          <div className="grid gap-1.5 w-full sm:w-44">
            <Label htmlFor="monthly-expense" className="text-xs text-muted-foreground">
              Pengeluaran bulanan (Rp)
            </Label>
            <Input
              id="monthly-expense"
              type="number"
              value={monthlyExpense}
              onChange={(e) => setMonthlyExpense(e.target.value)}
            />
          </div>
          <Button onClick={openAdd} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Tambah Target
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((s) => (
          <Card key={s.title} className={`${s.gradient} border-0 rounded-2xl`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {s.title}
                  </p>
                  <p className="text-xl font-bold tracking-tight">{s.value}</p>
                </div>
                <div className={`rounded-xl p-2.5 bg-background/30 ${s.iconColor}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goal detail cards */}
      {goals.length === 0 ? (
        <Card className="glass-card border-border/50 rounded-2xl">
          <CardContent className="py-2">
            <EmptyState
              icon={Target}
              title="Belum ada target"
              description='Klik "Tambah Target" untuk membuat target finansial pertamamu.'
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger-children">
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal);
            const eta = calculateGoalETA(goal);
            const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
            const reqMonthly = calculateRequiredMonthlySaving(goal);
            return (
              <Card key={goal.id} className="glass-card border-border/50 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{goal.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-lg truncate">{goal.name}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-lg font-bold ${getProgressColor(progress)}`}>
                            {progress.toFixed(0)}%
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" />}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(goal)}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleting(goal)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBgColor(
                            progress
                          )}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Milestones */}
                      <div className="flex items-center gap-1.5 mt-3">
                        {MILESTONES.map((m) => {
                          const reached = progress >= m;
                          return (
                            <div
                              key={m}
                              className={`flex-1 flex items-center justify-center rounded-md py-1 text-[10px] font-medium transition-colors ${
                                reached
                                  ? "bg-primary/15 text-primary"
                                  : "bg-secondary/50 text-muted-foreground"
                              }`}
                            >
                              {m}%
                            </div>
                          );
                        })}
                      </div>

                      {/* Amounts */}
                      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Terkumpul</p>
                          <p className="font-medium">{formatRupiah(goal.current_amount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Target</p>
                          <p className="font-medium">{formatRupiah(goal.target_amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sisa</p>
                          <p className="font-medium text-rose-400">{formatRupiah(remaining)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Estimasi</p>
                          <p className="font-medium text-emerald-400">{eta}</p>
                        </div>
                      </div>

                      {/* Required monthly saving to hit target on time */}
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Perlu nabung</span>
                        <span className="font-semibold text-primary">
                          {reqMonthly === null
                            ? "Tercapai 🎉"
                            : `${formatRupiah(Math.round(reqMonthly))}/bln`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit dialog */}
      <GoalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editing}
        onSubmit={(data) => {
          if (editing) updateGoal(editing.id, data);
          else addGoal(data);
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus target?"
        description={deleting ? `"${deleting.name}" akan dihapus.` : undefined}
        onConfirm={() => deleting && deleteGoal(deleting.id)}
      />
    </div>
  );
}
