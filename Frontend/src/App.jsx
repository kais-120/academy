import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Supervisors from './pages/Supervisors';
import Employees from './pages/Employees';
import Register from './pages/Register';
import AbsenceEleves from './pages/register/AbsenceEleves';
import AbsenceMaitres from './pages/register/AbsenceMaitres';
import AbsenceSurveillants from './pages/register/AbsenceSurveillants';
import AbsenceEmployes from './pages/register/AbsenceEmployes';
import Late from './pages/register/Late';
import Observations from './pages/register/Observations';
import TeacherMovements from './pages/register/TeacherMovements';
import Payments from './pages/Payments';
import Backup from './pages/Backup';
import Settings from './pages/Settings';
import PaymentsEleves from './components/payments/PaymentsEleves';
import PaymentsMaitres from './components/payments/PaymentsMaitres';
import PaymentsAchats from './components/payments/PaymentsAchats';
import PaymentsSurveillants from './components/payments/PaymentsSurveillantsEmploy';
import FinanceOverview from './components/payments/FinanceOverview';
import SchoolLoadingPage from './components/common/SchoolLoadingPage';
import DirectorRoute from './protect/DirectorRoute';
import AdminProfile from './pages/AdminProfile';
import ActivityLogs from './pages/ActivityLogs';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

            <Route path="/loading" element={<SchoolLoadingPage />} />
        {/* Routes protégées — accessibles uniquement si connecté */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DirectorRoute> <Dashboard /> </DirectorRoute>} />
            <Route path="/students" element={<Students />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/supervisors" element={<Supervisors />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/profil" element={<AdminProfile />} />
            <Route path="/register" element={<Register />}>
              <Route path="absences" element={<Navigate to="/register/absences/maitres" replace />} />
              <Route path="absences/eleves" element={<AbsenceEleves />} />
              <Route path="absences/maitres" element={<AbsenceMaitres />} />
              <Route path="absences/surveillants" element={<AbsenceSurveillants />} />
              <Route path="absences/employes" element={<AbsenceEmployes />} />
              <Route path="late" element={<Late />} />
              <Route path="observations" element={<Observations />} />
              <Route path="teacher-movements" element={<TeacherMovements />} />
            </Route>

            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/eleves" element={<PaymentsEleves />} />
            <Route path="/payments/maitres" element={<PaymentsMaitres />} />
            <Route path="/payments/employs" element={<PaymentsSurveillants />} />
            <Route path="/payments/achats" element={<PaymentsAchats />} /> 
            <Route path="/payments/expenses" element={<FinanceOverview />} /> 
            
            <Route path="/backup" element={<Backup />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
