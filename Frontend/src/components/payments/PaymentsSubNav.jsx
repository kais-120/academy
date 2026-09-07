import { HStack, Text } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ShoppingCart, HandCoins } from 'lucide-react';
import { FaChalkboardTeacher } from 'react-icons/fa';


const CATEGORIES = [
  { label: 'التلاميذ', to: '/payments/eleves', icon: GraduationCap },
  { label: 'المعلمون', to: '/payments/maitres', icon: FaChalkboardTeacher },
  { label: 'الموظفين/المشرفون', to: '/payments/employs', icon: Users },
  { label: 'المشتريات', to: '/payments/achats', icon: ShoppingCart },
  { label: 'المصاريف', to: '/payments/expenses', icon: HandCoins },
];

export default function PaymentsSubNav() {
  const location = useLocation();

  return (
    <HStack
      spacing={1}
      bg="ink.50"
      border="1px solid"
      borderColor="ink.200"
      borderRadius="lg"
      p={1}
      mb={5}
      overflowX="auto"
      w="fit-content"
      maxW="full"
    >
      {CATEGORIES.map((cat) => {
        const isActive = location.pathname === cat.to;
        return (
          <HStack
            as={NavLink}
            key={cat.to}
            to={cat.to}
            spacing={1.5}
            px={3}
            py={1.5}
            borderRadius="md"
            whiteSpace="nowrap"
            bg={isActive ? 'white' : 'transparent'}
            color={isActive ? 'brand.700' : 'ink.500'}
            fontWeight={isActive ? '600' : '500'}
            fontSize="xs"
            boxShadow={isActive ? '0 1px 3px rgba(16,26,46,0.08)' : 'none'}
            transition="all 0.15s ease"
            _hover={{ color: 'brand.700' }}
          >
            <cat.icon size={13} />
            <Text>{cat.label}</Text>
          </HStack>
        );
      })}
    </HStack>
  );
}