import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Copy, Check, Loader2 } from 'lucide-react';
import { LearningResource } from '../../types/resources';
import { validateAndPreviewImport } from '../../utils/resourceUtils';

interface ResourceImportModalProps {
  onClose: () => void;
  onImport: (newResources: LearningResource[]) => void;
  existingResources: LearningResource[];
}

const SAMPLE_IMPORT_TEMPLATE = `{
  "resources": [
    {
      "name": "MIT Distributed Systems (6.824)",
      "description": "Comprehensive engineering lectures, lab assignments, and papers covering Paxos, Raft, and distributed systems architecture.",
      "url": "https://pdos.csail.mit.edu/6.824/",
      "provider": "MIT CSAIL",
      "category": "System Design",
      "tags": ["Distributed Systems", "Raft", "Consensus", "Go", "Architecture"],
      "difficulty": "Advanced",
      "free_status": "100% Free",
      "paid_features": "None (free lecture notes, labs, and video recordings)",
      "date_added": "${new Date().toISOString().split('T')[0]}",
      "last_verified": "${new Date().toISOString().split('T')[0]}",
      "status": "Active",
      "learning_path": "Distributed Systems Mastery"
    }
  ]
}`;

export const ResourceImportModal: React.FC<ResourceImportModalProps> = ({
  onClose,
  onImport,
  existingResources,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<ReturnType<typeof validateAndPreviewImport> | null>(null);

  const handleValidate = () => {
    if (!jsonInput.trim()) return;
    const result = validateAndPreviewImport(jsonInput, existingResources);
    setPreviewData(result);
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      const result = validateAndPreviewImport(content, existingResources);
      setPreviewData(result);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setJsonInput(SAMPLE_IMPORT_TEMPLATE);
    const result = validateAndPreviewImport(SAMPLE_IMPORT_TEMPLATE, existingResources);
    setPreviewData(result);
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_IMPORT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommitImport = () => {
    if (isSubmitting) return;
    if (previewData?.preview && previewData.preview.toAdd.length > 0) {
      setIsSubmitting(true);
      try {
        onImport(previewData.preview.toAdd);
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl sm:p-8 my-8 max-h-[90vh] flex flex-col text-[var(--text-main)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--bg-secondary)] px-2.5 py-1 text-[11px] font-bold text-[var(--emerald-primary)] border border-[var(--border-color)]">
              <Upload className="h-3.5 w-3.5" />
              Monthly Resource Batch Update
            </div>
            <h2 className="font-display mt-2 text-2xl font-extrabold text-[var(--text-main)]">
              Import Resources (JSON)
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Add new verified learning materials in bulk with strict schema validation and duplicate prevention.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 sidebar-scrollbar">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--bg-secondary)] p-3 border border-[var(--border-color)]">
            <span className="text-xs font-semibold text-[var(--sage-dark)]">
              Need the structured JSON template?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-muted)]"
              >
                Insert Sample
              </button>
              <button
                type="button"
                onClick={handleCopySample}
                className="flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-muted)]"
              >
                {copied ? <Check className="h-3 w-3 text-[var(--emerald-primary)]" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy Template'}
              </button>
            </div>
          </div>

          {/* JSON Textarea & File Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)]">
                Paste JSON Payload
              </label>
              <label className="cursor-pointer text-xs font-bold text-[var(--emerald-primary)] hover:underline flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Upload .json file
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileDrop}
                />
              </label>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setPreviewData(null);
              }}
              placeholder='{ "resources": [ { "name": "...", "url": "https://...", "provider": "...", "category": "..." } ] }'
              rows={8}
              className="w-full font-mono text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)] focus:bg-[var(--bg-card)] transition"
            />
          </div>

          {/* Validate Button */}
          {!previewData && (
            <button
              type="button"
              onClick={handleValidate}
              disabled={!jsonInput.trim()}
              className="w-full rounded-xl bg-[var(--emerald-primary)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--emerald-deep)] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Analyze & Preview Import
            </button>
          )}

          {/* Validation & Preview Results */}
          {previewData && (
            <div className="space-y-4">
              {!previewData.success ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-bold">JSON Syntax Error</p>
                    <p className="mt-1">{previewData.error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[var(--emerald-primary)] font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xl font-extrabold">{previewData.preview?.validCount}</span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-[var(--sage-dark)]">Ready to Add</p>
                    </div>

                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xl font-extrabold">{previewData.preview?.duplicateCount}</span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-[var(--sage-dark)]">Duplicates Skipped</p>
                    </div>

                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-rose-700 dark:text-rose-400 font-bold">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xl font-extrabold">{previewData.preview?.errorCount}</span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-[var(--sage-dark)]">Rejected / Invalid</p>
                    </div>
                  </div>

                  {/* Errors Detail if any */}
                  {previewData.preview?.errors && previewData.preview.errors.length > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-200">
                      <p className="font-bold mb-1.5 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                        Rejected Entries (will NOT be imported):
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {previewData.preview.errors.map((err, i) => (
                          <li key={i}>
                            <strong>Item #{err.index + 1}</strong> {err.name ? `("${err.name}")` : ''}: {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Duplicates Detail if any */}
                  {previewData.preview?.duplicates && previewData.preview.duplicates.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200">
                      <p className="font-bold mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        Detected Duplicates (already in database or batch):
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {previewData.preview.duplicates.map((dup, i) => (
                          <li key={i}>
                            <strong>{dup.resource.name}</strong> matches existing entry: "{dup.matchedWith.name}" ({dup.matchReason})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table of Resources to Add */}
                  {previewData.preview?.toAdd && previewData.preview.toAdd.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-2">
                        Preview of Verified Resources to be Added:
                      </p>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--border-color)] divide-y divide-[var(--border-color)] sidebar-scrollbar">
                        {previewData.preview.toAdd.map((item) => (
                          <div key={item.id} className="p-2.5 bg-[var(--bg-card)] text-xs flex items-center justify-between gap-3">
                            <div>
                              <span className="font-bold text-[var(--text-main)]">{item.name}</span>
                              <span className="text-[var(--text-muted)] ml-2">({item.provider})</span>
                              <div className="text-[11px] text-[var(--sage-dark)] truncate max-w-md">{item.description}</div>
                            </div>
                            <span className="shrink-0 rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-bold text-[var(--emerald-primary)] border border-[var(--border-color)]">
                              {item.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-[var(--text-muted)]">
                      No new valid resources to import. Please check validation issues or supply new non-duplicate entries.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
          >
            Cancel
          </button>
          {previewData?.preview && previewData.preview.toAdd.length > 0 ? (
            <button
              type="button"
              onClick={handleCommitImport}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--emerald-primary)] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--emerald-deep)] disabled:opacity-40 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Importing...
                </>
              ) : (
                `Confirm & Import ${previewData.preview.toAdd.length} Resources`
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleValidate}
              disabled={!jsonInput.trim()}
              className="rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--emerald-deep)] disabled:opacity-40"
            >
              Validate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
