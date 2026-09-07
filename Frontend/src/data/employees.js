// ---------------------------------------------------------------------------
// Dummy data — 8 employés. À remplacer plus tard par src/services/api.js
// (getEmployees, createEmployee, updateEmployee, deleteEmployee).
// ---------------------------------------------------------------------------

export const employeeRoles = [
  'كاتب(ة)',
  'محاسب(ة)',
  'سائق',
  'عامل(ة) نظافة',
  'عون أمن',
];
export const employeeStatuses = ['نشط', 'في إجازة', 'غير نشط'];

export const employees = [
  {
    id: 1,
    nom: 'Belhadj',
    prenom: 'Chaima',
    telephone: '22 345 671',
    role: 'Secrétaire',
    dateDepotSalaire: '2026-07-28',
    salaire: 780,
  },
  {
    id: 2,
    nom: 'Bouzid',
    prenom: 'Adel',
    telephone: '98 671 234',
    role: 'Comptable',
    dateDepotSalaire: '2026-07-28',
    salaire: 1050,
  },
  {
    id: 3,
    nom: 'Sassi',
    prenom: 'Hedi',
    telephone: '25 908 671',
    role: 'Chauffeur',
    dateDepotSalaire: '2026-07-28',
    salaire: 720,
  },
  {
    id: 4,
    nom: 'Gharbi',
    prenom: 'Mouna',
    telephone: '52 341 908',
    role: 'Agent de nettoyage',
    dateDepotSalaire: '2026-07-28',
    salaire: 620,
  },
  {
    id: 5,
    nom: 'Trabelsi',
    prenom: 'Nesrine',
    telephone: '27 673 451',
    role: 'Agent administratif',
    dateDepotSalaire: '2026-07-28',
    salaire: 790,
  },
  {
    id: 6,
    nom: 'Ferjani',
    prenom: 'Skander',
    telephone: '23 908 176',
    role: 'Technicien',
    dateDepotSalaire: '2026-07-28',
    salaire: 850,
  },
  {
    id: 7,
    nom: 'Mansouri',
    prenom: 'Rym',
    telephone: '99 452 187',
    role: 'Agent de nettoyage',
    dateDepotSalaire: '2026-07-28',
    salaire: 620,
  },
  {
    id: 8,
    nom: 'Chebbi',
    prenom: 'Nabil',
    telephone: '55 671 908',
    role: 'Chauffeur',
    dateDepotSalaire: '2026-07-28',
    salaire: 720,
  },
];

export default employees;
