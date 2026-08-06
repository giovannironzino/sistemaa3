// calendario.ts
// Helpers de data e construção do calendário lateral (últimos 3 meses).

export function isoHoje(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function toIso(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function parseIso(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export interface CalendarCell {
  blank: boolean;
  day?: number;
  iso?: string;
  hasEntries?: boolean;
  isFuture?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
}

export interface CalendarMonth {
  label: string;
  dow: string[];
  weeks: CalendarCell[][];
}

/** Últimos 3 meses (mês corrente + 2 anteriores), semana começando no domingo. */
export function buildCalendarMonths(datasComCadastro: Set<string>, selectedDate: string): CalendarMonth[] {
  const today = new Date();
  const todayIso = toIso(today);
  const months: CalendarMonth[] = [];

  for (let i = 2; i >= 0; i--) {
    const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = ref.getFullYear();
    const monthIdx = ref.getMonth();
    const firstDow = new Date(year, monthIdx, 1).getDay();
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    const cells: CalendarCell[] = [];
    for (let b = 0; b < firstDow; b++) cells.push({ blank: true });
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toIso(new Date(year, monthIdx, day));
      cells.push({
        blank: false,
        day,
        iso,
        hasEntries: datasComCadastro.has(iso),
        isFuture: iso > todayIso,
        isToday: iso === todayIso,
        isSelected: iso === selectedDate,
      });
    }
    while (cells.length % 7 !== 0) cells.push({ blank: true });

    const weeks: CalendarCell[][] = [];
    for (let w = 0; w < cells.length; w += 7) weeks.push(cells.slice(w, w + 7));

    months.push({ label: `${MONTH_NAMES[monthIdx]} ${year}`, dow: DOW, weeks });
  }

  return months;
}

export function monthsUltimos3(): { monthIdx: number; year: number; label: string }[] {
  const today = new Date();
  const out: { monthIdx: number; year: number; label: string }[] = [];
  for (let i = 2; i >= 0; i--) {
    const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
    out.push({ monthIdx: ref.getMonth(), year: ref.getFullYear(), label: `${MONTH_NAMES[ref.getMonth()]} ${ref.getFullYear()}` });
  }
  return out;
}
