'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ListParams } from '@/lib/types';

const DEFAULTS = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

/** Reads/writes list state (search, filters, sort, pagination) to the URL. */
export function useListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo<ListParams>(() => {
    const get = (key: string) => searchParams.get(key) ?? undefined;
    return {
      page: Number(get('page') ?? DEFAULTS.page) || DEFAULTS.page,
      limit: Number(get('limit') ?? DEFAULTS.limit) || DEFAULTS.limit,
      search: get('search'),
      sortBy: get('sortBy') ?? DEFAULTS.sortBy,
      sortOrder: (get('sortOrder') as 'asc' | 'desc') ?? DEFAULTS.sortOrder,
      startDate: get('startDate'),
      endDate: get('endDate'),
      specialization: get('specialization'),
      condition: get('condition'),
      doctorId: get('doctorId'),
    };
  }, [searchParams]);

  const setParams = useCallback(
    (updates: Partial<ListParams>, options?: { resetPage?: boolean }) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === 1 && key === 'page') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      if (options?.resetPage !== false) next.delete('page');
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { params, setParams };
}
