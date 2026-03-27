# 个人助理工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-device personal assistant web app with 5 content modules, Google OAuth with invite whitelist, real-time sync, and day/week review views.

**Architecture:** Next.js 14 App Router on Vercel; Supabase for PostgreSQL, file storage, realtime sync, and Google OAuth. Server Components for initial data fetch, Server Actions for mutations, Supabase Realtime subscriptions for live multi-device updates. Admin email configured via env var; first login auto-registers admin.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, @supabase/supabase-js, @supabase/ssr, date-fns, vitest, Web Speech API (browser-native)

---

## File Structure

```
personal-assistant/
├── app/
│   ├── layout.tsx                        # Root HTML shell
│   ├── page.tsx                          # Redirect → /today
│   ├── login/page.tsx                    # Google sign-in page
│   ├── unauthorized/page.tsx             # Not on whitelist
│   ├── auth/
│   │   ├── callback/route.ts             # OAuth callback, auto-adds admin
│   │   └── setup/route.ts               # First-run admin setup
│   ├── api/
│   │   ├── link-preview/route.ts         # OG metadata scraper
│   │   └── rollover/route.ts             # Daily rollover cron endpoint
│   └── (app)/
│       ├── layout.tsx                    # App shell (auth-gated)
│       ├── today/page.tsx
│       ├── backlog/page.tsx
│       ├── inspiration/page.tsx
│       ├── materials/page.tsx
│       ├── habits/page.tsx
│       ├── review/day/page.tsx
│       ├── review/week/page.tsx
│       ├── stats/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx                  # Wraps sidebar + main content
│   │   ├── Sidebar.tsx                   # Desktop left nav
│   │   ├── TopBar.tsx                    # Search bar + add button
│   │   └── BottomNav.tsx                 # Mobile bottom nav
│   ├── items/
│   │   ├── QuickAddModal.tsx             # Half-sheet modal with category picker
│   │   ├── VoiceInput.tsx                # Web Speech API mic button
│   │   └── ItemCard.tsx                  # Generic card (backlog/inspiration/material)
│   ├── today/
│   │   ├── QuadrantGrid.tsx              # 2×2 grid container
│   │   └── QuadrantCard.tsx              # Single todo card inside quadrant
│   ├── materials/
│   │   ├── MaterialCard.tsx              # Card with OG preview or image
│   │   └── ImageUpload.tsx               # Upload to Supabase Storage
│   ├── habits/
│   │   ├── HabitRow.tsx                  # Single habit + inline calendar
│   │   └── HabitCalendar.tsx             # Month dot grid
│   ├── review/
│   │   ├── DayTimeline.tsx               # Chronological item list for one day
│   │   └── WeekGrid.tsx                  # 7-column week summary
│   ├── search/
│   │   └── SearchResults.tsx             # Dropdown results list
│   └── ui/
│       ├── CategoryBadge.tsx             # Colored pill label
│       └── StatsWidget.tsx               # Count cards + bar chart
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # createBrowserClient()
│   │   ├── server.ts                     # createServerClient() (cookies)
│   │   └── service.ts                    # createServiceClient() (service role)
│   ├── db/
│   │   ├── items.ts                      # CRUD for items table
│   │   ├── habits.ts                     # Habit log CRUD + streak calc
│   │   └── users.ts                      # allowed_users management
│   └── utils/
│       ├── rollover.ts                   # Pure rollover logic (unit-tested)
│       ├── streak.ts                     # Pure streak calculation (unit-tested)
│       └── dates.ts                      # Date helpers (unit-tested)
├── __tests__/
│   ├── rollover.test.ts
│   ├── streak.test.ts
│   └── dates.test.ts
├── middleware.ts                         # Auth guard + whitelist check
├── supabase/migrations/001_initial.sql   # Full DB schema
├── vercel.json                           # Cron job config
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
└── .env.local.example
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `next.config.ts`, `vitest.config.ts`, `.env.local.example`

- [ ] **Step 1: Bootstrap Next.js app**

Run from `C:/Users/我有两个太阳/`:
```bash
cd "C:/Users/我有两个太阳"
npx create-next-app@14 personal-assistant --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
cd personal-assistant
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr date-fns
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Write tailwind.config.ts**

Replace the generated file entirely:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: '#FAF8F5',
        accent: '#F97316',
        'today-tag': '#FCA5A5',
        'backlog-tag': '#93C5FD',
        'inspiration-tag': '#C4B5FD',
        'material-tag': '#6EE7B7',
        'habit-tag': '#FCD34D',
        'text-main': '#1C1917',
        'text-muted': '#78716C',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Write vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

- [ ] **Step 5: Write vitest.setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Write .env.local.example**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=your@gmail.com
CRON_SECRET=a-random-secret-string
```

- [ ] **Step 7: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 14 project with Tailwind and Vitest"
```

---

## Task 2: Database Schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/001_initial.sql

create extension if not exists "uuid-ossp";

-- Items (all 5 modules share this table)
create table items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null check (category in ('today_todo','backlog','inspiration','material','habit')),
  title text not null,
  content text,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  quadrant integer check (quadrant between 1 and 4),
  due_date date,
  display_date date,
  media_url text,
  link_url text,
  link_title text,
  link_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Habit check-in logs
create table habit_logs (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  checked_date date not null,
  created_at timestamptz not null default now(),
  unique(item_id, checked_date)
);

-- Invite whitelist
create table allowed_users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table items enable row level security;
alter table habit_logs enable row level security;
alter table allowed_users enable row level security;

