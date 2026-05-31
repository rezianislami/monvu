# DESIGN.md
# Neo Brutalism Design System 
> Pink & Purple theme · Next.js · Tailwind CSS · Dark & Light Mode

---

## 1. Philosophy

This project uses **Neo Brutalism** — a design style that combines brutalist rawness with modern rounded forms. Key principles:

- **Bold but rounded.** Hard shadows and thick borders, softened by rounded-2xl corners. Never sharp-cornered, never soft-shadowed.
- **Flat over layered.** No gradients, no blur, no glass morphism. Every surface is a solid flat fill.
- **Intentional color.** Pink and purple are the only accent colors. Yellow and green are reserved for status signals (warning/success). Nothing else.
- **Typography as hierarchy.** Space Grotesk for display/headings & data values (grotesque, bold, with clean legible numerals). Space Mono for all UI text, labels, and small data (mono reinforces the "raw" feel).
- **Interaction = physical press.** Every interactive element should feel like a physical button being pressed — shadow shrinks, element translates down-right on hover/active.

---

## 2. Color Tokens

All colors are defined as CSS variables in `globals.css`. Always use these variables — never hardcode hex values in components.

### CSS Variables

```css
/* globals.css */
:root {
  --nb-bg:          #F5E6F5;
  --nb-surface:     #FFFFFF;
  --nb-surface2:    #F0D6F5;
  --nb-border:      #1a0030;
  --nb-shadow:      #1a0030;
  --nb-text:        #1a0030;
  --nb-text-muted:  #5a3a7a;
  --nb-pink:        #FF2D78;
  --nb-purple:      #7B00FF;
  --nb-yellow:      #FFE600;
  --nb-green:       #00E5A0;
}

.dark {
  --nb-bg:          #0D0018;
  --nb-surface:     #1a0a2e;
  --nb-surface2:    #2a0a40;
  --nb-border:      #CC99FF;
  --nb-shadow:      #FF2D78;
  --nb-text:        #F5E6FF;
  --nb-text-muted:  #C9A0FF;
  --nb-pink:        #FF2D78;
  --nb-purple:      #A855F7;
  --nb-yellow:      #FFE600;
  --nb-green:       #00E5A0;
}
```

### Color Reference Table

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--nb-bg` | `#F5E6F5` | `#0D0018` | Page background |
| `--nb-surface` | `#FFFFFF` | `#1a0a2e` | Card/component background |
| `--nb-surface2` | `#F0D6F5` | `#2a0a40` | Input bg, progress track, nested surfaces |
| `--nb-border` | `#1a0030` | `#CC99FF` | All borders |
| `--nb-shadow` | `#1a0030` | `#FF2D78` | Hard shadow offset color |
| `--nb-text` | `#1a0030` | `#F5E6FF` | Primary text |
| `--nb-text-muted` | `#5a3a7a` | `#C9A0FF` | Labels, captions, secondary text |
| `--nb-pink` | `#FF2D78` | `#FF2D78` | Primary accent, CTA, critical |
| `--nb-purple` | `#7B00FF` | `#A855F7` | Secondary accent, info |
| `--nb-yellow` | `#FFE600` | `#FFE600` | Warning status only |
| `--nb-green` | `#00E5A0` | `#00E5A0` | Success/up status only |

### Usage Rules
- Pink → primary actions, critical alerts, "up" trend accents
- Purple → secondary actions, info alerts, data series
- Yellow → warning badges/tags only
- Green → success/resolved/uptime only
- Never use pink and purple together on the same interactive element

---

## 3. Typography

### Font Setup

