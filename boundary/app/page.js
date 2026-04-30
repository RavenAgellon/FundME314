'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      redirectByRole(user.role);
    }
  }, []);

  function redirectByRole(role) {
    const map = {
      user_admin: '/dashboard-admin',
      fundraiser: '/dashboard-fr',
      donee: '/dashboard-donee',
      platform_management: '/dashboard-platform',
    };
    router.push(map[role] || '/');
  }

  function fillCreds(u, p) {
    setUsername(u);
    setPassword(p);
  }

  async function handleLogin() {
    setAlert(null);
    if (!username || !password) { setAlert({ type: 'error', msg: 'Please enter your username and password.' }); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setAlert({ type: 'error', msg: data.message || 'Login failed.' }); return; }
      localStorage.setItem('user', JSON.stringify(data.user));
      setAlert({ type: 'success', msg: `Welcome, ${data.user.name}! Redirecting...` });
      setTimeout(() => redirectByRole(data.user.role), 800);
    } catch {
      setAlert({ type: 'error', msg: 'Cannot connect to server. Is it running?' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="brand">
          <div className="brand-icon">🤝</div>
          <h1>FundMe</h1>
          <p>Connect causes with those who care</p>
        </div>

        <div className="card">
          {alert && <div className={`alert ${alert.type}`}>{alert.msg}</div>}

          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <button className="btn-primary" style={{width:'100%', padding:'0.85rem', marginTop:'0.5rem'}}
            onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="divider">Quick test login</div>

          <div className="test-creds">
            {[
              { role: 'User Admin', u: 'admin1', p: 'admin123' },
              { role: 'Fundraiser', u: 'fr1', p: 'fr123' },
              { role: 'Donee', u: 'donee1', p: 'donee123' },
              { role: 'Platform Mgmt', u: 'pm1', p: 'pm123' },
            ].map(c => (
              <button key={c.u} className="cred-pill" onClick={() => fillCreds(c.u, c.p)}>
                <div className="cred-role">{c.role}</div>
                <div className="cred-user">{c.u} / {c.p}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}