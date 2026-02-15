"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  CubeIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ChartBarIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Problems", href: "/problems", icon: ExclamationTriangleIcon },
  { name: "Skills", href: "/skills", icon: CubeIcon },
  { name: "Context", href: "/context", icon: DocumentTextIcon },
  { name: "Cron Jobs", href: "/cron", icon: ClockIcon },
  { name: "Cost Analytics", href: "/analytics", icon: ChartBarIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-border)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mobileMenuOpen ? (
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          ) : (
            <Bars3Icon style={{ width: '24px', height: '24px' }} />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '240px',
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--bg-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease-in-out',
        }}
        className="lg:translate-x-0"
      >
        {/* Header */}
        <div style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--bg-border)',
        }}>
          <h1 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            Mission Control
          </h1>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            marginTop: 'var(--space-1)',
          }}>
            v2.0 - Dark Technical
          </p>
        </div>

        {/* Search */}
        <div style={{
          padding: 'var(--space-3)',
          borderBottom: '1px solid var(--bg-border)',
        }}>
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon style={{
              position: 'absolute',
              left: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--text-tertiary)',
            }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 'calc(var(--space-3) * 2 + 16px)',
                paddingRight: 'var(--space-3)',
                paddingTop: 'var(--space-2)',
                paddingBottom: 'var(--space-2)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{
          flex: 1,
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          overflowY: 'auto',
        }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 500 : 400,
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <item.icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-3)',
          borderTop: '1px solid var(--bg-border)',
        }}>
          <div style={{
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
          }}>
            <div>OpenClaw Agent</div>
            <div style={{ marginTop: 'var(--space-1)' }}>Auto-refresh: 5s</div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 30,
          }}
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
