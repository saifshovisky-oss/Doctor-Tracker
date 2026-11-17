'use client';

import { Combobox } from '@/components/ui/combobox';
import { usePatientConditions } from '@/lib/hooks/use-data';

/** Condition field with suggestions from real patient records, while still allowing new values. */
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
  const { data, isPending } = usePatientConditions();

  return (
    <Combobox
      id={id}
      value={value}
      onChange={onChange}
      options={(data ?? []).map((condition) => ({ value: condition, label: condition }))}
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
