"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Asset, Goal } from "./types";
import { GOLD_PRICE_PER_GRAM, resolveAsset } from "./system-prices";
import { mockAssets, mockGoals } from "./mock-data";
import { toast } from "@/components/ui/toast";

// API-backed store. Same public interface as before so pages/components are
// unchanged. Mutators call the route handlers and update local state from the
// response. Auth is enforced server-side (the (app) layout guard); fetches are
// same-origin so the session cookie rides along automatically.

export type AssetInput = Omit<Asset, "id" | "created_at" | "updated_at">;
export type GoalInput = Omit<Goal, "id">;
export interface FeedbackInput {
  category: "saran" | "masalah" | "pujian";
  sentiment: number | null; // 1–5 emoji scale, optional
  message: string;
}

interface DataContextValue {
  isGuest: boolean;
  assets: Asset[];
  goals: Goal[];
  goldPricePerGram: number;
  setGoldPricePerGram: (price: number) => void;
  setAssetCurrentValue: (id: string, value: number) => void;
  pricesUpdatedAt: string;
  addAsset: (data: AssetInput) => void;
  updateAsset: (id: string, data: AssetInput) => void;
  deleteAsset: (id: string) => void;
  addGoal: (data: GoalInput) => void;
  updateGoal: (id: string, data: GoalInput) => void;
  deleteGoal: (id: string) => void;
  // Returns true on success so the dialog can close only when the POST lands
  // (other mutators are fire-and-forget; feedback needs the result to decide).
  submitFeedback: (data: FeedbackInput) => Promise<boolean>;
}

const DataContext = createContext<DataContextValue | null>(null);

