import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Grid,
  GridItem,
  Flex,
  Text,
  Badge,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  Divider,
  VStack,
  HStack,
  Progress,
  useToast,
  InputLeftElement,
  Skeleton,
} from '@chakra-ui/react';
import {
  Eye,
  EyeOff,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  LogIn,
  Save,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { AxiosToken } from '../api/Api';

/* ---------------------------------------------------------
   Force du mot de passe
--------------------------------------------------------- */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: 'ink.200' };
  let score = 0;
  if (pwd.length >= 6) score += 25;
  if (pwd.length >= 10) score += 25;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
  if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25;

  if (score <= 25) return { score, label: 'ضعيفة', color: 'red.400' };
  if (score <= 50) return { score, label: 'متوسطة', color: 'orange.400' };
  if (score <= 75) return { score, label: 'جيدة', color: 'yellow.500' };
  return { score, label: 'قوية', color: 'green.500' };
}

/* ---------------------------------------------------------
   Card wrapper cohérent avec le style de l'app
--------------------------------------------------------- */
function SectionCard({ title, icon: Icon, children }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="ink.200"
      borderRadius="xl"
      overflow="hidden"
    >
      <Flex
        align="center"
        gap={2}
        px={5}
        py={4}
        borderBottom="1px solid"
        borderColor="ink.100"
      >
        {Icon && <Icon size={16} color="var(--chakra-colors-brand-600)" />}
        <Text fontSize="sm" fontWeight="600" color="ink.700">
          {title}
        </Text>
      </Flex>
      <Box px={5} py={5}>
        {children}
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------
   Schémas de validation
--------------------------------------------------------- */
const infoSchema = Yup.object({
  nom: Yup.string().trim().required('الاسم مطلوب.'),
  prenom: Yup.string().trim().required('اللقب مطلوب.'),
  telephone: Yup.string()
    .matches(/^[0-9+\s]{6,15}$/, 'رقم الهاتف غير صحيح.')
    .nullable()
    .notRequired(),
  email: Yup.string()
    .email('البريد الإلكتروني غير صحيح.')
    .nullable()
    .notRequired(),
});

const pwdSchema = Yup.object({
  ancien: Yup.string().required('أدخل كلمة المرور الحالية.'),
  nouveau: Yup.string()
    .required('أدخل كلمة مرور جديدة.')
    .min(6, 'الحد الأدنى 6 خانات.'),
  confirmation: Yup.string()
    .required('أكد كلمة المرور الجديدة.')
    .oneOf([Yup.ref('nouveau')], 'كلمتا المرور غير متطابقتين.'),
});

/* ---------------------------------------------------------
   Page : الملف الشخصي
--------------------------------------------------------- */
export default function AdminProfile() {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState({
    role: 'مدير',
    lastLogin: '—',
    memberSince: '—',
  });
  const [showPwd, setShowPwd] = useState({ ancien: false, nouveau: false, confirmation: false });

  /* ---------- Formulaire infos personnelles ---------- */
  const infoForm = useFormik({
    initialValues: { nom: '', prenom: '', telephone: '', email: '' },
    validationSchema: infoSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await AxiosToken.put('/auth/profile', values);
        toast({
          title: 'تم حفظ المعلومات',
          description: 'تم تحديث معلوماتك الشخصية بنجاح.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: 'خطأ',
          description:
            err?.response?.data?.message || 'حدث خطأ أثناء الحفظ.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  /* ---------- Formulaire mot de passe ---------- */
  const pwdForm = useFormik({
    initialValues: { ancien: '', nouveau: '', confirmation: '' },
    validationSchema: pwdSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setPasswordError(false)
        await AxiosToken.put('/auth/password', values);
        toast({
          title: 'تم تغيير كلمة المرور',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        resetForm();
      } catch (err) {
        if(err.response.status == 400){
          setPasswordError(true)
        }
        toast({
          title: 'خطأ',
          description:
            err?.response?.data?.errors?.msg || 'تعذر تغيير كلمة المرور.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const strength = getPasswordStrength(pwdForm.values.nouveau);

  /* ---------- Chargement du profil ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await AxiosToken.get('/auth/profile');
        if (!mounted) return;
        const user = data?.user || {};
        infoForm.setValues({
          nom: user.name || '',
          prenom: user.last_name || '',
          telephone: user.telephone || '',
          email: user.email || '',
        });
        setAccountInfo({
          role: user.role || 'مدير',
          lastLogin: data?.lastLogin
            ? new Date(data.lastLogin).toLocaleString('ar-TN')
            : '—',
          memberSince: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('ar-TN')
            : '—',
        });
        setAvatarUrl(user.avatarUrl || '');
      } catch (err) {
        toast({
          title: 'خطأ',
          description: 'تعذر تحميل معلومات الحساب.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Photo ---------- */
  const handlePickPhoto = () => fileInputRef.current?.click();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
      toast({
        title: 'Photo mise à jour',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      // TODO: upload réel -> POST /auth/profile/photo
    };
    reader.readAsDataURL(file);
  };

  const toggleShow = (field) =>
    setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }));

  const fullName =
    `${infoForm.values.prenom || ''} ${infoForm.values.nom || ''}`.trim() ||
    'المدير';

  return (
    <Box dir="rtl">
      <PageHeader
        title="الملف الشخصي"
        subtitle="عدّل معلوماتك الشخصية وإعدادات الأمان الخاصة بحسابك."
      />

      {/* Bandeau identité */}
      <Box
        mt={4}
        mb={6}
        bg="brand.600"
        bgGradient="linear(to-l, brand.600, brand.700)"
        borderRadius="xl"
        px={{ base: 5, md: 8 }}
        py={7}
        position="relative"
        overflow="hidden"
      >
        <Flex
          align="center"
          gap={5}
          direction={{ base: 'column', sm: 'row' }}
          textAlign={{ base: 'center', sm: 'right' }}
        >
          <Box flex="1">
            {loading ? (
              <Skeleton height="24px" width="180px" borderRadius="md" />
            ) : (
              <Text fontSize="xl" fontWeight="700" color="white">
                {fullName}
              </Text>
            )}
            <HStack mt={1} spacing={2} justify={{ base: 'center', sm: 'flex-start' }}>
              <Badge
                bg="whiteAlpha.300"
                color="white"
                borderRadius="full"
                px={3}
                py={0.5}
                fontWeight="500"
              >
                {accountInfo.role}
              </Badge>
              {infoForm.values.email && (
                <HStack spacing={1} color="whiteAlpha.900" fontSize="sm">
                  <Mail size={13} />
                  <Text>{infoForm.values.email}</Text>
                </HStack>
              )}
            </HStack>
          </Box>
        </Flex>
      </Box>

      {/* Contenu principal */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={5}>
        {/* Colonne principale */}
        <GridItem>
          <VStack spacing={5} align="stretch">
            <SectionCard title="المعلومات الشخصية" icon={ShieldCheck}>
              <form onSubmit={infoForm.handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
                    <FormControl
                      isInvalid={infoForm.touched.prenom && !!infoForm.errors.prenom}
                    >
                      <FormLabel fontSize="sm">اللقب</FormLabel>
                      <Input
                        name="prenom"
                        value={infoForm.values.prenom}
                        onChange={infoForm.handleChange}
                        onBlur={infoForm.handleBlur}
                        placeholder="اللقب"
                        borderRadius="lg"
                        isDisabled={loading}
                      />
                      <FormErrorMessage>{infoForm.errors.prenom}</FormErrorMessage>
                    </FormControl>

                    <FormControl
                      isInvalid={infoForm.touched.nom && !!infoForm.errors.nom}
                    >
                      <FormLabel fontSize="sm">الاسم</FormLabel>
                      <Input
                        name="nom"
                        value={infoForm.values.nom}
                        onChange={infoForm.handleChange}
                        onBlur={infoForm.handleBlur}
                        placeholder="الاسم"
                        borderRadius="lg"
                        isDisabled={loading}
                      />
                      <FormErrorMessage>{infoForm.errors.nom}</FormErrorMessage>
                    </FormControl>
                  </Flex>

                  <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
                    <FormControl
                      isInvalid={infoForm.touched.telephone && !!infoForm.errors.telephone}
                    >
                      <FormLabel fontSize="sm">رقم الهاتف</FormLabel>
                      <InputGroup>
                        <Input
                          name="telephone"
                          type="tel"
                          value={infoForm.values.telephone}
                          onChange={infoForm.handleChange}
                          onBlur={infoForm.handleBlur}
                          placeholder="+216 XX XXX XXX"
                          borderRadius="lg"
                          pl={10}
                          dir="ltr"
                          textAlign="right"
                          isDisabled={loading}
                        />
                        <InputLeftElement pointerEvents="none">
                          <Phone size={14} color="var(--chakra-colors-ink-400)" />
                        </InputLeftElement>
                      </InputGroup>
                      <FormErrorMessage>{infoForm.errors.telephone}</FormErrorMessage>
                    </FormControl>

                    <FormControl
                      isInvalid={infoForm.touched.email && !!infoForm.errors.email}
                    >
                      <FormLabel fontSize="sm">البريد الإلكتروني</FormLabel>
                      <InputGroup>
                        <Input
                          name="email"
                          type="email"
                          value={infoForm.values.email}
                          onChange={infoForm.handleChange}
                          onBlur={infoForm.handleBlur}
                          placeholder="admin@alamal.tn"
                          borderRadius="lg"
                          pl={10}
                          dir="ltr"
                          textAlign="right"
                          isDisabled={loading}
                        />
                        <InputLeftElement pointerEvents="none">
                          <Mail size={14} color="var(--chakra-colors-ink-400)" />
                        </InputLeftElement>
                      </InputGroup>
                      <FormErrorMessage>{infoForm.errors.email}</FormErrorMessage>
                    </FormControl>
                  </Flex>

                  <Flex justify="flex-end" pt={1}>
                    <Button
                      type="submit"
                      leftIcon={<Save size={15} />}
                      bg="brand.600"
                      color="white"
                      _hover={{ bg: 'brand.700' }}
                      borderRadius="lg"
                      isLoading={infoForm.isSubmitting}
                      isDisabled={loading}
                    >
                      حفظ التغييرات
                    </Button>
                  </Flex>
                </VStack>
              </form>
            </SectionCard>

            <SectionCard title="الأمان — تغيير كلمة المرور" icon={ShieldCheck}>
              <form onSubmit={pwdForm.handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl
                    isInvalid={(pwdForm.touched.ancien && !!pwdForm.errors.ancien) || passwordError}
                  >
                    <FormLabel fontSize="sm">كلمة المرور الحالية</FormLabel>
                    <InputGroup>
                      <Input
                        name="ancien"
                        type={showPwd.ancien ? 'text' : 'password'}
                        value={pwdForm.values.ancien}
                        onChange={pwdForm.handleChange}
                        onBlur={pwdForm.handleBlur}
                        placeholder="••••••••"
                        borderRadius="lg"
                      />
                      <InputLeftElement>
                        <IconButton
                          aria-label="إظهار كلمة المرور"
                          icon={showPwd.ancien ? <EyeOff size={16} /> : <Eye size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleShow('ancien')}
                        />
                      </InputLeftElement>
                    </InputGroup>
                    <FormErrorMessage>{pwdForm.errors.ancien
                      || passwordError && "كلمة المرور الحالية غير صحيحة." 
                      }</FormErrorMessage>
                  </FormControl>

                  <Divider />

                  <FormControl
                    isInvalid={pwdForm.touched.nouveau && !!pwdForm.errors.nouveau}
                  >
                    <FormLabel fontSize="sm">كلمة المرور الجديدة</FormLabel>
                    <InputGroup>
                      <Input
                        name="nouveau"
                        type={showPwd.nouveau ? 'text' : 'password'}
                        value={pwdForm.values.nouveau}
                        onChange={pwdForm.handleChange}
                        onBlur={pwdForm.handleBlur}
                        placeholder="••••••••"
                        borderRadius="lg"
                      />
                      <InputLeftElement>
                        <IconButton
                          aria-label="إظهار كلمة المرور"
                          icon={showPwd.nouveau ? <EyeOff size={16} /> : <Eye size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleShow('nouveau')}
                        />
                      </InputLeftElement>
                    </InputGroup>
                    <FormErrorMessage>{pwdForm.errors.nouveau}</FormErrorMessage>
                    {pwdForm.values.nouveau && (
                      <HStack mt={2} spacing={2}>
                        <Progress
                          value={strength.score}
                          size="xs"
                          borderRadius="full"
                          flex="1"
                          sx={{ '& > div': { background: strength.color } }}
                        />
                        <Text fontSize="xs" color="ink.500" minW="fit-content">
                          {strength.label}
                        </Text>
                      </HStack>
                    )}
                  </FormControl>

                  <FormControl
                    isInvalid={pwdForm.touched.confirmation && !!pwdForm.errors.confirmation}
                  >
                    <FormLabel fontSize="sm">تأكيد كلمة المرور</FormLabel>
                    <InputGroup>
                      <Input
                        name="confirmation"
                        type={showPwd.confirmation ? 'text' : 'password'}
                        value={pwdForm.values.confirmation}
                        onChange={pwdForm.handleChange}
                        onBlur={pwdForm.handleBlur}
                        placeholder="••••••••"
                        borderRadius="lg"
                      />
                      <InputLeftElement>
                        <IconButton
                          aria-label="إظهار كلمة المرور"
                          icon={showPwd.confirmation ? <EyeOff size={16} /> : <Eye size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleShow('confirmation')}
                        />
                      </InputLeftElement>
                    </InputGroup>
                    <FormErrorMessage>{pwdForm.errors.confirmation}</FormErrorMessage>
                  </FormControl>

                  <Flex justify="flex-end" pt={1}>
                    <Button
                      type="submit"
                      leftIcon={<Save size={15} />}
                      bg="brand.600"
                      color="white"
                      _hover={{ bg: 'brand.700' }}
                      borderRadius="lg"
                      isLoading={pwdForm.isSubmitting}
                    >
                      تحديث كلمة المرور
                    </Button>
                  </Flex>
                </VStack>
              </form>
            </SectionCard>
          </VStack>
        </GridItem>

        {/* Colonne latérale */}
        <GridItem>
          <SectionCard title="معلومات الحساب" icon={Clock}>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <HStack spacing={2} color="ink.500" fontSize="sm">
                  <LogIn size={14} />
                  <Text>آخر تسجيل دخول</Text>
                </HStack>
                {loading ? (
                  <Skeleton height="16px" width="90px" borderRadius="md" />
                ) : (
                  <Text fontSize="sm" fontWeight="600" color="ink.700">
                    {accountInfo.lastLogin}
                  </Text>
                )}
              </Flex>

              <Divider />

              <Flex justify="space-between" align="center">
                <HStack spacing={2} color="ink.500" fontSize="sm">
                  <Clock size={14} />
                  <Text>تاريخ الانضمام</Text>
                </HStack>
                {loading ? (
                  <Skeleton height="16px" width="90px" borderRadius="md" />
                ) : (
                  <Text fontSize="sm" fontWeight="600" color="ink.700">
                    {accountInfo.memberSince}
                  </Text>
                )}
              </Flex>

              <Divider />

              <Flex justify="space-between" align="center">
                <Text color="ink.500" fontSize="sm">
                  الصلاحية
                </Text>
                <Badge
                  colorScheme="green"
                  borderRadius="full"
                  px={3}
                  py={0.5}
                  fontWeight="500"
                >
                  {accountInfo.role}
                </Badge>
              </Flex>
            </VStack>
          </SectionCard>
        </GridItem>
      </Grid>
    </Box>
  );
}