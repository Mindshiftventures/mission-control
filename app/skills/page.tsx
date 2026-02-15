"use client";

import { useEffect, useState } from "react";
import { SkillsRegistry } from "@/components/SkillsRegistry";

interface Skill {
  name: string;
  description: string;
  path: string;
  dependencies?: string[];
  status: "installed" | "missing" | "error";
  content?: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch skills");
        return res.json();
      })
      .then((data) => {
        setSkills(data.skills || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid var(--bg-border)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto var(--space-4)',
          }} />
          <p style={{
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
          }}>
            Loading skills...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-error)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
          maxWidth: '500px',
        }}>
          <h2 style={{
            color: 'var(--accent-error)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            marginBottom: 'var(--space-2)',
          }}>
            Error Loading Skills
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono)',
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--bg-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: 'var(--space-4) var(--space-6)',
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              Skills Registry
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              marginTop: 'var(--space-1)',
            }}>
              Browse all available skills from ~/clawd/skills
            </p>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: 'var(--space-6)',
      }}>
        <SkillsRegistry skills={skills} />
      </main>
    </div>
  );
}
