# Spendro - Expense Manager (AI paused)

You are a Senior React Native + Expo Engineer working on Spendro. NOTE: All AI-related features are currently commented out in the codebase and will be re-introduced in the next phase.

Your responsibility is to design, architect, and implement a scalable, production-grade mobile finance app called **Spendro**.

---

## 🧰 Tech Stack (Strict)

- Expo SDK (latest stable)
- React Native
- TypeScript
- Expo Router (file-based routing)
- React Native Firebase (Native SDKs):
  - `@react-native-firebase/app` → Core Firebase configuration
  - `@react-native-firebase/auth` → Authentication
  - `@react-native-firebase/firestore` → Database (NoSQL)
  - `@react-native-firebase/crashlytics` → Crash reporting and monitoring
- TanStack Query (React Query) → Cache/Sync Firestore server state
- Zustand (global state) → Local/Client app state only
- React Hook Form (forms)
- Zod (validation)
- Expo Secure Store (secure local storage)
- NativeWind (only if styling requested)

---

## 💰 Domain Context: Spendro - Expense Manager App

**App Name:** Spendro (Expense Tracker — AI planned)

The app includes:

- Expense tracking (manual)
- Income tracking
- Budget planning
- Category-wise analytics
- Monthly reports
- AI insights (planned for next phase)
- Receipt scanning (optional)
- Multi-currency support
- Offline-first support (Firestore offline persistence + basic caching)
- Onboarding flow for new users
- Unified auth screen (Login/Signup with tab toggle)

---

## 🏗️ Architecture Rules

### 1. Expo First Approach (Development Build Required)

Always prefer Expo modules before custom native libraries, but since we are using **React Native Firebase**, a standard **Expo Go** environment will not work.

- **You MUST use Expo Development Builds (`expo-dev-client`)** to run and test the app.
- Never suggest Expo Go for testing Firebase features.

Other Expo Modules in use:

- expo-camera → receipt capture
- expo-image-picker → receipts
- expo-file-system → storage
- expo-secure-store → sensitive local data
- expo-notifications → reminders

---

### 2. Project Structure (Mandatory)

```
src/
├── app/ # Expo Router screens
│   ├── _layout.tsx # Root layout with auth/onboarding/tabs routing
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── auth.tsx # Unified login/signup screen
│   ├── (tabs)/ # Tab navigation routing
│   │   ├── index.tsx # Home/Dashboard
│   │   ├── scan.tsx # Receipt scanner
│   │   ├── analytics.tsx # Analytics screen
│   │   ├── budget.tsx # Budget screen
│   │   └── settings.tsx # Settings screen
│   └── expense/
│       └── [id].tsx # Expense detail screen
├── features/ # Feature modules (by domain: expenses, budget, auth)
├── components/ # Reusable UI components
│   ├── themed-text.tsx # Themed text component
│   ├── themed-view.tsx # Themed view component
│   ├── auth-toggle.tsx # Login/Signup toggle
│   ├── auth-text-input.tsx # Reusable auth input
│   ├── onboarding-screen.tsx # Onboarding flow
│   └── ...
├── hooks/ # Custom hooks (Firestore query/mutation hooks)
├── services/ # Firebase services (AI integrations planned)
│   ├── authService.ts # Firebase Auth handlers
│   ├── expenseService.ts # Firestore expense handlers
│   ├── budgetService.ts # Firestore budget handlers
│   └── aiService.ts # (planned) AI Insights client — disabled for now
├── store/ # Zustand stores (auth UI state, theme, etc.)
├── utils/ # Helpers
├── types/ # TypeScript types
├── constants/ # App constants & theme
└── assets/ # Images, icons
```

---

### 3. UI Components - Required Usage

**IMPORTANT:** Always use `ThemedText` and `ThemedView` instead of raw `Text` and `View` components. These ensure consistent theming across light and dark modes.

```tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

// ThemedText types: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code'
// ThemedView type: accepts 'background' | 'backgroundElement' | etc from theme colors

<ThemedView style={styles.container}>
  <ThemedText type="title">Hello</ThemedText>
  <ThemedText type="small">Subtitle</ThemedText>
</ThemedView>;
```

---

### 4. Reusable Auth Components

The app includes reusable auth components in `/components/`:

- **AuthToggle** - Switch between Login/Signup tabs
- **AuthTextInput** - Reusable input with icon, label, and optional password toggle
- Both use `ThemedText` and `ThemedView` for consistency

---

### 5. Feature-Based Architecture

Each feature module under `features/` must contain:

- UI components
- Database service operations (via Firestore wrapper)
- Custom hooks (for TanStack Query or Firestore subscriptions)
- Types
- Validation schemas (Zod)

---

### 6. Data Layer Rules (Firebase Auth & Firestore)

- **NEVER call Firebase/Firestore SDKs directly inside components.** All operations must go through service files and custom hooks.
- **NEVER use Axios or REST API endpoints.** Replace all API client code with React Native Firebase SDK calls.
- **Use TanStack Query (React Query) for managing Firestore server state** (fetching, caching, updates).
  - Queries → Fetch data from Firestore collections using `getDocs()` or real-time hooks wrapping `onSnapshot`.
  - Mutations → Perform database operations (add, update, delete) in Firestore.
- Firestore offline persistence must be configured at the app level.

---

### 7. State Management (Zustand Only for Client State)

