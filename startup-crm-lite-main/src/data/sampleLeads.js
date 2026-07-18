/**
 * Sample leads data with Indian-market contacts and organization names.
 * Designed to serve as initial value fallback for the CRM application if localStorage is empty.
 * Matches the required status distribution: 2 New, 1 Contacted, 1 Won, 1 Lost, 1 Meeting Scheduled, and 1 Proposal Sent (or other category).
 *
 * Statuses used:
 * - 2 x 'New'
 * - 1 x 'Contacted'
 * - 1 x 'Meeting Scheduled'
 * - 1 x 'Won'
 * - 1 x 'Lost'
 * - 1 x 'Proposal Sent' (to make up 6 leads total, or another from standard list: 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost')
 *
 * @type {Array<Object>}
 */
export const sampleLeads = [
  {
    id: 'lead-in-1',
    name: 'Aarav Mehta',
    title: 'Co-Founder & CTO',
    company: 'Indus Dynamics',
    email: 'aarav@indusdynamics.in',
    phone: '+91 98765 43210',
    value: 75000,
    status: 'New',
    source: 'LinkedIn',
    createdAt: '2026-06-20T10:00:00.000Z',
    notes: []
  },
  {
    id: 'lead-in-2',
    name: 'Ishaan Sharma',
    title: 'Head of Operations',
    company: 'Bharat AgriTech',
    email: 'ishaan@bharatagri.com',
    phone: '+91 91234 56789',
    value: 30000,
    status: 'New',
    source: 'Website',
    createdAt: '2026-06-22T08:30:00.000Z',
    notes: []
  },
  {
    id: 'lead-in-3',
    name: 'Ananya Iyer',
    title: 'VP of Product',
    company: 'Nutan Ventures',
    email: 'ananya@nutanventures.co',
    phone: '+91 88888 77777',
    value: 55000,
    status: 'Contacted',
    source: 'Referral',
    createdAt: '2026-06-15T14:15:00.000Z',
    notes: [
      {
        id: 'n-in-1',
        text: 'Initial conversation completed. Ananya requested a custom product catalog for multi-region deployment.',
        date: '2026-06-16T09:00:00.000Z'
      }
    ]
  },
  {
    id: 'lead-in-4',
    name: 'Rohan Gupta',
    title: 'Director of Sales',
    company: 'Jaipur Exports',
    email: 'rohan.g@jaipurexports.com',
    phone: '+91 77777 66666',
    value: 120000,
    status: 'Won',
    source: 'Cold Call',
    createdAt: '2026-06-01T11:00:00.000Z',
    notes: [
      {
        id: 'n-in-2',
        text: 'Contract finalized and signed. Integration session scheduled for Bharat team next week.',
        date: '2026-06-08T16:30:00.000Z'
      }
    ]
  },
  {
    id: 'lead-in-5',
    name: 'Diya Patel',
    title: 'Founder & CEO',
    company: 'SpiceRoute Digital',
    email: 'diya@spiceroute.io',
    phone: '+91 99999 88888',
    value: 18000,
    status: 'Lost',
    source: 'Email Campaign',
    createdAt: '2026-05-18T10:00:00.000Z',
    notes: [
      {
        id: 'n-in-3',
        text: 'Lead lost. Client went with a local developer package due to immediate budget limitations.',
        date: '2026-05-25T14:00:00.000Z'
      }
    ]
  },
  {
    id: 'lead-in-6',
    name: 'Siddharth Nair',
    title: 'Chief Technology Architect',
    company: 'Kerala CyberLabs',
    email: 'sid@cyberlabs.org',
    phone: '+91 90000 12345',
    value: 65000,
    status: 'Meeting Scheduled',
    source: 'Other',
    createdAt: '2026-06-19T09:15:00.000Z',
    notes: [
      {
        id: 'n-in-4',
        text: 'Scheduled full architectural review for coming Thursday at 3:00 PM IST.',
        date: '2026-06-20T11:00:00.000Z'
      }
    ]
  }
];
