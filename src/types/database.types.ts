export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'developer' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Request {
  id: string;
  request_number: string;
  requester_name: string;
  requester_email?: string;
  requester_area: string;
  request_type: string;
  origin: 'Interno' | 'Externo' | 'Regulatorio' | 'Cliente' | 'Otro';
  data_system_involved?: string;
  description: string;
  observations?: string;
  requested_date?: string;
  created_at: string;
  needs_code: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  project_id?: string;
  updated_at: string;
}

export interface Project {
  id: string;
  request_id?: string;
  title: string;
  description: string;
  project_type: 'development' | 'administrative' | 'dual';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'archived';
  estimated_hours?: number;
  actual_hours?: number;
  is_blocked: boolean;
  blocked_reason?: string;
  blocked_since?: string;
  tag_ids: string[];
  created_at: string;
  updated_at: string;
  project_flows?: ProjectFlow[];
}

export interface ProjectFlow {
  id: string;
  project_id: string;
  flow_type: 'administrative' | 'development';
  assigned_to?: string;
  current_phase: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  project_flow_id: string;
  phase: string;
  description: string;
  completed: boolean;
  order_index: number;
  created_at: string;
  completed_at?: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id?: string;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  project_id: string;
  user_id?: string;
  action: string;
  details: any;
  created_at: string;
}