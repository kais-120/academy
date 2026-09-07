import { Box, VStack, Text, Flex, Icon } from '@chakra-ui/react';
import { Construction } from 'lucide-react';
import PageHeader from './PageHeader';

/**
 * Page temporaire affichée pour les sections qui seront développées dans
 * les prochaines parties (voir la roadmap du projet).
 */
export default function ComingSoon({ title, part }) {
  return (
    <Box>
      <PageHeader title={title} subtitle="Cette section sera développée prochainement." />
      <Flex
        direction="column"
        align="center"
        justify="center"
        bg="white"
        border="1px dashed"
        borderColor="ink.200"
        borderRadius="2xl"
        py={20}
        px={6}
      >
        <Flex w="64px" h="64px" borderRadius="2xl" bg="brand.50" align="center" justify="center" mb={4}>
          <Icon as={Construction} boxSize={7} color="brand.600" />
        </Flex>
        <VStack spacing={1}>
          <Text fontFamily="heading" fontWeight="700" fontSize="lg" color="ink.900">
            Section en cours de construction
          </Text>
          <Text fontSize="sm" color="ink.500" textAlign="center" maxW="360px">
            {part
              ? `Cette page sera construite dans la ${part} du projet.`
              : 'Cette page sera bientôt disponible.'}
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
}
