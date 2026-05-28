import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, StatCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { ShieldCheck, ShieldAlert, ShieldX, Clock, FileWarning } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { complianceApi } from '../../services/api';

export const Route = createFileRoute('/_authenticated/compliance')({
  component: CompliancePage,
});

function CompliancePage() {
  const { data: dashboardData } = useQuery<any>({
    queryKey: ['compliance', 'dashboard'],
    queryFn: () => complianceApi.getDashboard(),
  });

  const { data: itemsData, isLoading: isItemsLoading } = useQuery<any>({
    queryKey: ['compliance', 'items'],
    queryFn: () => complianceApi.listItems(),
  });

  const { data: expiringData } = useQuery<any>({
    queryKey: ['compliance', 'expiring'],
    queryFn: () => complianceApi.getExpiring(),
  });

  const items = itemsData?.data || [];
  const expiring = expiringData?.data || [];
  const dashboard = dashboardData?.data || { score: 0, compliant: 0, total: 0 };
  
  const expiredCount = items.filter((i: any) => i.status === 'expired').length;
  const warningCount = items.filter((i: any) => i.status === 'warning').length;

  const complianceStats = [
    { name: 'Compliant', value: dashboard.compliant, color: '#10b981' },
    { name: 'Warning', value: warningCount, color: '#f59e0b' },
    { name: 'Expired', value: expiredCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Compliance</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Monitor certifications and regulations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Compliance Score" value={`${dashboard.score}%`} icon={<ShieldCheck className="w-6 h-6" />} iconBg="gradient-primary" />
        <StatCard title="Compliant Items" value={`${dashboard.compliant}`} icon={<ShieldCheck className="w-6 h-6" />} iconBg="gradient-success" delay={100} />
        <StatCard title="Warning (30 Days)" value={`${warningCount}`} icon={<ShieldAlert className="w-6 h-6" />} iconBg="gradient-warning" delay={200} />
        <StatCard title="Expired" value={`${expiredCount}`} icon={<ShieldX className="w-6 h-6" />} iconBg="gradient-danger" delay={300} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Compliance Breakdown">
          <div className="h-64 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complianceStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {complianceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold dark:text-text-dark-primary text-text-light-primary">{dashboard.score}%</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
              {complianceStats.map(stat => (
                  <div key={stat.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span className="text-xs dark:text-text-dark-secondary text-text-light-secondary">{stat.name} ({stat.value})</span>
                  </div>
              ))}
          </div>
        </Card>

        <Card title="Expiring Soon" className="lg:col-span-2">
            <div className="space-y-4 mt-4">
                {expiring.length === 0 ? (
                  <div className="py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">No items expiring soon.</div>
                ) : expiring.map((item: any, i: number) => {
                    const days = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const isExpired = days < 0;
                    const color = isExpired ? 'text-danger' : 'text-warning';
                    const bg = isExpired ? 'bg-danger/10' : 'bg-warning/10';
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border dark:border-dark-border border-light-border dark:bg-dark-elevated bg-light-elevated">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${bg} ${color}`}>
                                  <FileWarning className="w-5 h-5" />
                              </div>
                              <div>
                                  <h4 className="font-medium dark:text-text-dark-primary text-text-light-primary">{item.title}</h4>
                                  <p className="text-xs dark:text-text-dark-secondary text-text-light-secondary">
                                      {isExpired ? `Expired ${Math.abs(days)} days ago` : `Expires in ${days} days`}
                                  </p>
                              </div>
                          </div>
                          <Badge variant={isExpired ? 'danger' : 'warning'}>{isExpired ? 'Expired' : 'Warning'}</Badge>
                      </div>
                    );
                })}
            </div>
        </Card>
      </div>

      <Card title="All Compliance Items">
        {isItemsLoading ? (
            <div className="py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading items...</div>
        ) : (
            <DataTable 
              columns={[
                { key: 'title', title: 'Item Name', render: (item: any) => <span>{item.name || item.title}</span> },
                { key: 'category', title: 'Category', render: (item: any) => <span className="capitalize">{item.type || item.category}</span> },
                { key: 'expiryDate', title: 'Expiry Date', render: (item: any) => item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A' },
                { key: 'status', title: 'Status', render: (item: any) => (
                    <Badge variant={item.status === 'compliant' ? 'success' : item.status === 'expired' ? 'danger' : 'warning'} dot className="capitalize">
                      {item.status}
                    </Badge>
                  )
                },
              ]}
              data={items}
            />
        )}
      </Card>
    </div>
  );
}
