import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';

interface ResumeAnalyzerProps {
  notify: (message: string) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ notify }) => {
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="Resume analyzer"
        title="Make your proof easier to see."
        detail="Upload a resume for a simulated ATS-style review, keyword gaps, and focused next steps."
      />
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm">
        {!analyzed ? (
          <label className="flex min-h-[270px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] text-center transition hover:border-[var(--emerald-primary)] hover:bg-[var(--bg-card)]">
            <span className="rounded-2xl bg-[var(--sage-soft)] p-4 text-[var(--emerald-primary)]">
              <Upload className="h-7 w-7" />
            </span>
            <span className="mt-5 text-sm font-bold text-[var(--text-main)]">Drop your resume here</span>
            <span className="mt-2 text-xs text-[var(--text-muted)]">PDF or DOCX · Your file stays private in this workspace</span>
            <span className="mt-5 rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-sm">
              Choose file
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={() => {
                setAnalyzed(true);
                notify('Resume analysis complete');
              }}
            />
          </label>
        ) : (
          <div>
            <div className="flex flex-col justify-between gap-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <span className="rounded-xl bg-[var(--sage-soft)] p-3 text-[var(--emerald-primary)]">
                  <Check className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">Uploaded_Resume.pdf</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Analyzed just now · Software Engineering target</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-extrabold text-[var(--emerald-primary)]">78</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">ATS-style score</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-primary)]">Strengths</p>
                <div className="mt-4 space-y-2 text-sm font-semibold text-[var(--text-main)]">
                  <p>Clear project impact</p>
                  <p>Strong technical verbs</p>
                  <p>Good scannability</p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sage-dark)]">Missing keywords</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="tag">Distributed systems</span>
                  <span className="tag">Observability</span>
                  <span className="tag">Experimentation</span>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-deep)]">Next actions</p>
                <div className="mt-4 space-y-2 text-sm font-semibold text-[var(--text-main)]">
                  <p>Add measurable outcomes</p>
                  <p>Surface your systems work</p>
                  <p>Tailor for the target role</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setAnalyzed(false)}
              className="mt-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-secondary)]"
            >
              Analyze another resume
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
