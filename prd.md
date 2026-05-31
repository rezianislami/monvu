# Personal Asset & Financial Goal Dashboard

**Version:** 1.0
**Status:** Draft
**Author:** Product Team
**Last Updated:** 2026-05-29

---

# 1. Product Overview

## Background

Saat ini pengguna memiliki berbagai jenis aset seperti:

* Cash
* Emas
* Saham
* Reksa Dana Pasar Uang

Pengguna membutuhkan satu dashboard terpusat untuk:

* Melihat total kekayaan
* Mengukur profit/loss investasi
* Memantau pertumbuhan aset
* Mengelola target finansial
* Melakukan proyeksi pencapaian target

---

## Vision

Menjadi pusat pengelolaan kekayaan pribadi (Personal Wealth Management Dashboard) yang sederhana, transparan, dan actionable.

---

# 2. Goals

## Business Goals

* Menyediakan single source of truth seluruh aset pengguna.
* Membantu pengguna mengambil keputusan finansial berdasarkan data.
* Membantu pengguna mencapai target finansial lebih cepat.

## User Goals

Pengguna dapat:

* Mengetahui total aset saat ini.
* Mengetahui keuntungan investasi.
* Mengetahui net worth.
* Mengetahui progres target finansial.
* Mengetahui estimasi waktu pencapaian target.

---

# 3. Scope

## Included (V1)

### Asset Management

* Cash
* Emas
* Saham
* Reksa Dana Pasar Uang

### Goal Tracking

* Pelunasan KPR
* Pembelian Mobil
* Dana Darurat
* Dana Pensiun
* Target Custom

### Analytics

* Total Modal
* Nilai Saat Ini
* Profit / Loss
* Return %
* Asset Allocation
* Net Worth

### Projection

* Estimasi pencapaian target
* Simulasi pertumbuhan aset

---

## Excluded (V1)

* Crypto
* Obligasi
* Trading
* Integrasi Bank
* Integrasi Broker
* Pajak Investasi

---

# 4. User Personas

## Investor Pemula

Memiliki:

* Cash
* Emas
* Reksa Dana

Tujuan:

* Dana darurat
* Beli kendaraan

---

## Investor Menengah

Memiliki:

* Saham
* Emas
* Reksa Dana

Tujuan:

* Pelunasan KPR
* Dana pensiun

---

# 5. User Stories

## Asset Tracking

### US-001

Sebagai pengguna,

Saya ingin menambahkan aset,

Agar seluruh aset tercatat dalam dashboard.

---

### US-002

Sebagai pengguna,

Saya ingin melihat nilai seluruh aset saat ini,

Agar mengetahui total kekayaan saya.

---

### US-003

Sebagai pengguna,

Saya ingin melihat profit/loss investasi,

Agar mengetahui performa investasi saya.

---

## Goal Tracking

### US-004

Sebagai pengguna,

Saya ingin membuat target finansial,

Agar dapat memantau progres pencapaiannya.

---

### US-005

Sebagai pengguna,

Saya ingin mengetahui estimasi target tercapai,

Agar dapat membuat perencanaan yang lebih baik.

---

# 6. User Flow

## Flow A - Add Asset

```text
Dashboard
    ↓
Add Asset
    ↓
Choose Category
    ↓
Input Asset Data
    ↓
Save
    ↓
Dashboard Updated
```

---

## Flow B - Create Goal

```text
Dashboard
    ↓
Goals
    ↓
Create Goal
    ↓
Input Target
    ↓
Link Assets
    ↓
Save
    ↓
Goal Created
```

---

## Flow C - Monitor Progress

```text
Login
    ↓
Dashboard
    ↓
Portfolio Summary
    ↓
Goal Progress
    ↓
Projection
```

---

# 7. Dashboard Modules

## 7.1 Portfolio Overview

### Summary Cards

| Metric          | Description                          |
| --------------- | ------------------------------------ |
| Total Modal     | Total dana yang telah diinvestasikan |
| Current Value   | Nilai aset saat ini                  |
| Profit/Loss     | Keuntungan atau kerugian             |
| Return %        | Persentase keuntungan                |
| Net Worth       | Total aset dikurangi hutang          |
| Goal Completion | Persentase pencapaian target         |

---

## 7.2 Asset Allocation

Visualisasi:

* Pie Chart
* Donut Chart

Kategori:

* Cash
* Gold
* Stocks
* Money Market

---

## 7.3 Asset Performance

| Asset | Modal | Current Value | Profit | Return |
| ----- | ----- | ------------- | ------ | ------ |

---

## 7.4 Goal Dashboard

| Goal | Target | Current | Progress | ETA |
| ---- | ------ | ------- | -------- | --- |

---

## 7.5 Projection Dashboard

Scenario:

* Conservative
* Moderate
* Aggressive

Output:

* 1 Year Projection
* 5 Year Projection
* 10 Year Projection

---

# 8. Functional Requirements

## FR-001 Asset CRUD

User dapat:

* Create Asset
* Read Asset
* Update Asset
* Delete Asset

---

## FR-002 Goal CRUD

User dapat:

* Create Goal
* Read Goal
* Update Goal
* Delete Goal

---

## FR-003 Asset Allocation

Sistem menghitung persentase alokasi seluruh aset.

---

## FR-004 Profit/Loss Calculation

Sistem menghitung profit/loss setiap aset.

---

## FR-005 Net Worth Calculation

Sistem menghitung net worth pengguna.

---

## FR-006 Goal Progress

Sistem menghitung progress target secara otomatis.

---

## FR-007 Projection Engine

Sistem menghasilkan proyeksi pertumbuhan aset.

---

# 9. Data Model

## Asset

```json
{
  "id": "uuid",
  "name": "BBCA",
  "category": "stock",
  "purchase_value": 10000000,
  "current_value": 12000000,
  "quantity": 100,
  "created_at": "datetime"
}
```

---

## Asset Price History

```json
{
  "id": "uuid",
  "asset_id": "uuid",
  "price": 12500000,
  "recorded_at": "datetime"
}
```

---

## Goal

```json
{
  "id": "uuid",
  "name": "Pelunasan KPR",
  "target_amount": 500000000,
  "current_amount": 250000000,
  "target_date": "2030-12-31"
}
```

---

## Liability

```json
{
  "id": "uuid",
  "name": "KPR",
  "remaining_balance": 350000000
}
```

---

## Transaction

```json
{
  "id": "uuid",
  "asset_id": "uuid",
  "type": "buy",
  "amount": 5000000,
  "date": "2026-01-01"
}
```

---

# 10. Calculation Rules

## Profit / Loss

```text
Profit/Loss =
Current Value - Total Modal
```

---

## Return %

```text
Return % =
(Current Value - Total Modal)
/
Total Modal
× 100
```

---

## Net Worth

```text
Net Worth =
Total Assets - Total Liabilities
```

---

## Goal Progress

```text
Progress =
Current Amount
/
Target Amount
× 100
```

---

## Emergency Fund Coverage

```text
Emergency Fund Coverage =
Cash Reserve
/
Monthly Expense
```

---

## Financial Freedom Number

```text
FI Number =
Monthly Expense
× 12
× 25
```

---

# 11. Notifications

## Goal Milestones

Trigger:

* 25%
* 50%
* 75%
* 100%

---

## Net Worth Milestones

Trigger:

* Rp100 Juta
* Rp500 Juta
* Rp1 Miliar
* Rp5 Miliar

---

# 12. Reports

## Monthly Report

* Total Asset
* Profit/Loss
* Net Worth
* Goal Progress

---

## Annual Report

* Asset Growth
* Net Worth Growth
* Goal Achievement
* Contribution Summary

---

# 13. Future Enhancements

## V2

* Harga emas otomatis
* Harga saham otomatis
* Reksa dana otomatis
* Multi currency
* Dividend tracking

---

## V3

* Open Banking Integration
* AI Financial Advisor
* Portfolio Rebalancing
* Retirement Planning
* Tax Planning

---

# 14. Suggested Tech Stack

## Frontend

* Next.js
* TypeScript
* TailwindCSS
* Shadcn UI
* Recharts

## Backend

* Supabase
* PostgreSQL
* Prisma ORM

## Authentication

* Supabase Auth

## Deployment

* Vercel
* Supabase Cloud

---

# 15. Success Metrics

* User dapat melihat total aset dalam < 5 detik.
* User dapat mengetahui net worth dalam 1 halaman.
* User dapat melihat progress seluruh target tanpa navigasi tambahan.
* Dashboard dapat memuat < 2 detik untuk 10.000 transaksi.

```
```
