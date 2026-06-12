# Spendro — App Flow & Data Structure

## Overview

A concise, end-to-end overview of the Spendro mobile app from launch (splash) through onboarding, auth, main flows (tabs), expense lifecycle, background sync, and shutdown. Includes TypeScript data structures, SQLite schema and Firestore layout used across the app.

---

## High-level App Flow

1. Launch → Splash screen
2. Initialize app services (DB, Firestore/persistence, secure store, analytics, crashlytics)
3. Check onboarding status
   - If not completed → Onboarding (3 slides) → mark completed
4. First-time app setup (after onboarding)

- After onboarding completes, if the user hasn't completed first-time setup, show the Setup Flow.
- Setup Flow screens: choose default `currency`, create an initial `monthly budget`.
- These steps are optional but recommended; they can be changed later from Settings.
- UI component: [src/components/setup-flow.tsx](src/components/setup-flow.tsx)

4. Check authentication state
   - Guest mode possible (local-only)
   - If user authenticated → proceed to Main Tabs
   - If not → show unified Auth screen (Login / Signup toggle)
5. Main app (Tabs): Home/Dashboard, Scan, Analytics, Budget, Settings
6. Transaction flows: Add/Edit/Delete → local DB update → set `syncStatus` to `pending` / `deleted`
7. Background synchronization (Sync Engine)
   - Run on launch, App foreground, periodic timer (e.g., 60s)
   - Push pending changes, resolve conflicts (latest `updatedAt` wins), pull cloud changes
8. User may logout or close app → cleanup listeners & persist small client state

---

## Navigation Map (file-based Expo Router)

- app/(auth)/auth.tsx — Unified Auth (Login / Signup)
- app/\_layout.tsx — Root layout (handles session checks)
- app/(tabs)/index.tsx — Dashboard (Home)
- app/(tabs)/scan.tsx — Receipt scanner
- app/(tabs)/analytics.tsx — Analytics
- app/(tabs)/budget.tsx — Budget management
- app/(tabs)/settings.tsx — Settings
- app/expense/[id].tsx — Expense detail
- app/expense/add.tsx — Add/Edit expense

---

## Screen Responsibilities (brief)

- Splash: initialize services, show logo, block until DB & auth are ready
- Onboarding: 3-slide carousel, skip option, persist completion flag
- First-time Setup: currency + budget flow after onboarding (optional)
- Auth: Login/Signup using `authService` → store tokens/user in secure store & `authStore`
- Dashboard: balance, recent transactions (FlatList), quick add FAB
- Scan: camera flow to capture/attach receipt images
- Analytics: charts and category breakdown
- Budget: create/edit budgets, show remaining amounts
- Settings: toggle cloud backup, theme, logout
- Expense add/edit: form using React Hook Form + Zod validation

---

## Services & Repositories

- `services/authService.ts` — SignIn/SignUp/SignOut, token management
- `services/dbService.ts` — SQLite wrapper (getDb, runAsync, getAllAsync)
- `services/transactionRepository.ts` — CRUD for `transactions` table + `applySyncWrite`, `hardDelete`, `getAllRaw`
- `services/budgetRepository.ts` — CRUD for `budgets` table
- `services/firestoreBackupService.ts` — Firestore wrappers: fetchTransactions, uploadTransactionsBatch, deleteTransactionsBatch, fetchBudgets, uploadBudgetsBatch, deleteBudgetsBatch
- `services/syncEngine.ts` — Background sync logic (conflict resolution and reconciliation)

Implementation pattern:

- UI components never call Firebase/Firestore directly — always go through services + hooks
- TanStack Query for caching where appropriate (e.g., analytics queries)

---

## Data Structures (TypeScript)

Use these canonical interfaces across services, repositories, and components.

