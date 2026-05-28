import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Building2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/api';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('admin@rathnagroup.lk');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await authApi.login(email, password);
      if (res.success) {
        setAuth(res.data.user, res.data.company, res.data.token);
        navigate({ to: '/dashboard' });
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)`,
        }} />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HRMS Pro</h1>
              <p className="text-xs text-white/60">Enterprise HR Platform</p>
            </div>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Manage Your
            <br />
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Entire HR
            </span>
            <br />
            Operation
          </h2>

          <p className="text-lg text-white/70 mb-12 max-w-md leading-relaxed">
            Streamline recruitment, payroll, attendance, and employee management
            with our enterprise-grade HRMS platform.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3">
            {['Multi-Tenant', 'Payroll', 'Recruitment', 'Analytics', 'Compliance'].map((feature) => (
              <span
                key={feature}
                className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium border border-white/10"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-12 mt-16">
            {[
              { value: '500+', label: 'Companies' },
              { value: '50K+', label: 'Employees' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold dark:text-text-dark-primary text-text-light-primary">HRMS Pro</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold dark:text-text-dark-primary text-text-light-primary mb-2">
              Welcome back
            </h2>
            <p className="dark:text-text-dark-secondary text-text-light-secondary">
              Sign in to your HR dashboard
            </p>
          </div>

          {/* Demo credentials notice */}
          <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <p className="text-xs font-medium text-primary-400 mb-1">Demo Credentials</p>
            <p className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary">
              Email: <span className="font-mono text-primary-300">admin@rathnagroup.lk</span>
              <br />
              Password: <span className="font-mono text-primary-300">admin123</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-slide-up">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-text-dark-tertiary text-text-light-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border transition-all duration-200
                    dark:bg-dark-elevated dark:border-dark-border dark:text-text-dark-primary
                    bg-light-elevated border-light-border text-text-light-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-text-dark-tertiary text-text-light-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl text-sm border transition-all duration-200
                    dark:bg-dark-elevated dark:border-dark-border dark:text-text-dark-primary
                    bg-light-elevated border-light-border text-text-light-primary
                    focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 dark:text-text-dark-tertiary dark:hover:text-text-dark-secondary text-text-light-tertiary hover:text-text-light-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 dark:border-dark-border border-light-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm dark:text-text-dark-secondary text-text-light-secondary">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-500 hover:text-primary-400 font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-xl font-semibold text-sm
                shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40
                hover:scale-[1.01] active:scale-[0.99]
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm dark:text-text-dark-tertiary text-text-light-tertiary">
              Don't have an account?{' '}
              <a href="/register" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
                Register your company
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary">
              © 2026 HRMS Pro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
