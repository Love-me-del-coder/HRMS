import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import prisma from '../lib/prisma';
import { JWT_SECRET, AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = await new SignJWT({ userId: user.id, companyId: user.companyId, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const { password: _, company, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
        company
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.post('/register-company', async (req: Request, res: Response) => {
  try {
    const { companyName, companyEmail, industry, adminFirstName, adminLastName, adminEmail, adminPassword } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Run in a transaction
    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          industry,
          registrationNo: `RG-${Date.now()}`,
          address: '',
          city: '',
          country: '',
          phone: '',
          subscriptionPlan: 'starter'
        }
      });

      await tx.user.create({
        data: {
          companyId: company.id,
          email: adminEmail,
          password: hashedPassword,
          firstName: adminFirstName,
          lastName: adminLastName,
          role: 'company_admin',
        }
      });
    });

    res.status(201).json({ success: true, data: { message: 'Company registered successfully' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user || !req.company) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  
  const { password, ...userWithoutPassword } = req.user as any;
  
  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      company: req.company
    }
  });
});

export default router;
