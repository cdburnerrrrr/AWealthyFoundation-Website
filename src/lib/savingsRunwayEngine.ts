export function calculateRunway(
    savings: number,
    monthlyExpenses: number
  ) {
    if (!monthlyExpenses) return 0;
    return savings / monthlyExpenses;
  }