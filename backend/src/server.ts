import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authenticate } from './middleware/auth';

dotenv.config();
import { requireTenant } from './middleware/tenantIsolation';

// Import routers
import authRouter from './routes/auth.routes';
import dashboardRouter from './routes/dashboard.routes';
import employeeRouter from './routes/employee.routes';
import departmentRouter from './routes/department.routes';
import recruitmentRouter from './routes/recruitment.routes';
import payrollRouter from './routes/payroll.routes';
import attendanceRouter from './routes/attendance.routes';
import leaveRouter from './routes/leave.routes';
import performanceRouter from './routes/performance.routes';
import trainingRouter from './routes/training.routes';
import complianceRouter from './routes/compliance.routes';
import notificationRouter from './routes/notification.routes';
import reportsRouter from './routes/reports.routes';
import settingsRouter from './routes/settings.routes';
import uploadRouter from './routes/upload.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Public Routes
app.use('/api/auth', authRouter);

// Protected Routes
const protectedRouter = express.Router();
protectedRouter.use(authenticate, requireTenant);

protectedRouter.use('/dashboard', dashboardRouter);
protectedRouter.use('/employees', employeeRouter);
protectedRouter.use('/departments', departmentRouter);
protectedRouter.use('/recruitment', recruitmentRouter);
protectedRouter.use('/payroll', payrollRouter);
protectedRouter.use('/attendance', attendanceRouter);
protectedRouter.use('/leave', leaveRouter);
protectedRouter.use('/performance', performanceRouter);
protectedRouter.use('/training', trainingRouter);
protectedRouter.use('/compliance', complianceRouter);
protectedRouter.use('/notifications', notificationRouter);
protectedRouter.use('/reports', reportsRouter);
protectedRouter.use('/settings', settingsRouter);
protectedRouter.use('/upload', uploadRouter);

app.use('/api', protectedRouter);

// Error Handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`HRMS Backend Server running on http://localhost:${PORT}`);
});
