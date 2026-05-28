import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '../../stores/authStore';
import { StatCard, Card } from '../../components/ui/Card';
import { Users, UserCheck, UserMinus, Briefcase, Clock, DollarSign, Target, GraduationCap, ShieldCheck, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../services/api';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuthStore();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const { data: statsData, isLoading: isStatsLoading } = useQuery<any>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: deptData } = useQuery<any>({
    queryKey: ['dashboard', 'departments'],
    queryFn: () => dashboardApi.getDepartmentDistribution(),
  });

  const { data: trendData } = useQuery<any>({
    queryKey: ['dashboard', 'trends'],
    queryFn: () => dashboardApi.getMonthlyTrends(),
  });

  const { data: activityData } = useQuery<any>({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardApi.getRecentActivity(),
  });

  const stats = statsData?.data || {
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveToday: 0,
    openVacancies: 0,
  };

  const departments = deptData?.data || [];
  const trends = trendData?.data || [];
  const activities = activityData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">
            Good Morning, {user?.firstName || 'User'}
          </h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">{today}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={isStatsLoading ? '...' : stats.totalEmployees} change="+12 this month" changeType="positive" icon={<Users className="w-6 h-6" />} iconBg="gradient-primary" delay={0} />
        <StatCard title="Active Employees" value={isStatsLoading ? '...' : stats.activeEmployees} change="95% of total" icon={<UserCheck className="w-6 h-6" />} iconBg="gradient-success" delay={100} />
        <StatCard title="On Leave Today" value={isStatsLoading ? '...' : stats.onLeaveToday} change="-2 from yesterday" changeType="positive" icon={<UserMinus className="w-6 h-6" />} iconBg="gradient-warning" delay={200} />
        <StatCard title="Open Vacancies" value={isStatsLoading ? '...' : stats.openVacancies} change="+3 this week" icon={<Briefcase className="w-6 h-6" />} iconBg="gradient-accent" delay={300} />
        
        <StatCard title="Pending Requests" value="8" change="Requires action" changeType="negative" icon={<Clock className="w-6 h-6" />} iconBg="bg-orange-500" delay={400} />
        <StatCard title="Payroll Cost" value="LKR 45.2M" change="+2.4% vs last month" changeType="negative" icon={<DollarSign className="w-6 h-6" />} iconBg="bg-emerald-600" delay={500} />
        <StatCard title="Attendance Rate" value="94.2%" change="Above target (90%)" changeType="positive" icon={<Activity className="w-6 h-6" />} iconBg="bg-blue-500" delay={600} />
        <StatCard title="Compliance Score" value="87%" change="Action needed" changeType="warning" icon={<ShieldCheck className="w-6 h-6" />} iconBg="bg-red-500" delay={700} />
        
        <StatCard title="Training Completion" value="72%" change="+5% vs last month" changeType="positive" icon={<GraduationCap className="w-6 h-6" />} iconBg="bg-purple-500" delay={800} />
        <StatCard title="New Hires" value="15" change="This month" icon={<Users className="w-6 h-6" />} iconBg="bg-indigo-500" delay={900} />
        <StatCard title="Turnover Rate" value="3.2%" change="Below industry avg" changeType="positive" icon={<Target className="w-6 h-6" />} iconBg="bg-pink-500" delay={1000} />
        <StatCard title="Avg Performance" value="4.2/5" change="Last quarter" icon={<Activity className="w-6 h-6" />} iconBg="bg-cyan-500" delay={1100} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Department Distribution" className="h-96 animate-slide-up" style={{ animationDelay: '1200ms' }}>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={departments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }} />
              <Bar dataKey="employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Employee Growth Trend" className="h-96 animate-slide-up" style={{ animationDelay: '1300ms' }}>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }} />
              <Line type="monotone" dataKey="employees" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#12121a' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '1400ms' }}>
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 dark:text-text-dark-primary text-text-light-primary">Recent Activity</h3>
            <div className="space-y-4">
                {[
                    { title: 'New Employee Onboarded', desc: 'Saman Kumara joined Engineering', time: '2 hours ago', color: 'bg-emerald-500' },
                    { title: 'Payroll Approved', desc: 'May 2026 payroll approved by Finance', time: '4 hours ago', color: 'bg-blue-500' },
                    { title: 'Leave Request', desc: 'Kamal Perera requested 2 days Annual Leave', time: '5 hours ago', color: 'bg-amber-500' },
                    { title: 'Goal Completed', desc: 'Q1 Sales Target achieved by Sales Team', time: '1 day ago', color: 'bg-purple-500' }
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-xl dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.color}`} />
                        <div className="flex-1">
                            <p className="text-sm font-medium dark:text-text-dark-primary text-text-light-primary">{item.title}</p>
                            <p className="text-xs dark:text-text-dark-secondary text-text-light-secondary">{item.desc}</p>
                        </div>
                        <span className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary">{item.time}</span>
                    </div>
                ))}
            </div>
        </Card>
        <Card>
            <h3 className="text-lg font-semibold mb-4 dark:text-text-dark-primary text-text-light-primary">Quick Actions</h3>
            <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl border dark:border-dark-border border-light-border dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors group">
                    <span className="text-sm font-medium dark:text-text-dark-primary text-text-light-primary">Add Employee</span>
                    <Users className="w-4 h-4 dark:text-text-dark-tertiary text-text-light-tertiary group-hover:text-primary-500 transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border dark:border-dark-border border-light-border dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors group">
                    <span className="text-sm font-medium dark:text-text-dark-primary text-text-light-primary">Process Payroll</span>
                    <DollarSign className="w-4 h-4 dark:text-text-dark-tertiary text-text-light-tertiary group-hover:text-primary-500 transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border dark:border-dark-border border-light-border dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors group">
                    <span className="text-sm font-medium dark:text-text-dark-primary text-text-light-primary">Post Job</span>
                    <Briefcase className="w-4 h-4 dark:text-text-dark-tertiary text-text-light-tertiary group-hover:text-primary-500 transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border dark:border-dark-border border-light-border dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors group">
                    <span className="text-sm font-medium dark:text-text-dark-primary text-text-light-primary">Generate Report</span>
                    <Activity className="w-4 h-4 dark:text-text-dark-tertiary text-text-light-tertiary group-hover:text-primary-500 transition-colors" />
                </button>
            </div>
        </Card>
      </div>
    </div>
  );
}
