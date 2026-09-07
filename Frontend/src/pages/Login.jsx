import { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Checkbox,
  Divider,
  InputLeftElement,
} from '@chakra-ui/react';
import { Eye, EyeOff, Copyright, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

// Adapte ce chemin vers l'emplacement réel de ton image
import ecoleFacade from '../assets/images/back.jpg';

export default function Login() {
  const { login,user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'البريد الإلكتروني مطلوب.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'صيغة البريد الإلكتروني غير صحيحة.';
    if (!password) next.password = 'كلمة المرور مطلوبة.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      console.log(user)
      const redirectTo =
  user?.role === "مدير"
    ? "/dashboard"
    : "/student";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message || 'حدث خطأ ما.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex dir='rtl' minH="100vh" bg="ink.50">
      {/* Colonne gauche — présentation de l'école */}
      <Flex
        flex={1}
        display={{ base: 'none', lg: 'flex' }}
        position="relative"
        align="center"
        justify="center"
        overflow="hidden"
        bgImage={`url(${ecoleFacade})`}
        bgSize="cover"
        bgPosition="center"
      >
        {/* Overlay sombre pour la lisibilité du texte */}
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-b, blackAlpha.700, blackAlpha.500, blackAlpha.800)"
        />

        <VStack
          position="relative"
          zIndex={1}
          spacing={8}
          px={10}
          textAlign="center"
          dir="rtl"
        >
          <VStack spacing={2}>
            <Text
              color="white"
              fontSize="lg"
              fontWeight="700"
              letterSpacing="wide"
            >
              الجمهورية التونسية
            </Text>
            <Text
              color="whiteAlpha.900"
              fontSize="md"
              fontWeight="600"
            >
              المندوبية الجهوية للتربية بقبلي
            </Text>
            <Text
              color="white"
              fontFamily="heading"
              fontSize="2xl"
              fontWeight="800"
              mt={2}
            >
              المدرسة الابتدائية الفوار سكول
            </Text>
          </VStack>

          <Divider borderColor="whiteAlpha.400" w="60%" />
        </VStack>
      </Flex>

      {/* Colonne droite — formulaire de connexion */}
      <Flex
        flex={1}
        direction="column"
        align="center"
        justify="space-between"
        px={{ base: 6, md: 12 }}
        py={10}
      >
        <Box w="full" maxW="400px" />

        <VStack w="full" maxW="400px" align="stretch" spacing={7}>
          <Box display={{ base: 'block', lg: 'none' }} mb={2}>
            <Logo variant="full" />
          </Box>

          <VStack align="flex-start" spacing={1}>
            <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="ink.900">
              مرحبًا
            </Text>
            <Text fontSize="sm" color="ink.500">
              قم بتسجيل الدخول للوصول إلى فضاء الإدارة.
            </Text>
          </VStack>

          {formError && (
            <Alert status="error" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={Boolean(errors.email)}>
                <FormLabel fontSize="sm" fontWeight="600" color="ink.700">
                  عنوان البريد الإلكتروني
                </FormLabel>
                <Input
                  type="email"
                  placeholder="admin@ecole.tn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  borderColor="ink.200"
                  _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)' }}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(errors.password)}>
                <FormLabel fontSize="sm" fontWeight="600" color="ink.700">
                  كلمة المرور
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    borderRadius="lg"
                    borderColor="ink.200"
                    _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)' }}
                  />
                  <InputLeftElement>
                    <IconButton
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword((v) => !v)}
                    />
                  </InputLeftElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

             

              <Button
                type="submit"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="جارٍ تسجيل الدخول…"
              >
                تسجيل الدخول
              </Button>
            </VStack>
          </form>
        </VStack>

        {/* Footer */}
        <VStack spacing={3} pt={10} w="full">
          <Divider borderColor="ink.200" maxW="200px" />
          <HStack spacing={2} color="ink.400">
            <Copyright size={13} strokeWidth={2} />
            <Text fontSize="xs" fontWeight="500" letterSpacing="0.02em">
              {new Date().getFullYear()} — جميع الحقوق محفوظة
            </Text>
          </HStack>
          <HStack spacing={1.5} fontSize="xs" color="ink.400">
            <Text>Développé par</Text>
            <Heart size={12} fill="currentColor" strokeWidth={0} color="#e53e3e" />
            <Text>
              {' '}
              <Text as="span" fontWeight="700" color="ink.600">
               TAHA
              </Text>
              {' '}ET{' '}
              <Text as="span" fontWeight="700" color="ink.600">
                KAIS
              </Text>
            </Text>
          </HStack>
        </VStack>
      </Flex>
    </Flex>
  );
}