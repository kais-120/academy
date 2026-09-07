// ---------------------------------------------------------------------------
// Dummy data — Registre scolaire (absences par catégorie, retards,
// observations, mouvements des maîtres). À remplacer plus tard par
// src/services/api.js (getAbsences, getLateRecords, getObservations, ...).
// ---------------------------------------------------------------------------

export const absenceMotifs = [
  'المرض',
  'موعد طبي',
  'سبب عائلي',
  'غير مبرر',
  'أخرى',
];

// --- Absences — Élèves ------------------------------------------------------
export const absencesEleves = [
  { id: 1, personne: 'Yassine Jlassi', niveau: '2ème année', date: '2026-08-10', motif: 'Maladie', justifiee: true },
  { id: 2, personne: 'Aya Gharbi', niveau: 'Préscolaire', date: '2026-08-10', motif: 'Rendez-vous médical', justifiee: true },
  { id: 3, personne: 'Omar Hamdi', niveau: '7ème année', date: '2026-08-11', motif: 'Non justifiée', justifiee: false },
  { id: 4, personne: 'Salma Ferjani', niveau: '5ème année', date: '2026-08-11', motif: 'Raison familiale', justifiee: true },
  { id: 5, personne: 'Youssef Guesmi', niveau: '8ème année', date: '2026-08-11', motif: 'Non justifiée', justifiee: false },
  { id: 6, personne: 'Ranim Sassi', niveau: '4ème année', date: '2026-08-12', motif: 'Maladie', justifiee: true },
  { id: 7, personne: 'Malek Jaziri', niveau: '9ème année', date: '2026-08-12', motif: 'Autre', justifiee: false },
  { id: 8, personne: 'Lina Chebbi', niveau: '2ème année', date: '2026-08-13', motif: 'Rendez-vous médical', justifiee: true },
  { id: 9, personne: 'Cyrine Toumi', niveau: '7ème année', date: '2026-08-13', motif: 'Non justifiée', justifiee: false },
  { id: 10, personne: 'Hamza Belhadj', niveau: '8ème année', date: '2026-08-14', motif: 'Maladie', justifiee: true },
];

// --- Absences — Maîtres -----------------------------------------------------
export const absencesMaitres = [
  { id: 1, personne: 'Mohamed Ben Ali', matiere: 'Mathématiques', date: '2026-08-04', motif: 'Maladie', justifiee: true },
  { id: 2, personne: 'Leila Khemiri', matiere: 'Français', date: '2026-08-06', motif: 'Rendez-vous médical', justifiee: true },
  { id: 3, personne: 'Emna Sassi', matiere: 'Anglais', date: '2026-08-07', motif: 'Raison familiale', justifiee: true },
  { id: 4, personne: 'Karim Chebbi', matiere: 'Histoire-Géographie', date: '2026-08-10', motif: 'Non justifiée', justifiee: false },
  { id: 5, personne: 'Ahmed Jlassi', matiere: 'Sport', date: '2026-08-12', motif: 'Maladie', justifiee: true },
  { id: 6, personne: 'Ines Ferjani', matiere: 'Éducation Islamique', date: '2026-08-13', motif: 'Autre', justifiee: false },
];

// --- Absences — Surveillants -------------------------------------------------
export const absencesSurveillants = [
  { id: 1, personne: 'Foued Rekik', role: 'Surveillant général', date: '2026-08-05', motif: 'Maladie', justifiee: true },
  { id: 2, personne: 'Salma Ben Amor', role: 'Surveillant de cour', date: '2026-08-08', motif: 'Non justifiée', justifiee: false },
  { id: 3, personne: 'Anis Toumi', role: 'Surveillant d\u2019étude', date: '2026-08-09', motif: 'Rendez-vous médical', justifiee: true },
  { id: 4, personne: 'Bilel Hamdi', role: 'Surveillant de cour', date: '2026-08-12', motif: 'Raison familiale', justifiee: true },
  { id: 5, personne: 'Sami Guesmi', role: 'Surveillant général', date: '2026-08-13', motif: 'Non justifiée', justifiee: false },
];

// --- Absences — Employés ------------------------------------------------------
export const absencesEmployes = [
  { id: 1, personne: 'Chaima Belhadj', role: 'Secrétaire', date: '2026-08-04', motif: 'Maladie', justifiee: true },
  { id: 2, personne: 'Adel Bouzid', role: 'Comptable', date: '2026-08-07', motif: 'Raison familiale', justifiee: true },
  { id: 3, personne: 'Hedi Sassi', role: 'Chauffeur', date: '2026-08-09', motif: 'Non justifiée', justifiee: false },
  { id: 4, personne: 'Mouna Gharbi', role: 'Agent de nettoyage', date: '2026-08-11', motif: 'Rendez-vous médical', justifiee: true },
  { id: 5, personne: 'Skander Ferjani', role: 'Technicien', date: '2026-08-14', motif: 'Non justifiée', justifiee: false },
];