```ts
export type SyncStatus = "pending" | "synced" | "deleted";

export interface User {
  id: string; // UID from Firebase
  email?: string;
  displayName?: string;
  createdAt: number; // epoch ms
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number; // cents (integer) recommended for precision
  currency: string; // ISO code, e.g. 'USD'
  date: number; // epoch ms (transaction date)
  categoryId?: string | null;
  paymentMethodId?: string | null;
  note?: string | null;
  receiptImagePath?: string | null; // local URI or remote URL
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  syncStatus: SyncStatus;
  isDeleted?: 0 | 1; // optional soft-delete flag in SQLite
}

export interface Budget {
  id: string;
  userId: string;
  title: string;
  amount: number; // cents
  currency: string;
  startDate: number; // epoch ms
  endDate?: number | null; // epoch ms
  categoryId?: string | null;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Settings {
  cloudBackup: boolean;
  currency: string;
  theme: "light" | "dark" | "system";
}
```

---

## SQLite Schema (recommended)

Keep numeric timestamps as integers (epoch ms). Amounts stored as integer cents.

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  date INTEGER NOT NULL,
  categoryId TEXT,
  paymentMethodId TEXT,
  note TEXT,
  receiptImagePath TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'pending',
  isDeleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(userId, date DESC);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  startDate INTEGER NOT NULL,
  endDate INTEGER,
  categoryId TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_start ON budgets(userId, startDate);
```

---

## Firestore Layout (recommended)

Structure all user data under `/users/{userId}/...` or top-level collections with `userId` field.

Option A (subcollections):

- `users/{userId}/transactions/{transactionId}`
- `users/{userId}/budgets/{budgetId}`

Document shape mirrors `Transaction` / `Budget` without local-only fields like `isDeleted`.

Fields:

- Keep `createdAt` and `updatedAt` as Firestore server timestamps when writing (store epoch ms for local comparisons when pulled).

---

## Sync Considerations

- `syncStatus` values: `pending` (local change pending upload), `synced` (in-sync), `deleted` (soft-delete pending remote delete)
- Conflict policy: latest `updatedAt` wins. When cloud is newer, apply cloud document to local via `applySyncWrite`.
- Deleted flow: `deleted` -> syncEngine calls `firestoreBackupService.delete...` -> `transactionRepository.hardDelete(id)` to remove from SQLite entirely.
- Backoff & retries: implement exponential backoff on transient network failures in `firestoreBackupService`.
- Offline: allow read/write locally — mark items `pending` and upload when online.

---

## Example Transaction JSON

```json
{
  "id": "tx_abc123",
  "userId": "uid_123",
  "amount": 1599,
  "currency": "USD",
  "date": 1681234567890,
  "categoryId": "cat_food",
  "note": "Lunch",
  "receiptImagePath": "file:///data/user/0/.../receipt.jpg",
  "createdAt": 1681234567890,
  "updatedAt": 1681234567890,
  "syncStatus": "pending"
}
```

---

## Implementation Notes & Best Practices

- Use `ThemedText` and `ThemedView` across components.
- Use `React Hook Form` + `Zod` for all forms; validate amounts, dates, and required fields.
- Use `FlatList` with pagination or windowing for long transaction lists.
- Use `expo-file-system` + `expo-media-library` for receipt images; store local URIs and upload if needed.
- Persist sensitive info in `expo-secure-store`.
- Provide clear UX for sync state (spinner or small indicator in Settings or header).
- Firestore writes should be batched where possible for efficiency.

---

## Where to add / update in this repo

- Screens: `src/app/*` — follow layout structure in repository
- Components: `src/components/*` (use Themed components)
  - Setup flow component: [src/components/setup-flow.tsx](src/components/setup-flow.tsx)
- Services: `src/services/*` (authService, transactionRepository, dbService, firestoreBackupService, syncEngine)
- Stores: `src/store/*` (authStore, settingsStore)
- Hooks: `src/hooks/*` (useTransactions, useBudgets, useTheme)

---

If you want, I can also:

- generate TypeScript type files under `src/types/` with these exact interfaces
- add SQL migration scripts for the schemas above
- add a README section with dev steps to run and test sync

---

_Last updated: 2026-06-12_
