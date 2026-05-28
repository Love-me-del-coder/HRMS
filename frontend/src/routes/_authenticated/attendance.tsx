import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { attendanceApi } from '../../services/api';
import { AttendanceRecord } from '../../types';

export const Route = createFileRoute('/_authenticated/attendance')({
  component: AttendancePage,
});

function AttendancePage() {
  const [time, setTime] = useState(new Date());
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: summaryData } = useQuery<any>({
    queryKey: ['attendance', 'summary'],
    queryFn: () => attendanceApi.getSummary(),
  });

  const { data: recordsData, isLoading } = useQuery<any>({
    queryKey: ['attendance', 'records'],
    queryFn: () => attendanceApi.list(),
  });

  const checkInMutation = useMutation({
    mutationFn: attendanceApi.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: attendanceApi.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });

  const summary = summaryData?.data || { present: 0, absent: 0, late: 0, halfDay: 0, total: 0 };
  const records: AttendanceRecord[] = recordsData?.data || [];

  // Determine if the user is currently checked in
  const today = new Date().toISOString().split('T')[0];
  const myTodayRecord = records.find(r => r.date === today && !r.checkOut);
  const isCheckedIn = !!myTodayRecord;

  const handleCheckAction = () => {
    if (isCheckedIn) {
      checkOutMutation.mutate();
    } else {
      checkInMutation.mutate();
    }
  };

  const formattedRecords = records.map(r => ({
    id: r.id,
    employee: r.employeeId,
    date: r.date,
    shift: 'Morning Shift', // Stub
    checkIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-',
    checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-',
    status: r.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Attendance</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Track and manage employee attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 dark:text-text-dark-primary text-text-light-primary">Today's Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border dark:border-dark-border border-light-border text-center dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
                    <p className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">{summary.present}</p>
                    <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary">Present</p>
                </div>
                <div className="p-4 rounded-xl border dark:border-dark-border border-light-border text-center dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors">
                    <XCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
                    <p className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">{summary.absent}</p>
                    <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary">Absent</p>
                </div>
                <div className="p-4 rounded-xl border dark:border-dark-border border-light-border text-center dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-warning" />
                    <p className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">{summary.late}</p>
                    <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary">Late</p>
                </div>
                <div className="p-4 rounded-xl border dark:border-dark-border border-light-border text-center dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-info" />
                    <p className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">{summary.total - summary.present - summary.absent - summary.late}</p>
                    <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary">On Leave</p>
                </div>
            </div>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary mb-2">Current Time</h3>
            <p className="text-4xl font-bold mb-6 font-mono tracking-wider dark:text-text-dark-primary text-text-light-primary text-transparent bg-clip-text gradient-primary">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <Button 
                size="lg" 
                variant={isCheckedIn ? 'outline' : 'primary'}
                className="w-full"
                onClick={handleCheckAction}
                loading={checkInMutation.isPending || checkOutMutation.isPending}
            >
                {isCheckedIn ? 'Check Out' : 'Check In'}
            </Button>
            <p className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary mt-4">
                Shift: Morning Shift (09:00 AM - 05:30 PM)
            </p>
        </Card>
      </div>

      <Card title="Recent Attendance Records">
        {isLoading ? (
            <div className="py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading records...</div>
        ) : (
            <DataTable 
              searchable
              columns={[
                { key: 'employee', title: 'Employee' },
                { key: 'date', title: 'Date' },
                { key: 'shift', title: 'Shift' },
                { key: 'checkIn', title: 'Check In' },
                { key: 'checkOut', title: 'Check Out' },
                { key: 'status', title: 'Status', render: (item) => (
                    <Badge variant={item.status === 'present' ? 'success' : item.status === 'late' ? 'warning' : item.status === 'absent' ? 'danger' : 'info'} dot className="capitalize">
                      {item.status.replace('_', ' ')}
                    </Badge>
                  )
                },
              ]}
              data={formattedRecords}
            />
        )}
      </Card>
    </div>
  );
}
