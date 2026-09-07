import axios from 'axios';

// ---------------------------------------------------------------------------
// Client Axios — prêt pour la connexion au futur backend Express + PostgreSQL.
// Aucune de ces fonctions n'est appelée pour le moment : l'application
// fonctionne entièrement avec les dummy data de src/data/.
// ---------------------------------------------------------------------------

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injection future du token d'authentification.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('alamal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------------- Élèves -----------------------------------------
export const getStudents = () => api.get('/students');
export const getStudent = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// -------------------------- Maîtres ------------------------------------------
export const getTeachers = () => api.get('/teachers');
export const createTeacher = (data) => api.post('/teachers', data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// -------------------------- Surveillants -------------------------------------
export const getSupervisors = () => api.get('/supervisors');
export const createSupervisor = (data) => api.post('/supervisors', data);
export const updateSupervisor = (id, data) => api.put(`/supervisors/${id}`, data);
export const deleteSupervisor = (id) => api.delete(`/supervisors/${id}`);

// -------------------------- Employés -----------------------------------------
export const getEmployees = () => api.get('/employees');
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// -------------------------- Paiements ----------------------------------------
export const getPayments = () => api.get('/payments');
export const createPayment = (data) => api.post('/payments', data);
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data);
export const deletePayment = (id) => api.delete(`/payments/${id}`);

// -------------------------- Registre -----------------------------------------
export const getRegisterEntries = () => api.get('/register/entries');
export const getRegisterExits = () => api.get('/register/exits');
export const getAbsences = () => api.get('/register/absences');
export const getLateRecords = () => api.get('/register/late');
export const getObservations = () => api.get('/register/observations');

// -------------------------- École / Paramètres --------------------------------
export const getSchoolInfo = () => api.get('/school');
export const updateSchoolInfo = (data) => api.put('/school', data);
export const getTuitionFees = () => api.get('/school/tuition-fees');
export const updateTuitionFees = (data) => api.put('/school/tuition-fees', data);
export const getTransportFees = () => api.get('/school/transport-fees');
export const updateTransportFees = (data) => api.put('/school/transport-fees', data);

// -------------------------- Sauvegarde -----------------------------------------
export const createBackup = () => api.post('/backup');
export const restoreBackup = (backupId) => api.post(`/backup/${backupId}/restore`);
export const getBackupHistory = () => api.get('/backup/history');

// -------------------------- Authentification -----------------------------------
export const loginRequest = (email, password) => api.post('/auth/login', { email, password });
export const logoutRequest = () => api.post('/auth/logout');

export default api;
