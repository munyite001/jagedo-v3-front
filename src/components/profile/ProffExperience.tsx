/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck

import { useState, useMemo, useEffect } from "react";
import toast from 'react-hot-toast';
import { XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

interface AttachmentRow {
    id: number;
    projectName: string;
    files: any[];
}

const PROJECT_REQUIREMENTS = {
    senior: 5,
    professional: 3,
    graduate: 1,
    student: 0,
};

const SPECIALIZATIONS_BY_CATEGORY: Record<string, string[]> = {
    "Architect": ["Residential", "Commercial", "Industrial", "Urban"],
    "Engineer": ["Structural", "Civil", "Electrical", "Mechanical"],
    "Surveyor": ["Quantity", "Land", "Valuation"],
    "Project Manager": ["Construction", "IT", "Infrastructure"]
};

const ProffExperience = ({ data, refreshData }) => {
    const [category, setCategory] = useState("Architect");
    const [specialization, setSpecialization] = useState("Residential");
    const [level, setLevel] = useState("Professional");
    const [experience, setExperience] = useState("10+ years");
    const [attachments, setAttachments] = useState<AttachmentRow[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    /* ---------- LOAD FROM PROP ---------- */
    useEffect(() => {
        if (data?.userProfile) {
            const up = data.userProfile;
            setCategory(up.profession || "Architect");
            setSpecialization(up.specialization || "Residential");
            setLevel(up.professionalLevel || "Professional");
            setExperience(up.yearsOfExperience || "10+ years");

            const projects = up.professionalProjects || [];
            if (projects.length > 0) {
                setAttachments(projects.map((p: any, idx: number) => ({
                    id: idx + 1,
                    projectName: p.projectName || `Project ${idx + 1}`,
                    files: p.files || (p.fileUrl ? [p.fileUrl] : [])
                })));
            } else {
                setAttachments([...Array(5)].map((_, i) => ({ id: i + 1, projectName: "", files: [] })));
            }
            setIsLoadingProfile(false);
        }
    }, [data]);

    const rowsToShow = useMemo(() => {
        const levelKey = level.toLowerCase().trim() as keyof typeof PROJECT_REQUIREMENTS;
        return PROJECT_REQUIREMENTS[levelKey] ?? 0;
    }, [level]);

    const handleFileChange = (rowId: number, file: File | null) => {
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setAttachments((prev) =>
            prev.map((item) => item.id === rowId && item.files.length < 3 ? { ...item, files: [...item.files, preview] } : item)
        );
    };

    const handleProjectNameChange = (rowId: number, value: string) => {
        setAttachments((prev) => prev.map((item) => item.id === rowId ? { ...item, projectName: value } : item));
    };

    const removeFile = (rowId: number, fileIndex: number) => {
        setAttachments(prev => prev.map(item => {
            if (item.id === rowId) {
                const newFiles = [...item.files];
                newFiles.splice(fileIndex, 1);
                return { ...item, files: newFiles };
            }
            return item;
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const required = rowsToShow;
        const valid = attachments.slice(0, required).filter(p => p.projectName.trim() !== "" && p.files.length > 0);

        if (valid.length < required) return toast.error(`Please provide details for ${required} projects.`);

        setIsSubmitting(true);
        try {
            // Mock API Update
            toast.success('Professional profile updated!');
            if (refreshData) refreshData();
        } catch (err) {
            toast.error("Failed to update experience");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingProfile && !data) return <div className="p-8 text-center text-gray-500 font-medium font-inter">Loading professional data...</div>;

    const inputStyles = "w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-8">
            <div className="mb-8 border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-inter">Professional Portfolio</h1>
                <p className="text-sm text-gray-400 mt-2 font-medium font-inter">
                    Manage your accreditation level and showcase your specialized project history.
                </p>
            </div>

            <form className="space-y-10" onSubmit={handleSubmit}>
                {/* Meta Info */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Core Category</label>
                        <div className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-bold text-sm">
                            {category}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Specialization</label>
                        <select
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className={inputStyles}
                        >
                            <option value="">Select Specialty</option>
                            {(SPECIALIZATIONS_BY_CATEGORY[category] || ["General"]).map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Career Level</label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className={inputStyles}
                        >
                            {["Senior", "Professional", "Graduate", "Student"].map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Experience Range</label>
                        <select
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className={inputStyles}
                        >
                            {["10+ years", "5-10 years", "3-5 years", "1-3 years", "Graduate"].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Projects Table */}
                {rowsToShow > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm">Representative Projects ({rowsToShow} Required)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest w-16 text-center">No.</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Project Description / Context</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Drawings / Evidence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {attachments.slice(0, rowsToShow).map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6 text-center font-bold text-indigo-600 text-sm font-inter">#{row.id}</td>
                                            <td className="px-4 py-6">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Structural design for Apex Towers..."
                                                    value={row.projectName}
                                                    onChange={(e) => handleProjectNameChange(row.id, e.target.value)}
                                                    className="w-full p-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-inter"
                                                />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-3 items-center">
                                                    {row.files.map((file, idx) => (
                                                        <div key={idx} className="relative group w-14 h-14">
                                                            <div className="w-full h-full bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-[10px] overflow-hidden">
                                                                {typeof file === 'string' && (file.includes('jpg') || file.includes('png')) ? <img src={file} className="w-full h-full object-cover" /> : 'DOC'}
                                                            </div>
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1.5">
                                                                <a href={file} target="_blank" className="p-1 bg-white rounded-full text-gray-700 hover:text-indigo-600">
                                                                    <EyeIcon className="w-3 h-3" />
                                                                </a>
                                                                <button type="button" onClick={() => removeFile(row.id, idx)} className="p-1 bg-white rounded-full text-red-500 hover:bg-red-50">
                                                                    <XMarkIcon className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {row.files.length < 3 && (
                                                        <label className="w-14 h-14 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                                                            <CloudArrowUpIcon className="w-6 h-6 text-gray-300 group-hover:text-indigo-400" />
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => handleFileChange(row.id, e.target.files?.[0] || null)}
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

                <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-indigo-600 text-white px-12 py-4 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-3 font-inter"
                    >
                        {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {isSubmitting ? "Submitting Portfolio..." : "Submit Experience"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProffExperience;
