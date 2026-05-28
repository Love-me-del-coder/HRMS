import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, Avatar } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Briefcase, Users, Calendar, CheckCircle2, MoreHorizontal, MapPin, DollarSign, Star, Clock } from 'lucide-react';
import { recruitmentApi } from '../../services/api';
import { JobRequisition, Candidate, Interview } from '../../types';

export const Route = createFileRoute('/_authenticated/recruitment')({
  component: RecruitmentPage,
});

function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'interviews'>('jobs');

  const { data: jobsData, isLoading: isJobsLoading } = useQuery<any>({
    queryKey: ['recruitment', 'jobs'],
    queryFn: () => recruitmentApi.listJobs(),
  });

  const { data: candidatesData, isLoading: isCandidatesLoading } = useQuery<any>({
    queryKey: ['recruitment', 'candidates'],
    queryFn: () => recruitmentApi.listCandidates(),
  });

  const { data: interviewsData, isLoading: isInterviewsLoading } = useQuery<any>({
    queryKey: ['recruitment', 'interviews'],
    queryFn: () => recruitmentApi.listInterviews(),
  });

  const jobs: JobRequisition[] = jobsData?.data || [];
  const allCandidates: Candidate[] = candidatesData?.data || [];
  const interviews: Interview[] = interviewsData?.data || [];

  const candidates = {
    applied: allCandidates.filter(c => c.stage === 'applied' || !c.stage),
    screening: allCandidates.filter(c => c.stage === 'screening'),
    interview: allCandidates.filter(c => c.stage === 'interview'),
    offer: allCandidates.filter(c => c.stage === 'offer'),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Recruitment</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Manage job postings and candidates</p>
        </div>
        <Button icon={<Briefcase className="w-4 h-4" />}>Post Job</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Open Positions" value={isJobsLoading ? '...' : jobs.filter((j: any) => j.status === 'open').length} icon={<Briefcase className="w-6 h-6" />} iconBg="gradient-primary" />
        <StatCard title="Total Applicants" value={isCandidatesLoading ? '...' : allCandidates.length} change="+24 this week" changeType="positive" icon={<Users className="w-6 h-6" />} iconBg="gradient-accent" delay={100} />
        <StatCard title="Interviews Today" value={isInterviewsLoading ? '...' : interviews.length} icon={<Calendar className="w-6 h-6" />} iconBg="gradient-warning" delay={200} />
        <StatCard title="Offers Pending" value={isCandidatesLoading ? '...' : candidates.offer.length} icon={<CheckCircle2 className="w-6 h-6" />} iconBg="gradient-success" delay={300} />
      </div>

      <div className="flex border-b dark:border-dark-border border-light-border">
        {(['jobs', 'candidates', 'interviews'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 relative -mb-[2px] capitalize
              ${activeTab === tab 
                ? 'border-primary-500 text-primary-500 dark:text-primary-400' 
                : 'border-transparent dark:text-text-dark-secondary text-text-light-secondary hover:dark:text-text-dark-primary hover:text-text-light-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'jobs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isJobsLoading && <div className="col-span-full py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading jobs...</div>}
            {jobs.filter((j: any) => j.status === 'open').map((job: any, i: number) => (
              <Card key={job.id} hover className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg dark:text-text-dark-primary text-text-light-primary">{job.title}</h3>
                    <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location} • {job.employmentType}</p>
                  </div>
                  <button className="p-1 dark:text-text-dark-tertiary hover:dark:text-text-dark-primary text-text-light-tertiary hover:text-text-light-primary rounded transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="primary" className="bg-primary-500/10 text-primary-500 border-none">{job.departmentId}</Badge>
                  <Badge variant="default" className="dark:bg-dark-elevated bg-light-elevated border-none">{job.candidateCount || 0} applicants</Badge>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-dark-border border-light-border">
                  <span className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600">View Details</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="flex gap-6 overflow-x-auto pb-4 h-[600px]">
            {isCandidatesLoading && <div className="w-full py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading candidates...</div>}
            {!isCandidatesLoading && Object.entries(candidates).map(([stage, list], idx) => (
              <div key={stage} className="min-w-[300px] w-80 flex flex-col gap-4 animate-slide-in-right" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex justify-between items-center dark:bg-dark-elevated bg-light-elevated px-4 py-2.5 rounded-xl border dark:border-dark-border border-light-border">
                  <h3 className="font-semibold capitalize text-sm dark:text-text-dark-primary text-text-light-primary">{stage}</h3>
                  <Badge variant="default">{list.length}</Badge>
                </div>
                <div className="flex-1 space-y-4">
                  {list.map(c => (
                    <Card key={c.id} glass hover padding="sm" className="cursor-grab">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
                        <div>
                          <h4 className="font-medium text-sm dark:text-text-dark-primary text-text-light-primary">{c.firstName} {c.lastName}</h4>
                          <p className="text-xs dark:text-text-dark-secondary text-text-light-secondary">{c.jobId}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex text-warning">
                          {Array.from({length: 5}).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < (c.rating || 0) ? 'fill-current' : 'text-gray-400 dark:text-gray-600'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider dark:text-text-dark-tertiary text-text-light-tertiary">{c.source}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interviews' && (
          <Card>
            {isInterviewsLoading ? (
               <div className="py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading interviews...</div>
            ) : (
                <DataTable 
                  searchable
                  columns={[
                    { key: 'candidateId', title: 'Candidate' },
                    { key: 'interviewerId', title: 'Interviewer' },
                    { key: 'scheduledDate', title: 'Date & Time', render: (item: any) => new Date(item.scheduledDate).toLocaleString() },
                    { key: 'type', title: 'Type', render: (item: any) => <Badge variant="primary">{item.type}</Badge> },
                    { key: 'status', title: 'Status', render: (item: any) => <Badge variant="default">{item.status}</Badge> },
                  ]}
                  data={interviews}
                />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
