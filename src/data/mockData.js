// GreenLens Municipal Jurisdictions and Authentication Constants
// Retained exclusively for initial portal login and jurisdiction routing

export const municipalities = [
  { id: 'winneba', name: 'Winneba Municipal Assembly', region: 'Central Region, Ghana', lat: 5.3556, lng: -0.6247, zoom: 14 },
  { id: 'accra', name: 'Accra Metropolitan Assembly', region: 'Greater Accra, Ghana', lat: 5.6037, lng: -0.1870, zoom: 13 },
  { id: 'kumasi', name: 'Kumasi Metropolitan Assembly', region: 'Ashanti Region, Ghana', lat: 6.6885, lng: -1.6244, zoom: 13 },
  { id: 'cape_coast', name: 'Cape Coast Metropolitan', region: 'Central Region, Ghana', lat: 5.1053, lng: -1.2466, zoom: 13 },
];

export const demoAccounts = [
  {
    role: 'Municipal Officer',
    name: 'Kwame Mensah (Command Lead)',
    email: 'kwame.mensah@winneba.gov.gh',
    dept: 'Operations Command',
    icon: 'shield_person',
    badge: 'Full Command'
  },
  {
    role: 'Field Supervisor',
    name: 'Abena Osei (Field Lead)',
    email: 'abena.osei@winneba.gov.gh',
    dept: 'Field Operations',
    icon: 'engineering',
    badge: 'Field Ops'
  },
  {
    role: 'System Administrator',
    name: 'Dr. Joseph Ansah (SysAdmin)',
    email: 'admin@winneba.gov.gh',
    dept: 'Municipal IT & Security',
    icon: 'admin_panel_settings',
    badge: 'Admin'
  }
];
