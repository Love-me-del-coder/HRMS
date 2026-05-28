import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { DollarSign, FileText, CheckCircle, Clock, Download, PlayCircle } from 'lucide-react';
import { payrollApi } from '../../services/api';

export const Route = createFileRoute('/_authenticated/payroll')({
  component: PayrollPage,
});

function PayrollPage() {
  const queryClient = useQueryClient();
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { data: runsData, isLoading } = useQuery<any>({
    queryKey: ['payroll', 'runs'],
    queryFn: () => payrollApi.listRuns(),
  });

  const createRunMutation = useMutation({
    mutationFn: (data: any) => payrollApi.createRun(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] })
  });

  const processRunMutation = useMutation({
    mutationFn: (id: string) => payrollApi.processRun(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] })
  });

  const approveRunMutation = useMutation({
    mutationFn: (id: string) => payrollApi.approveRun(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] })
  });

  const runs = runsData?.data || [];
  const processedCount = runs.filter((r: any) => r.status === 'completed').length;
  const pendingCount = runs.filter((r: any) => r.status !== 'completed').length;
  
  const handleProcessPayroll = () => {
    createRunMutation.mutate({
      period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      status: 'draft',
      totalAmount: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Payroll Management</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Process and manage employee salaries</p>
        </div>
        <Button icon={<PlayCircle className="w-4 h-4" />} onClick={handleProcessPayroll} loading={createRunMutation.isPending}>New Payroll Run</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Payroll (YTD)" value="LKR 223M" icon={<DollarSign className="w-6 h-6" />} iconBg="gradient-primary" />
        <StatCard title="Avg Salary" value="LKR 85K" icon={<FileText className="w-6 h-6" />} iconBg="gradient-accent" delay={100} />
        <StatCard title="Processed Runs" value={processedCount.toString()} icon={<CheckCircle className="w-6 h-6" />} iconBg="gradient-success" delay={200} />
        <StatCard title="Pending Runs" value={pendingCount.toString()} icon={<Clock className="w-6 h-6" />} iconBg="gradient-warning" delay={300} />
      </div>

      <Card title="Recent Payroll Runs">
        {isLoading ? (
            <div className="py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading runs...</div>
        ) : (
            <DataTable 
              columns={[
                { key: 'id', title: 'Run ID', render: (item: any) => <span className="font-mono text-xs">{item.id?.slice(0, 8)}</span> },
                { key: 'period', title: 'Period', sortable: true },
                { key: 'createdAt', title: 'Run Date', render: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '' },
                { key: 'totalAmount', title: 'Total Amount', render: (item: any) => <span className="font-semibold">LKR {item.totalAmount?.toLocaleString() || 0}</span> },
                { key: 'status', title: 'Status', render: (item: any) => (
                    <Badge variant={item.status === 'completed' ? 'success' : item.status === 'processing' ? 'primary' : 'warning'} dot className="capitalize">
                      {item.status}
                    </Badge>
                  )
                },
                { key: 'actions', title: '', render: (item: any) => (
                    <div className="flex justify-end gap-2">
                      {item.status === 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => processRunMutation.mutate(item.id)}>Process</Button>
                      )}
                      {item.status === 'processing' && (
                          <Button variant="primary" size="sm" onClick={() => approveRunMutation.mutate(item.id)}>Approve</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => { setSelectedRunId(item.id); setIsPayslipOpen(true); }}>View Details</Button>
                    </div>
                  )
                }
              ]}
              data={runs}
            />
        )}
      </Card>

      <Modal isOpen={isPayslipOpen} onClose={() => setIsPayslipOpen(false)} title="Sample Payslip View" size="lg">
        <div className="p-6 border dark:border-dark-border border-light-border rounded-xl">
          <div className="flex justify-between items-start mb-8 border-b dark:border-dark-border border-light-border pb-6">
            <div>
              <h2 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Rathna Group of Companies</h2>
              <p className="dark:text-text-dark-secondary text-text-light-secondary">Payslip Data</p>
            </div>
            <div className="text-right">
              <p className="font-semibold dark:text-text-dark-primary text-text-light-primary">Kamal Perera</p>
              <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary">EMP-001 | Executive</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-success border-b dark:border-dark-border border-light-border pb-2">Earnings</h4>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="dark:text-text-dark-secondary text-text-light-secondary">Basic Salary</span><span>350,000.00</span></div>
                <div className="flex justify-between"><span className="dark:text-text-dark-secondary text-text-light-secondary">Transport Allowance</span><span>25,000.00</span></div>
                <div className="flex justify-between"><span className="dark:text-text-dark-secondary text-text-light-secondary">Housing Allowance</span><span>45,000.00</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-danger border-b dark:border-dark-border border-light-border pb-2">Deductions</h4>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="dark:text-text-dark-secondary text-text-light-secondary">PAYE Tax</span><span>42,500.00</span></div>
                <div className="flex justify-between"><span className="dark:text-text-dark-secondary text-text-light-secondary">EPF (8%)</span><span>28,000.00</span></div>
                <div className="flex justify-between"><span className="dark:text-text-dark-secondary text-text-light-secondary">Welfare Fund</span><span>1,000.00</span></div>
              </div>
            </div>
          </div>

          <div className="bg-primary-500/10 p-4 rounded-xl flex justify-between items-center">
            <span className="font-bold text-lg dark:text-text-dark-primary text-text-light-primary">Net Pay</span>
            <span className="font-bold text-2xl text-primary-500">LKR 348,500.00</span>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button icon={<Download className="w-4 h-4" />}>Download PDF</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
