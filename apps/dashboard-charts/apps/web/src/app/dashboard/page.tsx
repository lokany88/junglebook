import FinancialSnapshot from "../components/FinancialSnapshot";
import ActiveProjects from "../components/ActiveProjects";
import TaskQueue from "../components/TaskQueue";
import QuickActions from "../components/QuickActions";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Financial Snapshot */}
      <div className="lg:col-span-2 space-y-6">
        <FinancialSnapshot />
        <ActiveProjects />
      </div>

      {/* Right: Tasks + Actions */}
      <div className="space-y-6">
        <TaskQueue />
        <QuickActions />
      </div>
    </div>
  );
}

