import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { LearningResource, ResourceCategory, DifficultyLevel, FreeStatus, ResourceStatus } from '../../types/resources';
import { RESOURCE_CATEGORIES } from '../../data/initialResources';

interface ResourceFormModalProps {
  onClose: () => void;
  onSave: (resource: LearningResource) => void;
  initialResource?: LearningResource | null;
}

export const ResourceFormModal: React.FC<ResourceFormModalProps> = ({
  onClose,
  onSave,
  initialResource,
}) => {
  const isEditing = Boolean(initialResource);
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(initialResource?.name || '');
  const [provider, setProvider] = useState(initialResource?.provider || '');
  const [url, setUrl] = useState(initialResource?.url || '');
  const [description, setDescription] = useState(initialResource?.description || '');
  const [category, setCategory] = useState<ResourceCategory>(initialResource?.category || 'Computer Science Fundamentals');
  const [tagsInput, setTagsInput] = useState(initialResource?.tags?.join(', ') || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialResource?.difficulty || 'All Levels');
  const [freeStatus, setFreeStatus] = useState<FreeStatus>(initialResource?.free_status || '100% Free');
  const [paidFeatures, setPaidFeatures] = useState(initialResource?.paid_features || '');
  const [learningPath, setLearningPath] = useState(initialResource?.learning_path || '');
  const [status, setStatus] = useState<ResourceStatus>(initialResource?.status || 'Active');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialResource?.is_featured || false);
  const [lastVerified, setLastVerified] = useState(initialResource?.last_verified || todayStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !description.trim() || !provider.trim()) {
      alert('Please fill out all required fields: Name, Provider, Official URL, and Description.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const resourceData: LearningResource = {
      id: initialResource?.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      provider: provider.trim(),
      url: url.trim(),
      description: description.trim(),
      category,
      tags,
      difficulty,
      free_status: freeStatus,
      paid_features: paidFeatures.trim() || undefined,
      learning_path: learningPath.trim() || undefined,
      status,
      is_featured: isFeatured,
      date_added: initialResource?.date_added || todayStr,
      last_verified: lastVerified || todayStr,
    };

    onSave(resourceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-2xl sm:p-8 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DDDCCF] pb-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#24332B]">
              {isEditing ? 'Edit Learning Resource' : 'Add New Learning Resource'}
            </h2>
            <p className="mt-1 text-xs text-[#68766C]">
              {isEditing ? 'Update details, verification status, and attributes.' : 'Add a verified free learning resource to the library.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
                Resource Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CS50: Intro to CS"
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
                Provider / Institution *
              </label>
              <input
                type="text"
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Harvard University, MIT, Mozilla"
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
              Official URL *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
              Short Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a clear, student-focused summary of the learning material..."
              className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-3 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
                Free Status
              </label>
              <select
                value={freeStatus}
                onChange={(e) => setFreeStatus(e.target.value as FreeStatus)}
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
              >
                <option value="100% Free">100% Free</option>
                <option value="Free Course">Free Course</option>
                <option value="Free with Optional Certificate">Free with Optional Certificate</option>
                <option value="Free Tier Available">Free Tier Available</option>
                <option value="Free">Free</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ResourceStatus)}
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
              >
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Broken">Broken</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Python, Algorithms, DSA"
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
                Last Verification Date
              </label>
              <input
                type="date"
                value={lastVerified}
                onChange={(e) => setLastVerified(e.target.value)}
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
              Paid Features or Certificate Disclosures (Optional)
            </label>
            <input
              type="text"
              value={paidFeatures}
              onChange={(e) => setPaidFeatures(e.target.value)}
              placeholder="e.g. Optional $49 certificate, all course lectures are 100% free"
              className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F7563] mb-1.5">
              Recommended Learning Path (Optional)
            </label>
            <input
              type="text"
              value={learningPath}
              onChange={(e) => setLearningPath(e.target.value)}
              placeholder="e.g. Software Engineering Foundations"
              className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3.5 py-2.5 text-xs font-semibold text-[#24332B] outline-none focus:border-[#176B50] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-[#DDDCCF] text-[#176B50] focus:ring-[#176B50]"
            />
            <label htmlFor="isFeatured" className="text-xs font-bold text-[#24332B] cursor-pointer">
              Highlight in Featured Resources Section
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#DDDCCF] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#DDDCCF] px-4 py-2.5 text-xs font-bold text-[#5F7563] hover:bg-[#FAF8F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#176B50] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#104C3A] shadow-sm"
            >
              <Check className="h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Add to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
