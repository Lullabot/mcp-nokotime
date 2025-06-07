import { Team } from './team';

export type UserState = 'active' | 'pending' | 'disabled' | 'suspended';
export type UserRole = 'leader' | 'supervisor' | 'coworker' | 'contractor';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  url: string;
  state: UserState;
  role: UserRole;
  teams: Team[];
  entries: number;
  entries_url: string;
  expenses: number;
  expenses_url: string;
  give_access_to_project_url: string;
  revoke_access_to_project_url: string;
  revoke_access_to_all_projects_url: string;
  activate_url: string;
  deactivate_url: string;
  created_at: string; // YYYY-MM-DDTHH:MM:SSZ
  updated_at: string; // YYYY-MM-DDTHH:MM:SSZ
} 