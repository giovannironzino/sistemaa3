import React, { useState, useEffect } from 'react';
import { formatarMoedaBRL, parseMoedaBRL } from '../lib/formatters';

export { formatarMoedaBRL as formatBRL } from '../lib/formatters';

interface CurrencyInputProps {
  value: number | undefined;
  onChange: (val: number) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  min?: number;
}

export default function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = 'R$ 0,00',
  className = '',
  id,
  disabled = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return value !== undefined && value !== null && !isNaN(value) ? formatarMoedaBRL(value) : '';
  });

  useEffect(() => {
    if (value !== undefined && value !== null && !isNaN(value)) {
      const parsedCurrent = parseMoedaBRL(displayValue);
      if (Math.abs(parsedCurrent - value) > 0.001) {
        setDisplayValue(formatarMoedaBRL(value));
      }
    } else if (value === undefined || value === null) {
      setDisplayValue('');
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawInput = e.target.value;
    const digitsOnly = rawInput.replace(/\D/g, '');

    if (!digitsOnly) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const numericValue = parseFloat(digitsOnly) / 100;
    setDisplayValue(formatarMoedaBRL(numericValue));
    onChange(numericValue);
  }

  function handleBlur() {
    if (value !== undefined && !isNaN(value)) {
      setDisplayValue(formatarMoedaBRL(value));
    }
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <input
        type="text"
        id={id}
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className || 'w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-emerald-400 font-bold focus:border-emerald-500'}
      />
    </div>
  );
}
