'use client';

import { useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSpecializations } from '@/lib/hooks/use-data';

/** Free-text tag input: pick existing specializations or type entirely new ones. */
export function SpecializationInput({
  value,
  onChange,
  invalid,
  id = 'doctor-specialization',
}: {
  value: string[];
  onChange: (value: string[]) => void;
  invalid?: boolean;
  id?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { data: known } = useSpecializations();

  const suggestions = (known ?? [])
    .filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((item) => !value.includes(item))
    .slice(0, 6);

  function add(raw: string) {
    const next = raw.trim();
    if (!next || value.includes(next) || value.length >= 10) return;
    onChange([...value, next]);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(query);
    } else if (event.key === 'Backspace' && !query && value.length) {
      onChange(value.slice(0, -1));
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-white px-2 py-1.5 shadow-sm transition-colors focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15',
          invalid && 'border-rose-300',
        )}
      >
        {value.map((item) => (
          <Badge key={item} variant="teal" className="gap-1 pr-1">
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => onChange(value.filter((entry) => entry !== item))}
              className="rounded p-0.5 text-teal-700 hover:bg-teal-100"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          id={id}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder={value.length ? 'Add another…' : 'Type a specialization and press Enter'}
          aria-label="Add specialization"
          className="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {query.trim() && (
          <button
            type="button"
            aria-label="Add specialization"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => add(query)}
            className="rounded p-1 text-teal-700 hover:bg-teal-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (query.trim() || suggestions.length > 0) && value.length < 10 && (
        <div className="rounded-md border border-border bg-popover p-1 shadow-lg">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => add(item)}
              className="block w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-secondary"
            >
              {item}
            </button>
          ))}
          {query.trim() && !suggestions.some((item) => item.toLowerCase() === query.trim().toLowerCase()) && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => add(query)}
              className="block w-full rounded-sm px-3 py-1.5 text-left text-sm text-teal-700 hover:bg-teal-50"
            >
              Add “{query.trim()}”
            </button>
          )}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        Press Enter to add. You can type any specialization, even if it is not listed. Maximum 10.
      </p>
    </div>
  );
}