// --- Retards (élèves) --------------------------------------------------------
export const lateRecords = [
  { id: 1, eleve: 'Rayen Kilani', heureArrivee: '08:22', retard: 22, justifiee: false },
  { id: 2, eleve: 'Ines Bouazizi', heureArrivee: '08:15', retard: 15, justifiee: true },
  { id: 3, eleve: 'Firas Bouzid', heureArrivee: '08:40', retard: 40, justifiee: false },
  { id: 4, eleve: 'Anis Rekik', heureArrivee: '08:10', retard: 10, justifiee: true },
  { id: 5, eleve: 'Nour Ben Amor', heureArrivee: '08:35', retard: 35, justifiee: false },
  { id: 6, eleve: 'Amine Cherni', heureArrivee: '08:12', retard: 12, justifiee: true },
  { id: 7, eleve: 'Mariem Ben Salah', heureArrivee: '08:25', retard: 25, justifiee: false },
  { id: 8, eleve: 'Mohamed Ben Ali', heureArrivee: '08:08', retard: 8, justifiee: true },
];

// --- Observations --------------------------------------------------------------
export const observationTypes = ['Positive', 'Négative', 'Neutre'];

export const observations = [
  {
    id: 1,
    date: '2026-08-10',
    concerne: 'Yassine Jlassi — 2ème année',
    type: 'Positive',
    auteur: 'Mohamed Ben Ali',
    observation: 'Très bonne participation en classe de mathématiques.',
  },
  {
    id: 2,
    date: '2026-08-10',
    concerne: 'Omar Hamdi — 7ème année',
    type: 'Négative',
    auteur: 'Foued Rekik',
    observation: 'Comportement perturbateur pendant la récréation.',
  },
  {
    id: 3,
    date: '2026-08-11',
    concerne: 'Salma Ferjani — 5ème année',
    type: 'Positive',
    auteur: 'Leila Khemiri',
    observation: 'Excellent travail sur le projet de français.',
  },
  {
    id: 4,
    date: '2026-08-11',
    concerne: 'Classe 6ème année',
    type: 'Neutre',
    auteur: 'Direction',
    observation: 'Sortie pédagogique prévue le mois prochain — information transmise aux parents.',
  },
  {
    id: 5,
    date: '2026-08-12',
    concerne: 'Youssef Guesmi — 8ème année',
    type: 'Négative',
    auteur: 'Sonia Mansouri',
    observation: 'Absences répétées non justifiées à signaler aux parents.',
  },
  {
    id: 6,
    date: '2026-08-13',
    concerne: 'Ranim Sassi — 4ème année',
    type: 'Positive',
    auteur: 'Walid Gharbi',
    observation: 'Progrès notable en sciences ce trimestre.',
  },
];

// --- Mouvements des maîtres (entrées / sorties) ---------------------------------
// Le registre général d'entrées/sorties a été retiré ; seul le suivi des
// maîtres est conservé (pointage des heures d'arrivée et de départ).
export const movementDirections = ['Entrée', 'Sortie'];

export const teacherMovements = [
  { id: 1, date: '2026-08-10', heure: '07:52', nom: 'Ben Ali', prenom: 'Mohamed', sens: 'Entrée', remarque: 'Cours de 8h' },
  { id: 2, date: '2026-08-10', heure: '13:05', nom: 'Ben Ali', prenom: 'Mohamed', sens: 'Sortie', remarque: '' },
  { id: 3, date: '2026-08-10', heure: '07:58', nom: 'Khemiri', prenom: 'Leila', sens: 'Entrée', remarque: '' },
  { id: 4, date: '2026-08-10', heure: '16:20', nom: 'Khemiri', prenom: 'Leila', sens: 'Sortie', remarque: '' },
  { id: 5, date: '2026-08-11', heure: '07:55', nom: 'Gharbi', prenom: 'Walid', sens: 'Entrée', remarque: '' },
  { id: 6, date: '2026-08-11', heure: '13:10', nom: 'Gharbi', prenom: 'Walid', sens: 'Sortie', remarque: 'Rendez-vous direction' },
  { id: 7, date: '2026-08-12', heure: '08:02', nom: 'Mansouri', prenom: 'Sonia', sens: 'Entrée', remarque: '' },
  { id: 8, date: '2026-08-12', heure: '16:00', nom: 'Mansouri', prenom: 'Sonia', sens: 'Sortie', remarque: '' },
  { id: 9, date: '2026-08-13', heure: '07:49', nom: 'Chebbi', prenom: 'Karim', sens: 'Entrée', remarque: 'Réunion pédagogique' },
  { id: 10, date: '2026-08-13', heure: '13:15', nom: 'Chebbi', prenom: 'Karim', sens: 'Sortie', remarque: '' },
];
