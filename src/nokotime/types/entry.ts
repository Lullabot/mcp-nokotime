import { Project } from './project.js';
import { User } from './user.js';

export interface Tag {
  id: number;
  name: string;
  billable: boolean;
  formatted_name: string;
  url: string;
}

export interface Invoice {
  id: number;
  reference: string;
  invoice_date: string;
  state: 'unpaid' | 'paid';
  total_amount: number;
  url: string;
}

export interface NokoImport {
  id: number;
  url: string;
}

export interface Entry {
  id: number;
  date: string; // YYYY-MM-DD
  user: User;
  billable: boolean;
  minutes: number;
  description: string;
  project: Project;
  tags: Tag[];
  source_url: string | null;
  invoiced_at: string | null; // YYYY-MM-DDTHH:MM:SSZ
  invoice: Invoice | null;
  import: NokoImport | null;
  approved_at: string | null; // YYYY-MM-DDTHH:MM:SSZ
  approved_by: User | null;
  url: string;
  invoiced_outside_of_noko_url: string;
  approved_url: string;
  unapproved_url: string;
  created_at: string; // YYYY-MM-DDTHH:MM:SSZ
  updated_at: string; // YYYY-MM-DDTHH:MM:SSZ
} 