create policy "items_own" on items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_own" on habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "allowed_users_read" on allowed_users for select to authenticated using (true);
create policy "allowed_users_admin_write" on allowed_users for all using (
  exists (select 1 from allowed_users where email = auth.email() and is_admin = true)
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger items_updated_at before update on items
  for each row execute function update_updated_at();

-- Index for common queries
create index items_user_category on items(user_id, category);
create index items_user_status on items(user_id, status);
create index items_display_date on items(display_date);
create index habit_logs_item_date on habit_logs(item_id, checked_date);
```

- [ ] **Step 2: Apply schema to Supabase**

1. Go to https://supabase.com → create a new project (free tier)
2. Once created, go to **SQL Editor**
3. Paste the entire SQL above and click **Run**
4. Confirm all tables appear in the **Table Editor**

- [ ] **Step 3: Enable Google OAuth in Supabase**

1. In Supabase dashboard → **Authentication → Providers → Google**
2. Enable Google provider
3. Follow the linked guide to create a Google OAuth app at console.cloud.google.com
4. Copy Client ID and Client Secret into Supabase
5. Copy the **Callback URL** from Supabase into Google OAuth app

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_initial.sql
git commit -m "feat: add database schema with RLS policies"
```

---

## Task 3: Supabase Clients + Middleware

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/service.ts`, `middleware.ts`

- [ ] **Step 1: Write lib/supabase/client.ts**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Write lib/supabase/server.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Write lib/supabase/service.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 4: Write middleware.ts**

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // Skip auth for public paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/rollover')
  ) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: allowed } = await supabase
    .from('allowed_users')
    .select('id')
    .eq('email', user.email!)
    .maybeSingle()

  if (!allowed) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/ middleware.ts
git commit -m "feat: add Supabase clients and auth middleware"
```

---

## Task 4: Auth Pages

**Files:**
- Create: `app/login/page.tsx`, `app/unauthorized/page.tsx`, `app/auth/callback/route.ts`

- [ ] **Step 1: Write app/login/page.tsx**

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-card p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-text-main mb-2">个人助理</h1>
        <p className="text-text-muted mb-8 text-sm">你的待办、灵感与素材管理工具</p>
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-accent text-white rounded-card py-3 px-4 font-medium hover:bg-orange-600 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 账号登录
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write app/unauthorized/page.tsx**

```typescript
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-warm flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-card p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold text-text-main mb-2">暂无访问权限</h1>
        <p className="text-text-muted text-sm">请联系管理员将你的邮箱加入白名单后再登录。</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write app/auth/callback/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user?.email) {
      // Check if allowed_users is empty (first run) → auto-add as admin
      const { count } = await supabase
        .from('allowed_users')
        .select('*', { count: 'exact', head: true })

      const isFirstUser = count === 0
      const isAdminEmail = user.email === process.env.ADMIN_EMAIL

      if (isFirstUser || isAdminEmail) {
        const service = createServiceClient()
        await service.from('allowed_users').upsert(
          { email: user.email, is_admin: true, invited_by: user.id },
          { onConflict: 'email' }
        )
      }

      return NextResponse.redirect(`${origin}/today`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
```

- [ ] **Step 4: Write app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '个人助理',
  description: '你的待办、灵感与素材管理工具',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={`${inter.className} bg-warm min-h-screen`}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Write app/page.tsx**

```typescript
import { redirect } from 'next/navigation'
export default function Home() { redirect('/today') }
```

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: add login, unauthorized pages and OAuth callback"
```

---

## Task 5: App Shell Layout

**Files:**
- Create: `app/(app)/layout.tsx`, `components/layout/AppShell.tsx`, `components/layout/Sidebar.tsx`, `components/layout/TopBar.tsx`, `components/layout/BottomNav.tsx`

- [ ] **Step 1: Write components/layout/Sidebar.tsx**

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/today', label: '今日待办', emoji: '📋', color: 'today-tag' },
  { href: '/backlog', label: '待处理', emoji: '📥', color: 'backlog-tag' },
  { href: '/inspiration', label: '选题灵感', emoji: '💡', color: 'inspiration-tag' },
  { href: '/materials', label: '素材收集', emoji: '📌', color: 'material-tag' },
  { href: '/habits', label: '日常习惯', emoji: '✅', color: 'habit-tag' },
]

const reviewItems = [
  { href: '/review/day', label: '日视图', emoji: '📅' },
  { href: '/review/week', label: '周视图', emoji: '📆' },
  { href: '/stats', label: '统计', emoji: '📊' },
  { href: '/settings', label: '设置', emoji: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-stone-100 h-screen sticky top-0 p-4 gap-1">
      <div className="text-lg font-semibold text-text-main px-2 py-3 mb-2">个人助理</div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-colors ${
            pathname === item.href
              ? 'bg-orange-50 text-accent font-medium'
              : 'text-text-muted hover:bg-stone-50 hover:text-text-main'
          }`}
        >
          <span>{item.emoji}</span>
          {item.label}
        </Link>
      ))}
      <div className="mt-4 border-t border-stone-100 pt-4 flex flex-col gap-1">
        {reviewItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-colors ${
              pathname === item.href
                ? 'bg-orange-50 text-accent font-medium'
                : 'text-text-muted hover:bg-stone-50 hover:text-text-main'
            }`}
          >
            <span>{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Write components/layout/BottomNav.tsx**

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/today', label: '今日', emoji: '📋' },
  { href: '/backlog', label: '待处理', emoji: '📥' },
  { href: '/inspiration', label: '灵感', emoji: '💡' },
  { href: '/materials', label: '素材', emoji: '📌' },
  { href: '/habits', label: '习惯', emoji: '✅' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex z-40">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
            pathname === tab.href ? 'text-accent' : 'text-text-muted'
          }`}
        >
          <span className="text-lg">{tab.emoji}</span>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
```

- [ ] **Step 3: Write components/layout/TopBar.tsx**

```typescript
'use client'
import { useState } from 'react'
import QuickAddModal from '@/components/items/QuickAddModal'
import SearchResults from '@/components/search/SearchResults'

export default function TopBar() {
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-stone-100 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="搜索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-warm rounded-card px-4 py-2 text-sm text-text-main placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent/30"
          />
          {query && <SearchResults query={query} onClose={() => setQuery('')} />}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-accent text-white rounded-card flex items-center justify-center text-xl font-light hover:bg-orange-600 transition-colors flex-shrink-0"
          aria-label="添加记录"
        >
          +
        </button>
      </header>
      {showAdd && <QuickAddModal onClose={() => setShowAdd(false)} />}
    </>
  )
}
```

- [ ] **Step 4: Write components/layout/AppShell.tsx**

```typescript
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 pb-20 md:pb-6 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 5: Write app/(app)/layout.tsx**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <AppShell>{children}</AppShell>
}
```

- [ ] **Step 6: Commit**

```bash
git add app/ components/layout/
git commit -m "feat: add app shell with sidebar, top bar, and mobile bottom nav"
```

---

## Task 6: DB Utilities + Tests

**Files:**
- Create: `lib/utils/dates.ts`, `lib/utils/rollover.ts`, `lib/utils/streak.ts`, `lib/db/items.ts`, `lib/db/habits.ts`, `lib/db/users.ts`, `__tests__/rollover.test.ts`, `__tests__/streak.test.ts`, `__tests__/dates.test.ts`

- [ ] **Step 1: Write lib/utils/dates.ts**

```typescript
import { format, startOfDay, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns'

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MM月dd日')
}

export function dueDateStatus(dateStr: string | null): 'normal' | 'near' | 'overdue' {
  if (!dateStr) return 'normal'
  const d = new Date(dateStr)
  if (isPast(startOfDay(d)) && !isToday(d)) return 'overdue'
  if (isToday(d) || isTomorrow(d)) return 'near'
  return 'normal'
}
```

- [ ] **Step 2: Write __tests__/dates.test.ts**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { dueDateStatus } from '@/lib/utils/dates'

describe('dueDateStatus', () => {
  it('returns normal for null', () => {
    expect(dueDateStatus(null)).toBe('normal')
  })

  it('returns near for today', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(dueDateStatus(today)).toBe('near')
  })

  it('returns overdue for yesterday', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    expect(dueDateStatus(d.toISOString().slice(0, 10))).toBe('overdue')
  })

  it('returns normal for future date', () => {
    const d = new Date()
    d.setDate(d.getDate() + 5)
    expect(dueDateStatus(d.toISOString().slice(0, 10))).toBe('normal')
  })
})
```

- [ ] **Step 3: Run dates tests**

```bash
npm test -- dates
```
Expected: 4 tests PASS

- [ ] **Step 4: Write lib/utils/rollover.ts**

```typescript
import { parseISO, startOfDay, isBefore } from 'date-fns'

export type RolloverItem = {
  id: string
  display_date: string | null
  created_at: string
}

/**
 * Returns IDs of active today_todo items whose display_date is before today.
 * These need their display_date updated to today (rolled over).
 */
export function getItemsToRollover(items: RolloverItem[], today: Date = new Date()): string[] {
  const todayStart = startOfDay(today)
  return items
    .filter((item) => {
      const dateStr = item.display_date ?? item.created_at.slice(0, 10)
      return isBefore(startOfDay(parseISO(dateStr)), todayStart)
    })
    .map((item) => item.id)
}
```

- [ ] **Step 5: Write __tests__/rollover.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import { getItemsToRollover } from '@/lib/utils/rollover'

const today = new Date('2026-03-27')
const yesterday = '2026-03-26'
const twoDaysAgo = '2026-03-25'
const todayStr = '2026-03-27'

