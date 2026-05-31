import type { Asset } from "./types";

// Manual price model (no API). The global gold price lives in the store and is
// edited by the user; stock & money_market hold their current value directly
// (also user-edited). Only gold needs derivation here.

// Default/seed global gold price per gram. The live value is held in the store
// (DataProvider) so it can be updated at runtime.
export const GOLD_PRICE_PER_GRAM = 2_774_000;

// Computes canonical purchase_value & current_value for an asset.
// - gold: modal = gram × buy price; nilai sekarang = gram × global gold price.
// - stock / money_market: pass through (current_value entered/updated manually).
export function resolveAsset(asset: Asset, goldPricePerGram: number): Asset {
  if (asset.category === "gold") {
    const qty = asset.quantity ?? 0;
    return {
      ...asset,
      purchase_value: qty * (asset.buy_unit_price ?? 0),
      current_value: qty * goldPricePerGram,
    };
  }
  return asset;
}
