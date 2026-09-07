import { Box, HStack, Text } from '@chakra-ui/react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { CalendarX2, Clock3, MessageSquareText, DoorOpen } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

const SUB_NAV = [
  { label: 'الغياب', to: '/register/absences', icon: CalendarX2, matchPrefix: '/register/absences' },
  { label: 'المعلمون — الحضور والانصراف', to: '/register/teacher-movements', icon: DoorOpen },
];

export default function Register() {
  const location = useLocation();

  // Redirige /register vers /register/absences (qui redirige lui-même vers
  // la catégorie Élèves) par défaut.
  if (location.pathname === '/register') {
    return <Navigate to="/register/absences" replace />;
  }

  return (
    <Box
    dir='rtl'
    >
      <PageHeader title="سجل المدرسة" subtitle="سجلات الغياب وحضور المعلمين." />

      <HStack
        spacing={1}
        bg="white"
        border="1px solid"
        borderColor="ink.200"
        borderRadius="xl"
        p={1.5}
        mb={6}
        overflowX="auto"
        w="fit-content"
        maxW="full"
      >
        {SUB_NAV.map((item) => {
          const isActive = item.matchPrefix
            ? location.pathname.startsWith(item.matchPrefix)
            : location.pathname === item.to;
          return (
            <HStack
              as={NavLink}
              key={item.to}
              to={item.to}
              spacing={2}
              px={3.5}
              py={2}
              borderRadius="lg"
              whiteSpace="nowrap"
              bg={isActive ? 'brand.600' : 'transparent'}
              color={isActive ? 'white' : 'ink.600'}
              fontWeight={isActive ? '600' : '500'}
              fontSize="sm"
              transition="all 0.15s ease"
              _hover={{ bg: isActive ? 'brand.600' : 'ink.50' }}
            >
              <item.icon size={16} />
              <Text>{item.label}</Text>
            </HStack>
          );
        })}
      </HStack>

      <Outlet />
    </Box>
  );
}
