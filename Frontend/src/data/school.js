// ---------------------------------------------------------------------------
// Données générales de l'école, tarifs, et agrégats utilisés par le Dashboard.
// À remplacer plus tard par des appels API (voir src/services/api.js).
// ---------------------------------------------------------------------------

export const schoolInfo = {
  name: 'École Privée Mohamed Tayeb School',
  slogan: 'Construire aujourd\u2019hui les réussites de demain.',
  address: 'Cité ELhouda - elfaouar',
  phone: '+216 73 200 145',
  email: 'contact@ecole.tn',
  director: 'Mr Mohamed ben brahim',
  schoolYear: '2025 / 2026',
  totalStudents: 850,
};

export const levels = [
  'التحضيري',
'السنة الأولى',
'السنة الثانية',
'السنة الثالثة',
'السنة الرابعة',
'السنة الخامسة',
'السنة السادسة',
];

export const paiements = [
  'يدفع شهريًا',
  'يدفع بالثلاثي',
'يدفع سنويًا',
'غير معني بالدفع',
];

export const tuitionFees = [
  { id: 1, level: 'Préscolaire', amount: 1200 },
  { id: 2, level: '1ère année', amount: 1400 },
  { id: 3, level: '2ème année', amount: 1400 },
  { id: 4, level: '3ème année', amount: 1450 },
  { id: 5, level: '4ème année', amount: 1450 },
  { id: 6, level: '5ème année', amount: 1500 },
  { id: 7, level: '6ème année', amount: 1500 },
  { id: 8, level: '7ème année', amount: 1600 },
  { id: 9, level: '8ème année', amount: 1600 },
  { id: 10, level: '9ème année', amount: 1650 },
];

export const transportFees = [
  { id: 1, zone: 'Zone 1', amount: 80 },
  { id: 2, zone: 'Zone 2', amount: 100 },
  { id: 3, zone: 'Zone 3', amount: 120 },
  { id: 4, zone: 'Zone 4', amount: 150 },
];

// ---------------------------------------------------------------------------
// Statistiques globales pour les StatCard du Dashboard
// ---------------------------------------------------------------------------

export const dashboardStats = {
  totalStudents: 850,
  totalTeachers: 52,
  totalSupervisors: 18,
  totalEmployees: 24,
  paymentsThisMonth: {
    total: 48250,
    collected: 39400,
    pending: 8850,
  },
};

export const genderDistribution = [
  { name: 'بنت', value: 430, color: '#7CC7C0' },
  { name: 'ولد', value: 420, color: '#2C6FD1' },
];

export const studentsByLevel = [
  { level: 'Préscolaire', eleves: 92 },
  { level: '1ère', eleves: 88 },
  { level: '2ème', eleves: 85 },
  { level: '3ème', eleves: 91 },
  { level: '4ème', eleves: 84 },
  { level: '5ème', eleves: 79 },
  { level: '6ème', eleves: 83 },
  { level: '7ème', eleves: 82 },
  { level: '8ème', eleves: 80 },
  { level: '9ème', eleves: 86 },
];

export const monthlyPayments = [
  { month: 'Jan', montant: 41200 },
  { month: 'Fév', montant: 38900 },
  { month: 'Mar', montant: 43750 },
  { month: 'Avr', montant: 40100 },
  { month: 'Mai', montant: 44600 },
  { month: 'Juin', montant: 46200 },
  { month: 'Sep', montant: 52300 },
  { month: 'Oct', montant: 47900 },
  { month: 'Nov', montant: 45100 },
  { month: 'Déc', montant: 48250 },
];

export const recentActivities = [
  {
    id: 1,
    type: 'payment',
    text: 'Nouveau paiement enregistré — Yassine Jlassi (1ère année)',
    time: 'Il y a 12 min',
  },
  {
    id: 2,
    type: 'student',
    text: 'Nouvel élève ajouté — Aya Gharbi (Préscolaire)',
    time: 'Il y a 46 min',
  },
  {
    id: 3,
    type: 'salary',
    text: 'Salaire enseignant enregistré — Mohamed Ben Ali',
    time: 'Il y a 2 h',
  },
  {
    id: 4,
    type: 'backup',
    text: 'Sauvegarde automatique effectuée avec succès',
    time: 'Il y a 5 h',
  },
  {
    id: 5,
    type: 'payment',
    text: 'Paiement transport encaissé — Sarra Mansouri (Zone 2)',
    time: 'Hier, 17:20',
  },
  {
    id: 6,
    type: 'student',
    text: 'Dossier mis à jour — Mariem Ben Salah (5ème année)',
    time: 'Hier, 11:05',
  },
];
