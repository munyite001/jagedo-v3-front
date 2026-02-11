/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import {
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  CloudArrowUpIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

interface ContractorCategory {
  id: string;
  category: string;
  specialization: string;
  categoryClass: string;
  yearsOfExperience: string;
}

interface ContractorProject {
  id: string;
  categoryId?: string;
  projectName: string;
  projectFile: any;
  referenceLetterFile: any;
}

const CATEGORIES = [
  "Electrical Works",
  "Mechanical Works",
  "Road Works",
  "Water Works",
  "Building Works",
];

const BUILDING_WORKS_SPECIALIZATIONS = [
  "Residential Buildings",
  "Commercial Buildings",
  "Industrial Buildings",
  "Renovation & Refurbishment",
  "Steel Structures",
];

const ContractorExperience = ({ data, refreshData }) => {
  const [categories, setCategories] = useState<ContractorCategory[]>([]);
  const [projects, setProjects] = useState<ContractorProject[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  /* ---------- LOAD FROM PROP ---------- */
  useEffect(() => {
    if (data?.userProfile) {
      const up = data.userProfile;

      const exps = up.contractorExperiences || [];
      if (exps.length > 0) {
        setCategories(exps.map((exp: any) => ({
          id: exp.id || crypto.randomUUID(),
          category: exp.category || "",
          specialization: exp.specialization || "",
          categoryClass: exp.categoryClass || "",
          yearsOfExperience: exp.yearsOfExperience || "",
        })));
      } else {
        setCategories([{ id: crypto.randomUUID(), category: "", specialization: "", categoryClass: "", yearsOfExperience: "" }]);
      }

      const projs = up.contractorProjects || [];
      if (projs.length > 0) {
        setProjects(projs.map((proj: any) => ({
          id: proj.id || crypto.randomUUID(),
          categoryId: proj.categoryId,
          projectName: proj.projectName || "",
          projectFile: proj.projectFile || null,
          referenceLetterFile: proj.referenceLetterUrl || null,
        })));
      } else {
        setProjects([]);
      }
      setIsLoadingProfile(false);
    }
  }, [data]);

  const handleCategoryChange = (id: string, field: string, value: string) => {
    if (field === 'category' && categories.some(c => c.category === value && c.id !== id)) {
      toast.error("Category already added.");
      return;
    }

    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));

    // Auto create linked project if categorizing for first time
    if (field === 'category' && !projects.find(p => p.categoryId === id)) {
      setProjects(prev => [...prev, {
        id: crypto.randomUUID(),
        categoryId: id,
        projectName: `${value} Project`,
        projectFile: null,
        referenceLetterFile: null,
      }]);
    }
  };

  const addCategoryRow = () => {
    setCategories(prev => [...prev, { id: crypto.randomUUID(), category: "", specialization: "", categoryClass: "", yearsOfExperience: "" }]);
  };

  const removeCategoryRow = (id: string) => {
    if (categories.length <= 1) return toast.error("At least one trade is required.");
    setCategories(prev => prev.filter(cat => cat.id !== id));
    setProjects(prev => prev.filter(p => p.categoryId !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (categories.some(c => !c.category || !c.categoryClass)) return toast.error("Please fill required fields.");

    setIsSubmitting(true);
    try {
      toast.success("Contractor stats updated!");
      if (refreshData) refreshData();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile && !data) return <div className="p-8 text-center text-gray-500 font-medium">Loading contractor profile...</div>;

  const selectStyles = "w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all";

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Contractor Experience</h1>
        <p className="text-sm text-gray-400 mt-2 font-medium">
          Define your trade categories, certifications, and provide project references.
        </p>
      </div>

      <form className="space-y-12" onSubmit={handleSubmit}>
        {/* Trade Categories Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-indigo-600" />
              Trade Categories & NCA Class
            </h3>
            <button type="button" onClick={addCategoryRow} className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <PlusIcon className="w-4 h-4" /> Add Trade
            </button>
          </div>

          <div className="p-8 space-y-4">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="lg:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Work Type</label>
                  <select value={cat.category} onChange={e => handleCategoryChange(cat.id, 'category', e.target.value)} className={selectStyles}>
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Specialization</label>
                  <select value={cat.specialization} onChange={e => handleCategoryChange(cat.id, 'specialization', e.target.value)} className={selectStyles}>
                    <option value="">Select Specialization</option>
                    {BUILDING_WORKS_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="lg:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">NCA Class</label>
                  <select value={cat.categoryClass} onChange={e => handleCategoryChange(cat.id, 'categoryClass', e.target.value)} className={selectStyles}>
                    <option value="">Class</option>
                    {["NCA 1", "NCA 2", "NCA 3", "NCA 4", "NCA 5", "NCA 6", "NCA 7", "NCA 8"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Years Active</label>
                  <select value={cat.yearsOfExperience} onChange={e => handleCategoryChange(cat.id, 'yearsOfExperience', e.target.value)} className={selectStyles}>
                    <option value="">Experience</option>
                    {["10+ years", "5-10 years", "3-5 years", "1-3 years"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="lg:col-span-1 mb-1">
                  <button type="button" onClick={() => removeCategoryRow(cat.id)} className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Projects */}
        {projects.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">Project References & Verification</h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 text-left">
                    <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Linked Category</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Project / BQ File</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Completion Letter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map(proj => (
                    <tr key={proj.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{proj.projectName || "Unlabeled Project"}</span>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase mt-1">{proj.categoryId ? (categories.find(c => c.id === proj.categoryId)?.category || "General") : "General"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-3">
                          {proj.projectFile ? (
                            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
                              <span className="text-xs font-bold text-indigo-700 truncate max-w-[120px]">View Attachment</span>
                              <a href={proj.projectFile} target="_blank" className="p-1 text-indigo-600 hover:bg-white rounded shadow-sm"><EyeIcon className="w-4 h-4" /></a>
                              <button type="button" onClick={() => setProjects(p => p.map(x => x.id === proj.id ? { ...x, projectFile: null } : x))} className="p-1 text-red-400 hover:text-red-500"><XMarkIcon className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <label className="flex items-center gap-2 text-indigo-600 cursor-pointer hover:underline text-xs font-bold">
                              <CloudArrowUpIcon className="w-5 h-5" /> Upload File
                              <input type="file" className="hidden" onChange={e => setProjects(p => p.map(x => x.id === proj.id ? { ...x, projectFile: e.target.files[0] } : x))} />
                            </label>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {proj.referenceLetterFile ? (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
                              <span className="text-xs font-bold text-green-700 truncate max-w-[120px]">Letter Attached</span>
                              <a href={proj.referenceLetterFile} target="_blank" className="p-1 text-green-600 hover:bg-white rounded shadow-sm"><EyeIcon className="w-4 h-4" /></a>
                              <button type="button" onClick={() => setProjects(p => p.map(x => x.id === proj.id ? { ...x, referenceLetterFile: null } : x))} className="p-1 text-red-400 hover:text-red-500"><XMarkIcon className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <label className="flex items-center gap-2 text-green-600 cursor-pointer hover:underline text-xs font-bold">
                              <CloudArrowUpIcon className="w-5 h-5" /> Upload Reference
                              <input type="file" className="hidden" onChange={e => setProjects(p => p.map(x => x.id === proj.id ? { ...x, referenceLetterFile: e.target.files[0] } : x))} />
                            </label>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-12 py-4 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isSubmitting ? "Processing..." : "Submit Experience"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractorExperience;
