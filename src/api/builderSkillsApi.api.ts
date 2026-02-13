import { getAuthHeaders } from "@/utils/auth";
import { BuilderType } from "@/types/builder";

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/builder-skills`;

interface CreateSkillDto {
  skillName: string;
  builderType: BuilderType;
  createdBy: string;
}

interface UpdateSkillDto {
  skillName: string;
  builderType: BuilderType;
  approvedBy?: string;
}

export const getAllBuilderSkills = async (axiosInstance: any) => {
  const response = await axiosInstance.get(BASE_URL, {
    headers: { Authorization: getAuthHeaders() },
  });
  return response.data;
};

export const getBuilderSkillsByType = async (axiosInstance: any, builderType: BuilderType) => {
  const response = await axiosInstance.get(`${BASE_URL}/type/${builderType}`, {
    headers: { Authorization: getAuthHeaders() },
  });
  return response.data;
};

export const createBuilderSkill = async (axiosInstance: any, skillData: CreateSkillDto) => {
  const response = await axiosInstance.post(BASE_URL, skillData, {
    headers: { Authorization: getAuthHeaders() },
  });
  return response.data;
};

export const approveBuilderSkill = async (axiosInstance: any, id: number, approvedBy: string) => {
  const response = await axiosInstance.post(`${BASE_URL}/${id}/approve`, null, {
    headers: { Authorization: getAuthHeaders() },
    params: { approvedBy },
  });
  return response.data;
};

export const deleteBuilderSkill = async (axiosInstance: any, id: number) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: getAuthHeaders() },
  });
  return response.data;
};
