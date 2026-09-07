import { useState } from 'react';
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
  VStack,
  Icon,
} from '@chakra-ui/react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import FormModal from '../common/FormModal';
import { paiements } from '../../data/school';

// ---------------------------------------------------------------------------
// شعب الباكالوريا — مواد + معلوم تسجيل (بيانات وهمية مؤقتة)
// ---------------------------------------------------------------------------

const BAC_TRACKS = [
  {
    key: 'علوم تجريبية',
    price: 850,
    matieres: ['الرياضيات', 'الفيزياء', 'علوم الحياة والأرض', 'العربية', 'الفرنسية', 'الإنجليزية', 'الإعلامية', 'الفلسفة'],
  },
  {
    key: 'رياضيات',
    price: 950,
    matieres: ['الرياضيات', 'الفيزياء', 'علوم الحياة والأرض', 'العربية', 'الفرنسية', 'الإنجليزية', 'الإعلامية', 'الفلسفة'],
  },
  {
    key: 'تكنولوجية',
    price: 880,
    matieres: ['الرياضيات', 'الفيزياء', 'التكنولوجيا / العلوم التقنية', 'الإعلامية', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  },
  {
    key: 'إعلامية',
    price: 900,
    matieres: ['الرياضيات', 'الخوارزميات والبرمجة', 'الإعلامية / TIC', 'الفيزياء', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  },
  {
    key: 'اقتصاد وتصرف',
    price: 750,
    matieres: ['الاقتصاد', 'التصرف', 'الرياضيات', 'التاريخ والجغرافيا', 'الإعلامية', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  },
  {
    key: 'آداب',
    price: 700,
    matieres: ['العربية', 'الفلسفة', 'التاريخ والجغرافيا', 'الفرنسية', 'الإنجليزية', 'الإعلامية'],
  },
];

const sxSelectRtl = {
  textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem',
  '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' },
};

const EMPTY_FORM = {
  track: '',
  name: '',
  last_name: '',
  father_name: '',
  mother_name: '',
  father_phone: '',
  mother_phone: '',
  gender: 'ولد',
  birthday: '',
  address: '',
  payment_type: '',
};

const bacStudentSchema = Yup.object({
  track: Yup.string().required('اختر الشعبة أولاً.'),

  name: Yup.string().trim().required('الاسم مطلوب.'),
  last_name: Yup.string().trim().required('اللقب مطلوب.'),
  father_name: Yup.string().trim(),
  mother_name: Yup.string().trim(),

  father_phone: Yup.string()
    .matches(/^\d[\d\s]{6,}$/, 'رقم هاتف الأب غير صالح.')
    .nullable(),
  mother_phone: Yup.string()
    .matches(/^\d[\d\s]{6,}$/, 'رقم هاتف الأم غير صالح.')
    .nullable(),

  payment_type: Yup.string().trim().required('طريقة الدفع مطلوبة.'),
});

export default function BacStudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving = false,
}) {
  // step: 'select' -> اختيار الشعبة | 'form' -> بيانات التلميذ
  const [step, setStep] = useState('select');

  const handleModalClose = (resetForm) => {
    setStep('select'); // reset the wizard for next time it's opened
    resetForm();
    onClose();
  };

  return (
    <Formik
      initialValues={EMPTY_FORM}
      validationSchema={bacStudentSchema}
      onSubmit={(values, helpers) => {
        const trackData = BAC_TRACKS.find((t) => t.key === values.track);
        onSubmit(
          {
            ...values,
            classe: `باكالوريا - ${values.track}`,
            matieres: trackData?.matieres ?? [],
            price: trackData?.price ?? 0,
          },
          helpers
        );
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
        const selectedTrack = BAC_TRACKS.find((t) => t.key === values.track);

        const handleNext = () => {
          if (!values.track) return;
          setStep('form');
        };

        const handleBack = () => setStep('select');

        const handleSubmitClick = async () => {
          const validationErrors = await validateForm();
          if (Object.keys(validationErrors).length > 0) {
            setTouched(
              Object.keys(validationErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
            );
            return;
          }
          handleSubmit();
        };

        return (
          <FormModal
            isOpen={isOpen}
            onClose={() => handleModalClose(resetForm)}
            title={
              step === 'select'
                ? 'تسجيل تلميذ — اختر الشعبة'
                : `تسجيل تلميذ — ${selectedTrack?.key} (${selectedTrack?.price} د.ت)`
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
                    onClick={handleSubmitClick}
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
                // ---------- الخطوة 1: اختيار الشعبة عبر Cards ----------
                <Box>
                  <Text fontWeight="600" mb={3}>اختر الشعبة</Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                    {BAC_TRACKS.map((t) => {
                      const isSelected = values.track === t.key;
                      return (
                        <Box
                          key={t.key}
                          onClick={() => setFieldValue('track', t.key)}
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
                          <HStack justify="space-between" mb={2}>
                            <Heading size="sm">{t.key}</Heading>
                            {isSelected && <Icon as={CheckCircle2} color="purple.500" boxSize={5} />}
                          </HStack>

                          <Wrap spacing={1} mb={2}>
                            {t.matieres.map((m) => (
                              <WrapItem key={m}>
                                <Badge fontSize="0.65rem" borderRadius="full" px={2} bg="ink.100" color="ink.700">
                                  {m}
                                </Badge>
                              </WrapItem>
                            ))}
                          </Wrap>

                          <Text fontSize="sm" fontWeight="700" color="purple.600">
                            {t.price} د.ت
                          </Text>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                  {touched.track && errors.track && (
                    <Text color="red.500" fontSize="sm" mt={2}>{errors.track}</Text>
                  )}
                </Box>
              ) : (
                // ---------- الخطوة 2: بيانات التلميذ الشخصية فقط ----------
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

                  <FormControl>
                    <FormLabel fontSize="sm">اسم الأب</FormLabel>
                    <Input name="father_name" value={values.father_name} onChange={handleChange} placeholder="كريم علي" />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">اسم الأم</FormLabel>
                    <Input name="mother_name" value={values.mother_name} onChange={handleChange} placeholder="أمل التونسي" />
                  </FormControl>

                  <FormControl isInvalid={touched.father_phone && errors.father_phone}>
                    <FormLabel fontSize="sm">رقم هاتف الأب</FormLabel>
                    <Input name="father_phone" value={values.father_phone} onChange={handleChange} placeholder="632 145 20" />
                    <FormErrorMessage>{errors.father_phone}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={touched.mother_phone && errors.mother_phone}>
                    <FormLabel fontSize="sm">رقم هاتف الأم</FormLabel>
                    <Input name="mother_phone" value={values.mother_phone} onChange={handleChange} placeholder="411 987 22" />
                    <FormErrorMessage>{errors.mother_phone}</FormErrorMessage>
                  </FormControl>

        

    

            

                  <FormControl isInvalid={touched.payment_type && errors.payment_type} isRequired>
                    <FormLabel fontSize="sm">طريقة الدفع</FormLabel>
                    <Select
                      name="payment_type"
                      placeholder="اختر طريقة الدفع"
                      value={values.payment_type}
                      onChange={handleChange}
                      sx={sxSelectRtl}
                    >
                      {paiements.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.payment_type}</FormErrorMessage>
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