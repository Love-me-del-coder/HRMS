import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedDatabase() {
  console.log('Clearing existing data and seeding massive realistic demo data...');

  try {

    // 1. Company
    const company = await prisma.company.create({
      data: {
        name: 'Rathna Group of Companies',
        registrationNo: 'RG-2024-001',
        industry: 'Conglomerate',
        address: '123 Peradeniya Road',
        city: 'Kandy',
        country: 'Sri Lanka',
        phone: '+94 81 234 5678',
        email: 'info@rathnagroup.lk',
        website: 'https://rathnagroup.lk',
        currency: 'LKR',
        timezone: 'Asia/Colombo',
        subscriptionPlan: 'enterprise',
        subscriptionStatus: 'active',
      }
    });

    // 2. Departments
    const deptsData = [
      { name: 'Executive Management', desc: 'C-Level Management' },
      { name: 'Human Resources', desc: 'HR Department' },
      { name: 'Finance & Accounting', desc: 'Finance Department' },
      { name: 'Information Technology', desc: 'IT Department' },
      { name: 'Sales & Marketing', desc: 'Sales and Marketing' },
      { name: 'Operations', desc: 'Operations' },
      { name: 'Customer Service', desc: 'Customer Service' },
      { name: 'Research & Development', desc: 'R&D' },
    ];

    const departments = [];
    for (const d of deptsData) {
      const dept = await prisma.department.create({
        data: {
          companyId: company.id,
          name: d.name,
          description: d.desc,
        }
      });
      departments.push(dept);
    }

    // 3. Employees - Core Leadership
    const coreEmployees = [
      { employeeNo: 'EMP001', firstName: 'Kamal', lastName: 'Perera', email: 'admin@rathnagroup.lk', phone: '+94 77 123 4567', gender: 'male', position: 'CEO', employmentType: 'full_time', status: 'active', salary: 1500000, deptIndex: 0 },
      { employeeNo: 'EMP002', firstName: 'Nimali', lastName: 'Fernando', email: 'hr@rathnagroup.lk', phone: '+94 71 234 5678', gender: 'female', position: 'HR Director', employmentType: 'full_time', status: 'active', salary: 850000, deptIndex: 1 },
      { employeeNo: 'EMP003', firstName: 'Suresh', lastName: 'Rajapaksa', email: 'finance@rathnagroup.lk', phone: '+94 77 345 6789', gender: 'male', position: 'CFO', employmentType: 'full_time', status: 'active', salary: 1200000, deptIndex: 2 },
      { employeeNo: 'EMP004', firstName: 'Dilshan', lastName: 'Silva', email: 'it@rathnagroup.lk', phone: '+94 72 456 7890', gender: 'male', position: 'CTO', employmentType: 'full_time', status: 'active', salary: 1100000, deptIndex: 3 },
    ];

    const allEmployees = [];

    // Create Core Leaders
    for (const empData of coreEmployees) {
      const emp = await prisma.employee.create({
        data: {
          companyId: company.id,
          departmentId: departments[empData.deptIndex].id,
          employeeNo: empData.employeeNo,
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email,
          phone: empData.phone,
          dateOfBirth: randomDate(new Date('1975-01-01'), new Date('1985-01-01')),
          gender: empData.gender,
          maritalStatus: 'married',
          nationality: 'Sri Lankan',
          address: 'Colombo, Sri Lanka',
          city: 'Colombo',
          country: 'Sri Lanka',
          position: empData.position,
          jobTitle: empData.position,
          employmentType: empData.employmentType,
          hireDate: randomDate(new Date('2018-01-01'), new Date('2020-01-01')),
          status: empData.status,
          salary: empData.salary,
          currency: 'LKR'
        }
      });
      allEmployees.push(emp);
    }

    // 4. Generate 50 Random Employees for Realistic Data
    const firstNames = ['Nuwan', 'Kasun', 'Amila', 'Ruwan', 'Gayan', 'Lahiru', 'Dinesh', 'Tharindu', 'Chamara', 'Saman', 'Nadeesha', 'Chathurika', 'Tharushi', 'Sachini', 'Hansani', 'Madhavi', 'Sanduni', 'Upeka', 'Nimeshi'];
    const lastNames = ['Bandara', 'Senanayake', 'Wickramasinghe', 'Jayawardena', 'Dissanayake', 'Gunaratne', 'Karunaratne', 'Weerasinghe', 'Liyanage', 'Fernando', 'De Silva'];
    const positions = ['Executive', 'Senior Executive', 'Manager', 'Analyst', 'Specialist', 'Coordinator', 'Officer'];

    for (let i = 5; i <= 54; i++) {
      const fName = firstNames[getRandomInt(0, firstNames.length - 1)];
      const lName = lastNames[getRandomInt(0, lastNames.length - 1)];
      const deptIdx = getRandomInt(1, departments.length - 1); // skip executive
      
      const emp = await prisma.employee.create({
        data: {
          companyId: company.id,
          departmentId: departments[deptIdx].id,
          employeeNo: `EMP${i.toString().padStart(3, '0')}`,
          firstName: fName,
          lastName: lName,
          email: `${fName.toLowerCase()}.${lName.toLowerCase()}@rathnagroup.lk`,
          phone: `+94 7${getRandomInt(0, 8)} ${getRandomInt(100, 999)} ${getRandomInt(1000, 9999)}`,
          dateOfBirth: randomDate(new Date('1985-01-01'), new Date('2000-12-31')),
          gender: getRandomInt(0, 1) === 0 ? 'male' : 'female',
          maritalStatus: getRandomInt(0, 1) === 0 ? 'single' : 'married',
          nationality: 'Sri Lankan',
          address: 'Kandy, Sri Lanka',
          city: 'Kandy',
          country: 'Sri Lanka',
          position: positions[getRandomInt(0, positions.length - 1)],
          jobTitle: 'Staff',
          employmentType: 'full_time',
          hireDate: randomDate(new Date('2021-01-01'), new Date('2025-12-31')),
          status: getRandomInt(1, 20) === 1 ? 'on_leave' : 'active', // 5% on leave
          salary: getRandomInt(80000, 350000),
          currency: 'LKR'
        }
      });
      allEmployees.push(emp);
    }

    // 5. Auth Users (Admin and HR)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    // CEO -> Admin
    await prisma.user.create({
      data: {
        companyId: company.id,
        employeeId: allEmployees[0].id,
        email: allEmployees[0].email,
        password: passwordHash,
        firstName: allEmployees[0].firstName,
        lastName: allEmployees[0].lastName,
        role: 'company_admin',
        isActive: true,
      }
    });

    // HR Director -> HR Manager
    await prisma.user.create({
      data: {
        companyId: company.id,
        employeeId: allEmployees[1].id,
        email: allEmployees[1].email,
        password: passwordHash,
        firstName: allEmployees[1].firstName,
        lastName: allEmployees[1].lastName,
        role: 'hr_manager',
        isActive: true,
      }
    });

    // 6. Generate 3 Months of Payroll Runs
    const pastMonths = [
      { start: new Date('2026-03-01'), end: new Date('2026-03-31'), run: new Date('2026-03-25') },
      { start: new Date('2026-04-01'), end: new Date('2026-04-30'), run: new Date('2026-04-25') },
      { start: new Date('2026-05-01'), end: new Date('2026-05-31'), run: new Date('2026-05-25') },
    ];

    for (const period of pastMonths) {
      const run = await prisma.payrollRun.create({
        data: {
          companyId: company.id,
          periodStart: period.start,
          periodEnd: period.end,
          runDate: period.run,
          status: 'completed',
          processedBy: allEmployees[1].id, // HR
          currency: 'LKR',
        }
      });

      // Generate payslips for all active employees for this run
      const payslipsToCreate = allEmployees.map(emp => {
        const epf = emp.salary * 0.08;
        const allowance = emp.salary * 0.1;
        const gross = emp.salary + allowance;
        const net = gross - epf;
        
        return {
          companyId: company.id,
          payrollRunId: run.id,
          employeeId: emp.id,
          periodStart: period.start,
          periodEnd: period.end,
          basic: emp.salary,
          earnings: { allowance: allowance },
          deductions: { epf: epf },
          grossPay: gross,
          totalDeductions: epf,
          netPay: net,
          status: 'paid',
          currency: 'LKR'
        };
      });

      await prisma.payslip.createMany({ data: payslipsToCreate });
    }

    // 7. Job Requisitions (ATS)
    const jobs = [
      { deptIdx: 3, title: 'Senior Software Engineer', min: 250000, max: 450000, status: 'open', openings: 2 },
      { deptIdx: 4, title: 'Marketing Executive', min: 100000, max: 180000, status: 'open', openings: 1 },
      { deptIdx: 2, title: 'Financial Analyst', min: 150000, max: 250000, status: 'closed', openings: 1 },
      { deptIdx: 5, title: 'Operations Manager', min: 300000, max: 500000, status: 'open', openings: 1 },
    ];

    for (const job of jobs) {
      await prisma.jobRequisition.create({
        data: {
          companyId: company.id,
          departmentId: departments[job.deptIdx].id,
          title: job.title,
          description: `We are hiring a ${job.title} to join our fantastic team!`,
          requirements: ['Bachelors Degree', '3+ Years Experience'],
          employmentType: 'full_time',
          location: 'Kandy (Hybrid)',
          salaryMin: job.min,
          salaryMax: job.max,
          currency: 'LKR',
          openings: job.openings,
          filled: job.status === 'closed' ? job.openings : 0,
          status: job.status,
          postedDate: new Date('2026-05-01'),
          closingDate: new Date('2026-06-15'),
          hiringManagerId: allEmployees[job.deptIdx].id, // Corresponding dept head
        }
      });
    }

    console.log(`Massive seeding complete! Seeded 1 Company, ${departments.length} Departments, ${allEmployees.length} Employees, 3 Payroll Runs, and ${jobs.length} Job Requisitions.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Allow direct execution
if (process.argv[1].includes('seed.ts')) {
  seedDatabase();
}
