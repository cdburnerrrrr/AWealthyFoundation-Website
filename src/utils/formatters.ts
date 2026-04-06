export function formatDebt(pillars) {
  const debtScore = pillars.debt;

  if (debtScore >= 85) return { label: "Low", color: "green" };
  if (debtScore >= 60) return { label: "Moderate", color: "yellow" };
  if (debtScore >= 30) return { label: "High", color: "orange" };
  return { label: "Severe", color: "red" };
}