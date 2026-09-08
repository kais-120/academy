import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Tooltip,
  Divider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  IconButton,
} from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ShieldCheck,
  Briefcase,
  BookOpenCheck,
  Wallet,
  DatabaseBackup,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { MdOutlineLocalOffer } from "react-icons/md";


const NAV_ITEMS = [
  { label: 'لوحة التحكم', to: '/dashboard', icon: LayoutDashboard },
  { label: 'التلاميذ', to: '/students', icon: GraduationCap },
  { label: 'المعلمون', to: '/teachers', icon: Users },
  { label: 'سجل الحضور', to: '/register', icon: BookOpenCheck, matchPrefix: '/register' },
  { label: 'باقة دراسية', to: '/package', icon: MdOutlineLocalOffer, matchPrefix: '/package' },
  { label: 'المدفوعات', to: '/payments', icon: Wallet, matchPrefix: '/payments' },
  { label: 'الإعدادات', to: '/settings', icon: Settings },
];

function NavItem({ item, collapsed, onClick }) {
  const location = useLocation();
  const isActive = item.matchPrefix
    ? location.pathname.startsWith(item.matchPrefix)
    : location.pathname === item.to;

  const content = (
    <HStack
    dir='rtl'
      as={NavLink}
      to={item.to}
      onClick={onClick}
      spacing={3}
      px={collapsed ? 0 : 3.5}
      py={2.5}
      borderRadius="xl"
      justify={collapsed ? 'center' : 'flex-start'}
      position="relative"
      bg={isActive ? 'whiteAlpha.200' : 'transparent'}
      color={isActive ? 'white' : 'whiteAlpha.700'}
      fontWeight={isActive ? '600' : '500'}
      transition="all 0.15s ease"
      _hover={{ bg: 'whiteAlpha.150', color: 'white' }}
      w="full"
    >
      {isActive && (
        <Box
          position="absolute"
          left="-12px"
          top="50%"
          transform="translateY(-50%)"
          w="4px"
          h="60%"
          bg="accent.300"
          borderRadius="full"
        />
      )}
      <Icon as={item.icon} boxSize={5} flexShrink={0} />
      {!collapsed && (
        <Text fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          {item.label}
        </Text>
      )}
    </HStack>
  );

  if (collapsed) {
    return (
      <Tooltip label={item.label} placement="right" hasArrow bg="ink.900">
        {content}
      </Tooltip>
    );
  }
  return content;
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
  showCollapseToggle = true
}) {
  const { user } = useAuth();
  const isDirector = user?.role === 'مدير';

  const visibleNavItems = isDirector
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.to !== '/dashboard');

  return (
    <VStack
      h="full"
      bgGradient="linear(to-b, brand.700, brand.800)"
      align="stretch"
      spacing={0}
      py={5}
      px={collapsed ? 3 : 4}
      position="relative"
    >
      <Box
        px={collapsed ? 0 : 1}
        mb={6}
        display="flex"
        justifyContent={collapsed ? 'center' : 'flex-end'}
      >
        {collapsed ? (
          <Logo variant="mark" size={38} />
        ) : (
          <Logo variant="full" nameColor="white" />
        )}
      </Box>

      <VStack spacing={1} align="stretch" flex={1} overflowY="auto">
        {visibleNavItems.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onClick={onNavigate}
          />
        ))}
      </VStack>

      <Divider borderColor="whiteAlpha.200" my={3} />

      {showCollapseToggle && (
        <HStack
          justify={collapsed ? 'center' : 'flex-end'}
          px={collapsed ? 0 : 1}
        >
          <IconButton
            aria-label={
              collapsed ? 'Développer le menu' : 'Réduire le menu'
            }
            icon={
              collapsed
                ? <ChevronsLeft size={18} />
                : <ChevronsRight size={18} />
            }
            size="sm"
            variant="ghost"
            color="whiteAlpha.700"
            _hover={{
              bg: 'whiteAlpha.150',
              color: 'white'
            }}
            onClick={onToggleCollapse}
          />
        </HStack>
      )}
    </VStack>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  return (
    <>
      {/* Sidebar fixe — desktop / tablette */}
      <Box
        as="aside"
        display={{ base: 'none', lg: 'block' }}
        w={collapsed ? '84px' : '260px'}
        transition="width 0.2s ease"
        position="fixed"
        top={0}
        right={0}
        h="100vh"
        zIndex={20}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </Box>

      {/* Drawer — mobile */}
      <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose}>
        <DrawerOverlay />
        <DrawerContent maxW="270px">
          <SidebarContent collapsed={false} onNavigate={onMobileClose} showCollapseToggle={false} />
        </DrawerContent>
      </Drawer>
    </>
  );
}