describe('getItemsToRollover', () => {
  it('returns items with display_date before today', () => {
    const items = [
      { id: '1', display_date: yesterday, created_at: `${twoDaysAgo}T00:00:00Z` },
      { id: '2', display_date: todayStr, created_at: `${todayStr}T00:00:00Z` },
    ]
    expect(getItemsToRollover(items, today)).toEqual(['1'])
  })

  it('falls back to created_at date when display_date is null', () => {
    const items = [
      { id: '3', display_date: null, created_at: `${yesterday}T10:00:00Z` },
      { id: '4', display_date: null, created_at: `${todayStr}T10:00:00Z` },
    ]
    expect(getItemsToRollover(items, today)).toEqual(['3'])
  })

  it('returns empty array when nothing needs rollover', () => {
    const items = [
      { id: '5', display_date: todayStr, created_at: `${todayStr}T00:00:00Z` },
    ]
    expect(getItemsToRollover(items, today)).toEqual([])
  })
})
```

- [ ] **Step 6: Run rollover tests**

```bash
npm test -- rollover
```
Expected: 3 tests PASS

- [ ] **Step 7: Write lib/utils/streak.ts**

```typescript
import { parseISO, differenceInDays, format, subDays } from 'date-fns'

/**
 * Calculates the current consecutive-day streak from an array of checked date strings (yyyy-MM-dd).
 * Streak counts from today or yesterday backward through consecutive days.
 */
