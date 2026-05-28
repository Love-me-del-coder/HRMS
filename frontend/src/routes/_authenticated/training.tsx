import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, StatCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { GraduationCap, BookOpen, Users, Award, Clock } from 'lucide-react';
import { trainingApi } from '../../services/api';

export const Route = createFileRoute('/_authenticated/training')({
  component: TrainingPage,
});

function TrainingPage() {
  const { data: coursesData, isLoading: isCoursesLoading } = useQuery<any>({
    queryKey: ['training', 'courses'],
    queryFn: () => trainingApi.listCourses(),
  });

  const { data: assignmentsData } = useQuery<any>({
    queryKey: ['training', 'assignments'],
    queryFn: () => trainingApi.listAssignments(),
  });

  const courses = coursesData?.data || [];
  const assignments = assignmentsData?.data || [];
  
  // Stats
  const activeLearners = new Set(assignments.filter((a: any) => a.status === 'in_progress').map((a: any) => a.employeeId)).size;
  const completedAssignments = assignments.filter((a: any) => a.status === 'completed').length;
  const completionRate = assignments.length ? Math.round((completedAssignments / assignments.length) * 100) : 0;
  const certifications = assignments.filter((a: any) => a.score && a.score >= 80).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-dark-primary text-text-light-primary">Training & Development</h1>
          <p className="dark:text-text-dark-secondary text-text-light-secondary">Manage employee learning and courses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Courses" value={courses.length.toString()} icon={<BookOpen className="w-6 h-6" />} iconBg="gradient-primary" />
        <StatCard title="Active Learners" value={activeLearners.toString()} icon={<Users className="w-6 h-6" />} iconBg="gradient-accent" delay={100} />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={<GraduationCap className="w-6 h-6" />} iconBg="gradient-success" delay={200} />
        <StatCard title="Certifications" value={certifications.toString()} icon={<Award className="w-6 h-6" />} iconBg="gradient-warning" delay={300} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 dark:text-text-dark-primary text-text-light-primary">Course Catalog</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCoursesLoading ? (
            <div className="col-span-full py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">No courses found.</div>
          ) : courses.map((course: any, i: number) => {
            const courseEnrolled = assignments.filter((a: any) => a.courseId === course.id).length;
            return (
              <Card key={course.id} hover padding="none" className="overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="h-32 bg-gradient-to-br from-primary-900 to-primary-700 relative">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                  <Badge variant="default" className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white border-none capitalize">{course.category}</Badge>
                  <Badge variant="primary" className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white border-none capitalize">{course.level}</Badge>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 dark:text-text-dark-primary text-text-light-primary line-clamp-1">{course.title}</h3>
                  <p className="text-sm dark:text-text-dark-secondary text-text-light-secondary mb-4 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {course.duration || '2h'} • Instructor: {course.instructorId || 'TBA'}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs dark:text-text-dark-tertiary text-text-light-tertiary">
                      <span>{courseEnrolled} enrolled</span>
                      <span>Max {course.capacity || 50}</span>
                    </div>
                    <div className="h-1.5 w-full dark:bg-dark-elevated bg-light-elevated rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary transition-all duration-1000" 
                        style={{ width: `${(courseEnrolled / (course.capacity || 50)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
