import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, Avatar } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, TextArea } from '../../components/ui/Input';
import { CalendarDays, Plus, Check, X } from 'lucide-react';
import { leaveApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export const Route = createFileRoute('/_authenticated/leave')({
  component: LeavePage,
});

const DEFAULT_BALANCES = [
  { type: 'Annual', total: 14, used: 0, color: 'bg-primary-500' },
  { type: 'Casual', total: 7, used: 0, color: 'bg-accent' },
  { type: 'Sick', total: 7, used: 0, color: 'bg-success' },
  { type: 'Maternity', total: 84, used: 0, color: 'bg-pink-500' },
];

function LeavePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });

  const { data: requestsData, isLoading: isRequestsLoading } = useQuery<any>({
    queryKey: ['leave', 'requests'],
    queryFn: () => leaveApi.listRequests(),
  });

  const { data: balancesData } = useQuery<any>({
    queryKey: ['leave', 'balances'],
    queryFn: () => leaveApi.getBalances(user?.id),
  });

  const applyMutation = useMutation({
    mutationFn: leaveApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      setIsApplyModalOpen(false);
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => leaveApi.approveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => leaveApi.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    }
  });

  const handleApplyLeave = () => {
    applyMutation.mutate(leaveData);
  };

  const requests = requestsData?.data || [];
  const balances = balancesData?.data?.length ? balancesData.data : DEFAULT_BALANCES;

  const formattedRequests = requests.map((r: any) => ({
    id: r.id,
    employee: r.employeeId,
    type: r.type,
    startDate: new Date(r.startDate).toLocaleDateString(),
    endDate: new Date(r.endDate).toLocaleDateString(),
    days: r.days || 1,
    status: r.status,
    reason: r.reason
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Leave Management</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Manage employee time off and absences</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsApplyModalOpen(true)}>Apply Leave</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {balances.map((balance: any, index: number) => (
          <Card key={balance.type} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-text-dark-primary text-text-light-primary">{balance.type} Leave</h3>
              <CalendarDays className={`w-5 h-5 ${balance.color?.replace('bg-', 'text-') || 'text-primary-500'}`} />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold dark:text-text-dark-primary text-text-light-primary">{balance.total - (balance.used || 0)}</span>
              <span className="text-sm dark:text-text-dark-secondary text-text-light-secondary">/ {balance.total} days left</span>
            </div>
            <div className="h-2 w-full dark:bg-dark-elevated bg-light-elevated rounded-full overflow-hidden">
              <div 
                className={`h-full ${balance.color || 'bg-primary-500'} transition-all duration-1000 ease-out`} 
                style={{ width: `${((balance.used || 0) / balance.total) * 100}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Leave Requests" className="lg:col-span-2">
          {isRequestsLoading ? (
             <div className="py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading requests...</div>
          ) : (
            <DataTable 
              columns={[
                { key: 'employee', title: 'Employee', render: (item: any) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={item.employeeName || 'Unknown'} />
                    <div>
                      <p className="font-medium dark:text-text-dark-primary text-text-light-primary">{item.employeeName}</p>
                      <p className="text-xs dark:text-text-dark-secondary text-text-light-secondary">{item.department}</p>
                    </div>
                  </div>
                )},
                { key: 'type', title: 'Leave Type', render: (item: any) => <span className="capitalize">{item.leaveTypeName || item.type}</span> },
                { key: 'date', title: 'Duration', render: (item: any) => <span>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()} ({item.days} days)</span> },
                { key: 'reason', title: 'Reason' },
                { key: 'status', title: 'Status', render: (item: any) => (
                    <Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'} dot className="capitalize">
                      {item.status}
                    </Badge>
                  )
                },
                { key: 'actions', title: '', render: (item: any) => item.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => approveMutation.mutate(item.id)}>Approve</Button>
                      <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => rejectMutation.mutate(item.id)}>Reject</Button>
                    </div>
                  ) : null
                }
              ]}
              data={formattedRequests}
            />
          )}
        </Card>

        <Card title="Team Availability" className="h-[400px]">
            <div className="flex items-center justify-center h-full flex-col dark:text-text-dark-tertiary text-text-light-tertiary">
                <CalendarDays className="w-12 h-12 mb-4 opacity-50" />
                <p>Team calendar integration goes here</p>
            </div>
        </Card>
      </div>

      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply Leave" footer={<><Button variant="ghost" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button><Button onClick={handleApplyLeave} loading={applyMutation.isPending}>Submit Request</Button></>}>
        <div className="space-y-4">
          <Select label="Leave Type" options={[{value:'annual', label:'Annual Leave'}, {value:'casual', label:'Casual Leave'}, {value:'sick', label:'Sick Leave'}]} value={leaveData.type} onChange={(e) => setLeaveData({...leaveData, type: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={leaveData.startDate} onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})} />
            <Input label="End Date" type="date" value={leaveData.endDate} onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})} />
          </div>
          <TextArea label="Reason" placeholder="Please provide a brief reason for your leave request..." value={leaveData.reason} onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})} />
        </div>
      </Modal>
    </div>
  );
}