```tsx
// app/layout.tsx
import { Space_Grotesk, Space_Mono } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

```js
// tailwind.config.js
fontFamily: {
  display: ['var(--font-display)', 'sans-serif'],
  mono: ['var(--font-mono)', 'monospace'],
}
```

> **Note:** Syne was replaced with **Space Grotesk** — Syne's display numerals read poorly for data-heavy screens (KPI values, tables). Space Grotesk keeps the bold grotesque character while rendering numbers cleanly, and pairs with Space Mono (same superfamily). Use the `font-display` utility (max weight 700 — use `font-bold`, not `font-extrabold`).

### Type Scale

| Role | Font | Size | Weight | Tailwind |
|---|---|---|---|---|
| Page title / Logo | Space Grotesk | 20–24px | 700 | `font-display text-xl font-bold` |
| Card heading | Space Grotesk | 15–16px | 700 | `font-display text-base font-bold uppercase` |
| Stat value (KPI) | Space Grotesk | 16–20px | 700 | `font-display text-base sm:text-xl font-bold` |
| Body / UI text | Space Mono | 13–14px | 400 | `font-mono text-sm` |
| Label / caption | Space Mono | 11–12px | 700 | `font-mono text-xs font-bold tracking-widest uppercase` |
| Badge / tag | Space Mono | 10–11px | 700 | `font-mono text-[10px] font-bold` |

### Rules
- All labels are `UPPERCASE` with `letter-spacing: 0.1em`
- Body text is always Space Mono — no exceptions
- KPI/stat values stay compact (`text-base sm:text-xl`) — data screens have many numbers, oversized values crowd the cards
- Never use Inter, Roboto, Syne, or system-ui anywhere

---

## 4. Base Card

All card-type components extend this base. Never deviate from these properties.

```tsx
// Base card Tailwind classes
const cardBase = `
  bg-[var(--nb-surface)]
  border-[2.5px]
  border-[var(--nb-border)]
  rounded-2xl
  p-4
  [box-shadow:4px_4px_0px_var(--nb-shadow)]
  transition-all
  duration-100
`

// Hover (add to all interactive cards)
const cardHover = `
  hover:[box-shadow:1px_1px_0px_var(--nb-shadow)]
  hover:translate-x-[2px]
  hover:translate-y-[2px]
`
```

**Rules:**
- `rounded-2xl` (16px) is the minimum — never `rounded-lg` or less on cards
- Shadow offset is always `4px 4px` — never increase, never add blur
- Hover state MUST shrink shadow to `1px 1px` and translate `2px 2px` — the "press" effect
- Padding is `p-4` (16px) by default, `p-5` for larger cards

---

## 5. Components

### 5.1 KPI Stat Card

```tsx
<div className={`${cardBase} border-t-[5px] border-t-[var(--nb-pink)]`}>
  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--nb-text-muted)] mb-2">
    Total Users
  </p>
  <p className="font-syne text-3xl font-extrabold text-[var(--nb-text)] leading-none">
    48.2K
  </p>
  <span className="inline-block mt-2 rounded-full border-2 border-[var(--nb-border)] px-2 py-0.5 font-mono text-[10px] font-bold bg-[var(--nb-green)] text-[#003322]">
    ↑ 12.4%
  </span>
