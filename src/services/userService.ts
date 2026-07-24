import { axiosClient } from '../api/axiosClient';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  nombre?: string;
  apellido?: string;
  role: string;
  isActive: boolean;
}

export interface UpdateProfileData {
  nombre?: string;
  apellido?: string;
  email?: string;
}

export async function fetchUserProfile(id: string): Promise<UserProfile> {
  const res = await axiosClient.get(`/users/${id}`);
  return res.data.data as UserProfile;
}

export async function updateUserProfile(id: string, data: UpdateProfileData): Promise<UserProfile> {
  const res = await axiosClient.put(`/users/${id}`, data);
  return res.data.data as UserProfile;
}
