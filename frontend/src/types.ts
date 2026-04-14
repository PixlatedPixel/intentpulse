export type OpportunityType = 
  | 'Workflow Automation'
  | 'AI/ML Integration'
  | 'Custom Software / MVP'
  | 'Website / System Upgrade'
  | 'CRM / ERP Customization'
  | 'Analytics Dashboard';

export type SignalType = 
  | 'Recent Funding'
  | 'Hiring Tech Roles'
  | 'Hiring Ops / Support / HR'
  | 'Scaling / Growth Announcements'
  | 'Outdated Website'
  | 'Low Digital Presence'
  | 'Needs Digital Presence'
  | 'Digital Transformation'
  | 'High-Growth Industry';

export interface Lead {
  id: string;
  company: string;
  logo?: string;
  location: string;
  industry: string;
  size: number;
  score: number;
  signals: SignalType[];
  opportunity: OpportunityType;
  lastSignalDate: string;
  insightSummary: string;
  pitchStarter: string;
  website: string;
  linkedin: string;
  contacted: boolean;
}

export interface FilterState {
  search: string;
  scoreRange: [number, number];
  industries: string[];
  locations: string[];
  opportunities: OpportunityType[];
  signals: SignalType[];
  companySizes: string[];
  dateRange: '7' | '30' | '90';
}
