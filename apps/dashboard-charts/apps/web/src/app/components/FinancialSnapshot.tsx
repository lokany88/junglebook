import ChartCard from "./ChartCard";

export default function FinancialSnapshot() {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Financial Snapshot</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-400">Revenue</p>
          <p className="text-2xl font-bold">$120,000</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Expenses</p>
          <p className="text-2xl font-bold">$45,000</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Profit</p>
          <p className="text-2xl font-bold">$75,000</p>
        </div>
      </div>
      <ChartCard />
    </div>
  );
}

