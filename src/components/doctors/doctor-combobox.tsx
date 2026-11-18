'use client';

import { useState } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useDoctors } from '@/lib/hooks/use-data';

/** Full-width, searchable doctor picker backed by server-side search. */
export function DoctorCombobox({
  value,
  onChange,
  invalid,
  id = 'patient-doctor',
  clearable = false,
}: {
  value?: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  id?: string;
  clearable?: boolean;
}) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const { data, isPending, isError } = useDoctors({
    page: 1,
    limit: 25,
    search: debounced || undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  return (
    <Combobox
      id={id}
      value={value}
      onChange={onChange}
      options={(data?.data ?? []).map((doctor) => ({
        value: doctor.id,
        label: doctor.name,
        description: `${(doctor.specializations?.length ? doctor.specializations : [doctor.specialization]).join(', ')} · ${doctor.hospital}`,
      }))}
      placeholder="Search and select a doctor"
      searchPlaceholder="Type a doctor name, specialty or hospital…"
      emptyText={query ? 'No doctors match your search' : 'No doctors available'}
      loading={isPending}
      disabled={isError && !data}
      invalid={invalid}
      clearable={clearable}
      onSearch={setQuery}
    />
  );
}