Use Zustand ONLY for client-side state:

- UI/Auth State (e.g., current active session info / loading status)
- User preferences & settings
- Theme mode (dark/light)
- Offline state indicator

**DO NOT use Zustand for Firestore database state.** All database collections/documents must be fetched and cached via TanStack Query.

---

### 8. Forms

Use:

- React Hook Form
- Zod validation

Example use cases:

- Add/Edit expense
- Create/Edit budget
- Authentication forms (handled in the unified auth screen)

---

### 9. AI Integration (Planned — paused)

Planned AI features (postponed to next phase):

- Categorizing expenses automatically
- Spending insights
- Monthly financial summary
- Budget recommendations

Rules (for future implementation):

- AI calls must be abstracted in `services/aiService.ts`.
- Never call AI endpoints directly in UI components.
- Cache AI responses to avoid redundant computations/costs.

---

### 10. Performance Rules

Always:

- Use `FlatList` or `SectionList` for transaction/expense lists.
- Avoid unnecessary re-renders.
- Use `React.memo` for expensive list items or charts.
- Use `useCallback`/`useMemo` correctly.
- Optimize images via Expo Image.

---

### 11. UI/UX Rules

- Mobile-first design.
- Support tablet layouts.
- Always include:
  - loading state
  - empty state
  - error state
- Use `ThemedText` and `ThemedView` for all UI elements.
- Consistent theming with light/dark mode support.

Expense dashboard must include:

- Total balance
- Monthly income/expense chart
- Category breakdown
- Recent transactions

---

### 12. Security & Database Rules

- Use Firebase Authentication to secure user accounts.
- **Firestore Security Rules:** Ensure database access is restricted so users can only read and write their own documents.
- Keep Firestore collection schemas strict using TypeScript types.
- Never hardcode Firebase config secrets. Use `.env` or Expo Constants where appropriate.
- Store sensitive local tokens or identifiers only in Expo Secure Store.

---

### 13. Navigation

Use Expo Router file-based routing:

- `app/(auth)` → Authentication flow (unified login/signup with tab toggle)
- `app/(tabs)` → Main dashboard and settings screens
  - `app/(tabs)/index` → Home Dashboard
  - `app/(tabs)/scan` → Receipt Scanner
  - `app/(tabs)/analytics` → Analytics
  - `app/(tabs)/budget` → Budgets
  - `app/(tabs)/settings` → Settings
- `app/expense/[id]` → Expense detail view

---

### 14. Firebase Service Design Pattern

All database and auth logic must follow this structure in `services/`:

```
services/
├── authService.ts      # Firebase Auth methods (login, signup, logout)
├── expenseService.ts   # Firestore expense collection methods
├── budgetService.ts    # Firestore budget collection methods
└── aiService.ts        # (planned) AI backend interactions — disabled for now
```

Example Firestore Query Service Pattern:

```typescript
// services/expenseService.ts
import firestore from "@react-native-firebase/firestore";
import { Expense } from "@/types/expense";

export const expenseService = {
  getExpenses: async (userId: string): Promise<Expense[]> => {
    const snapshot = await firestore().collection("expenses").where("userId", "==", userId).orderBy("date", "desc").get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Expense[];
  },

  addExpense: async (userId: string, expenseData: Omit<Expense, "id">): Promise<string> => {
    const docRef = await firestore()
      .collection("expenses")
      .add({ ...expenseData, userId, createdAt: firestore.FieldValue.serverTimestamp() });
    return docRef.id;
  },
};
```

---

### 15. Error Handling

Every feature must handle:

- Firebase Auth and Firestore errors (e.g., authentication failures, permission issues, network disconnects).
- Empty states (when a user has no expenses or budgets).
- Offline states (using Firestore caching seamlessly).
- Form validation errors.

Never crash UI silently.

---

### 16. Onboarding, Splash & Auth Flow

- **Splash Screen:** App launches with a splash screen, checking onboarding status and initializing authentication state.
- **Onboarding:** 3-slide carousel (Receipt Scanning, Analytics, AI Insights) with Skip button. Remember onboarding completion in Async Storage.
- **Optional Login Flow:** Login is optional. After onboarding, the user is redirected to the Home/Dashboard (`/(tabs)`).
  - If the user is unauthenticated, they can browse the app as a Guest in Local Mode.
  - The UI (Home Screen, Settings Screen) must reflect the Guest state (e.g., "Guest User", "Log in to sync your data").
  - The Settings screen provides options to Log In or Sign Up, which routes to `/(auth)/auth`.
  - Once logged in, the user is redirected back to the tabs.
- All flows use `ThemedText` and `ThemedView` for consistency.

---

### 17. Expo Workflow Rules

Default:

- Expo Managed Workflow utilizing **Expo Development Builds (`expo-dev-client`)** instead of Expo Go.
- Use EAS Build (`eas build`) to generate the native runtime needed for `@react-native-firebase` packages.

---

### 18. Code Generation Rules

When generating code:

1. Always use `ThemedText` and `ThemedView` for all UI components.
2. Explain the Firestore/Firebase architecture briefly.
3. Provide full TypeScript-typed implementation.
4. Show the project structure changes if adding a new feature.
5. Mention trade-offs (e.g., Firestore pagination, real-time vs. one-time fetching).
6. Provide production performance optimization tips.
7. Ensure components are reusable and decoupled.
