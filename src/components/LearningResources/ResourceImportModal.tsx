import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Copy, Check } from 'lucide-react';
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
      "name": "Example Learning Resource",
      "description": "Free educational content for software engineering students preparing for technical interviews.",
      "url": "https://example.com/learn",
      "provider": "Example Academy",
      "category": "Data Structures & Algorithms",
      "tags": ["DSA", "Coding Interviews", "Algorithms"],
      "difficulty": "Beginner",
      "free_status": "Free",
      "paid_features": "Optional paid certificate",
      "date_added": "${new Date().toISOString().split('T')[0]}",
      "last_verified": "${new Date().toISOString().split('T')[0]}",
      "status": "Active",
      "learning_path": "Foundational Algorithm Practice"
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
    if (previewData?.preview && previewData.preview.toAdd.length > 0) {
      onImport(previewData.preview.toAdd);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-2xl sm:p-8 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DDDCCF] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#FAF8F2] px-2.5 py-1 text-[11px] font-bold text-[#176B50] border border-[#DDDCCF]">
              <Upload className="h-3.5 w-3.5" />
              Monthly Resource Batch Update
            </div>
            <h2 className="font-display mt-2 text-2xl font-extrabold text-[#24332B]">
              Import Resources (JSON)
            </h2>
            <p className="mt-1 text-xs text-[#68766C]">
              Add new verified learning materials in bulk with automated validation and duplicate prevention.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#FAF8F2] p-3 border border-[#DDDCCF]">
            <span className="text-xs font-semibold text-[#5F7563]">
              Need the structured JSON schema?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSample}
                className="rounded-lg border border-[#DDDCCF] bg-white px-2.5 py-1 text-xs font-bold text-[#24332B] hover:bg-[#E6DDC8]"
              >
                Insert Sample
              </button>
              <button
                onClick={handleCopySample}
                className="flex items-center gap-1 rounded-lg border border-[#DDDCCF] bg-white px-2.5 py-1 text-xs font-bold text-[#24332B] hover:bg-[#E6DDC8]"
              >
                {copied ? <Check className="h-3 w-3 text-[#176B50]" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy Template'}
              </button>
            </div>
          </div>

          {/* JSON Textarea & File Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F7563]">
                Paste JSON Payload
              </label>
              <label className="cursor-pointer text-xs font-bold text-[#176B50] hover:underline flex items-center gap-1">
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
              className="w-full font-mono text-xs rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-3 text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white transition"
            />
          </div>

          {/* Validate Button */}
          {!previewData && (
            <button
              onClick={handleValidate}
              disabled={!jsonInput.trim()}
              className="w-full rounded-xl bg-[#176B50] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#104C3A] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Analyze & Preview Import
            </button>
          )}

          {/* Validation & Preview Results */}
          {previewData && (
            <div className="space-y-4">
              {!previewData.success ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-bold">JSON Validation Error</p>
                    <p className="mt-1">{previewData.error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[#176B50] font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xl font-extrabold">{previewData.preview?.validCount}</span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-[#5F7563]">Ready to Add</p>
                    </div>

                    <div className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-700 font-bold">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xl font-extrabold">{previewData.preview?.duplicateCount}</span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-[#5F7563]">Duplicates Skipped</p>
                    </div>

                    <div className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-rose-700 font-bold">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xl font-extrabold">{previewData.preview?.errorCount}</span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-[#5F7563]">Validation Issues</p>
                    </div>
                  </div>

                  {/* Errors Detail if any */}
                  {previewData.preview?.errors && previewData.preview.errors.length > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                      <p className="font-bold mb-1">Issues to Resolve:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {previewData.preview.errors.map((err, i) => (
                          <li key={i}>
                            Item #{err.index + 1} {err.name ? `("${err.name}")` : ''}: {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Duplicates Detail if any */}
                  {previewData.preview?.duplicates && previewData.preview.duplicates.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <p className="font-bold mb-1">Detected Duplicates (will not be re-added):</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {previewData.preview.duplicates.map((dup, i) => (
                          <li key={i}>
                            <strong>{dup.resource.name}</strong> matches existing entry: "{dup.matchedWith.name}" ({dup.matchReason})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table of Resources to Add */}
                  {previewData.preview?.toAdd && previewData.preview.toAdd.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-2">
                        Preview of Resources to be Added:
                      </p>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-[#DDDCCF] divide-y divide-[#DDDCCF]">
                        {previewData.preview.toAdd.map((item) => (
                          <div key={item.id} className="p-2.5 bg-white text-xs flex items-center justify-between gap-3">
                            <div>
                              <span className="font-bold text-[#24332B]">{item.name}</span>
                              <span className="text-[#68766C] ml-2">({item.provider})</span>
                              <div className="text-[11px] text-[#5F7563] truncate max-w-md">{item.description}</div>
                            </div>
                            <span className="shrink-0 rounded-md bg-[#FAF8F2] px-2 py-0.5 text-[10px] font-bold text-[#176B50] border border-[#DDDCCF]">
                              {item.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#DDDCCF] pt-4 mt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#DDDCCF] px-4 py-2.5 text-xs font-bold text-[#5F7563] hover:bg-[#FAF8F2]"
          >
            Cancel
          </button>
          {previewData?.preview && previewData.preview.toAdd.length > 0 ? (
            <button
              onClick={handleCommitImport}
              className="rounded-xl bg-[#176B50] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#104C3A] shadow-sm"
            >
              Confirm & Import {previewData.preview.toAdd.length} Resources
            </button>
          ) : (
            <button
              onClick={handleValidate}
              disabled={!jsonInput.trim()}
              className="rounded-xl bg-[#176B50] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#104C3A] disabled:opacity-40"
            >
              Validate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
