export function formatWon(amount: number): string {
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return `${billions.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tỷ ₩`;
  }
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${millions.toLocaleString('vi-VN')} Triệu ₩`;
  }
  return `${amount.toLocaleString('vi-VN')} ₩`;
}

export function formatWonFull(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} ₩`;
}
