import { useState, useEffect } from "react";
import axios from "axios";
import {
  getAllBuilderSkills,
  createBuilderSkill,
  approveBuilderSkill,
  deleteBuilderSkill,
} from "@/api/builderSkillsApi.api";
import { BuilderSkill, BuilderType } from "@/types/builder";
import { getAuthHeaders } from "@/utils/auth";

export function useBuilderSkills() {
  const [skills, setSkills] = useState<BuilderSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const axiosInstance = axios.create({ headers: { Authorization: getAuthHeaders() } });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await getAllBuilderSkills(axiosInstance);
      setSkills(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (skillName: string, builderType: BuilderType, createdBy: string) => {
    const skill = await createBuilderSkill(axiosInstance, { skillName, builderType, createdBy });
    setSkills((prev) => [...prev, skill]);
  };

  const updateSkill = async (
    id: number,
    skillName: string,
    builderType: BuilderType,
    approvedBy?: string
  ) => {
    if (approvedBy) {
      await approveBuilderSkill(axiosInstance, id, approvedBy);
    }
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, skillName, builderType, approvedBy } : s))
    );
  };

  const deleteSkillFn = async (id: number) => {
    await deleteBuilderSkill(axiosInstance, id);
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    skills,
    loading,
    error,
    fetchSkills,
    addSkill,
    updateSkill,
    deleteSkill: deleteSkillFn,
  };
}
