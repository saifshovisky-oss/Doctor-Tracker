'use client';

import { CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FilterDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'All',
  className,
}: {
  label: string;
  value?: string;
  onChange: (value?: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Select value={value ?? 'all'} onValueChange={(next) => onChange(next === 'all' ? undefined : next)}>
        <SelectTrigger aria-label={label} className="w-full sm:w-44">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
}: {
  startDate?: string;
  endDate?: string;
  onChange: (values: { startDate?: string; endDate?: string }) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden />
      <div className="space-y-1">
        <Label htmlFor="startDate" className="sr-only">Start date</Label>
        <Input
          id="startDate"
          type="date"
          aria-label="Start date"
          value={startDate ?? ''}
          max={endDate}
          onChange={(event) => onChange({ startDate: event.target.value || undefined })}
          className="h-10 w-[130px] bg-white text-xs sm:w-[145px]"
        />
      </div>
      <span className="text-muted-foreground">–</span>
      <div className="space-y-1">
        <Label htmlFor="endDate" className="sr-only">End date</Label>
        <Input
          id="endDate"
          type="date"
          aria-label="End date"
          value={endDate ?? ''}
          min={startDate}
          onChange={(event) => onChange({ endDate: event.target.value || undefined })}
          className="h-10 w-[130px] bg-white text-xs sm:w-[145px]"
        />
      </div>
    </div>
  );
}
