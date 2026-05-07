'use client';

import { useState, useRef, useEffect, InputHTMLAttributes } from 'react';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** Raw numeric value (integer COP) */
  value: string;
  /** Called with the raw numeric string (digits only) */
  onChange: (rawValue: string) => void;
}

/**
 * Format a numeric string with dot separators for thousands (COP style).
 * "1500000" → "1.500.000"
 */
function formatWithDots(raw: string): string {
  if (!raw) return '';
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Strip everything that's not a digit.
 */
function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function CurrencyInput({ value, onChange, className = '', ...props }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState<number | null>(null);

  const formatted = formatWithDots(value);

  // Restore cursor position after React re-render
  useEffect(() => {
    if (cursorPos !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPos, cursorPos);
      setCursorPos(null);
    }
  }, [cursorPos, formatted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawInput = input.value;
    const caretPos = input.selectionStart ?? 0;

    // Count how many dots are before cursor in old value
    const oldDotsBeforeCursor = (formatted.substring(0, caretPos + 1).match(/\./g) || []).length;

    const digits = stripNonDigits(rawInput);

    // Remove leading zeros
    const cleaned = digits.replace(/^0+/, '') || '';

    onChange(cleaned);

    // Calculate new cursor position
    const newFormatted = formatWithDots(cleaned);
    const newDotsBeforeCursor = (newFormatted.substring(0, caretPos).match(/\./g) || []).length;

    const dotsAdded = newDotsBeforeCursor - oldDotsBeforeCursor;
    const newPos = Math.max(0, caretPos + dotsAdded);

    setCursorPos(Math.min(newPos, newFormatted.length));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows, home, end
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(e.key)) return;

    // Allow Ctrl/Cmd + A, C, V, X
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;

    // Block non-digit characters
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold text-lg pointer-events-none select-none">
        $
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={formatted}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`pl-9 ${className}`}
        autoComplete="off"
        {...props}
      />
    </div>
  );
}
