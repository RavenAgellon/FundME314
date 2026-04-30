'use client';
import { logout } from '@/lib/auth';

export default function Navbar({ role, username }) {
  return (
    <nav>
      <div className="nav-brand">FundMe</div>
      <div className="nav-right">
        <span className="nav-role">{role}</span>
        <span className="nav-user">{username}</span>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}