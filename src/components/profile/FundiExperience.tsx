/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { XMarkIcon, EyeIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

interface FundiAttachment {
  id: number;
  projectName: string;
  files: string[];
}

const requiredProjectsByGrade: { [key: string]: number } = {
  "G1: Master Fundi": 3,
  "G2: Skilled": 2,
  "G3: Semi-skilled": 1,
  "G4: Unskilled": 0,
};

const fundiSpecializations = [
  "General Plumbing",
  "Water Systems",
  "Drainage & Sewer",
  "Gas Plumbing",
  "Bathroom Installation",
  "Kitchen Installation",
  "Pipe Welding",
  "Solar Water Systems",
];

const FundiExperience = ({ data, refreshData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [grade, setGrade] = useState("G1: Master Fundi");
  const [experience, setExperience] = useState("10+ years");
  const [specialization, setSpecialization] = useState("");
  const [attachments, setAttachments] = useState<FundiAttachment[]>([]);

  /* ---------- LOAD FROM PROP ---------- */
  useEffect(() => {
    if (data?.userProfile) {
      const up = data.userProfile;
      setGrade(up.grade || "G1: Master Fundi");
      setExperience(up.experience || "10+ years");
      setSpecialization(up.profession || "");

      // Map previousJobPhotoUrls to attachments if available
      // For Fundi, we might have professionalProjects or just photo urls
      const existingProjects = up.professionalProjects || [];
      if (existingProjects.length > 0) {
        setAttachments(existingProjects.map((p: any, idx: number) => ({
          id: idx + 1,
          projectName: p.projectName || `Project ${idx + 1}`,
          files: p.files || []
        })));
      } else {
        setAttachments([
          { id: 1, projectName: "", files: [] },
          { id: 2, projectName: "", files: [] },
          { id: 3, projectName: "", files: [] },
        ]);
      }
      setIsLoadingProfile(false);
    }
  }, [data]);

  const visibleProjectRows = requiredProjectsByGrade[grade] || 0;

  const handleFileChange = (rowId: number, file: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);

    setAttachments(prev =>
      prev.map(item =>
        item.id === rowId && item.files.length < 3
          ? { ...item, files: [...item.files, preview] }
          : item
      )
    );
  };

  const removeFile = (rowId: number, fileIndex: number) => {
    setAttachments(prev =>
      prev.map(item =>
        item.id === rowId
          ? { ...item, files: item.files.filter((_, i) => i !== fileIndex) }
          : item
      )
    );
  };

  const handleProjectNameChange = (rowId: number, name: string) => {
    setAttachments(prev =>
      prev.map(item => (item.id === rowId ? { ...item, projectName: name } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const required = requiredProjectsByGrade[grade];
    const validProjects = attachments
      .slice(0, required)
      .filter(a => a.projectName.trim() && a.files.length > 0);

    if (validProjects.length < required) {
      setIsSubmitting(false);
      return toast.error(`Please provide details for ${required} project(s).`);
    }

    try {
      // API Call to Update Experience
      toast.success("Experience details saved successfully!");
      if (refreshData) refreshData();
    } catch (error) {
      toast.error("Failed to save experience info");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile && !data) return <div className="p-8 text-center text-gray-500 font-medium">Loading experience profile...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Experience & Portfolio</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Showcase your skills and previous work to get approved faster.
        </p>
      </div>

      <div className="mb-8 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <CloudArrowUpIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 text-sm">Review Process</h4>
          <p className="text-indigo-700 text-xs mt-1 leading-relaxed">
            After saving your experience, our team will review your portfolio.
            Average verification time is <strong>7-14 business days</strong>.
          </p>
        </div>
      </div>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skill Category</label>
            <div className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 font-bold text-sm">
              Plumbing & Installation
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</label>
            <select
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="">Select Specialty</option>
              {fundiSpecializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Certifed Grade</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {Object.keys(requiredProjectsByGrade).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Years Active</label>
            <select
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {["10+ years", "5-10 years", "3-5 years", "1-3 years", "Entry Level"].map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
        </div>

        {visibleProjectRows > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">Previous Projects (Proof of Work)</h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50/50">
                    <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-16 text-center">No.</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Project Description / Name</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Job Site Photos (Max 3)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attachments.slice(0, visibleProjectRows).map(row => (
                    <tr key={row.id}>
                      <td className="px-8 py-6 text-center font-bold text-indigo-600 text-sm">#{row.id}</td>
                      <td className="px-4 py-6">
                        <input
                          placeholder="e.g. Bathroom renovation at Kilimani..."
                          value={row.projectName}
                          onChange={e => handleProjectNameChange(row.id, e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-3 items-center">
                          {row.files.map((f, i) => (
                            <div key={i} className="relative group w-14 h-14">
                              <img src={f} className="w-full h-full object-cover rounded-lg border shadow-sm" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1.5">
                                <a href={f} target="_blank" className="p-1 bg-white rounded-full text-gray-700 hover:text-indigo-600">
                                  <EyeIcon className="w-3 h-3" />
                                </a>
                                <button type="button" onClick={() => removeFile(row.id, i)} className="p-1 bg-white rounded-full text-red-500 hover:bg-red-50">
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {row.files.length < 3 && (
                            <label className="w-14 h-14 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                              <CloudArrowUpIcon className="w-6 h-6 text-gray-300 group-hover:text-indigo-400" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={e => handleFileChange(row.id, e.target.files?.[0] || null)}
                              />
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
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-12 py-4 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isSubmitting ? "Submitting Portfolio..." : "Save Experience & Portfolio"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FundiExperience;