async function jsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request gagal (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function DataProvider({
  children,
  isGuest = false,
}: {
  children: ReactNode;
  isGuest?: boolean;
}) {
  const router = useRouter();
  // Raw assets from the API. For gold, purchase/current are placeholders that
  // get derived on read from the global gold price. Guests are seeded from the
  // static sample data via lazy init (isGuest is a stable prop) — doing it here
  // instead of in an effect avoids a synchronous setState-in-effect cascade.
  const [rawAssets, setRawAssets] = useState<Asset[]>(() => (isGuest ? mockAssets : []));
  const [goals, setGoals] = useState<Goal[]>(() => (isGuest ? mockGoals : []));
  const [goldPricePerGram, setGoldPriceState] = useState<number>(GOLD_PRICE_PER_GRAM);
  const [pricesUpdatedAt, setPricesUpdatedAt] = useState<string>("");

  // In guest mode every write is blocked — bounce to /signup instead of calling
  // the API. Returns true when blocked so mutators can early-return.
  const blockGuestWrite = () => {
    if (isGuest) {
      router.push("/signup");
      return true;
    }
    return false;
  };

  // Initial load. Guests already hold the seeded sample data (lazy init above)
  // and have no session, so skip the fetch entirely. Gold price stays default.
  useEffect(() => {
    if (isGuest) return;
    let active = true;
    (async () => {
      try {
        const [a, g, s] = await Promise.all([
          jsonFetch<Asset[]>("/api/assets"),
          jsonFetch<Goal[]>("/api/goals"),
          jsonFetch<{ gold_price_per_gram: number; prices_updated_at: string | null }>(
            "/api/settings"
          ),
        ]);
        if (!active) return;
        setRawAssets(a);
        setGoals(g);
        setGoldPriceState(s.gold_price_per_gram);
        setPricesUpdatedAt(s.prices_updated_at ?? "");
      } catch (err) {
        console.error("Gagal memuat data:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [isGuest]);

  const resolvedAssets = useMemo(
    () => rawAssets.map((a) => resolveAsset(a, goldPricePerGram)),
    [rawAssets, goldPricePerGram]
  );

  const addAsset = (data: AssetInput) => {
    if (blockGuestWrite()) return;
    jsonFetch<Asset>("/api/assets", { method: "POST", body: JSON.stringify(data) })
      .then((created) => {
        setRawAssets((prev) => [created, ...prev]);
        toast.add({
          type: "success",
          title: "Aset ditambahkan",
          description: `"${created.name}" berhasil masuk ke portofolio.`,
        });
      })
      .catch((e) => console.error("Gagal menambah aset:", e));
  };

  const updateAsset = (id: string, data: AssetInput) => {
    if (blockGuestWrite()) return;
    jsonFetch<Asset>(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(data) })
      .then((updated) => {
        setRawAssets((prev) => prev.map((a) => (a.id === id ? updated : a)));
        toast.add({
          type: "success",
          title: "Aset diperbarui",
          description: `Perubahan pada "${updated.name}" tersimpan.`,
        });
      })
      .catch((e) => console.error("Gagal mengubah aset:", e));
  };

  const deleteAsset = (id: string) => {
    if (blockGuestWrite()) return;
    // Capture the name before the row is filtered out so the toast can name it.
    const removed = rawAssets.find((a) => a.id === id);
    jsonFetch(`/api/assets/${id}`, { method: "DELETE" })
      .then(() => {
        setRawAssets((prev) => prev.filter((a) => a.id !== id));
        toast.add({
          type: "success",
          title: "Aset dihapus",
          description: removed ? `"${removed.name}" dihapus dari portofolio.` : undefined,
        });
      })
      .catch((e) => console.error("Gagal menghapus aset:", e));
  };

  const setAssetCurrentValue = (id: string, value: number) => {
    if (blockGuestWrite()) return;
    const a = rawAssets.find((x) => x.id === id);
    if (!a) return;
    const payload: AssetInput = {
      name: a.name,
      category: a.category,
      custom_category: a.custom_category,
      purchase_value: a.purchase_value,
      current_value: value,
      quantity: a.quantity,
      unit: a.unit,
      buy_unit_price: a.buy_unit_price,
    };
    jsonFetch<Asset>(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(payload) })
      .then((updated) => setRawAssets((prev) => prev.map((x) => (x.id === id ? updated : x))))
      .catch((e) => console.error("Gagal mengubah nilai aset:", e));
  };

  const setGoldPricePerGram = (price: number) => {
    if (blockGuestWrite()) return;
    jsonFetch<{ gold_price_per_gram: number; prices_updated_at: string | null }>(
      "/api/settings",
      { method: "PUT", body: JSON.stringify({ gold_price_per_gram: price }) }
    )
      .then((s) => {
        setGoldPriceState(s.gold_price_per_gram);
        setPricesUpdatedAt(s.prices_updated_at ?? "");
      })
      .catch((e) => console.error("Gagal mengubah harga emas:", e));
  };

  const addGoal = (data: GoalInput) => {
    if (blockGuestWrite()) return;
    jsonFetch<Goal>("/api/goals", { method: "POST", body: JSON.stringify(data) })
      .then((created) => {
        setGoals((prev) => [created, ...prev]);
        toast.add({
          type: "success",
          title: "Target ditambahkan",
          description: `"${created.name}" berhasil dibuat.`,
        });
      })
      .catch((e) => console.error("Gagal menambah target:", e));
  };

  const updateGoal = (id: string, data: GoalInput) => {
    if (blockGuestWrite()) return;
    jsonFetch<Goal>(`/api/goals/${id}`, { method: "PUT", body: JSON.stringify(data) })
      .then((updated) => {
        setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
        toast.add({
          type: "success",
          title: "Target diperbarui",
          description: `Perubahan pada "${updated.name}" tersimpan.`,
        });
      })
      .catch((e) => console.error("Gagal mengubah target:", e));
  };

  const deleteGoal = (id: string) => {
    if (blockGuestWrite()) return;
    const removed = goals.find((g) => g.id === id);
    jsonFetch(`/api/goals/${id}`, { method: "DELETE" })
      .then(() => {
        setGoals((prev) => prev.filter((g) => g.id !== id));
        toast.add({
          type: "success",
          title: "Target dihapus",
          description: removed ? `"${removed.name}" dihapus.` : undefined,
        });
      })
      .catch((e) => console.error("Gagal menghapus target:", e));
  };

  const submitFeedback = async (data: FeedbackInput): Promise<boolean> => {
    if (blockGuestWrite()) return false;
    try {
      await jsonFetch("/api/feedback", { method: "POST", body: JSON.stringify(data) });
      toast.add({
        type: "success",
        title: "Masukan terkirim",
        description: "Terima kasih! Masukanmu sangat membantu kami.",
      });
      return true;
    } catch (e) {
      console.error("Gagal mengirim masukan:", e);
      toast.add({
        type: "error",
        title: "Gagal mengirim",
        description: e instanceof Error ? e.message : "Coba lagi sebentar.",
      });
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        isGuest,
        assets: resolvedAssets,
        goals,
        goldPricePerGram,
        setGoldPricePerGram,
        setAssetCurrentValue,
        pricesUpdatedAt,
        addAsset,
        updateAsset,
        deleteAsset,
        addGoal,
        updateGoal,
        deleteGoal,
        submitFeedback,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
