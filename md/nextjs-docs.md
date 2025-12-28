# Next.js 16 (App Router) Comprehensive Guide

## 1. Introduction & Core Concepts
The App Router (`src/app`) is the modern way to build Next.js applications, leveraging React Server Components (RSC) and Streaming.

### 1.1 Server Components vs. Client Components
By default, **everything** in `app/` is a Server Component. 

**Server Components:**
- Run ONLY on the server.
- No client-side JS bundle (smaller download).
- Direct access to DB/API keys.
- **Cannot** use: `useState`, `useEffect`, `onClick`.

**Client Components:**
- Add `'use client'` at the very top of the file.
- Hydrated on the client.
- **Can** use: state, effects, event listeners.
- Use sparingly (e.g., for buttons, inputs, interactive graphs).

## 2. Routing (`src/app`)

### 2.1 File System Routing
- **Page**: `app/page.tsx` → `/`
- **Dashboard**: `app/dashboard/page.tsx` → `/dashboard`
- **Dynamic**: `app/blog/[slug]/page.tsx` → `/blog/hello-world`

#### Dynamic Segments
```tsx
export default function Page({ params }: { params: { slug: string } }) {
  return <h1>Post: {params.slug}</h1>
}
```

### 2.2 Special Files
- `layout.tsx`: Wraps pages, preserves state on navigation.
- `loading.tsx`: automatic Suspense fallback.
- `error.tsx`: Error boundary (must be Client Component).
- `not-found.tsx`: Custom 404 UI.
- `route.ts`: API Endpoints (GET, POST).

### 2.3 Route Groups
Folders in parentheses `(folder)` are skipped in the URL path.
- `app/(marketing)/page.tsx` → `/`
- `app/(admin)/dashboard/page.tsx` → `/dashboard`
This allows you to try different layouts for different sections without affecting the URL.

## 3. Data Fetching (Server Side)
Async/Await in Server Components.

### 3.1 Fetch API
```tsx
async function getData() {
  const res = await fetch('https://api.example.com/data');
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <main>{JSON.stringify(data)}</main>;
}
```

### 3.2 Caching Strategies
Next.js extends `fetch` to control caching.

- **Static (Default)**: Cached forever (until rebuild).
  ```ts
  fetch('...', { cache: 'force-cache' })
  ```
- **Dynamic (No Cache)**: Fetched on every request.
  ```ts
  fetch('...', { cache: 'no-store' })
  ```
- **Revalidated (ISR)**: Cached for time T.
  ```ts
  fetch('...', { next: { revalidate: 60 } }) // 60 seconds
  ```

## 4. Server Actions (Mutations)
The modern way to handle form submissions and data updates without API routes.

### 4.1 Inline Actions (Server Components)
```tsx
export default function Page() {
  async function create(formData: FormData) {
    'use server'
    const id = await db.create(formData.get('name'))
    redirect(`/item/${id}`)
  }
 
  return (
    <form action={create}>
      <input name="name" />
      <button type="submit">Add</button>
    </form>
  )
}
```

### 4.2 Actions in Client Components
Define the action in a separate file (e.g., `actions.ts`).

`app/actions.ts`:
```ts
'use server'
import { revalidatePath } from 'next/cache'

export async function createItem(data: any) {
  await db.insert(data);
  revalidatePath('/items'); // Refresh the cache for this route
}
```

`app/form-client.tsx`:
```tsx
'use client'
import { createItem } from './actions'

export function Form() {
  return <button onClick={() => createItem({ foo: 'bar' })}>Click</button>
}
```

## 5. Metadata (SEO)
Export a `metadata` object from any `page.tsx` or `layout.tsx`.

```ts
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Next.js 16',
  openGraph: {
    images: ['/og-image.png'],
  },
}
```

For dynamic pages:
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);
  return {
    title: product.title,
  }
}
```

## 6. Middleware (`middleware.ts`)
Run code before a request completes. Useful for Auth redirection.

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.rewrite(new URL('/login', request.url))
  }
}
```
