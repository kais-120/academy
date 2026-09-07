// ---------------------------------------------------------------------------
// Dummy data — 20 paiements scolaires. Concerne uniquement les élèves.
// À remplacer plus tard par src/services/api.js (getPayments, createPayment).
// ---------------------------------------------------------------------------

export const paymentTypes = ['Scolarité', 'Transport', 'Inscription', 'Autre'];
export const paymentModes = ['Espèces', 'Carte bancaire', 'Virement', 'Chèque'];
export const paymentStatuses = ['payé', 'Partiel', 'en attente'];

export const payments = [
  { id: 1, eleve: 'Mohamed Ben Ali', niveau: 'Préscolaire', typePaiement: 'Scolarité', montant: 1200, datePaiement: '2026-08-03', modePaiement: 'Virement', statut: 'Payé' },
  { id: 2, eleve: 'Ahmed Trabelsi', niveau: '1ère année', typePaiement: 'Scolarité', montant: 700, datePaiement: '2026-08-04', modePaiement: 'Espèces', statut: 'Partiel' },
  { id: 3, eleve: 'Yassine Jlassi', niveau: '2ème année', typePaiement: 'Transport', montant: 100, datePaiement: '2026-08-05', modePaiement: 'Espèces', statut: 'Payé' },
  { id: 4, eleve: 'Sarra Mansouri', niveau: 'Préscolaire', typePaiement: 'Inscription', montant: 150, datePaiement: '2026-08-05', modePaiement: 'Carte bancaire', statut: 'Payé' },
  { id: 5, eleve: 'Mariem Ben Salah', niveau: '4ème année', typePaiement: 'Scolarité', montant: 1450, datePaiement: '2026-08-06', modePaiement: 'Chèque', statut: 'Payé' },
  { id: 6, eleve: 'Aya Gharbi', niveau: 'Préscolaire', typePaiement: 'Scolarité', montant: 0, datePaiement: '2026-08-06', modePaiement: 'Espèces', statut: 'En attente' },
  { id: 7, eleve: 'Amine Cherni', niveau: '5ème année', typePaiement: 'Transport', montant: 120, datePaiement: '2026-08-07', modePaiement: 'Espèces', statut: 'Payé' },
  { id: 8, eleve: 'Nour Ben Amor', niveau: '6ème année', typePaiement: 'Scolarité', montant: 800, datePaiement: '2026-08-07', modePaiement: 'Virement', statut: 'Partiel' },
  { id: 9, eleve: 'Rayen Kilani', niveau: '2ème année', typePaiement: 'Scolarité', montant: 1400, datePaiement: '2026-08-08', modePaiement: 'Carte bancaire', statut: 'Payé' },
  { id: 10, eleve: 'Ines Bouazizi', niveau: '1ère année', typePaiement: 'Autre', montant: 60, datePaiement: '2026-08-08', modePaiement: 'Espèces', statut: 'Payé' },
  { id: 11, eleve: 'Omar Hamdi', niveau: '7ème année', typePaiement: 'Scolarité', montant: 0, datePaiement: '2026-08-09', modePaiement: 'Espèces', statut: 'En attente' },
  { id: 12, eleve: 'Salma Ferjani', niveau: '5ème année', typePaiement: 'Transport', montant: 120, datePaiement: '2026-08-10', modePaiement: 'Espèces', statut: 'Payé' },
  { id: 13, eleve: 'Youssef Guesmi', niveau: '8ème année', typePaiement: 'Scolarité', montant: 900, datePaiement: '2026-08-11', modePaiement: 'Chèque', statut: 'Partiel' },
  { id: 14, eleve: 'Ranim Sassi', niveau: '4ème année', typePaiement: 'Inscription', montant: 150, datePaiement: '2026-08-11', modePaiement: 'Virement', statut: 'Payé' },
  { id: 15, eleve: 'Firas Bouzid', niveau: '6ème année', typePaiement: 'Scolarité', montant: 1500, datePaiement: '2026-08-12', modePaiement: 'Carte bancaire', statut: 'Payé' },
  { id: 16, eleve: 'Malek Jaziri', niveau: '9ème année', typePaiement: 'Scolarité', montant: 0, datePaiement: '2026-08-13', modePaiement: 'Espèces', statut: 'En attente' },
  { id: 17, eleve: 'Lina Chebbi', niveau: '2ème année', typePaiement: 'Transport', montant: 100, datePaiement: '2026-08-13', modePaiement: 'Espèces', statut: 'Payé' },
  { id: 18, eleve: 'Anis Rekik', niveau: '1ère année', typePaiement: 'Scolarité', montant: 1400, datePaiement: '2026-07-22', modePaiement: 'Virement', statut: 'Payé' },
  { id: 19, eleve: 'Cyrine Toumi', niveau: '7ème année', typePaiement: 'Scolarité', montant: 850, datePaiement: '2026-07-18', modePaiement: 'Chèque', statut: 'Partiel' },
  { id: 20, eleve: 'Hamza Belhadj', niveau: '8ème année', typePaiement: 'Scolarité', montant: 1600, datePaiement: '2026-07-15', modePaiement: 'Carte bancaire', statut: 'Payé' },
];

export default payments;
