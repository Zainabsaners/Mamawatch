import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Shield, HeartPulse, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../app/providers/ThemeProvider';
import { useAuth } from '../features/auth/hooks';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      // Navigate to dashboard is handled by the route guard or can be explicit
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen relative items-center justify-center transition-colors duration-300 p-4">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-in fade-in duration-1000"
        style={{ backgroundImage: 'url(/baby-bg.png)' }}
      />
      <div className="absolute inset-0 z-0 bg-white/70 backdrop-blur-[6px] dark:bg-slate-900/80 transition-colors" />

      {/* Center Unified Card */}
      <div className="z-10 w-full max-w-[950px] bg-[var(--color-surface)] flex flex-col lg:flex-row rounded-[2rem] shadow-2xl border border-[var(--color-border)] overflow-hidden animate-in slide-in-from-bottom-4 duration-700 fade-in">
        
        {/* Left Visual Side inside Card */}
        <div className="hidden lg:flex w-5/12 bg-[var(--color-primary-light)] flex-col justify-center items-center text-center p-12 relative border-r border-[var(--color-border)]">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--color-primary)_2px,_transparent_1px)] [background-size:16px_16px]"></div>

          <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center mb-8 shadow-sm border border-white/50 z-10">
            <Baby size={48} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-4 z-10 w-full text-[var(--color-text-main)]">TotoWatch</h1>
          <p className="text-[var(--color-text-muted)] text-base max-w-xs font-medium leading-relaxed">
            Continuous, gentle, and reliable monitoring for the fragile ones. Giving you peace of mind.
          </p>

          <div className="absolute bottom-8 flex gap-8 w-full justify-center text-[var(--color-primary)] opacity-80">
            <div className="flex flex-col items-center">
              <Shield size={20} className="mb-2" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <HeartPulse size={20} className="mb-2" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Real-time</span>
            </div>
          </div>
        </div>

        {/* Right Login Side */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-14">
          <div className="w-full max-w-sm">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[var(--color-primary-light)] rounded-2xl mx-auto flex items-center justify-center mb-6 lg:hidden">
                <Baby size={32} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="text-3xl font-extrabold text-[var(--color-text-main)] mb-2 tracking-tight">Caregiver Portal</h2>
              <p className="text-[var(--color-text-muted)] font-medium text-sm">Sign in to monitor your infants</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl border-[var(--color-status-critical)]/30 text-[var(--color-status-critical)] bg-[var(--color-status-critical)]/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2.5 text-left">
                <Label htmlFor="email" className="text-[11px] uppercase tracking-widest font-bold text-[var(--color-text-muted)]">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clinician@example.com"
                  required
                  disabled={isLoading}
                  className="rounded-xl h-12 bg-gray-50/50 dark:bg-slate-900/50"
                />
              </div>

              <div className="space-y-2.5 text-left">
                <Label htmlFor="password" className="text-[11px] uppercase tracking-widest font-bold text-[var(--color-text-muted)]">Passcode</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="rounded-xl h-12 bg-gray-50/50 dark:bg-slate-900/50"
                />
              </div>

              <div className="flex items-center justify-between text-sm py-2">
                <label className="flex items-center gap-2 cursor-pointer group text-[var(--color-text-muted)]">
                  <input type="checkbox" className="w-4 h-4 rounded-md border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" disabled={isLoading} />
                  <span className="group-hover:text-[var(--color-text-main)] font-medium transition-colors">Remember me</span>
                </label>
                <a href="#" className="flex-1 text-right text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold transition-colors">Forgot passcode?</a>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-[15px] font-bold shadow-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-all mt-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-[10px] font-bold text-[var(--color-text-muted)] opacity-70 uppercase tracking-widest">
              Neonatal Care System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
