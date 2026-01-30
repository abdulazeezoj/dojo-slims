# Client-Side Data Fetching

This document outlines our client-side data fetching architecture using **TanStack Query (React Query)** with **Axios** and custom React hooks.

## Architecture

```
Component → Custom Hook → API Client (CSRF + Axios) → API Routes
            (TanStack Query)  (lib/api-client.ts)    (/api/*)
```

**Benefits:**

- Automatic caching & deduplication
- Background refetching & polling
- Optimistic updates
- Built-in loading/error states
- Type safety with TypeScript
- DevTools for debugging

## Setup

### Query Client Configuration

**File: `src/lib/query-client.ts`**

```typescript
import { QueryClient } from "@tanstack/react-query";
import { getLogger } from "./logger";

const logger = getLogger(["lib", "query-client"]);

const queryConfig = {
  queries: {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    retry: 1,
    retryDelay: 1000,
    gcTime: 5 * 60 * 1000,
  },
};

function onError(error: Error) {
  logger.error("Query error", {
    message: error.message,
    name: error.name,
    stack: error.stack,
  });
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      ...queryConfig,
      mutations: { ...queryConfig.mutations, onError },
    },
  });
}
```

### Provider Setup

**File: `src/providers/query-provider.tsx`**

```typescript
"use client";

import { createQueryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

**File: `src/providers/index.tsx`**

```typescript
"use client";

import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
```

Add to `src/app/layout.tsx`:

```typescript
import { Providers } from "@/providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Query Keys Convention

Use hierarchical query keys for organized cache management:

```typescript
// Pattern: ["resource", "action", ...params]
export const workerKeys = {
  all: ["worker"] as const,
  jobs: () => [...workerKeys.all, "job"] as const,
  job: (jobId: string) => [...workerKeys.jobs(), jobId] as const,
};

// Usage
queryKey: workerKeys.job("job-123"); // ["worker", "job", "job-123"]
```

Benefits: Easy invalidation, selective updates, type safety.

## Creating Query Hooks

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Student {
  id: string;
  name: string;
  email: string;
}

export const studentKeys = {
  all: ["student"] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Student>(`/api/students/${id}`);
      if (!response.success || !response.data) {
        throw new Error("Failed to fetch student");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// Usage in component
"use client";

export function StudentProfile({ id }: { id: string }) {
  const { data, isLoading, error } = useStudent(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div><h1>{data.name}</h1></div>;
}
```

## Creating Mutation Hooks

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface CreateStudentRequest {
  name: string;
  email: string;
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentRequest) => {
      const response = await api.post<Student>("/api/students", data);
      if (!response.success || !response.data) {
        throw new Error("Failed to create student");
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      // Or set directly in cache
      queryClient.setQueryData(studentKeys.detail(data.id), data);
    },
  });
}

// Usage
const { mutate, isPending, error } = useCreateStudent();

mutate(
  { name: "John", email: "john@example.com" },
  {
    onSuccess: () => console.log("Created!"),
    onError: (error) => console.error(error.message),
  },
);
```

## Polling Patterns

Automatic polling with conditional stop:

```typescript
export function useJobStatus(jobId: string, options?: { enabled?: boolean }) {
  const pollingInterval = clientConfig.QUERY_POLLING_INTERVAL_MS;
  const maxAttempts = clientConfig.QUERY_MAX_POLLING_ATTEMPTS;

  return useQuery({
    queryKey: workerKeys.job(jobId),
    queryFn: async () => {
      const response = await api.get<JobStatus>(
        `/api/worker/test?jobId=${jobId}`,
      );
      if (!response.success || !response.data) {
        throw new Error("Failed to get job status");
      }
      return response.data;
    },
    enabled: options?.enabled ?? !!jobId,
    refetchInterval: (query) => {
      if (!jobId || !query.state.data) return false;

      const jobState = query.state.data.state;
      const fetchCount = query.state.dataUpdateCount;

      // Stop on terminal states or max attempts
      if (
        jobState === "completed" ||
        jobState === "failed" ||
        fetchCount >= maxAttempts
      ) {
        return false;
      }

      return pollingInterval; // Continue polling
    },
    gcTime: 5 * 60 * 1000,
  });
}
```

## Optimistic Updates

```typescript
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Student>;
    }) => {
      const response = await api.patch<Student>(`/api/students/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error("Failed to update student");
      }
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: studentKeys.detail(id) });

      const previous = queryClient.getQueryData(studentKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(studentKeys.detail(id), (old: Student) => ({
        ...old,
        ...data,
      }));

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          studentKeys.detail(variables.id),
          context.previous,
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentKeys.detail(variables.id),
      });
    },
  });
}
```

## Pagination with useInfiniteQuery

```typescript
export function useStudents(filters: { search?: string } = {}) {
  return useInfiniteQuery({
    queryKey: studentKeys.list(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        cursor: String(pageParam),
        limit: "20",
        ...filters,
      });
      const response = await api.get<PaginatedResponse<Student>>(
        `/api/students?${params}`
      );
      if (!response.success || !response.data) {
        throw new Error("Failed to fetch students");
      }
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

// Usage
const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useStudents();

{data.pages.map((page) => page.data.map((student) => (
  <div key={student.id}>{student.name}</div>
)))}

{hasNextPage && (
  <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
    Load More
  </button>
)}
```

## Error Handling

### API Client Error Handling

**File: `src/lib/api-client.ts`**

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function formatApiError(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "An unknown error occurred";
}
```

### In Components

```typescript
const { data, error } = useStudent(id);

if (error) {
  if (isApiError(error) && error.statusCode === 404) {
    return <div>Student not found</div>;
  }
  return <div>Error: {formatApiError(error)}</div>;
}

// In mutations
const { mutate } = useCreateStudent();
mutate(data, {
  onError: (error) => {
    if (isApiError(error) && error.statusCode === 409) {
      toast.error("Student already exists");
    } else {
      toast.error(formatApiError(error));
    }
  },
});
```

## Server vs Client Components

Keep server components for metadata, wrap client components for interactivity:

**Server Component (page.tsx)**

```typescript
import type { Metadata } from "next";
import { StudentListClient } from "./client";

export const metadata: Metadata = {
  title: "Students",
};

export default function StudentsPage() {
  return <StudentListClient />;
}
```

**Client Component (client.tsx)**

```typescript
"use client";

import { useStudents } from "@/hooks/use-students";

export function StudentListClient() {
  const { data, isLoading } = useStudents();
  // ... use TanStack Query hooks
}
```

## Best Practices

1. **Organized query keys**: Use hierarchical structure
2. **Type safety**: Always type API responses
3. **Error handling**: Use `isApiError()` and `formatApiError()`
4. **Loading states**: Differentiate `isLoading` vs `isFetching`
5. **Conditional polling**: Stop on terminal states
6. **Cache invalidation**: Invalidate specific keys, not everything
7. **Optimistic updates**: Always handle rollback on error

## Reference Implementation

See [src/hooks/use-test-worker.tsx](../web/src/hooks/use-test-worker.tsx) for a complete example with:

- Mutation for queuing jobs
- Query with conditional polling
- Combined convenience hook
- Error handling & loading states

---

**Last Updated**: January 30, 2026
