'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

interface ComboboxProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  selectedLabel?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  allowCustom?: boolean;
  clearable?: boolean;
  onSearch?: (query: string) => void;
}

export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  selectedLabel,
  searchPlaceholder = 'Search…',
  emptyText = 'No results found',
  loading = false,
  disabled = false,
  invalid = false,
  allowCustom = false,
  clearable = false,
  onSearch,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options;
    const needle = query.trim().toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        (option.description ?? '').toLowerCase().includes(needle),
    );
  }, [options, query]);

  const showCustom = allowCustom && query.trim().length > 0 && !filtered.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  function choose(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const count = filtered.length + (showCustom ? 1 : 0);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (count === 0 ? 0 : (i + 1) % count));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (count === 0 ? 0 : (i - 1 + count) % count));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filtered[active]) choose(filtered[active]!.value);
      else if (showCustom) choose(query.trim());
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverPrimitive.Trigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-label={id ? undefined : placeholder}
            aria-invalid={invalid || undefined}
            className={cn(
              'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-white py-1 pl-3 text-sm shadow-sm transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-50',
              clearable && (value || selectedLabel) ? 'pr-16' : 'pr-3',
              invalid && 'border-rose-300 focus:ring-rose-400',
            )}
          >
            <span className={cn('truncate text-left', !selectedLabel && !selected && 'text-muted-foreground')}>
              {selectedLabel ?? selected?.label ?? placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverPrimitive.Trigger>
        {clearable && (value || selectedLabel) && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => onChange('')}
            className="absolute right-7 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-border bg-popover shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded
              aria-autocomplete="list"
              aria-controls={`${id ?? 'combobox'}-listbox`}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
                onSearch?.(event.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div id={`${id ?? 'combobox'}-listbox`} role="listbox" className="max-h-64 overflow-y-auto p-1">
            {loading && <p className="px-3 py-4 text-center text-xs text-muted-foreground">Loading…</p>}
            {!loading && filtered.length === 0 && !showCustom && (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">{emptyText}</p>
            )}
            {filtered.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(option.value)}
                className={cn(
                  'flex w-full items-start gap-2 rounded-sm px-3 py-2 text-left text-sm transition-colors',
                  index === active ? 'bg-secondary' : 'hover:bg-secondary/70',
                )}
              >
                <Check className={cn('mt-0.5 h-4 w-4 shrink-0', option.value === value ? 'text-teal-700' : 'opacity-0')} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{option.label}</span>
                  {option.description && <span className="block truncate text-xs text-muted-foreground">{option.description}</span>}
                </span>
              </button>
            ))}
            {showCustom && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseEnter={() => setActive(filtered.length)}
                onClick={() => choose(query.trim())}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm transition-colors',
                  active === filtered.length ? 'bg-secondary' : 'hover:bg-secondary/70',
                )}
              >
                <span className="h-4 w-4 shrink-0" />
                <span className="text-muted-foreground">Use “{query.trim()}”</span>
              </button>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
