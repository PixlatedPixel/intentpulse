import { Lead, OpportunityType, SignalType } from './types';

export const COLORS = {
  green: '#10B981',
  blue: '#3B82F6',
  dark: '#0F172A',
  cardBg: '#1E2937',
  orange: '#F59E0B',
  gray: '#64748B',
};

export const INDUSTRIES = [
  'Manufacturing',
  'Logistics',
  'Retail',
  'SaaS',
  'FinTech',
  'Professional Services',
  'Healthcare',
  'E-commerce'
];

export const LOCATIONS = [
  'Mumbai, MH',
  'Pune, MH',
  'Nagpur, MH',
  'Bangalore, KA',
  'Delhi, DL',
  'Hyderabad, TS',
  'Chennai, TN'
];

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  'Workflow Automation',
  'AI/ML Integration',
  'Custom Software / MVP',
  'Website / System Upgrade',
  'CRM / ERP Customization',
  'Analytics Dashboard'
];

export const SIGNAL_TYPES: SignalType[] = [
  'Recent Funding',
  'Hiring Tech Roles',
  'Hiring Ops / Support / HR',
  'Scaling / Growth Announcements',
  'Outdated Website'
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    company: 'XYZ Logistics',
    location: 'Pune, MH',
    industry: 'Logistics',
    size: 87,
    score: 84,
    signals: ['Recent Funding', 'Hiring Ops / Support / HR', 'Outdated Website'],
    opportunity: 'Workflow Automation',
    lastSignalDate: '2026-03-24',
    insightSummary: 'XYZ Logistics recently secured Series B funding and is aggressively hiring for operations roles. Their current website is outdated, suggesting a need for a modern system upgrade.',
    pitchStarter: 'Hi [Name], noticed XYZ Logistics is scaling operations after the recent funding round. Given the growth, I’d love to show how we can automate your core workflows to handle the new volume seamlessly.',
    website: 'https://xyzlogistics.com',
    linkedin: 'https://linkedin.com/company/xyzlogistics',
    contacted: false,
  },
  {
    id: '2',
    company: 'ABC FinTech',
    location: 'Mumbai, MH',
    industry: 'FinTech',
    size: 34,
    score: 88,
    signals: ['Recent Funding', 'Hiring Tech Roles'],
    opportunity: 'Custom Software / MVP',
    lastSignalDate: '2026-03-25',
    insightSummary: 'ABC FinTech just closed a Series A round and is looking for developers. They are in the early stages of building their core platform, presenting a perfect opportunity for MVP development.',
    pitchStarter: 'Congratulations on the Series A, [Name]! Building a robust MVP is critical at this stage. We specialize in helping FinTech startups like yours launch high-performance platforms quickly.',
    website: 'https://abcfintech.io',
    linkedin: 'https://linkedin.com/company/abcfintech',
    contacted: true,
  },
  {
    id: '3',
    company: 'Global Health Systems',
    location: 'Bangalore, KA',
    industry: 'Healthcare',
    size: 450,
    score: 72,
    signals: ['Scaling / Growth Announcements', 'Hiring Tech Roles'],
    opportunity: 'AI/ML Integration',
    lastSignalDate: '2026-03-22',
    insightSummary: 'Global Health Systems is expanding its digital health initiatives and hiring AI researchers. They are looking to integrate predictive analytics into their patient management system.',
    pitchStarter: 'Hi [Name], I saw your recent expansion into digital health. Integrating AI for predictive patient care could significantly improve your outcomes. We’ve done similar work for large healthcare providers.',
    website: 'https://globalhealth.com',
    linkedin: 'https://linkedin.com/company/globalhealth',
    contacted: false,
  },
  {
    id: '4',
    company: 'RetailFlow',
    location: 'Delhi, DL',
    industry: 'Retail',
    size: 120,
    score: 65,
    signals: ['Hiring Ops / Support / HR', 'Outdated Website'],
    opportunity: 'Website / System Upgrade',
    lastSignalDate: '2026-03-20',
    insightSummary: 'RetailFlow is growing its support team but their online presence is lagging. A complete website overhaul and CRM integration would help them manage their increasing customer base.',
    pitchStarter: 'Hi [Name], noticed RetailFlow is expanding its support team. A more modern, integrated website could help automate many of the queries your new team will be handling. Let’s chat about a system upgrade.',
    website: 'https://retailflow.in',
    linkedin: 'https://linkedin.com/company/retailflow',
    contacted: false,
  },
  {
    id: '5',
    company: 'DataViz Pro',
    location: 'Pune, MH',
    industry: 'SaaS',
    size: 55,
    score: 92,
    signals: ['Recent Funding', 'Scaling / Growth Announcements', 'Hiring Tech Roles'],
    opportunity: 'Analytics Dashboard',
    lastSignalDate: '2026-03-26',
    insightSummary: 'DataViz Pro is a fast-growing SaaS company that just received a massive investment. They are scaling their engineering team and need advanced analytics dashboards for their enterprise clients.',
    pitchStarter: 'Incredible growth at DataViz Pro lately! As you scale for enterprise clients, having top-tier analytics dashboards is non-negotiable. We can help you build these custom visualizations.',
    website: 'https://datavizpro.com',
    linkedin: 'https://linkedin.com/company/datavizpro',
    contacted: false,
  }
];
