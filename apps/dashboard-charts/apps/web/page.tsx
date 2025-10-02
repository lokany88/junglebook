import FinancialSnapshot from '../components/FinancialSnapshot';
import ActiveProjects from '../components/ActiveProjects';
import TaskQueue from '../components/TaskQueue';
import QuickActions from '../components/QuickActions';
import ChartCard from '../components/ChartCard';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Row 1 */}
      <div className="lg:col-span-2 space-y-6">
        <QuickActions />
        <FinancialSnapshot />
        <ChartCard />
      </div>

      {/* Row 2 */}
      <div className="space-y-6">
        <ActiveProjects />
        <TaskQueue />
      </div>
    </div>
  );
}