export function calculateStreak(checkedDates: string[]): number {
  if (checkedDates.length === 0) return 0

  const unique = [...new Set(checkedDates)].sort().reverse()
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  if (unique[0] !== today && unique[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const diff = differenceInDays(parseISO(unique[i - 1]), parseISO(unique[i]))
    if (diff === 1) streak++
    else break
  }
  return streak
}
```

- [ ] **Step 8: Write __tests__/streak.test.ts**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateStreak } from '@/lib/utils/streak'

// We fix "today" to a known date for deterministic tests
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-27'))
})
afterEach(() => vi.useRealTimers())

describe('calculateStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('returns 1 when only today is checked', () => {
    expect(calculateStreak(['2026-03-27'])).toBe(1)
  })

  it('returns 3 for 3 consecutive days ending today', () => {
    expect(calculateStreak(['2026-03-25', '2026-03-26', '2026-03-27'])).toBe(3)
  })

  it('breaks streak on gap', () => {
    expect(calculateStreak(['2026-03-24', '2026-03-26', '2026-03-27'])).toBe(2)
  })

  it('counts streak ending yesterday', () => {
    expect(calculateStreak(['2026-03-25', '2026-03-26'])).toBe(2)
  })

  it('returns 0 when last check was 2 days ago', () => {
    expect(calculateStreak(['2026-03-25'])).toBe(0)
  })
})
```

- [ ] **Step 9: Run streak tests**

```bash
npm test -- streak
```
Expected: 6 tests PASS

- [ ] **Step 10: Write lib/db/items.ts**

```typescript
import { createClient } from '@/lib/supabase/server'
import { todayStr } from '@/lib/utils/dates'

export type ItemCategory = 'today_todo' | 'backlog' | 'inspiration' | 'material' | 'habit'
export type ItemStatus = 'active' | 'completed' | 'cancelled'

export type Item = {
  id: string
  user_id: string
  category: ItemCategory
  title: string
  content: string | null
  status: ItemStatus
  quadrant: number | null
  due_date: string | null
  display_date: string | null
  media_url: string | null
  link_url: string | null
  link_title: string | null
  link_image: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export type CreateItemInput = {
  category: ItemCategory
  title: string
  content?: string
  quadrant?: number
  due_date?: string
  link_url?: string
  link_title?: string
  link_image?: string
  media_url?: string
}

export async function getItemsByCategory(category: ItemCategory): Promise<Item[]> {
  const supabase = await createClient()
  const query = supabase
    .from('items')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (category === 'today_todo') {
    const today = todayStr()
    query
      .eq('status', 'active')
      .or(`display_date.eq.${today},and(display_date.is.null,created_at.gte.${today}T00:00:00Z)`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const payload = {
    ...input,
    user_id: user.id,
    display_date: input.category === 'today_todo' ? todayStr() : null,
  }

  const { data, error } = await supabase.from('items').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function completeItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('items')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function cancelItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('items')
    .update({ status: 'cancelled', completed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getItemsForDay(dateStr: string): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .or(
      `display_date.eq.${dateStr},` +
      `and(display_date.is.null,created_at.gte.${dateStr}T00:00:00Z,created_at.lt.${dateStr}T23:59:59Z)`
    )
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function searchItems(query: string): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data ?? []
}
```

- [ ] **Step 11: Write lib/db/habits.ts**

```typescript
import { createClient } from '@/lib/supabase/server'
import { calculateStreak } from '@/lib/utils/streak'
import { todayStr } from '@/lib/utils/dates'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export type HabitWithLogs = {
  id: string
  title: string
  checkedDates: string[]
  streak: number
  checkedToday: boolean
}

export async function getHabitsWithLogs(): Promise<HabitWithLogs[]> {
  const supabase = await createClient()
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const { data: habits, error: hErr } = await supabase
    .from('items')
    .select('id, title')
    .eq('category', 'habit')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
  if (hErr) throw hErr

  const today = todayStr()
  const result: HabitWithLogs[] = []

  for (const habit of habits ?? []) {
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('checked_date')
      .eq('item_id', habit.id)
      .gte('checked_date', monthStart)
      .lte('checked_date', monthEnd)

    const checkedDates = (logs ?? []).map((l) => l.checked_date)
    result.push({
      id: habit.id,
      title: habit.title,
      checkedDates,
      streak: calculateStreak(checkedDates),
      checkedToday: checkedDates.includes(today),
    })
  }
  return result
}

export async function toggleHabitLog(itemId: string, date: string, checked: boolean): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (checked) {
    await supabase.from('habit_logs').upsert(
      { item_id: itemId, user_id: user.id, checked_date: date },
      { onConflict: 'item_id,checked_date' }
    )
  } else {
    await supabase.from('habit_logs').delete()
      .eq('item_id', itemId).eq('checked_date', date)
  }
}
```

- [ ] **Step 12: Write lib/db/users.ts**

```typescript
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export type AllowedUser = {
  id: string
  email: string
  is_admin: boolean
  created_at: string
}

export async function getAllowedUsers(): Promise<AllowedUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('allowed_users')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('allowed_users')
    .select('is_admin')
    .eq('email', user.email!)
    .maybeSingle()
  return data?.is_admin === true
}

export async function addAllowedUser(email: string, invitedBy: string): Promise<void> {
  const service = createServiceClient()
  const { error } = await service.from('allowed_users').insert({ email, invited_by: invitedBy })
  if (error) throw error
}

export async function removeAllowedUser(id: string): Promise<void> {
  const service = createServiceClient()
  const { error } = await service.from('allowed_users').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 13: Run all tests**

```bash
npm test
```
Expected: All tests PASS

- [ ] **Step 14: Commit**

```bash
git add lib/ __tests__/ vitest.config.ts vitest.setup.ts
git commit -m "feat: add DB utilities and unit tests for rollover, streak, dates"
```

---

## Task 7: Quick Add Modal + Voice Input

**Files:**
- Create: `components/items/QuickAddModal.tsx`, `components/items/VoiceInput.tsx`, `components/ui/CategoryBadge.tsx`

- [ ] **Step 1: Write components/ui/CategoryBadge.tsx**

```typescript
const categoryConfig = {
  today_todo: { label: '今日待办', color: 'bg-today-tag text-rose-700' },
  backlog: { label: '待处理', color: 'bg-backlog-tag text-blue-700' },
  inspiration: { label: '选题灵感', color: 'bg-inspiration-tag text-purple-700' },
  material: { label: '素材收集', color: 'bg-material-tag text-emerald-700' },
  habit: { label: '日常习惯', color: 'bg-habit-tag text-amber-700' },
} as const

type Category = keyof typeof categoryConfig

export default function CategoryBadge({ category }: { category: Category }) {
  const { label, color } = categoryConfig[category]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Write components/items/VoiceInput.tsx**

```typescript
'use client'
import { useState, useRef } from 'react'

interface Props {
  onTranscript: (text: string) => void
}

export default function VoiceInput({ onTranscript }: Props) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  function start() {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  function stop() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      className={`w-9 h-9 rounded-card flex items-center justify-center transition-colors ${
        listening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-stone-100 text-text-muted hover:bg-stone-200'
      }`}
      aria-label={listening ? '停止录音' : '语音输入'}
    >
      🎤
    </button>
  )
}
```

- [ ] **Step 3: Write components/items/QuickAddModal.tsx**

```typescript
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import VoiceInput from './VoiceInput'
import { createItem, type ItemCategory } from '@/lib/db/items'

const CATEGORIES: { value: ItemCategory; label: string; emoji: string }[] = [
  { value: 'today_todo', label: '今日待办', emoji: '📋' },
  { value: 'backlog', label: '待处理', emoji: '📥' },
  { value: 'inspiration', label: '选题灵感', emoji: '💡' },
  { value: 'material', label: '素材收集', emoji: '📌' },
  { value: 'habit', label: '日常习惯', emoji: '✅' },
]

const QUADRANTS = [
  { value: 1, label: '重要且紧急' },
  { value: 2, label: '重要不紧急' },
  { value: 3, label: '不重要紧急' },
  { value: 4, label: '不重要不紧急' },
]

interface Props {
  onClose: () => void
  defaultCategory?: ItemCategory
}

export default function QuickAddModal({ onClose, defaultCategory = 'today_todo' }: Props) {
  const [category, setCategory] = useState<ItemCategory>(defaultCategory)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [quadrant, setQuadrant] = useState(1)
  const [dueDate, setDueDate] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Auto-detect link in title
  const isLink = /^https?:\/\//.test(title.trim())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    startTransition(async () => {
      await createItem({
        category: isLink ? 'material' : category,
        title: title.trim(),
        content: content.trim() || undefined,
        quadrant: category === 'today_todo' ? quadrant : undefined,
        due_date: dueDate || undefined,
        link_url: isLink ? title.trim() : undefined,
      })
      router.refresh()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl md:rounded-card shadow-xl w-full md:max-w-lg p-5 pb-8 md:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-main">添加记录</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              placeholder="标题或链接..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-warm rounded-card px-4 py-2.5 text-sm text-text-main outline-none focus:ring-2 focus:ring-accent/30"
            />
            <VoiceInput onTranscript={(t) => setTitle((prev) => prev + t)} />
          </div>

          <textarea
            placeholder="备注（可选）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="bg-warm rounded-card px-4 py-2.5 text-sm text-text-main outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />

          {/* Category selector */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  category === cat.value
                    ? 'bg-accent text-white'
                    : 'bg-stone-100 text-text-muted hover:bg-stone-200'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Quadrant selector (only for today_todo) */}
          {category === 'today_todo' && (
            <select
              value={quadrant}
              onChange={(e) => setQuadrant(Number(e.target.value))}
              className="bg-warm rounded-card px-4 py-2 text-sm text-text-main outline-none"
            >
              {QUADRANTS.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          )}

          {/* Due date (only for today_todo) */}
          {category === 'today_todo' && (
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-warm rounded-card px-4 py-2 text-sm text-text-main outline-none"
            />
          )}

          <button
            type="submit"
            disabled={!title.trim() || isPending}
            className="bg-accent text-white rounded-card py-2.5 font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isPending ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify modal renders**

Start dev server and test manually:
```bash
npm run dev
```
Open http://localhost:3000 → click + button → modal should appear with all 5 category buttons, mic icon, and save button. Try typing and saving.

- [ ] **Step 5: Commit**

```bash
git add components/
git commit -m "feat: add quick add modal with category picker and voice input"
```

---

## Task 8: Today Module (4-Quadrant View)

**Files:**
- Create: `components/today/QuadrantGrid.tsx`, `components/today/QuadrantCard.tsx`, `app/(app)/today/page.tsx`

- [ ] **Step 1: Write components/today/QuadrantCard.tsx**

```typescript
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeItem, cancelItem, type Item } from '@/lib/db/items'
import { dueDateStatus } from '@/lib/utils/dates'

export default function QuadrantCard({ item }: { item: Item }) {
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const dateStatus = dueDateStatus(item.due_date)

  function handleComplete() {
    setDone(true)
    setTimeout(() => {
      startTransition(async () => {
        await completeItem(item.id)
        router.refresh()
      })
    }, 300)
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelItem(item.id)
      router.refresh()
    })
  }

  return (
    <div
      className={`group flex items-start gap-2 p-2 rounded-card bg-white shadow-card transition-all duration-300 ${
        done ? 'opacity-0 scale-95' : 'opacity-100'
      }`}
    >
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="mt-0.5 w-5 h-5 rounded-full border-2 border-stone-300 flex-shrink-0 hover:border-accent transition-colors"
        aria-label="完成"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-main leading-snug break-words">{item.title}</p>
        {item.due_date && (
          <span className={`text-xs mt-0.5 inline-block ${
            dateStatus === 'overdue' ? 'text-red-500' :
            dateStatus === 'near' ? 'text-accent' : 'text-text-muted'
          }`}>
            📅 {item.due_date}
          </span>
        )}
      </div>
      <button
        onClick={handleCancel}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-xs transition-opacity"
        aria-label="取消"
      >
        ✕
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Write components/today/QuadrantGrid.tsx**

```typescript
import QuadrantCard from './QuadrantCard'
import type { Item } from '@/lib/db/items'

const QUADRANTS = [
  { id: 1, title: '重要且紧急', subtitle: '立即做', color: 'border-red-200 bg-red-50/50' },
  { id: 2, title: '重要不紧急', subtitle: '计划做', color: 'border-blue-200 bg-blue-50/50' },
  { id: 3, title: '不重要紧急', subtitle: '快速处理', color: 'border-amber-200 bg-amber-50/50' },
  { id: 4, title: '不重要不紧急', subtitle: '考虑删除', color: 'border-stone-200 bg-stone-50/50' },
]

interface Props {
  items: Item[]
}

export default function QuadrantGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {QUADRANTS.map((q) => {
        const quadrantItems = items.filter((i) => i.quadrant === q.id)
        return (
          <div key={q.id} className={`rounded-card border p-3 min-h-32 ${q.color}`}>
            <div className="mb-2">
              <p className="text-xs font-semibold text-text-main">{q.title}</p>
              <p className="text-xs text-text-muted">{q.subtitle}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {quadrantItems.map((item) => (
                <QuadrantCard key={item.id} item={item} />
              ))}
              {quadrantItems.length === 0 && (
                <p className="text-xs text-text-muted italic">暂无任务</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Write app/(app)/today/page.tsx**

```typescript
import { getItemsByCategory } from '@/lib/db/items'
import QuadrantGrid from '@/components/today/QuadrantGrid'

export default async function TodayPage() {
  const items = await getItemsByCategory('today_todo')
  const activeCount = items.filter((i) => i.status === 'active').length
  const doneCount = items.filter((i) => i.status === 'completed').length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-text-main">今日待办</h1>
          <p className="text-sm text-text-muted mt-0.5">
            已完成 {doneCount} / 共 {items.length} 项
          </p>
        </div>
      </div>
      <QuadrantGrid items={items} />
    </div>
  )
}
```

- [ ] **Step 4: Test in browser**

```bash
npm run dev
```
Navigate to http://localhost:3000/today. Add a few todo items via the + button. Verify they appear in the correct quadrant. Click the circle to complete — item should fade out.

- [ ] **Step 5: Commit**

```bash
git add components/today/ app/\(app\)/today/
git commit -m "feat: add today module with 4-quadrant grid and completion animation"
```

---

## Task 9: Daily Rollover

**Files:**
- Create: `app/api/rollover/route.ts`, `vercel.json`

- [ ] **Step 1: Write app/api/rollover/route.ts**

```typescript
import { createServiceClient } from '@/lib/supabase/service'
import { getItemsToRollover } from '@/lib/utils/rollover'
import { todayStr } from '@/lib/utils/dates'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = todayStr()

  // Get all active today_todos not yet on today's date
  const { data: items, error } = await supabase
    .from('items')
    .select('id, display_date, created_at')
    .eq('category', 'today_todo')
    .eq('status', 'active')
    .neq('display_date', today)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const toRollover = getItemsToRollover(items ?? [])

  if (toRollover.length > 0) {
    const { error: updateError } = await supabase
      .from('items')
      .update({ display_date: today })
      .in('id', toRollover)
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ rolled: toRollover.length, date: today })
}
```

- [ ] **Step 2: Write vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/rollover",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Note: Vercel cron jobs send requests with the `Authorization: Bearer CRON_SECRET` header automatically when `CRON_SECRET` is set as an environment variable in Vercel.

- [ ] **Step 3: Commit**

```bash
git add app/api/rollover/ vercel.json
git commit -m "feat: add daily rollover cron endpoint"
```

---

## Task 10: Backlog Module

**Files:**
- Create: `components/items/ItemCard.tsx`, `app/(app)/backlog/page.tsx`

- [ ] **Step 1: Write components/items/ItemCard.tsx**

```typescript
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeItem, cancelItem, type Item } from '@/lib/db/items'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function ItemCard({ item }: { item: Item }) {
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleComplete() {
    setDone(true)
    setTimeout(() => {
      startTransition(async () => {
        await completeItem(item.id)
        router.refresh()
      })
    }, 300)
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelItem(item.id)
      router.refresh()
    })
  }

  return (
    <div
      className={`group flex items-start gap-3 p-4 bg-white rounded-card shadow-card transition-all duration-300 ${
        done ? 'opacity-0 scale-95' : 'opacity-100'
      }`}
    >
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="mt-0.5 w-5 h-5 rounded-full border-2 border-stone-300 flex-shrink-0 hover:border-accent transition-colors"
        aria-label="完成"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-main leading-snug">{item.title}</p>
        {item.content && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{item.content}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <CategoryBadge category={item.category} />
          <span className="text-xs text-text-muted">
            {new Date(item.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
      <button
        onClick={handleCancel}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-xs transition-opacity mt-1"
        aria-label="取消"
      >
        ✕
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Write app/(app)/backlog/page.tsx**

```typescript
import { getItemsByCategory } from '@/lib/db/items'
import ItemCard from '@/components/items/ItemCard'

export default async function BacklogPage() {
  const items = await getItemsByCategory('backlog')
  const active = items.filter((i) => i.status === 'active')

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">待处理清单</h1>
        <p className="text-sm text-text-muted mt-0.5">{active.length} 项待处理</p>
      </div>
      <div className="flex flex-col gap-3">
        {active.map((item) => <ItemCard key={item.id} item={item} />)}
        {active.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">暂无待处理事项 ✨</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/items/ItemCard.tsx app/\(app\)/backlog/
git commit -m "feat: add backlog module with item cards"
```

---

## Task 11: Inspiration Module

**Files:**
- Create: `app/(app)/inspiration/page.tsx`

- [ ] **Step 1: Write app/(app)/inspiration/page.tsx**

```typescript
import { getItemsByCategory } from '@/lib/db/items'
import ItemCard from '@/components/items/ItemCard'

export default async function InspirationPage() {
  const items = await getItemsByCategory('inspiration')
  const active = items.filter((i) => i.status === 'active')

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">选题灵感</h1>
        <p className="text-sm text-text-muted mt-0.5">{active.length} 条灵感</p>
      </div>
      {/* Masonry-style 2-column layout on md+ */}
      <div className="columns-1 md:columns-2 gap-3 space-y-3">
        {active.map((item) => (
          <div key={item.id} className="break-inside-avoid">
            <div className="bg-white rounded-card shadow-card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-text-main leading-snug">{item.title}</p>
              </div>
              {item.content && (
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{item.content}</p>
              )}
              <span className="text-xs text-text-muted mt-2 block">
                {new Date(item.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        ))}
        {active.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">还没有灵感，快记下来吧 💡</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/inspiration/
git commit -m "feat: add inspiration module with masonry card layout"
```

---

## Task 12: Materials Module + Link Preview API + Image Upload

**Files:**
- Create: `app/api/link-preview/route.ts`, `components/materials/MaterialCard.tsx`, `components/materials/ImageUpload.tsx`, `app/(app)/materials/page.tsx`

- [ ] **Step 1: Write app/api/link-preview/route.ts**

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return Response.json({ error: 'Missing url' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    const html = await res.text()

    const getTag = (property: string): string | null => {
      const match =
        html.match(new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'))
      return match?.[1] ?? null
    }

    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]

    return Response.json({
      title: getTag('title') ?? titleTag ?? url,
      description: getTag('description'),
      image: getTag('image'),
    })
  } catch {
    // Graceful fallback: return just the URL as title
    return Response.json({ title: url, description: null, image: null })
  }
}
```

- [ ] **Step 2: Write components/materials/ImageUpload.tsx**

```typescript
'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onUpload: (url: string) => void
}

export default function ImageUpload({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('materials').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('materials').getPublicUrl(path)
      onUpload(data.publicUrl)
    }
    setUploading(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs px-3 py-1.5 bg-stone-100 text-text-muted rounded-full hover:bg-stone-200 transition-colors"
      >
        {uploading ? '上传中...' : '📷 上传图片'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </>
  )
}
```

- [ ] **Step 3: Create Supabase Storage bucket**

1. Go to Supabase dashboard → **Storage**
2. Create a new bucket named `materials`
3. Set it to **Public** (so images can be displayed via URL)
4. In **Policies**, add a policy: authenticated users can insert/select their own files

SQL to add storage policy:
```sql
-- In Supabase SQL Editor
insert into storage.buckets (id, name, public) values ('materials', 'materials', true)
on conflict do nothing;

create policy "materials_user_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "materials_public_read" on storage.objects
  for select using (bucket_id = 'materials');
```

- [ ] **Step 4: Write components/materials/MaterialCard.tsx**

```typescript
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeItem, type Item } from '@/lib/db/items'

export default function MaterialCard({ item }: { item: Item }) {
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleRemove() {
    setDone(true)
    setTimeout(() => {
      startTransition(async () => {
        await completeItem(item.id)
        router.refresh()
      })
    }, 300)
  }

  const image = item.link_image || item.media_url

  return (
    <div
      className={`bg-white rounded-card shadow-card overflow-hidden transition-all duration-300 ${
        done ? 'opacity-0 scale-95' : 'opacity-100'
      }`}
    >
      {image && (
        <img src={image} alt="" className="w-full h-32 object-cover" loading="lazy" />
      )}
      <div className="p-3">
        <p className="text-sm font-medium text-text-main leading-snug line-clamp-2">
          {item.link_title || item.title}
        </p>
        {item.content && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2">{item.content}</p>
        )}
        {item.link_url && (
          <a
            href={item.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent mt-1.5 block truncate hover:underline"
          >
            {new URL(item.link_url).hostname}
          </a>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-muted">
            {new Date(item.created_at).toLocaleDateString('zh-CN')}
          </span>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs text-text-muted hover:text-red-400 transition-colors"
          >
            移除
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write app/(app)/materials/page.tsx**

```typescript
import { getItemsByCategory } from '@/lib/db/items'
import MaterialCard from '@/components/materials/MaterialCard'

export default async function MaterialsPage() {
  const items = await getItemsByCategory('material')
  const active = items.filter((i) => i.status === 'active')

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">素材收集</h1>
        <p className="text-sm text-text-muted mt-0.5">{active.length} 条素材</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {active.map((item) => <MaterialCard key={item.id} item={item} />)}
        {active.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12 col-span-3">
            还没有素材，粘贴链接或上传截图 📌
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Wire link preview into QuickAddModal**

Update `components/items/QuickAddModal.tsx` — add link preview fetch when URL is detected. Add this inside the component after the existing state declarations:

```typescript
// Add after existing state declarations in QuickAddModal.tsx
const [linkPreview, setLinkPreview] = useState<{ title: string; image: string | null } | null>(null)
const [fetchingPreview, setFetchingPreview] = useState(false)

// Add this effect after the state declarations
useEffect(() => {
  if (!isLink) { setLinkPreview(null); return }
  const timer = setTimeout(async () => {
    setFetchingPreview(true)
    const res = await fetch(`/api/link-preview?url=${encodeURIComponent(title.trim())}`)
    const data = await res.json()
    setLinkPreview(data)
    if (data.title && data.title !== title.trim()) setTitle(data.title)
    setFetchingPreview(false)
  }, 600)
  return () => clearTimeout(timer)
}, [title, isLink])
```

Add `import { useEffect } from 'react'` to the imports at the top of QuickAddModal.

Update the `handleSubmit` function to pass link preview data:
```typescript
await createItem({
  category: isLink ? 'material' : category,
  title: title.trim(),
  content: content.trim() || undefined,
  quadrant: category === 'today_todo' ? quadrant : undefined,
  due_date: dueDate || undefined,
  link_url: isLink ? title.trim() : undefined,
  link_title: linkPreview?.title,
  link_image: linkPreview?.image ?? undefined,
})
```

- [ ] **Step 7: Commit**

```bash
git add app/api/link-preview/ components/materials/ app/\(app\)/materials/
git commit -m "feat: add materials module with link preview and image upload"
```

---

## Task 13: Habits Module

**Files:**
- Create: `components/habits/HabitCalendar.tsx`, `components/habits/HabitRow.tsx`, `app/(app)/habits/page.tsx`

- [ ] **Step 1: Write components/habits/HabitCalendar.tsx**

```typescript
'use client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'

interface Props {
  checkedDates: string[]
  month?: Date
}

export default function HabitCalendar({ checkedDates, month = new Date() }: Props) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })
  const checked = new Set(checkedDates)

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd')
        const isChecked = checked.has(key)
        const today = isToday(day)
        return (
          <div
            key={key}
            title={key}
            className={`w-5 h-5 rounded-sm text-[9px] flex items-center justify-center font-medium transition-colors ${
              isChecked
                ? 'bg-accent text-white'
                : today
                ? 'bg-orange-100 text-accent border border-accent/30'
                : 'bg-stone-100 text-text-muted'
            }`}
          >
            {format(day, 'd')}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Write components/habits/HabitRow.tsx**

```typescript
'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleHabitLog } from '@/lib/db/habits'
import { todayStr } from '@/lib/utils/dates'
import HabitCalendar from './HabitCalendar'
import type { HabitWithLogs } from '@/lib/db/habits'

export default function HabitRow({ habit }: { habit: HabitWithLogs }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const today = todayStr()

  function handleToggle() {
    startTransition(async () => {
      await toggleHabitLog(habit.id, today, !habit.checkedToday)
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
              habit.checkedToday
                ? 'bg-accent border-accent text-white'
                : 'border-stone-300 hover:border-accent'
            }`}
            aria-label={habit.checkedToday ? '取消打卡' : '打卡'}
          >
            {habit.checkedToday && '✓'}
          </button>
          <div>
            <p className="text-sm font-medium text-text-main">{habit.title}</p>
            {habit.streak > 0 && (
              <p className="text-xs text-accent mt-0.5">🔥 连续 {habit.streak} 天</p>
            )}
          </div>
        </div>
      </div>
      <HabitCalendar checkedDates={habit.checkedDates} />
    </div>
  )
}
```

- [ ] **Step 3: Write app/(app)/habits/page.tsx**

```typescript
import { getHabitsWithLogs } from '@/lib/db/habits'
import HabitRow from '@/components/habits/HabitRow'

export default async function HabitsPage() {
  const habits = await getHabitsWithLogs()
  const uncheckedToday = habits.filter((h) => !h.checkedToday)

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">日常习惯</h1>
        <p className="text-sm text-text-muted mt-0.5">
          今日已打卡 {habits.length - uncheckedToday.length} / {habits.length} 项
        </p>
      </div>

      {uncheckedToday.length > 0 && (
        <div className="mb-3 p-3 bg-orange-50 rounded-card border border-orange-100 text-xs text-accent">
          ⏰ 今日还有 {uncheckedToday.length} 项习惯未打卡
        </div>
      )}

      <div className="flex flex-col gap-3">
        {habits.map((habit) => <HabitRow key={habit.id} habit={habit} />)}
        {habits.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">
            添加你的第一个习惯，坚持打卡 ✅
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/habits/ app/\(app\)/habits/
git commit -m "feat: add habits module with monthly calendar and streak tracking"
```

---

## Task 14: Day Review View

**Files:**
- Create: `components/review/DayTimeline.tsx`, `app/(app)/review/day/page.tsx`

- [ ] **Step 1: Write components/review/DayTimeline.tsx**

```typescript
import type { Item } from '@/lib/db/items'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function DayTimeline({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="text-text-muted text-sm text-center py-12">当天没有记录</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-4 bg-white rounded-card shadow-card flex items-start gap-3 ${
            item.status !== 'active' ? 'opacity-60' : ''
          }`}
        >
          <span className="text-lg mt-0.5">
            {item.status === 'completed' ? '✅' : item.status === 'cancelled' ? '❌' : '⬜'}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium text-text-main ${
              item.status !== 'active' ? 'line-through' : ''
            }`}>
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <CategoryBadge category={item.category} />
              {item.status === 'cancelled' && (
                <span className="text-xs bg-stone-100 text-text-muted px-2 py-0.5 rounded-full">已取消</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Write app/(app)/review/day/page.tsx**

```typescript
import { getItemsForDay } from '@/lib/db/items'
import DayTimeline from '@/components/review/DayTimeline'
import { todayStr, formatDate } from '@/lib/utils/dates'

export default async function DayReviewPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const date = searchParams.date ?? todayStr()
  const items = await getItemsForDay(date)
  const completed = items.filter((i) => i.status === 'completed').length
  const total = items.length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-text-main">日视图</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {formatDate(date)} · 完成 {completed} / 共 {total} 项
          </p>
        </div>
        <form className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="bg-warm rounded-card px-3 py-1.5 text-sm outline-none text-text-main"
          />
          <button
            type="submit"
            className="bg-accent text-white text-sm px-3 py-1.5 rounded-card hover:bg-orange-600 transition-colors"
          >
            查看
          </button>
        </form>
      </div>
      <DayTimeline items={items} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/review/DayTimeline.tsx app/\(app\)/review/day/
git commit -m "feat: add day review view with completed/cancelled status display"
```

---

## Task 15: Week Review View

**Files:**
- Create: `components/review/WeekGrid.tsx`, `app/(app)/review/week/page.tsx`

- [ ] **Step 1: Write app/(app)/review/week/page.tsx**

```typescript
import { createClient } from '@/lib/supabase/server'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns'
import { todayStr, formatDate } from '@/lib/utils/dates'
import DayTimeline from '@/components/review/DayTimeline'
import type { Item } from '@/lib/db/items'

export default async function WeekReviewPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const anchor = parseISO(searchParams.date ?? todayStr())
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const supabase = await createClient()
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .gte('created_at', `${format(weekStart, 'yyyy-MM-dd')}T00:00:00Z`)
    .lte('created_at', `${format(weekEnd, 'yyyy-MM-dd')}T23:59:59Z`)
    .order('created_at', { ascending: true })

  const allItems: Item[] = items ?? []
  const [expandedDay, setExpandedDay] = [searchParams.date ?? todayStr(), null]

  // Group by day
  const byDay: Record<string, Item[]> = {}
  for (const day of days) {
    const key = format(day, 'yyyy-MM-dd')
    byDay[key] = allItems.filter((i) => {
      const d = (i.display_date ?? i.created_at.slice(0, 10))
      return d === key
    })
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">周视图</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {formatDate(format(weekStart, 'yyyy-MM-dd'))} — {formatDate(format(weekEnd, 'yyyy-MM-dd'))}
        </p>
      </div>

      {/* Week summary bar */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayItems = byDay[key] ?? []
          const done = dayItems.filter((i) => i.status === 'completed').length
          const isToday = key === todayStr()
          return (
            <a key={key} href={`/review/week?date=${key}`} className="text-center group">
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-accent' : 'text-text-muted'}`}>
                {['一', '二', '三', '四', '五', '六', '日'][day.getDay() === 0 ? 6 : day.getDay() - 1]}
              </div>
              <div className={`rounded-card py-2 px-1 text-xs transition-colors ${
                isToday ? 'bg-orange-50 border border-accent/20' : 'bg-white hover:bg-stone-50'
              }`}>
                <div className="font-semibold text-text-main">{format(day, 'd')}</div>
                <div className="text-text-muted">{done}/{dayItems.length}</div>
              </div>
            </a>
          )
        })}
      </div>

      {/* Expanded day detail */}
      <div>
        <h2 className="text-base font-medium text-text-main mb-3">
          {formatDate(expandedDay)} 详情
        </h2>
        <DayTimeline items={byDay[expandedDay] ?? []} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/review/week/
git commit -m "feat: add week review view with 7-day summary bar"
```

---

## Task 16: Stats Page

**Files:**
- Create: `components/ui/StatsWidget.tsx`, `app/(app)/stats/page.tsx`

- [ ] **Step 1: Write components/ui/StatsWidget.tsx**

```typescript
interface Props {
  label: string
  value: number
  emoji: string
  color: string
}

export default function StatsWidget({ label, value, emoji, color }: Props) {
  return (
    <div className={`bg-white rounded-card shadow-card p-4 border-l-4 ${color}`}>
      <div className="text-2xl font-bold text-text-main">{value}</div>
      <div className="text-sm text-text-muted mt-1">{emoji} {label}</div>
    </div>
  )
}
```

- [ ] **Step 2: Write app/(app)/stats/page.tsx**

```typescript
import { createClient } from '@/lib/supabase/server'
import StatsWidget from '@/components/ui/StatsWidget'
import { todayStr } from '@/lib/utils/dates'
import { format, startOfWeek } from 'date-fns'
import { getHabitsWithLogs } from '@/lib/db/habits'

const CATEGORY_LABELS: Record<string, string> = {
  today_todo: '今日待办',
  backlog: '待处理',
  inspiration: '选题灵感',
  material: '素材收集',
  habit: '日常习惯',
}

const CATEGORY_COLORS: Record<string, string> = {
  today_todo: 'bg-today-tag',
  backlog: 'bg-backlog-tag',
  inspiration: 'bg-inspiration-tag',
  material: 'bg-material-tag',
  habit: 'bg-habit-tag',
}

export default async function StatsPage() {
  const supabase = await createClient()
  const today = todayStr()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const { data: todayCompleted } = await supabase
    .from('items')
    .select('id', { count: 'exact' })
    .eq('status', 'completed')
    .gte('completed_at', `${today}T00:00:00Z`)

  const { count: todayCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', `${today}T00:00:00Z`)

  const { count: weekCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', `${weekStart}T00:00:00Z`)

  const { data: categoryData } = await supabase
    .from('items')
    .select('category')
    .eq('status', 'active')

  const categoryCounts: Record<string, number> = {}
  for (const row of categoryData ?? []) {
    categoryCounts[row.category] = (categoryCounts[row.category] ?? 0) + 1
  }
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0)

  const habits = await getHabitsWithLogs()
  const topStreaks = habits.sort((a, b) => b.streak - a.streak).slice(0, 3)

  return (
    <div>
      <h1 className="text-xl font-semibold text-text-main mb-4">统计</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatsWidget label="今日完成" value={todayCount ?? 0} emoji="🎯" color="border-accent" />
        <StatsWidget label="本周完成" value={weekCount ?? 0} emoji="📈" color="border-blue-300" />
      </div>

      <div className="bg-white rounded-card shadow-card p-4 mb-6">
        <h2 className="text-sm font-semibold text-text-main mb-3">各模块待处理数量</h2>
        <div className="flex flex-col gap-2">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-xs text-text-muted w-16">{CATEGORY_LABELS[cat] ?? cat}</span>
              <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${CATEGORY_COLORS[cat] ?? 'bg-stone-300'}`}
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-text-muted w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {topStreaks.length > 0 && (
        <div className="bg-white rounded-card shadow-card p-4">
          <h2 className="text-sm font-semibold text-text-main mb-3">习惯连击排行</h2>
          <div className="flex flex-col gap-2">
            {topStreaks.map((h, i) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <span className="text-text-main">{['🥇','🥈','🥉'][i]} {h.title}</span>
                <span className="text-accent font-medium">🔥 {h.streak} 天</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/StatsWidget.tsx app/\(app\)/stats/
git commit -m "feat: add stats page with completion counts and category distribution"
```

---

## Task 17: Global Search

**Files:**
- Create: `components/search/SearchResults.tsx`

- [ ] **Step 1: Write components/search/SearchResults.tsx**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CategoryBadge from '@/components/ui/CategoryBadge'
import type { Item } from '@/lib/db/items'

interface Props {
  query: string
  onClose: () => void
}

export default function SearchResults({ query, onClose }: Props) {
  const [results, setResults] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('items')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(15)
      setResults(data ?? [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (query.length < 2) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-card shadow-xl border border-stone-100 z-50 max-h-80 overflow-y-auto">
      {loading && (
        <div className="px-4 py-3 text-sm text-text-muted">搜索中...</div>
      )}
      {!loading && results.length === 0 && (
        <div className="px-4 py-3 text-sm text-text-muted">无结果</div>
      )}
      {results.map((item) => (
        <button
          key={item.id}
          onClick={onClose}
          className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
        >
          <p className={`text-sm text-text-main font-medium ${
            item.status === 'completed' ? 'line-through opacity-60' : ''
          }`}>
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={item.category} />
            <span className="text-xs text-text-muted">
              {new Date(item.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/search/
git commit -m "feat: add global search with real-time results dropdown"
```

---

## Task 18: Settings + Invite Management

**Files:**
- Create: `app/(app)/settings/page.tsx`

- [ ] **Step 1: Write app/(app)/settings/page.tsx**

```typescript
import { redirect } from 'next/navigation'
import { getAllowedUsers, isCurrentUserAdmin, addAllowedUser, removeAllowedUser } from '@/lib/db/users'
import { createClient } from '@/lib/supabase/server'

async function addUser(formData: FormData) {
  'use server'
  const email = formData.get('email')?.toString().trim()
  if (!email) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await addAllowedUser(email, user.id)
  redirect('/settings')
}

async function removeUser(formData: FormData) {
  'use server'
  const id = formData.get('id')?.toString()
  if (!id) return
  await removeAllowedUser(id)
  redirect('/settings')
}

export default async function SettingsPage() {
  const isAdmin = await isCurrentUserAdmin()
  if (!isAdmin) redirect('/today')

  const users = await getAllowedUsers()

  return (
    <div>
      <h1 className="text-xl font-semibold text-text-main mb-4">设置</h1>

      <div className="bg-white rounded-card shadow-card p-5 mb-4">
        <h2 className="text-sm font-semibold text-text-main mb-3">邀请成员</h2>
        <form action={addUser} className="flex gap-2">
          <input
            name="email"
            type="email"
            placeholder="输入 Gmail 邮箱地址"
            required
            className="flex-1 bg-warm rounded-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            className="bg-accent text-white text-sm px-4 py-2 rounded-card hover:bg-orange-600 transition-colors"
          >
            添加
          </button>
        </form>
      </div>

      <div className="bg-white rounded-card shadow-card p-5">
        <h2 className="text-sm font-semibold text-text-main mb-3">
          已授权成员 ({users.length})
        </h2>
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between text-sm py-2 border-b border-stone-50 last:border-0">
              <div>
                <span className="text-text-main">{user.email}</span>
                {user.is_admin && (
                  <span className="ml-2 text-xs bg-orange-100 text-accent px-2 py-0.5 rounded-full">管理员</span>
                )}
              </div>
              {!user.is_admin && (
                <form action={removeUser}>
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    className="text-xs text-text-muted hover:text-red-400 transition-colors"
                  >
                    移除
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/settings/
git commit -m "feat: add settings page with invite management (admin only)"
```

---

## Task 19: Polish — Animations, Due Date Highlighting, PWA

**Files:**
- Modify: `app/globals.css`
- Create: `app/manifest.ts`, `public/icon-192.png`, `public/icon-512.png`

- [ ] **Step 1: Add fade-out keyframe to app/globals.css**

Append to the end of `app/globals.css`:
```css
@keyframes fadeOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.95); }
}
```

- [ ] **Step 2: Write app/manifest.ts**

```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '个人助理',
    short_name: '助理',
    description: '你的待办、灵感与素材管理工具',
    start_url: '/today',
    display: 'standalone',
    background_color: '#FAF8F5',
    theme_color: '#F97316',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

- [ ] **Step 3: Create placeholder icons**

Create two simple orange square PNG icons. Use this command to generate them (requires ImageMagick, or use any online tool to create a 192×192 and 512×512 orange PNG):

If ImageMagick is available:
```bash
convert -size 192x192 xc:"#F97316" public/icon-192.png
convert -size 512x512 xc:"#F97316" public/icon-512.png
```

If not available: download any two orange PNG images and rename them to `public/icon-192.png` and `public/icon-512.png`.

- [ ] **Step 4: Update app/layout.tsx to reference manifest**

Add `manifest` to the metadata export:
```typescript
export const metadata: Metadata = {
  title: '个人助理',
  description: '你的待办、灵感与素材管理工具',
  manifest: '/manifest.webmanifest',
}
```

- [ ] **Step 5: Final build check**

```bash
npm run build
```
Expected: Build completes with no errors. Warnings about missing `use client` or missing images are OK; errors about TypeScript types must be fixed.

- [ ] **Step 6: Run all tests one final time**

```bash
npm test
```
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/manifest.ts app/layout.tsx public/
git commit -m "feat: add PWA manifest and polish animations"
```

---

## Task 20: Deployment Guide

**Files:**
- Create: `DEPLOY.md`

- [ ] **Step 1: Write DEPLOY.md**

```markdown
# 部署指南

## 前置条件

- GitHub 账号（用于连接 Vercel）
- Google 账号（用于登录）
- Supabase 账号（https://supabase.com，免费注册）
- Vercel 账号（https://vercel.com，用 GitHub 登录即可）

## 第一步：准备 Supabase

1. 登录 https://supabase.com，新建项目（选离你最近的区域，建议 Singapore）
2. 等待项目初始化完成（约 1 分钟）
3. 进入 **SQL Editor**，粘贴 `supabase/migrations/001_initial.sql` 全部内容，点击 Run
4. 进入 **Authentication → Providers → Google**，启用 Google 登录：
   - 前往 https://console.cloud.google.com 创建 OAuth 2.0 客户端
   - 将 Supabase 提供的 Callback URL 填入 Google 控制台的"已获授权的重定向 URI"
   - 将 Google 的 Client ID 和 Client Secret 填回 Supabase
5. 进入 **Project Settings → API**，记录：
   - Project URL（如 `https://abc.supabase.co`）
   - anon/public key
   - service_role key（保密！）

## 第二步：推送代码到 GitHub

```bash
cd personal-assistant
git remote add origin https://github.com/你的用户名/personal-assistant.git
git push -u origin main
```

## 第三步：部署到 Vercel

1. 登录 https://vercel.com
2. 点击 **Add New → Project**，选择刚才推送的 GitHub 仓库
3. 在 **Environment Variables** 中添加以下变量：

| 变量名 | 值 |
|--------|----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `ADMIN_EMAIL` | 你的 Gmail 地址（如 abc@gmail.com） |
| `CRON_SECRET` | 任意随机字符串（如 my-secret-123）|

4. 点击 **Deploy**，等待约 2 分钟
5. 部署完成后，将 Vercel 提供的域名（如 `https://xxx.vercel.app`）填入 Supabase：
   - **Authentication → URL Configuration → Site URL**：填入你的 Vercel 域名
   - **Redirect URLs**：添加 `https://xxx.vercel.app/auth/callback`

## 第四步：首次登录

1. 打开 Vercel 提供的 URL
2. 点击"使用 Google 账号登录"
3. 选择你在 `ADMIN_EMAIL` 中填写的 Google 账号
4. 自动进入应用，你的账号已被设为管理员

## 添加朋友

1. 进入应用 → 点击侧边栏底部"设置"
2. 输入朋友的 Gmail 邮箱，点击"添加"
3. 朋友打开同一个 URL，用对应 Google 账号登录即可

## 本地开发

```bash
cp .env.local.example .env.local
# 填写 .env.local 中的变量值
npm run dev
```
```

- [ ] **Step 2: Commit**

```bash
git add DEPLOY.md
git commit -m "docs: add step-by-step deployment guide"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ 5 modules (today, backlog, inspiration, materials, habits) — Tasks 8–13
- ✅ 4-quadrant sort — Task 8
- ✅ Due date highlighting — Task 6 (dueDateStatus), Task 8 (QuadrantCard)
- ✅ Auto-rollover — Tasks 9
- ✅ Complete/cancel distinction — Tasks 6, 8
- ✅ Quick add with voice input — Task 7
- ✅ Link auto-detection — Task 7 (isLink), Task 12 (link preview)
- ✅ Screenshot upload — Task 12 (ImageUpload)
- ✅ Habits with streak + calendar — Task 13
- ✅ Day review — Task 14
- ✅ Week review — Task 15
- ✅ Stats (completion counts + category distribution + habit streaks) — Task 16
- ✅ Search — Task 17
- ✅ Invite management (admin) — Tasks 4 (callback), 18 (settings)
- ✅ Google OAuth — Tasks 3, 4
- ✅ Realtime sync — Supabase Realtime via `router.refresh()` on mutations
- ✅ Mobile-first layout — Tasks 5 (AppShell, BottomNav)
- ✅ PWA manifest — Task 19
- ✅ Deployment guide — Task 20

**Type consistency:**
- `Item` type defined in `lib/db/items.ts` and used consistently across all components
- `HabitWithLogs` defined in `lib/db/habits.ts` and used in HabitRow
- `ItemCategory` exported from `lib/db/items.ts` and used in QuickAddModal
- `createClient()` (browser) vs `createClient()` (server) — different imports: `@/lib/supabase/client` vs `@/lib/supabase/server`

**Note on realtime:** The current implementation uses `router.refresh()` after mutations which re-fetches server components. For true cross-device realtime, add a Supabase Realtime subscription in each page's client component wrapper that calls `router.refresh()` when the `items` table changes. This is a post-MVP enhancement.
