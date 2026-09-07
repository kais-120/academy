import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PAGE_TITLES = {
  '/dashboard': 'لوحة التحكم',
  '/students': 'التلاميذ',
  '/teachers': 'المعلمون',
  '/supervisors': 'المشرفون',
  '/employees': 'الموظفين',
  '/payments': 'المدفوعات',
  '/backup': 'Sauvegarde',
  '/settings': 'الإعدادات',
};

function getPageTitle(pathname) {
  if (pathname.startsWith('/register/absences')) {
    const category = pathname.split('/')[3];
    const map = {
      eleves: 'سجل غياب التلاميذ',
      maitres: 'سجل غيابات المعلمين',
      surveillants: 'سجل غيابات المشرفين',
      employes: 'سجل غيابات الموظفين',
    };
    return map[category] || 'Registre — Absences';
  }
  if (pathname === '/register/late') return 'Registre — Retards';
  if (pathname === '/register/observations') return 'Registre — Observations';
  if (pathname === '/register/teacher-movements') return 'التسجيل - الماجستير ( الحضور والانصراف)';
  if (pathname === '/payments/eleves') return 'المدفوعات - التلاميذ';
if (pathname === '/payments/maitres') return 'المدفوعات - المعلمون';
if (pathname === '/payments/employs') return 'المدفوعات - الموظفين/المشرفون';
if (pathname === '/payments/achats') return 'المدفوعات - المشتريات';
  if (pathname.startsWith('/register')) return 'Registre';
  return PAGE_TITLES[pathname] || 'مدرسة الفوار سكول';
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <Box minH="100vh" bg="ink.50">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box
        mr={{ base: 0, lg: collapsed ? '84px' : '260px' }}
        transition="margin-left 0.2s ease"
        minH="100vh"
        display="flex"
        flexDirection="column"
      >
        <Header pageTitle={getPageTitle(location.pathname)} onOpenMobileMenu={() => setMobileOpen(true)} />
        <Box as="main" flex={1} px={{ base: 4, md: 6 }} py={{ base: 5, md: 7 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
