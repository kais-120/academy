# École Privée Al Amal — Espace d'administration

Frontend du dashboard de gestion scolaire — **PARTIE 1**.

## Stack

React 18 · Vite · Chakra UI 2 · React Router DOM 6 · Lucide React · Recharts · Axios (préparé, non branché)

## Installation

```bash
npm install
npm run dev
```

Application disponible sur `http://localhost:5173`.

## Connexion de démonstration

```
Email    : admin@ecole.tn
Password : admin123
```

## Contenu de cette partie

- Structure du projet complète (voir arborescence dans le chat)
- Thème Chakra UI (palette éducation : bleus, blanc, gris clair, touche verte)
- Layout admin : Sidebar collapsible + drawer mobile, Header
- Page de connexion (split-screen, validation, show/hide password, loading)
- Dashboard complet : stats, paiements, graphiques (Recharts), activités, infos école, tarifs
- Pages Élèves / Maîtres / Surveillants / Employés / Registre / Paiements / Sauvegarde / Paramètres en placeholder ("à venir"), routes déjà actives
- `src/services/api.js` prêt pour le futur backend Express + PostgreSQL (non appelé)

## Prochaines parties

PARTIE 2 : Élèves, DataTable, formulaires
PARTIE 3 : Maîtres, Surveillants, Employés
PARTIE 4 : Registre (sous-navigation)
PARTIE 5 : Paiements
PARTIE 6 : Sauvegarde, Google Drive (interface), Paramètres
