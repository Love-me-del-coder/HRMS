import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, Avatar } from '../../components/ui/Badge';
import { Target, TrendingUp, Award, Users, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { performanceApi } from '../../services/api';

export const Route = createFileRoute('/_authenticated/performance')({
  component: PerformancePage,
});

const performanceData = [
  { name: 'Engineering', score: 4.5 },
  { name: 'Marketing', score: 4.2 },
  { name: 'Sales', score: 4.8 },
  { name: 'HR', score: 4.0 },
  { name: 'Finance', score: 4.3 },
];

function PerformancePage() {
  const { data: goalsData, isLoading: isGoalsLoading } = useQuery<any>({
    queryKey: ['performance', 'goals'],
    queryFn: () => performanceApi.listGoals(),
  });

  const { data: reviewsData } = useQuery<any>({
    queryKey: ['performance', 'reviews'],
    queryFn: () => performanceApi.listReviews(),
  });

  const goals = goalsData?.data || [];
  const reviews = reviewsData?.data || [];
  
  // Calculate stats
  const totalReviews = reviews.length || 1;
  const avgScore = reviews.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / totalReviews;
  const onTrackGoals = goals.filter((g: any) => g.status === 'on_track').length;
  const goalsOnTrackPercent = goals.length ? Math.round((onTrackGoals / goals.length) * 100) : 0;
  const highPerformers = reviews.filter((r: any) => (r.score || 0) >= 4.5).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Performance</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Track goals, KPIs, and appraisals</p>
        </div>
        <Button icon={<Target className="w-4 h-4" />}>Create Goal</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Avg Company Score" value={`${avgScore.toFixed(1)}/5`} icon={<Star className="w-6 h-6" />} iconBg="gradient-primary" />
        <StatCard title="Reviews Completed" value={`${reviews.length}`} icon={<Award className="w-6 h-6" />} iconBg="gradient-success" delay={100} />
        <StatCard title="Goals On Track" value={`${goalsOnTrackPercent}%`} icon={<TrendingUp className="w-6 h-6" />} iconBg="gradient-info" delay={200} />
        <StatCard title="High Performers" value={highPerformers.toString()} icon={<Users className="w-6 h-6" />} iconBg="gradient-accent" delay={300} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Company Goals">
          <div className="space-y-6 mt-4">
            {isGoalsLoading ? (
               <div className="py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading goals...</div>
            ) : goals.length === 0 ? (
               <div className="py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">No goals found.</div>
            ) : goals.map((goal: any, i: number) => (
              <div key={goal.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold dark:text-text-dark-primary text-text-light-primary">{goal.title}</h4>
                    <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary">Type: {goal.type}</p>
                  </div>
                  <Badge variant={goal.status === 'completed' ? 'success' : goal.status === 'on_track' ? 'primary' : 'warning'} className="capitalize">
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 dark:bg-dark-elevated bg-light-elevated rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${goal.progress === 100 ? 'bg-success' : goal.progress > 50 ? 'bg-primary-500' : 'bg-warning'} transition-all duration-1000`} 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium dark:text-text-dark-primary text-text-light-primary w-12 text-right">
                    {goal.progress}%
                  </span>
                </div>
                <p className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary mt-1">Due: {new Date(goal.targetDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Department Performance">
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                <XAxis type="number" domain={[0, 5]} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }} />
                <Bar dataKey="score" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
