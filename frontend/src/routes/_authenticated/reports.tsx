import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Users, Briefcase, DollarSign, Clock, ShieldCheck, GraduationCap, Download, FileText, FileSpreadsheet, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Route = createFileRoute('/_authenticated/reports')({
  component: ReportsPage,
});

const reportTypes = [
  { id: 'employee', title: 'Employee Report', icon: Users, desc: 'Demographics, turnover, headcount' },
  { id: 'recruitment', title: 'Recruitment', icon: Briefcase, desc: 'Time to hire, pipeline, sources' },
  { id: 'payroll', title: 'Payroll', icon: DollarSign, desc: 'Cost analysis, overtime, taxes' },
  { id: 'attendance', title: 'Attendance', icon: Clock, desc: 'Absenteeism, late arrivals' },
  { id: 'compliance', title: 'Compliance', icon: ShieldCheck, desc: 'Expiring items, audit logs' },
  { id: 'training', title: 'Training', icon: GraduationCap, desc: 'Completion rates, costs' },
];

const mockChartData = [
  { name: 'Jan', val1: 400, val2: 240 },
  { name: 'Feb', val1: 300, val2: 139 },
  { name: 'Mar', val1: 200, val2: 980 },
  { name: 'Apr', val1: 278, val2: 390 },
  { name: 'May', val1: 189, val2: 480 },
];

function ReportsPage() {
  const [activeReport, setActiveReport] = useState('employee');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Reports & Analytics</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Generate and export insights</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isActive = activeReport === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setActiveReport(type.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200
                ${isActive 
                  ? 'border-primary-500 bg-primary-500/10 dark:text-text-dark-primary text-text-light-primary' 
                  : 'dark:border-dark-border border-light-border dark:hover:bg-dark-elevated hover:bg-light-elevated dark:text-text-dark-secondary text-text-light-secondary'}
              `}
            >
              <Icon className={`w-6 h-6 mb-3 ${isActive ? 'text-primary-500' : 'dark:text-text-dark-tertiary text-text-light-tertiary'}`} />
              <h3 className="font-semibold text-sm mb-1">{type.title}</h3>
              <p className="text-[10px] opacity-80 line-clamp-2">{type.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-primary-500/5 p-4 rounded-xl border border-primary-500/20">
        <div>
            <h2 className="text-lg font-semibold dark:text-text-dark-primary text-text-light-primary capitalize">{activeReport} Report Overview</h2>
            <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary">Data as of May 2026</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<FileText className="w-4 h-4" />}>PDF</Button>
            <Button variant="outline" size="sm" icon={<FileSpreadsheet className="w-4 h-4" />}>Excel</Button>
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Metric A" value="1,245" change="+12%" changeType="positive" icon={<FileText className="w-6 h-6" />} />
        <StatCard title="Total Metric B" value="45.2M" change="-2.4%" changeType="negative" delay={100} icon={<FileSpreadsheet className="w-6 h-6" />} />
        <StatCard title="Average Metric C" value="85%" change="On track" delay={200} icon={<BarChartIcon className="w-6 h-6" />} />
      </div>

      <Card title="Monthly Trends">
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }} />
              <Bar dataKey="val1" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="val2" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Detailed Data">
        <DataTable 
          columns={[
            { key: 'col1', title: 'Column 1' },
            { key: 'col2', title: 'Column 2' },
            { key: 'col3', title: 'Column 3' },
            { key: 'col4', title: 'Column 4' },
          ]}
          data={[
            { id: '1', col1: 'Data A1', col2: 'Data B1', col3: 'Data C1', col4: 'Data D1' },
            { id: '2', col1: 'Data A2', col2: 'Data B2', col3: 'Data C2', col4: 'Data D2' },
            { id: '3', col1: 'Data A3', col2: 'Data B3', col3: 'Data C3', col4: 'Data D3' },
          ]}
        />
      </Card>
    </div>
  );
}
