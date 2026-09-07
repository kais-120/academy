import {
  Box,
  HStack,
  IconButton,
  InputGroup,
  InputLeftElement,
  Input,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  VStack,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Menu as MenuIcon, Search, Bell, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header({ pageTitle, onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const showSearch = useBreakpointValue({ base: false, md: true });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
  as="header"
  position="sticky"
  top={0}
  zIndex={10}
  bg="white"
  borderBottom="1px solid"
  borderColor="ink.200"
  px={{ base: 4, md: 6 }}
  py={3}
  dir="rtl"
>
  <HStack justify="space-between" spacing={4}>

    {/* Right side */}
    <HStack spacing={3} minW={0}>
      <IconButton
        aria-label="فتح القائمة"
        icon={<MenuIcon size={20} />}
        variant="ghost"
        display={{ base: 'inline-flex', lg: 'none' }}
        onClick={onOpenMobileMenu}
      />

      <Text
        fontFamily="heading"
        fontWeight="700"
        fontSize={{ base: 'md', md: 'lg' }}
        color="ink.900"
        noOfLines={1}
      >
        {pageTitle}
      </Text>
    </HStack>

    {/* Left side */}
    <HStack spacing={{ base: 2, md: 3 }}>
      <Menu placement="bottom-start">
        <MenuButton>
          <HStack
            spacing={2.5}
            px={2}
            py={1}
            borderRadius="xl"
            _hover={{ bg: 'ink.50' }}
            transition="background 0.15s ease"
          >
            <Avatar
              size="sm"
              name={user?.name}
              bg="brand.600"
              color="white"
              fontWeight="700"
            />

            <VStack
              spacing={0}
              align="flex-start"
              display={{ base: 'none', sm: 'flex' }}
            >
              <Text
                fontSize="sm"
                fontWeight="600"
                color="ink.900"
                lineHeight="1.2"
              >
                {user?.name || 'المدير'}
              </Text>

              <Text
                fontSize="xs"
                color="ink.400"
                lineHeight="1.2"
              >
                {user?.role || 'مدير المدرسة'}
              </Text>
            </VStack>

            <ChevronDown
              size={16}
              color="var(--chakra-colors-ink-400)"
            />
          </HStack>
        </MenuButton>

        <MenuList minW="220px" dir="rtl">
          <Box px={3} py={2}>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="ink.900"
            >
              {user?.name}
            </Text>

            <Text
              fontSize="xs"
              color="ink.400"
            >
              {user?.email}
            </Text>

            <Badge
              mt={1}
              colorScheme="blue"
              bg="brand.50"
              color="brand.700"
              fontSize="10px"
            >
              مدير
            </Badge>
          </Box>

          <MenuDivider />

          <MenuItem icon={<UserCircle size={17} />}
          onClick={() => navigate('/profil')}
          >
            ملفي الشخصي
          </MenuItem>

          <MenuItem
            icon={<Settings size={17} />}
            onClick={() => navigate('/settings')}
          >
            الإعدادات
          </MenuItem>

          <MenuDivider />

          <MenuItem
            icon={<LogOut size={17} />}
            color="danger.500"
            onClick={handleLogout}
          >
            تسجيل الخروج
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>

  </HStack>
</Box>
  );
}
