'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAppStore((s) => s.login);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = (formData.get('username') as string)?.trim() || '';
    const password = (formData.get('password') as string) || '';

    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost<{ token: string; admin: { id: string; name: string; username: string } }>('/api/auth', {
        username,
        password,
      });
      login(data.token, data.admin);
      toast.success(`Welcome back, ${data.admin.name}!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #001a2e 0%, #003B5C 50%, #005580 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          animation: 'login-drift 20s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.06) 0%, transparent 70%)',
          bottom: '15%',
          right: '15%',
          animation: 'login-drift 25s ease-in-out 5s infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 59, 92, 0.1) 0%, transparent 70%)',
          top: '50%',
          left: '60%',
          animation: 'login-drift 18s ease-in-out 10s infinite',
        }}
      />

      {/* Login card */}
      <div
        className="login-card-animate"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '420px',
          padding: '0 16px',
        }}
      >
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <CardHeader className="text-center pb-2 pt-8 px-8">
            <div className="flex justify-center mb-4">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Image
                  src="/logo.png"
                  alt="Abyssal Academy"
                  width={80}
                  height={80}
                  className="rounded-2xl"
                  priority
                  style={{ position: 'relative', zIndex: 1 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '24px',
                    background: 'rgba(217, 119, 6, 0.15)',
                    filter: 'blur(16px)',
                    zIndex: 0,
                  }}
                />
              </div>
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ffffff 0%, #d4e5f7 40%, #f5c542 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '4px',
              }}
            >
              Abyssal Academy
            </h1>
            <CardDescription style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.875rem' }}>
              English &amp; French Online Academy
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="login-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.07)',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    height: '44px',
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="login-input"
                    style={{
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1.5px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      height: '44px',
                      paddingRight: '44px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255, 255, 255, 0.45)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full login-submit-btn"
                style={{
                  background: 'linear-gradient(135deg, #003B5C 0%, #005580 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  height: '44px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(0, 59, 92, 0.3)',
                }}
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              <p style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.75rem', textAlign: 'center', marginTop: '8px' }}>
                &copy; 2025 Abyssal Academy. All rights reserved.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
