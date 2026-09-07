// ---------------------------------------------------------------------------
// Dummy data — état de la sauvegarde et historique. À remplacer plus tard
// par src/services/api.js (createBackup, restoreBackup, getBackupHistory)
// connecté à Google Drive côté backend.
// ---------------------------------------------------------------------------

export const lastBackupInfo = {
  date: '2026-08-15T22:30:00',
  status: 'success', // 'success' | 'failed' | 'in_progress'
  size: '25.4 MB',
};

export const backupHistory = [
  { id: 1, date: '2026-08-15T22:30:00', size: '25.4 MB', status: 'success', type: 'Automatique' },
  { id: 2, date: '2026-08-14T22:30:00', size: '25.1 MB', status: 'success', type: 'Automatique' },
  { id: 3, date: '2026-08-13T22:30:00', size: '24.9 MB', status: 'success', type: 'Automatique' },
  { id: 4, date: '2026-08-12T18:12:00', size: '24.8 MB', status: 'success', type: 'Manuelle' },
  { id: 5, date: '2026-08-12T22:30:00', size: '24.7 MB', status: 'failed', type: 'Automatique' },
  { id: 6, date: '2026-08-11T22:30:00', size: '24.6 MB', status: 'success', type: 'Automatique' },
  { id: 7, date: '2026-08-10T09:05:00', size: '24.2 MB', status: 'success', type: 'Manuelle' },
];

export const googleDriveInfo = {
  connected: false,
  account: null,
  lastSync: null,
};
