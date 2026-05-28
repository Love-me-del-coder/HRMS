import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge, Avatar } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FileUploader } from '../../components/ui/FileUploader';
import { Plus, Search, MoreVertical, Mail, Phone, MapPin } from 'lucide-react';
import { employeesApi } from '../../services/api';
import { Employee } from '../../types';

export const Route = createFileRoute('/_authenticated/employees')({
  component: EmployeesPage,
});

function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = search;

  const { data: employeesData, isLoading } = useQuery<any>({
    queryKey: ['employees', debouncedSearch, filter],
    queryFn: () => employeesApi.list({ search: debouncedSearch, status: filter !== 'all' ? filter : '' }),
  });

  const employees: Employee[] = employeesData?.data || [];

  const filteredEmployees = employees.filter(emp => {
    const departmentName = emp.departmentName || '';
    const matchesSearch = emp.firstName.toLowerCase().includes(search.toLowerCase()) || 
                          emp.lastName.toLowerCase().includes(search.toLowerCase()) || 
                          departmentName.toLowerCase().includes(search.toLowerCase()) ||
                          emp.position.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || emp.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Employees</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Manage your company's workforce</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>Add Employee</Button>
      </div>

      <Card className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'active' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('active')}>Active</Button>
          <Button variant={filter === 'on_leave' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('on_leave')}>On Leave</Button>
          <Button variant={filter === 'probation' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('probation')}>Probation</Button>
        </div>
        <div className="w-full sm:w-72">
          <Input 
            placeholder="Search employees..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && <div className="col-span-full py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading employees...</div>}
        {filteredEmployees.map((emp, index) => (
          <Card key={emp.id} hover padding="none" className="overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Avatar name={`${emp.firstName} ${emp.lastName}`} size="lg" />
                <button className="p-2 -mr-2 rounded-lg dark:text-text-dark-tertiary dark:hover:text-text-dark-primary text-text-light-tertiary hover:text-text-light-primary transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold text-lg dark:text-text-dark-primary text-text-light-primary truncate">{emp.firstName} {emp.lastName}</h3>
                <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary truncate">{emp.position}</p>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="primary" size="sm">{emp.departmentName || 'Dept'}</Badge>
                <Badge 
                    variant={emp.status === 'active' ? 'success' : emp.status === 'on_leave' ? 'warning' : 'info'} 
                    size="sm" dot
                >
                  {emp.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="space-y-2 text-sm dark:text-text-dark-tertiary text-text-light-tertiary">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t dark:border-dark-border border-light-border divide-x dark:divide-dark-border divide-light-border">
              <button className="py-3 text-sm font-medium dark:text-text-dark-secondary dark:hover:text-text-dark-primary text-text-light-secondary hover:text-text-light-primary dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors">
                View Profile
              </button>
              <button className="py-3 text-sm font-medium dark:text-text-dark-secondary dark:hover:text-text-dark-primary text-text-light-secondary hover:text-text-light-primary dark:hover:bg-dark-elevated hover:bg-light-elevated transition-colors">
                Message
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee" size="lg" footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => setIsModalOpen(false)}>Save Employee</Button></>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="First Name" placeholder="e.g. Kamal" />
          <Input label="Last Name" placeholder="e.g. Perera" />
          <Input label="Email" type="email" placeholder="kamal@rathnagroup.lk" />
          <Input label="Phone" placeholder="+94 7X XXX XXXX" />
          <Select label="Department" options={[{value:'it', label:'IT'}, {value:'hr', label:'HR'}, {value:'finance', label:'Finance'}]} />
          <Input label="Job Title" placeholder="e.g. Software Engineer" />
          <Input label="Date of Joining" type="date" />
          <Select label="Employment Type" options={[{value:'full_time', label:'Full Time'}, {value:'contract', label:'Contract'}]} />
        </div>
        <FileUploader 
          label="Profile Picture (Avatar)" 
          accept="image/*" 
          onUploadSuccess={(url) => console.log('Uploaded Avatar:', url)} 
        />
      </Modal>
    </div>
  );
}

