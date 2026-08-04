import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
}

export function formatBRL(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val);
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = 'R$ 0,00',
  className = '',
  disabled = false,
  id,
  label
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === undefined || value === null || isNaN(value)) {
      setDisplayValue('');
    } else if (value === 0) {
      setDisplayValue(value === 0 && displayValue === '' ? '' : formatBRL(0));
    } else {
      setDisplayValue(formatBRL(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Keep only numeric characters
    const digitsOnly = rawValue.replace(/\D/g, '');
    
    if (!digitsOnly) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Convert digits to number (treating last 2 digits as cents)
    const numericValue = parseFloat(digitsOnly) / 100;
    setDisplayValue(formatBRL(numericValue));
    onChange(numericValue);
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all ${className}`}
        />
      </div>
    </div>
  );
}
