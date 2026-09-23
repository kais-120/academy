import { useState, useEffect } from 'react';
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Button,
  Box,
  Text,
  Heading,
  Wrap,
  WrapItem,
  Badge,
  HStack,
  Icon,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import FormModal from '../common/FormModal';
import { AxiosToken } from '../../api/Api';

const sxSelectRtl = {
  textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem',
  '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' },
};

const EMPTY_FORM = {
  track: '',
  name: '',
  last_name: '',
  phone: '',
  stage: 'ثانوي',
  level: 'باكالوريا',
  section: '',
};

const bacStudentSchema = Yup.object({
  track: Yup.string().required('اختر الشعبة أولاً.'),

  name: Yup.string().trim().required('الاسم مطلوب.'),
  last_name: Yup.string().trim().required('اللقب مطلوب.'),

  phone: Yup.string()
    .matches(/^\d[\d\s]{7}$/, 'رقم هاتف  غير صالح.')
    .required('رقم الهاتف مطلوب.'),
});

export default function BacStudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving = false,
}) {
  const [step, setStep] = useState('select');
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleModalClose = (resetForm) => {
    setStep('select');
    resetForm();
    onClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await AxiosToken.get('/package');
        setPackages(response.data.packages ?? response.data.package ?? response.data ?? []);
      } catch (err) {
        console.error('error fetching packages', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const findPackage = (id) => packages.find((p) => String(p.id) === String(id));

  return (
    <Formik
      initialValues={EMPTY_FORM}
      validationSchema={bacStudentSchema}
      onSubmit={async (values, helpers) => {
        const pkg = findPackage(values.track);
        try {
          await onSubmit(
            {
              ...values,
               level: 'باكالوريا',
              package_id: pkg?.id,
              section: pkg?.section ?? '',
              matieres: (pkg?.packageSubject ?? []).map((s) => s.name),
              price: Number(pkg?.amount ?? 0),
            },
            helpers
          );

          setStep('select');
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        setFieldValue,
        validateForm,
        setTouched,
        resetForm,
      }) => {
        const selectedPackage = findPackage(values.track);

        const handleNext = () => {
          if (!values.track) return;
          setStep('form');
        };

        const handleBack = () => setStep('select');

        return (
          <FormModal
            isOpen={isOpen}
            onClose={() => handleModalClose(resetForm)}
            title={
              step === 'select'
                ? 'تسجيل تلميذ — اختر الباقة'
                : `تسجيل تلميذ — ${selectedPackage?.name ?? ''} (${Number(selectedPackage?.amount ?? 0)} د.ت)`
            }
            size="2xl"
            footer={
              step === 'select' ? (
                <HStack spacing={2} w="full">
                  <Button variant="outline" onClick={() => handleModalClose(resetForm)}>
                    إلغاء
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="purple"
                    onClick={handleNext}
                    isDisabled={!values.track}
                  >
                    التالي
                  </Button>
                </HStack>
              ) : (
                <HStack spacing={2} w="full">
                  <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={handleBack}>
                    رجوع
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="green"
                    onClick={async () => {
                      const validationErrors = await validateForm();
                      if (Object.keys(validationErrors).length > 0) {
                        setTouched(
                          Object.keys(validationErrors).reduce((acc, key) => {
                            acc[key] = true;
                            return acc;
                          }, {})
                        );
                        return;
                      }
                      handleSubmit();
                    }}
                    isLoading={isSaving}
                    loadingText="حفظ…"
                  >
                    أضف التلميذ
                  </Button>
                </HStack>
              )
            }
          >
            <Form id="bac-student-form" dir="rtl">
              {step === 'select' ? (
                <Box>
                  <Text fontWeight="600" mb={3}>اختر الباقة</Text>

                  {isLoading ? (
                    <Center py={8}>
                      <Spinner color="purple.500" />
                    </Center>
                  ) : packages.length === 0 ? (
                    <Text color="ink.500">لا توجد باقات.</Text>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                      {packages.map((t) => {
                        const isSelected = String(values.track) === String(t.id);
                        return (
                          <Box
                            key={t.id}
                            onClick={() => setFieldValue('track', String(t.id))}
                            cursor="pointer"
                            borderWidth="2px"
                            borderColor={isSelected ? 'purple.400' : 'ink.200'}
                            bg={isSelected ? 'purple.50' : 'white'}
                            borderRadius="lg"
                            px={4}
                            py={3}
                            transition="all 0.15s"
                            _hover={{ borderColor: 'purple.300' }}
                          >
                            <HStack justify="space-between" mb={1}>
                              <Heading size="sm">{t.name}</Heading>
                              {isSelected && <Icon as={CheckCircle2} color="purple.500" boxSize={5} />}
                            </HStack>

                            <Text fontSize="xs" color="ink.500" mb={2}>{t.section}</Text>

                            <Wrap spacing={1} mb={2}>
                              {(t.packageSubject ?? []).map((m) => (
                                <WrapItem key={m.id}>
                                  <Badge fontSize="0.65rem" borderRadius="full" px={2} bg="ink.100" color="ink.700">
                                    {m.name}
                                  </Badge>
                                </WrapItem>
                              ))}
                            </Wrap>

                            <Text fontSize="sm" fontWeight="700" color="purple.600">
                              {Number(t.amount)} د.ت
                            </Text>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  )}

                  {touched.track && errors.track && (
                    <Text color="red.500" fontSize="sm" mt={2}>{errors.track}</Text>
                  )}
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isInvalid={touched.name && errors.name} isRequired>
                    <FormLabel fontSize="sm">الاسم</FormLabel>
                    <Input name="name" value={values.name} onChange={handleChange} placeholder="محمد" />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={touched.last_name && errors.last_name} isRequired>
                    <FormLabel fontSize="sm">اللقب</FormLabel>
                    <Input name="last_name" value={values.last_name} onChange={handleChange} placeholder="علي" />
                    <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={touched.phone && errors.phone}>
                    <FormLabel fontSize="sm">رقم هاتف </FormLabel>
                    <Input name="phone" value={values.phone} onChange={handleChange} placeholder="632 145 20" />
                    <FormErrorMessage>{errors.phone}</FormErrorMessage>
                  </FormControl>

                  
                </SimpleGrid>
              )}
            </Form>
          </FormModal>
        );
      }}
    </Formik>
  );
}