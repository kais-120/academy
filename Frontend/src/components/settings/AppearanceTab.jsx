import { Box, HStack, VStack, Text, Icon, Flex, Badge } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react';

const OPTIONS = [
  { key: 'light', label: 'Mode clair', description: 'Fond clair, adapté à un usage administratif quotidien.', icon: Sun, available: true },
  { key: 'dark', label: 'Mode sombre', description: 'Bientôt disponible.', icon: Moon, available: false },
];

export default function AppearanceTab() {
  return (
    <Box bg="white" borderRadius="2xl" p={6} border="1px solid" borderColor="ink.200" boxShadow="card">
      <Text fontFamily="heading" fontWeight="700" color="ink.900" mb={1}>Apparence</Text>
      <Text fontSize="sm" color="ink.500" mb={5}>
        L’application utilise actuellement le mode clair comme thème principal.
      </Text>

      <VStack align="stretch" spacing={3}>
        {OPTIONS.map((opt) => (
          <HStack
            key={opt.key}
            justify="space-between"
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor={opt.key === 'light' ? 'brand.300' : 'ink.200'}
            bg={opt.key === 'light' ? 'brand.50' : 'ink.50'}
            opacity={opt.available ? 1 : 0.7}
          >
            <HStack spacing={3}>
              <Flex w="40px" h="40px" borderRadius="lg" bg="white" align="center" justify="center" border="1px solid" borderColor="ink.200">
                <Icon as={opt.icon} boxSize={4.5} color="brand.600" />
              </Flex>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="sm" fontWeight="600" color="ink.900">{opt.label}</Text>
                <Text fontSize="xs" color="ink.500">{opt.description}</Text>
              </VStack>
            </HStack>
            <Badge
              bg={opt.key === 'light' ? 'positive.50' : 'ink.100'}
              color={opt.key === 'light' ? 'positive.600' : 'ink.500'}
              borderRadius="full"
              px={2.5}
            >
              {opt.key === 'light' ? 'Actif' : 'À venir'}
            </Badge>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
