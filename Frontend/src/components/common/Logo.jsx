import { Box, HStack, Img, Text, VStack } from '@chakra-ui/react';
import logo from "../../assets/images/logo.png"
import logoWithOutBg from "../../assets/images/logoWithOutBg.png"


/**
 * Logo de l'école — un mark évoquant un livre ouvert / un toit,
 * accompagné du nom sur deux niveaux (nom + baseline optionnelle).
 */
function LogoMark({ size = 40 }) {
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="12px"
      bg="brand.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      boxShadow="0 4px 12px -2px rgba(27, 75, 143, 0.45)"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4L22 8.5V10L12 14L2 10V8.5L12 4Z"
          fill="white"
        />
        <path
          d="M6 10.8V16C6 16 8.8 18 12 18C15.2 18 18 16 18 16V10.8L12 14L6 10.8Z"
          fill="#7CC7C0"
        />
      </svg>
    </Box>
  );
}

export default function Logo({ variant = 'full', size = 40, nameColor = 'ink.900' }) {
  if (variant === 'mark') return <LogoMark size={size} />;

  return (
    <HStack dir='rtl' spacing={3} align="right">
      <Img src={logoWithOutBg} w='10' alt='logo'/>
      <VStack spacing={0} align="flex-start"  lineHeight="1.1">
        <Text fontFamily="heading" fontWeight="700" fontSize="md" color={nameColor}>
          الفوار سكول
        </Text>
        <Text fontSize="xs" color="ink.400" fontWeight="500">
          الفضاء الإداري
        </Text>
      </VStack>
    </HStack>
  );
}
