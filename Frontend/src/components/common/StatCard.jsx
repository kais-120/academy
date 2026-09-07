import { Box, HStack, Text, Icon, Flex } from '@chakra-ui/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Carte de statistique — utilisée dans le Dashboard (élèves, maîtres,
 * surveillants, employés, paiements, etc.).
 *
 * @param {string} label       Libellé de la statistique
 * @param {string|number} value Valeur principale affichée
 * @param {React} icon         Icône Lucide (composant, pas élément)
 * @param {string} iconColor   Nom de couleur du thème (ex: 'brand.500')
 * @param {string} iconBg      Fond de l'icône (ex: 'brand.50')
 * @param {number} [trend]     Variation en % — positif = vert, négatif = rouge
 * @param {string} [trendLabel] Texte accompagnant la variation
 */
export default function StatCard({
  label,
  value,
  icon,
  iconColor = 'brand.600',
  iconBg = 'brand.50',
}) {

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      border="1px solid"
      borderColor="ink.200"
      boxShadow="card"
      p={5}
      transition="all 0.2s ease"
      _hover={{ boxShadow: 'cardHover', transform: 'translateY(-2px)' }}
    >
      <Flex justify="space-between" align="flex-start" mb={4}>
        <Text fontSize="sm" color="ink.500" fontWeight="600">
          {label}
        </Text>
        <Flex
          w="42px"
          h="42px"
          borderRadius="xl"
          bg={iconBg}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={5} color={iconColor} />
        </Flex>
      </Flex>

      <HStack align="baseline" spacing={2}>
        <Text fontFamily="heading" fontSize="3xl" fontWeight="700" color="ink.900">
          {value}
        </Text>
      </HStack>

     
    </Box>
  );
}
