'use client';

import { Combobox } from '@/components/ui/combobox';
import { useConditionsCatalog, usePatientConditions } from '@/lib/hooks/use-data';

/**
 * Condition field for the patient form.
 *
 * Suggestions come from two sources merged together:
 *   1. The managed Conditions catalog (GET /conditions) — the curated list.
 *   2. Any distinct condition strings already used on patient records
 *      (GET /patients/conditions) — catches values that pre-date the catalog.
 *
 * The combobox still allows free-text entry so an admin can type a new value
 * that isn't in the catalog yet.
 */
export function ConditionCombobox({
  value,
  onChange,
  invalid,
  id = 'patient-condition',
}: {
  value?: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  id?: string;
}) {
  const catalogQuery = useConditionsCatalog({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' });
  const legacyQuery = usePatientConditions();

  // Merge catalog names with any legacy patient-condition strings, deduped
  // case-insensitively so we never show the same condition twice.
  const catalogNames = new Set(
    (catalogQuery.data?.data ?? []).map((c) => c.name.toLowerCase()),
  );
  const catalogOptions = (catalogQuery.data?.data ?? []).map((c) => ({
    value: c.name,
    label: c.name,
  }));
  const legacyOptions = (legacyQuery.data ?? [])
    .filter((name) => !catalogNames.has(name.toLowerCase()))
    .map((name) => ({ value: name, label: name }));

  const options = [...catalogOptions, ...legacyOptions];
  const isPending = catalogQuery.isPending;

  return (
    <Combobox
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      selectedLabel={value}
      placeholder="Select or type a condition"
      searchPlaceholder="Search conditions or type a new one…"
      emptyText="No saved conditions"
      loading={isPending}
      allowCustom
      clearable
      invalid={invalid}
    />
  );
}
