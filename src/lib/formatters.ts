// formatters.ts
// Utilitários de Formatação Financeira Moeda BRL para todo o Sistema A3.

export function formatarMoedaBRL(valor: number | undefined | null): string {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return 'R$ 0,00';
  }
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseMoedaBRL(texto: string): number {
  if (!texto) return 0;
  // Remove R$, espaços e pontos de milhar, substitui vírgula por ponto
  const limpo = texto.replace(/[^0-9,-]/g, '').replace(',', '.');
  const numero = parseFloat(limpo);
  return isNaN(numero) ? 0 : numero;
}
