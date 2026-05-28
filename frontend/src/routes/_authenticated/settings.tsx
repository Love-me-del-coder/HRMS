import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, TextArea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { useAuthStore } from '../../stores/authStore';
import { Building2, Users, Network, CalendarDays, DollarSign, CreditCard, Upload } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
});

const tabs = [
  { id: 'profile', label: 'Company Profile', icon: Building2 },
  { id: 'departments', label: 'Departments', icon: Network },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'leave', label: 'Leave Policies', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
];

function SettingsPage() {
  const { company } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Settings</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Manage company preferences and configurations</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <Card className="w-full md:w-64 flex-shrink-0 h-fit" padding="sm">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left
                    ${isActive 
                      ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400' 
                      : 'dark:text-text-dark-secondary text-text-light-secondary hover:dark:bg-dark-elevated hover:bg-light-elevated hover:dark:text-text-dark-primary hover:text-text-light-primary'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content Area */}
        <div className="flex-1 animate-fade-in">
          {activeTab === 'profile' && (
            <Card title="Company Profile">
              <div className="space-y-8 mt-4">
                <div className="flex items-center gap-6 pb-6 border-b dark:border-dark-border border-light-border">
                  <div className="w-24 h-24 rounded-2xl bg-primary-500/10 flex items-center justify-center border-2 border-dashed border-primary-500/30">
                    <Building2 className="w-10 h-10 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-text-dark-primary text-text-light-primary mb-1">Company Logo</h3>
                    <p className="text-xs dark:text-text-dark-secondary text-text-light-secondary mb-3">Recommended size 256x256px. Max 2MB.</p>
                    <Button variant="outline" size="sm" icon={<Upload className="w-4 h-4" />}>Upload Logo</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Company Name" defaultValue={company?.name} />
                  <Input label="Registration Number" defaultValue={company?.registrationNo} />
                  <Input label="Industry" defaultValue={company?.industry} />
                  <Input label="Website" defaultValue="https://www.rathnagroup.lk" />
                  <Select label="Timezone" options={[{value:'Asia/Colombo', label:'Asia/Colombo'}]} defaultValue={company?.timezone} />
                  <Select label="Currency" options={[{value:'LKR', label:'Sri Lankan Rupee (LKR)'}]} defaultValue={company?.currency} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextArea label="Address" className="md:col-span-2" defaultValue="123 Peradeniya Road, Kandy" />
                  <Input label="City" defaultValue={company?.city} />
                  <Input label="Country" defaultValue={company?.country} />
                </div>

                <div className="flex justify-end pt-4 border-t dark:border-dark-border border-light-border">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'departments' && (
            <Card title="Departments" actions={<Button size="sm">Add Department</Button>}>
              <div className="mt-4">
                <DataTable 
                  columns={[
                    { key: 'name', title: 'Department Name' },
                    { key: 'head', title: 'Department Head' },
                    { key: 'employees', title: 'Employees' },
                    { key: 'status', title: 'Status', render: () => <Badge variant="success">Active</Badge> },
                  ]}
                  data={[
                    { id: '1', name: 'Executive Management', head: 'Kamal Perera', employees: 5 },
                    { id: '2', name: 'Human Resources', head: 'Nimali Fernando', employees: 8 },
                    { id: '3', name: 'Information Technology', head: 'Dilshan Silva', employees: 45 },
                  ]}
                />
              </div>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card title="User Management" actions={<Button size="sm">Invite User</Button>}>
              <div className="mt-4">
                <DataTable 
                  columns={[
                    { key: 'name', title: 'User' },
                    { key: 'email', title: 'Email' },
                    { key: 'role', title: 'Role', render: (item) => <Badge variant="primary" className="capitalize">{item.role.replace('_', ' ')}</Badge> },
                  ]}
                  data={[
                    { id: '1', name: 'Kamal Perera', email: 'admin@rathnagroup.lk', role: 'company_admin' },
                    { id: '2', name: 'Nimali Fernando', email: 'nimali@rathnagroup.lk', role: 'hr_manager' },
                  ]}
                />
              </div>
            </Card>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
                <Card className="bg-gradient-to-br from-primary-900 to-primary-700 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="default" className="bg-white/20 text-white border-none mb-4">Current Plan</Badge>
                            <h2 className="text-3xl font-bold mb-1 capitalize">{company?.subscriptionPlan || 'Enterprise'} Plan</h2>
                            <p className="text-white/70">Unlimited employees, all features included.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">$499<span className="text-lg text-white/60 font-normal">/mo</span></p>
                            <p className="text-sm text-white/70">Billed annually</p>
                        </div>
                    </div>
                </Card>
                <Card title="Billing Information">
                    <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary mb-4">Manage your billing details and invoices.</p>
                    <Button variant="outline">Update Billing Method</Button>
                </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
