import { Link } from 'react-router-dom';

type FreedomDateDashboardCardProps = {
  freedomDate?: string | null;
  updatedAt?: string | null;
};

export default function FreedomDateDashboardCard({
  freedomDate,
  updatedAt,
}: FreedomDateDashboardCardProps) {
  const freedomDateLabel = freedomDate
    ? new Date(freedomDate).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Not set yet';

  const updatedAtLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="rounded-2xl border border-[#2b5676]/20 bg-white/85 p-5 shadow-sm">
      <p className="text-sm text-[#5a7690]">My Freedom Date</p>
      <p className="mt-1 text-2xl font-semibold text-[#0f2a44]">{freedomDateLabel}</p>
      {updatedAtLabel && (
        <p className="mt-2 text-xs text-[#5a7690]">Last updated {updatedAtLabel}</p>
      )}
      <Link
        to="/foundation-tools/my-freedom-date"
        className="mt-4 inline-flex rounded-full border border-[#0f3a5a]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0f2a44] hover:bg-[#f8fbfd]"
      >
        Update Plan
      </Link>
    </div>
  );
}
