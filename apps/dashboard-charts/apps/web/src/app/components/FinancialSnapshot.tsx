import React from "react";
import ChartCard from "./ChartCard";

export default function FinancialSnapshot() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <ChartCard title="Revenue">
          <div className="h-40 flex items-center justify-center text-gray-400">
            {/* Replace with actual chart component */}
            Chart goes here
          </div>
        </ChartCard>
      </div>
      <div>
        <ChartCard title="Expenses">
          <div className="h-40 flex items-center justify-center text-gray-400">
            {/* Replace with actual chart component */}
            Chart goes here
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

