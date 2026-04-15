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
    <div className="flex h-screen w-screen bg-[var(--color-bg-base)] transition-colors duration-300">

      {/* Left Visual Side */}
      <div className="hidden lg:flex w-5/12 bg-[var(--color-primary)] flex-col justify-center items-center text-white px-12 text-center relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:24px_24px]"></div>

        <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-white/20">
          <Baby size={56} className="text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4 z-10 w-full drop-shadow-md">Mamawatch Neonatal Care</h1>
        <p className="text-blue-50 text-lg max-w-md w-full font-medium leading-relaxed drop-shadow">
          Continuous, gentle, and reliable monitoring for the fragile ones. Giving caregivers peace of mind anywhere.
        </p>

        <div className="absolute bottom-12 flex gap-8 w-full justify-center opacity-80">
          <div className="flex flex-col items-center">
            <Shield size={24} className="mb-2" />
            <span className="text-xs uppercase tracking-widest font-bold">Secure</span>
          </div>
          <div className="flex flex-col items-center">
            <HeartPulse size={24} className="mb-2" />
            <span className="text-xs uppercase tracking-widest font-bold">Real-time</span>
          </div>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md p-8 md:p-12 bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl mx-auto flex items-center justify-center mb-6 lg:hidden">
              <Baby size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--color-text-main)] mb-2 tracking-tight">Caregiver Portal</h2>
            <p className="text-[var(--color-text-muted)] font-medium">Sign in to monitor and care for your infants</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-muted)]">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-muted)]">Passcode</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between text-sm py-2">
              <label className="flex items-center gap-2 cursor-pointer group text-[var(--color-text-muted)]">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" disabled={isLoading} />
                <span className="group-hover:text-[var(--color-text-main)] font-medium transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold transition-colors">Forgot passcode?</a>
            </div>

            <Button type="submit" className="w-full py-6 text-base font-bold shadow-lg" disabled={isLoading}>
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

          <div className="mt-8 text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Neonatal Care System
          </div>
        </div>
      </div>
    </div>
  );
}
