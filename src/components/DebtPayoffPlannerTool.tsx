import { useMemo, useState } from 'react';
import { CreditCard, TrendingDown, Calendar } from 'lucide-react';

type Values = {
  balance: number;
  rate: number;
  minPayment: number;
  extraPayment: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function DebtPayoffPlannerTool() {
  const [values, setValues] = useState<Values>({
    balance: 12000,
    rate: 18,
    minPayment: 300,
    extraPayment: 100,
  });

  const totalPayment = values.minPayment + values.extraPayment;

  const result = useMemo(() => {
    let balance = values.balance;
    const monthlyRate = values.rate / 100 / 12;
    let months = 0;
    let interestPaid = 0;

    while (balance > 0 && months < 600) {
      const interest = balance * monthlyRate;
      balance += interest;
      interestPaid += interest;

      const payment = Math.min(balance, totalPayment);
      balance -= payment;

      months++;
    }

    return { months, interestPaid };
  }, [values, totalPayment]);

  const baseResult = useMemo(() => {
    let balance = values.balance;
    const monthlyRate = values.rate / 100 / 12;
    let months = 0;
    let interestPaid = 0;

    while (balance > 0 && months < 600) {
      const interest = balance * monthlyRate;
      balance += interest;
      interestPaid += interest;

      const payment = Math.min(balance, values.minPayment);
      balance -= payment;

      months++;
    }

    return { months, interestPaid };
  }, [values]);

  const monthsSaved = baseResult.months - result.months;
  const interestSaved = baseResult.interestPaid - result.interestPaid;

  const update = (key: keyof Values, value: number) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

      {/* LEFT SIDE */}
      <div className="space-y-4">
        <Input label="Debt Balance" value={values.balance} onChange={(v) => update('balance', v)} />
        <Input label="Interest Rate (%)" value={values.rate} onChange={(v) => update('rate', v)} />
        <Input label="Minimum Payment" value={values.minPayment} onChange={(v) => update('minPayment', v)} />
        <Input label="Extra Payment" value={values.extraPayment} onChange={(v) => update('extraPayment', v)} />
      </div>

      {/* RIGHT SIDE */}
      <div className="rounded-2xl border border-[#2b5676]/20 bg-white/80 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#0f2a44] mb-4">Your Payoff Plan</h3>

        <div className="space-y-4 text-sm">

          <Stat
            icon={<Calendar size={16} />}
            label="Payoff Time"
            value={`${result.months} months`}
          />

          <Stat
            icon={<TrendingDown size={16} />}
            label="Months Saved"
            value={`${monthsSaved}`}
          />

          <Stat
            icon={<CreditCard size={16} />}
            label="Interest Saved"
            value={formatCurrency(interestSaved)}
          />

        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-[#2b5676]/20 bg-white/80 p-4">
      <label className="text-sm text-[#325672] block mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border border-[#2b5676]/20 rounded px-3 py-2"
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[#325672]">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-[#0f2a44]">{value}</span>
    </div>
  );
}