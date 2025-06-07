import { Invoice, NokoImport } from './entry.js';
import { ProjectGroup } from './project-group.js';
import { User } from './user.js';

export interface Project {
  id: number;
  name: string;
  billing_increment: number;
  enabled: boolean;
  billable: boolean;
  color: string;
  url: string;
  group: ProjectGroup | null;
  minutes: number;
  billable_minutes: number;
  unbillable_minutes: number;
  invoiced_minutes: number;
  remaining_minutes: number;
  budgeted_minutes: number;
  import: NokoImport | null;
  invoices: Invoice[];
  participants: User[];
  entries: number;
  entries_url: string;
  expenses: number;
  expenses_url: string;
  created_at: string; // YYYY-MM-DDTHH:MM:SSZ
  updated_at: string; // YYYY-MM-DDTHH:MM:SSZ
  merge_url: string;
  archive_url: string;
  unarchive_url: string;
} 