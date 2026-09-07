// ---------------------------------------------------------------------------
// Dummy data — 8 surveillants. À remplacer plus tard par src/services/api.js
// (getSupervisors, createSupervisor, updateSupervisor, deleteSupervisor).
// ---------------------------------------------------------------------------

export const supervisorRoles = [
   'قيم الساحة',
  'مراقب الدراسة',
  'مسؤول الانضباط',
    'مسؤول التسيير',
  'مقتصد',
];
export const supervisorStatuses = ['نشط', 'في إجازة', 'غير نشط'];

export const supervisors = [
  {
    id: 1,
    nom: 'Rekik',
    prenom: 'Foued',
    telephone: '26 341 908',
    role: 'Surveillant général',
    dateDepotSalaire: '2026-07-28',
    salaire: 950,
  },
  {
    id: 2,
    nom: 'Ben Amor',
    prenom: 'Salma',
    telephone: '21 673 452',
    role: 'Surveillant de cour',
    dateDepotSalaire: '2026-07-28',
    salaire: 820,
  },
  {
    id: 3,
    nom: 'Toumi',
    prenom: 'Anis',
    telephone: '98 217 654',
    role: 'Surveillant d\u2019étude',
    dateDepotSalaire: '2026-07-28',
    salaire: 830,
  },
  {
    id: 4,
    nom: 'Jaziri',
    prenom: 'Yosra',
    telephone: '52 908 761',
    role: 'Responsable discipline',
    dateDepotSalaire: '2026-07-28',
    salaire: 980,
  },
  {
    id: 5,
    nom: 'Hamdi',
    prenom: 'Bilel',
    telephone: '23 456 187',
    role: 'Surveillant de cour',
    dateDepotSalaire: '2026-07-28',
    salaire: 820,
  },
  {
    id: 6,
    nom: 'Cherni',
    prenom: 'Nadia',
    telephone: '27 908 345',
    role: 'Surveillant d\u2019étude',
    dateDepotSalaire: '2026-07-28',
    salaire: 830,
  },
  {
    id: 7,
    nom: 'Guesmi',
    prenom: 'Sami',
    telephone: '99 671 203',
    role: 'Surveillant général',
    dateDepotSalaire: '2026-07-28',
    salaire: 950,
  },
  {
    id: 8,
    nom: 'Kilani',
    prenom: 'Amira',
    telephone: '54 312 908',
    role: 'Surveillant de cour',
    dateDepotSalaire: '2026-07-28',
    salaire: 820,
  },
];

export default supervisors;
