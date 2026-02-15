"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  CubeIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ChartBarIcon,
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
      <style>{`
        @media (min-width: 1024px) {
          [data-sidebar] {
            transform: translateX(0) !important;
          }
        }
        
        /* Tooltip styles */
        [data-tooltip] {
          position: relative;
        }
        
        [data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          font-family: var(--font-sans);
          white-space: nowrap;
          z-index: 1000;
          border: 1px solid var(--bg-border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          pointer-events: none;
        }
        
        [data-tooltip]:hover::before {
          content: '';
          position: absolute;
          left: calc(100% + 6px);
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid var(--bg-tertiary);
          z-index: 1000;
          pointer-events: none;
        }
      `}</style>
      <div
        data-sidebar
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '64px',
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--bg-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        {/* Minimal Header - Just Icon */}
        <div style={{
          padding: 'var(--space-3)',
          borderBottom: '1px solid var(--bg-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--accent-primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--bg-primary)',
          }}>
            MC
          </div>
        </div>

        {/* Navigation Links - Icon Only */}
        <nav style={{
          flex: 1,
          padding: 'var(--space-2) 0',
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
                data-tooltip={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-3)',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <item.icon style={{ width: '24px', height: '24px', flexShrink: 0 }} />
              </Link>
            );
          })}
        </nav>

        {/* Minimal Footer - Status Indicator */}
        <div style={{
          padding: 'var(--space-3)',
          borderTop: '1px solid var(--bg-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div
            data-tooltip="Auto-refresh: 5s"
            style={{
              width: '8px',
              height: '8px',
              background: 'var(--accent-success)',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
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

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