</div>
```

**Top accent variants:**
- Critical/Pink KPI → `border-t-[var(--nb-pink)]`
- Secondary/Purple KPI → `border-t-[var(--nb-purple)]`
- Warning KPI → `border-t-[var(--nb-yellow)]`
- Success KPI → `border-t-[var(--nb-green)]`

**Badge color rules:**
- Trend up → `bg-[var(--nb-green)] text-[#003322]`
- Trend down → `bg-[var(--nb-pink)] text-white`
- Neutral → `bg-[var(--nb-surface2)] text-[var(--nb-text-muted)]`

---

### 5.2 Progress Bar

```tsx
<div className="flex items-center gap-3 mb-3">
  <span className="font-mono text-xs text-[var(--nb-text-muted)] w-16 shrink-0">
    Organic
  </span>
  <div className="flex-1 h-2.5 rounded-full border-2 border-[var(--nb-border)] bg-[var(--nb-surface2)] overflow-hidden">
    <div
      className="h-full rounded-full bg-[var(--nb-pink)]"
      style={{ width: '72%' }}
    />
  </div>
  <span className="font-mono text-[11px] font-bold text-[var(--nb-text)] w-8 text-right">
    72%
  </span>
</div>
```

Fill color per channel: pink / purple / yellow / green — rotate through in order.

---

### 5.3 Activity Feed Item

```tsx
<div className="flex items-start gap-3 py-2 border-b-[1.5px] border-dashed border-[var(--nb-border)] last:border-0 last:pb-0">
  <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--nb-border)] bg-[var(--nb-pink)] mt-1 shrink-0" />
  <div>
    <p className="font-mono text-xs font-bold text-[var(--nb-text)]">New alert triggered</p>
    <p className="font-mono text-[11px] text-[var(--nb-text-muted)]">2 min ago — Orion XDR</p>
  </div>
</div>
```

Dot color: pink = critical, purple = info, green = resolved.

---

### 5.4 User/Leaderboard Row

```tsx
<div className="flex items-center gap-3 py-2 border-b-[1.5px] border-dashed border-[var(--nb-border)] last:border-0">
  <div className="w-8 h-8 rounded-full border-2 border-[var(--nb-border)] [box-shadow:2px_2px_0px_var(--nb-shadow)] bg-[var(--nb-pink)] text-white flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
    DK
  </div>
  <div>
    <p className="font-mono text-xs font-bold text-[var(--nb-text)]">Dika K.</p>
    <p className="font-mono text-[11px] text-[var(--nb-text-muted)]">Threat Intel</p>
  </div>
  <span className="ml-auto font-syne text-sm font-extrabold text-[var(--nb-text)]">94</span>
</div>
```

Avatar bg rotation: pink → purple → green (`text-[#003322]`) → yellow (`text-[#1a0030]`).

---

### 5.5 Alert Card

```tsx
{/* Critical */}
<div className={`${cardBase} border-l-[5px] border-l-[var(--nb-pink)] flex items-center gap-3`}>
  <span className="text-lg">⚠</span>
  <p className="font-mono text-xs font-bold text-[var(--nb-text)]">
    Critical: 3 endpoints flagged by Orion XDR
  </p>
</div>

{/* Info */}
<div className={`${cardBase} border-l-[5px] border-l-[var(--nb-purple)] flex items-center gap-3`}>
  <span className="text-lg">ℹ</span>
  <p className="font-mono text-xs font-bold text-[var(--nb-text)]">
    Corvus: New IoC cluster detected in APAC region
  </p>
</div>
```

---

### 5.6 Tag / Label Pill

```tsx
<span className="inline-block rounded-full border-2 border-[var(--nb-border)] [box-shadow:2px_2px_0px_var(--nb-shadow)] px-3 py-1 font-mono text-[11px] font-bold tracking-wide">
  Critical
</span>
```

| Variant | bg | text |
|---|---|---|
| pink | `bg-[var(--nb-pink)]` | `text-white` |
| purple | `bg-[var(--nb-purple)]` | `text-white` |
| yellow | `bg-[var(--nb-yellow)]` | `text-[#1a0030]` |
| green | `bg-[var(--nb-green)]` | `text-[#003322]` |
| outline | `bg-[var(--nb-surface)]` | `text-[var(--nb-text)]` |

---

### 5.7 Buttons

```tsx
{/* Primary */}
<button className="
  bg-[var(--nb-pink)] text-white
  rounded-full
  border-2 border-[var(--nb-border)]
  [box-shadow:3px_3px_0px_var(--nb-shadow)]
  px-5 py-2
  font-mono text-xs font-bold tracking-wide
  hover:[box-shadow:1px_1px_0px_var(--nb-shadow)]
  hover:translate-x-[2px] hover:translate-y-[2px]
  transition-all duration-100
  active:translate-x-[3px] active:translate-y-[3px]
  active:[box-shadow:0px_0px_0px_var(--nb-shadow)]
">
  + New Case
</button>

{/* Secondary */}
<button className="
  bg-[var(--nb-surface)] text-[var(--nb-text)]
  rounded-full
  border-2 border-[var(--nb-border)]
  [box-shadow:3px_3px_0px_var(--nb-shadow)]
  px-5 py-2
  font-mono text-xs font-bold tracking-wide
  hover:[box-shadow:1px_1px_0px_var(--nb-shadow)]
  hover:translate-x-[2px] hover:translate-y-[2px]
  transition-all duration-100
">
  Export Report
</button>
```

---

### 5.8 Dark Mode Toggle

**Icon-only** (no text label), square button, lives in the topbar **to the right of the profile/avatar**.

```tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
      className="
        flex h-9 w-9 items-center justify-center
        bg-[var(--nb-surface)] text-[var(--nb-text)]
        rounded-full
        border-2 border-[var(--nb-border)]
        [box-shadow:3px_3px_0px_var(--nb-shadow)]
        hover:[box-shadow:1px_1px_0px_var(--nb-shadow)]
        hover:translate-x-[2px] hover:translate-y-[2px]
        active:translate-x-[3px] active:translate-y-[3px]
        active:[box-shadow:0px_0px_0px_var(--nb-shadow)]
        transition-all duration-100
      "
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
```

Setup in `app/layout.tsx`:
```tsx
import { ThemeProvider } from 'next-themes'

// wrap children:
<ThemeProvider attribute="class" defaultTheme="dark">
  {children}
</ThemeProvider>
```

---

## 6. Layout Grid

```tsx
// Dashboard page structure
<main className="bg-[var(--nb-bg)] min-h-screen p-5 font-mono">

  {/* Topbar */}
  <div className="flex items-center justify-between mb-6">
    <h1 className="font-syne text-xl font-extrabold text-[var(--nb-text)]">
      Broń<span className="text-[var(--nb-pink)]">AI</span>
    </h1>
    <ThemeToggle />
  </div>

  {/* KPI Stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    {/* 4x StatCard */}
  </div>

  {/* Mid row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
    {/* ProgressCard + ChartCard */}
  </div>

  {/* Bottom row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
    {/* ActivityFeed + Leaderboard */}
  </div>

  {/* Alerts */}
  <div className="flex flex-col gap-3 mb-5">
    {/* AlertCard × n */}
  </div>

  {/* Tags + Actions */}
  <div className="flex flex-wrap gap-2 mb-4">{/* Tags */}</div>
  <div className="flex flex-wrap gap-3">{/* Buttons */}</div>

</main>
```

---

## 7. Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| `rounded-2xl` or `rounded-xl` on all cards | `rounded-md`, `rounded-lg`, or no rounding |
| Sidebar/nav menu items are **square** (`rounded-none`) | Rounded nav items — rounding is for cards, not menu rows |
| Hard shadow `4px 4px 0px` no blur | Soft shadow with blur (`shadow-lg`, etc.) |
| Flat solid fills only | Gradients, glass, backdrop-blur |
| Syne for headings/values | Inter, Roboto, system-ui anywhere |
| Space Mono for all UI/body text | Any sans-serif for body text |
| CSS variables for all colors | Hardcoded hex in component files |
| Translate + shadow-shrink on hover | Scale transform on hover |
| Dashed borders for list dividers | Solid dividers inside cards |
| Border-left accent for alerts | Background color fills for alerts |
| `active:` state collapses shadow to 0 | No active state on buttons |

---

## 8. Tailwind Config Additions

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderWidth: {
        '2.5': '2.5px',
      },
    },
  },
}
```

---

## 9. File Structure

```
src/
├── app/
│   ├── globals.css          ← CSS variables (all --nb-* tokens here)
│   ├── layout.tsx           ← Font setup + ThemeProvider
│   └── dashboard/
│       └── page.tsx         ← Dashboard page
├── components/
│   └── dashboard/
│       ├── StatCard.tsx
│       ├── ProgressCard.tsx
│       ├── ActivityFeed.tsx
│       ├── Leaderboard.tsx
│       ├── AlertCard.tsx
│       └── ThemeToggle.tsx
└── lib/
    └── cn.ts                ← clsx/twMerge utility (optional)
```

---

*When rolling out to other pages: copy the CSS variables and Tailwind config as-is. Apply the same cardBase class, fonts, and color tokens. Do not introduce new colors or shadow styles.*
