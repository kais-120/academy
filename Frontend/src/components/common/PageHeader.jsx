import { Flex, VStack, Text, HStack } from '@chakra-ui/react';

/**
 * En-tête réutilisable pour les pages internes (titre + sous-titre + actions).
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Flex
      justify="space-between"
      align={{ base: 'flex-start', sm: 'center' }}
      direction={{ base: 'column', sm: 'row' }}
      gap={3}
      mb={6}
    >
      <VStack align="flex-start" spacing={0.5}>
        <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="ink.900">
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="sm" color="ink.500">
            {subtitle}
          </Text>
        )}
      </VStack>
      {actions && <HStack spacing={2}>{actions}</HStack>}
    </Flex>
  );
}
