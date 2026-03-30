"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  History,
  Stethoscope,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home, exact: true },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/queue", label: "Patient Queue", icon: ClipboardList },
  { href: "/dashboard/doctors", label: "Doctors", icon: Stethoscope },
];

const FOOTER_ITEMS = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="dashboard-shell">
      {/* ── Sidebar ── */}
      <aside className={`dashboard-sidebar ${collapsed ? "collapsed" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Activity size={20} />
          </div>
          {!collapsed && <span className="sidebar-logo-text">MediQ</span>}
        </div>

        {/* Toggle button */}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive(href, exact) ? "active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="sidebar-link-icon" />
              {!collapsed && <span className="sidebar-link-label">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {FOOTER_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive(href) ? "active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="sidebar-link-icon" />
              {!collapsed && <span className="sidebar-link-label">{label}</span>}
            </Link>
          ))}
          <button
            className="sidebar-link logout-btn"
            title={collapsed ? "Logout" : undefined}
            onClick={handleLogout}
          >
            <LogOut size={18} className="sidebar-link-icon" />
            {!collapsed && <span className="sidebar-link-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Doctor Dashboard</h1>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>

      <style>{`
        /* ── Layout shell ── */
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: hsl(210 100% 97%);
        }

        /* ── Sidebar ── */
        .dashboard-sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 220px;
          min-width: 220px;
          background: #ffffff;
          border-right: 1px solid hsl(210 40% 88%);
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease, min-width 0.2s ease;
          overflow: hidden;
          z-index: 40;
          box-shadow: 2px 0 8px rgba(0,0,0,0.04);
        }
        .dashboard-sidebar.collapsed {
          width: 60px;
          min-width: 60px;
        }

        /* Logo */
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 14px 16px;
          border-bottom: 1px solid hsl(210 40% 92%);
        }
        .sidebar-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 8px;
          background: hsl(180 100% 25%);
          color: #fff;
        }
        .sidebar-logo-text {
          font-size: 1.1rem;
          font-weight: 700;
          color: hsl(222 84% 5%);
          white-space: nowrap;
          letter-spacing: -0.02em;
        }

        /* Toggle */
        .sidebar-toggle {
          position: absolute;
          top: 18px;
          right: 10px;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid hsl(210 40% 88%);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: hsl(222 30% 40%);
          transition: background 0.15s;
        }
        .sidebar-toggle:hover {
          background: hsl(210 60% 95%);
        }
        .collapsed .sidebar-toggle {
          right: 50%;
          transform: translateX(50%);
          top: 16px;
          position: relative;
          margin: 4px auto 8px;
        }

        /* Nav */
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 12px 8px;
          overflow-y: auto;
        }

        /* Links */
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          color: hsl(222 30% 40%);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }
        .sidebar-link:hover {
          background: hsl(210 60% 95%);
          color: hsl(222 84% 5%);
        }
        .sidebar-link.active {
          background: hsl(180 100% 25% / 0.1);
          color: hsl(180 100% 22%);
        }
        .sidebar-link.active .sidebar-link-icon {
          color: hsl(180 100% 25%);
        }
        .sidebar-link-icon {
          min-width: 18px;
          flex-shrink: 0;
        }
        .sidebar-link-label {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Footer */
        .sidebar-footer {
          border-top: 1px solid hsl(210 40% 92%);
          padding: 10px 8px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .logout-btn {
          color: hsl(0 70% 50%);
        }
        .logout-btn:hover {
          background: hsl(0 80% 97%);
          color: hsl(0 70% 40%);
        }

        /* ── Main content ── */
        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .dashboard-header {
          height: 56px;
          display: flex;
          align-items: center;
          padding: 0 24px;
          border-bottom: 1px solid hsl(210 40% 88%);
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .dashboard-title {
          font-size: 1rem;
          font-weight: 600;
          color: hsl(222 84% 5%);
          margin: 0;
        }
        .dashboard-content {
          flex: 1;
          padding: 24px;
        }
      `}</style>
    </div>
  );
}
