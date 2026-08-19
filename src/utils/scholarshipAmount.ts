export function formatScholarshipAmount(title: string, maxAmount: string | null): string {
  if (!maxAmount) {
    return '금액 정보 없음';
  }

  if (title.includes('근로')) {
    return `시급 ${maxAmount.replace(/^(최대|시급)\s*/, '')}`;
  }

  return maxAmount;
}
