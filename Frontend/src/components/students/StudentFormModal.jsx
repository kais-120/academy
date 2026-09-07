import { useEffect, useState } from 'react';
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Button,
  HStack,
  Wrap,
  WrapItem,
  Checkbox,
  CheckboxGroup,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import FormModal from '../common/FormModal';
import { paiements } from '../../data/school';
import { AxiosToken } from '../../api/Api';

// ---------------------------------------------------------------------------
// المراحل والمستويات
// ---------------------------------------------------------------------------

const STAGES = ['ابتدائي', 'اعدادي', 'ثانوي'];

const STAGE_LEVELS = {
  'ابتدائي': [
    'السنة الأولى ابتدائي',
    'السنة الثانية ابتدائي',
    'السنة الثالثة ابتدائي',
    'السنة الرابعة ابتدائي',
    'السنة الخامسة ابتدائي',
    'السنة السادسة ابتدائي',
  ],
  'اعدادي': [
    'السنة السابعة اعدادي',
    'السنة الثامنة اعدادي',
    'السنة التاسعة اعدادي',
  ],
  'ثانوي': [
    'السنة الأولى ثانوي',
    'السنة الثانية ثانوي',
    'السنة الثالثة ثانوي',
    'باكالوريا',
  ],
};

// الشعب المتاحة حسب المستوى (فقط بداية من السنة الثانية ثانوي)
const TRACKS_BY_LEVEL = {
  'السنة الثانية ثانوي': ['علوم تجريبية', 'آداب', 'إعلامية', 'اقتصاد وتصرف'],
  'السنة الثالثة ثانوي': ['علوم تجريبية', 'آداب', 'إعلامية', 'اقتصاد وتصرف', 'رياضيات', 'تكنولوجية'],
  'باكالوريا': ['علوم تجريبية', 'آداب', 'إعلامية', 'اقتصاد وتصرف', 'رياضيات', 'تكنولوجية'],
};

const getTracksForLevel = (niveau) => TRACKS_BY_LEVEL[niveau] || null;

const findStageForLevel = (niveau) => {
  const entry = Object.entries(STAGE_LEVELS).find(([, levelsArr]) => levelsArr.includes(niveau));
  return entry ? entry[0] : '';
};

// classe النهائية المخزّنة = "المستوى" أو "المستوى - الشعبة" عند وجود شعبة
const buildClasse = (niveau, shoba) => {
  if (!niveau) return '';
  return shoba ? `${niveau} - ${shoba}` : niveau;
};

// عكس العملية عند التعديل: نحاول استخراج المستوى والشعبة من classe المخزّنة
const parseClasse = (classe) => {
  if (!classe) return { marhala: '', niveau: '', shoba: '' };
  const [niveauPart, shobaPart] = classe.split(' - ').map((s) => s?.trim());
  const marhala = findStageForLevel(niveauPart);
  return { marhala, niveau: niveauPart || '', shoba: shobaPart || '' };
};

// ---------------------------------------------------------------------------
// المواد الدراسية حسب المرحلة / المستوى / الشعبة
// ---------------------------------------------------------------------------

const MATIERES_PRIMAIRE = [
  'العربية', 'الفرنسية', 'الإنجليزية', 'الرياضيات', 'الإيقاظ العلمي', 'التربية الإسلامية',
];

const MATIERES_IIDADI = [
  'العربية', 'الفرنسية', 'الإنجليزية', 'الرياضيات', 'العلوم الفيزيائية', 'علوم الحياة والأرض',
  'التاريخ الجغرافيا', 'التربية الإسلامية', 'التربية المدنية', 'الإعلامية', 'التكنولوجيا',
];

const MATIERES_THANAWI_1 = [
  'العربية', 'الفرنسية', 'الإنجليزية', 'الرياضيات', 'الفيزياء', 'علوم الحياة والأرض',
  'التاريخ', 'الجغرافيا', 'الإعلامية', 'التكنولوجيا',
];

// نفس الشعب المستعملة في TRACKS_BY_LEVEL أعلاه (بداية من السنة الثانية ثانوي إلى الباكالوريا)
const MATIERES_BY_SHOBA = {
  'رياضيات': ['الرياضيات', 'الفيزياء', 'علوم الحياة والأرض', 'العربية', 'الفرنسية', 'الإنجليزية', 'الإعلامية', 'الفلسفة'],
  'علوم تجريبية': ['الرياضيات', 'الفيزياء', 'علوم الحياة والأرض', 'العربية', 'الفرنسية', 'الإنجليزية', 'الإعلامية', 'الفلسفة'],
  'تكنولوجية': ['الرياضيات', 'الفيزياء', 'التكنولوجيا / العلوم التقنية', 'الإعلامية', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'إعلامية': ['الرياضيات', 'الخوارزميات والبرمجة', 'الإعلامية / TIC', 'الفيزياء', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'اقتصاد وتصرف': ['الاقتصاد', 'التصرف', 'الرياضيات', 'التاريخ والجغرافيا', 'الإعلامية', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'آداب': ['العربية', 'الفلسفة', 'التاريخ والجغرافيا', 'الفرنسية', 'الإنجليزية', 'الإعلامية'],
};

const getMatieresOptions = (marhala, niveau, shoba) => {
  if (marhala === 'ابتدائي') return MATIERES_PRIMAIRE;
  if (marhala === 'اعدادي') return MATIERES_IIDADI;
  if (marhala === 'ثانوي') {
    if (niveau === 'السنة الأولى ثانوي') return MATIERES_THANAWI_1;
    if (shoba) return MATIERES_BY_SHOBA[shoba] || null;
    return null; // بانتظار اختيار الشعبة
  }
  return null;
};

const sxSelectRtl = {
  textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem',
  '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' },
};

const EMPTY_FORM = {
  name: '',
  unique_id: '',
  last_name: '',
  father_name: '',
  mother_name: '',
  father_phone: '',
  mother_phone: '',
  gender: 'ولد',
  birthday: '',
  marhala: '',
  niveau: '',
  shoba: '',
  matieres: [],
  classe: '',
  address: '',
  payment_type: '',
  transport: 'false',
  is_take_uniform: 'false',
  is_take_book: 'false',
  zone_id: '',
};

const studentSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('الاسم مطلوب.'),

  last_name: Yup.string()
    .trim()
    .required('اللقب مطلوب.'),

  father_name: Yup.string()
    .trim(),

  mother_name: Yup.string()
    .trim(),

  father_phone: Yup.string()
    .matches(
      /^\d[\d\s]{6,}$/,
      'رقم هاتف الأب غير صالح.'
    )
    .nullable(),

  mother_phone: Yup.string()
    .matches(
      /^\d[\d\s]{6,}$/,
      'رقم هاتف الأم غير صالح.'
    )
    .nullable(),

  marhala: Yup.string()
    .trim()
    .required('المرحلة مطلوبة.'),

  niveau: Yup.string()
    .trim()
    .required('المستوى مطلوب.'),

  shoba: Yup.string()
    .trim()
    .when('niveau', {
      is: (niveau) => Boolean(getTracksForLevel(niveau)),
      then: (schema) => schema.required('الشعبة مطلوبة.'),
      otherwise: (schema) => schema.notRequired(),
    }),

  matieres: Yup.array()
    .of(Yup.string())
    .min(1, 'اختر مادة واحدة على الأقل.'),

  classe: Yup.string()
    .trim()
    .required('القسم مطلوب.'),

  payment_type: Yup.string()
    .trim()
    .required('طريقة الدفع مطلوب.'),

});

export default function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  student = null,
  isSaving = false,
  uniqueIsError = false,
  setUniqueIsError = () => {},
  lockedFatherName = null,      // NEW
  offerPositionLabel = null,    // NEW
  offerPromotionLabel = null,   // NEW — "خصم 50%" أو "مجاني بالكامل" عند تلميذ العرض الأخير
}) {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AxiosToken.get('/zone');
        setZones(response.data.zones);
      } catch (err) {
        console.error('error', err);
      }
    };
    fetchData();
  }, [isSaving]);

  const isEditMode = Boolean(student);
  const isFatherNameLocked = Boolean(lockedFatherName) && !isEditMode;

  const mapStudentToFormValues = (s) => {
    const { marhala, niveau, shoba } = parseClasse(s.class ?? '');
    return {
      name: s.name ?? '',
      unique_id: s.unique_id ?? '',
      last_name: s.last_name ?? '',
      father_name: s.father_name ?? '',
      mother_name: s.mother_name ?? '',
      father_phone: s.father_phone ?? '',
      mother_phone: s.mother_phone ?? '',
      gender: s.gender ?? 'ولد',
      birthday: s.birthday ? s.birthday.split('T')[0] : '',
      marhala,
      niveau,
      shoba,
      matieres: s.matieres ?? [], // NOTE: assumes backend exposes a `matieres` string array on the student
      classe: s.class ?? '',
      address: s.address ?? '',
      payment_type: s.subscription?.payment_type ?? '',
      transport: s.subscription?.transport ? 'true' : 'false',
      is_take_uniform: s.subscription?.is_take_uniform ? 'true' : 'false',
      is_take_book: s.subscription?.is_take_book ? 'true' : 'false',
      zone_id: s.subscription?.zone?.id ?? '',
    };
  };

  const initialValues = student
    ? mapStudentToFormValues(student)
    : { ...EMPTY_FORM, father_name: lockedFatherName || '' }; // NEW

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={studentSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        setFieldValue,
      }) => {
        const tracks = getTracksForLevel(values.niveau);
        const availableLevels = STAGE_LEVELS[values.marhala] || [];
        const matieresOptions = getMatieresOptions(values.marhala, values.niveau, values.shoba);

        const handleMarhalaChange = (e) => {
          const marhala = e.target.value;
          setFieldValue('marhala', marhala);
          setFieldValue('niveau', '');
          setFieldValue('shoba', '');
          setFieldValue('matieres', []);
          setFieldValue('classe', '');
        };

        const handleNiveauChange = (e) => {
          const niveau = e.target.value;
          setFieldValue('niveau', niveau);
          setFieldValue('shoba', '');
          setFieldValue('matieres', []);
          setFieldValue('classe', buildClasse(niveau, ''));
        };

        const handleShobaChange = (e) => {
          const shoba = e.target.value;
          setFieldValue('shoba', shoba);
          setFieldValue('matieres', []);
          setFieldValue('classe', buildClasse(values.niveau, shoba));
        };

        return (
          <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={
              isEditMode
                ? `تعديل التلميذ — ${student.name} ${student.last_name}`
                : offerPositionLabel
                  ? `إضافة تلميذ — ${offerPositionLabel}` // NEW
                  : 'إضافة تلميذ'
            }
            footer={
              <>
                <Button variant="outline" onClick={onClose} isDisabled={isSaving}>
                  الغاء
                </Button>
                <Button onClick={handleSubmit} isLoading={isSaving} loadingText="حفظ…">
                  {isEditMode ? 'حفظ التغييرات' : 'أضف التلميذ'}
                </Button>
              </>
            }
          >
            <Form id="student-form" dir="rtl">
              {offerPromotionLabel && (
                <Alert status="success" borderRadius="lg" fontSize="sm" mb={4}>
                  <AlertIcon />
                  سيتم تطبيق عرض الإخوة على هذا التلميذ: <b>&nbsp;{offerPromotionLabel}&nbsp;</b>
                </Alert>
              )}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                {/* Name */}
                <FormControl isInvalid={touched.name && errors.name} isRequired>
                  <FormLabel fontSize="sm">الاسم</FormLabel>
                  <Input name="name" value={values.name} onChange={handleChange} placeholder="محمد" />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                {/* Last name */}
                <FormControl isInvalid={touched.last_name && errors.last_name} isRequired>
                  <FormLabel fontSize="sm">اللقب</FormLabel>
                  <Input name="last_name" value={values.last_name} onChange={handleChange} placeholder="علي" />
                  <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                </FormControl>

                {/* Father - locked when coming from an offer session */}
                <FormControl isDisabled={isFatherNameLocked}>
                  <FormLabel fontSize="sm">
                    اسم الأب {isFatherNameLocked && <Badge ml={2} colorScheme="purple">مثبّت من العرض</Badge>}
                  </FormLabel>
                  <Input
                    name="father_name"
                    value={values.father_name}
                    onChange={handleChange}
                    placeholder="كريم علي"
                    isDisabled={isFatherNameLocked}
                  />
                </FormControl>

                {/* Mother */}
                <FormControl>
                  <FormLabel fontSize="sm">اسم الأم</FormLabel>
                  <Input name="mother_name" value={values.mother_name} onChange={handleChange} placeholder="أمل التونسي" />
                </FormControl>

                {/* Father phone */}
                <FormControl isInvalid={touched.father_phone && errors.father_phone}>
                  <FormLabel fontSize="sm">رقم هاتف الأب</FormLabel>
                  <Input name="father_phone" value={values.father_phone} onChange={handleChange} placeholder="632 145 20" />
                  <FormErrorMessage>{errors.father_phone}</FormErrorMessage>
                </FormControl>

                {/* Mother phone */}
                <FormControl isInvalid={touched.mother_phone && errors.mother_phone}>
                  <FormLabel fontSize="sm">رقم هاتف الأم</FormLabel>
                  <Input dir="rtl" name="mother_phone" value={values.mother_phone} onChange={handleChange} placeholder="411 987 22" />
                  <FormErrorMessage>{errors.mother_phone}</FormErrorMessage>
                </FormControl>

                {/* المرحلة */}
                <FormControl isInvalid={touched.marhala && errors.marhala} isRequired>
                  <FormLabel fontSize="sm">المرحلة</FormLabel>
                  <Select
                    name="marhala"
                    placeholder="اختر المرحلة"
                    value={values.marhala}
                    onChange={handleMarhalaChange}
                    sx={sxSelectRtl}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.marhala}</FormErrorMessage>
                </FormControl>

                {/* المستوى */}
                <FormControl isInvalid={touched.niveau && errors.niveau} isRequired isDisabled={!values.marhala}>
                  <FormLabel fontSize="sm">المستوى</FormLabel>
                  <Select
                    name="niveau"
                    placeholder="اختر المستوى"
                    value={values.niveau}
                    onChange={handleNiveauChange}
                    isDisabled={!values.marhala}
                    sx={sxSelectRtl}
                  >
                    {availableLevels.map((niveau) => (
                      <option key={niveau} value={niveau}>{niveau}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.niveau}</FormErrorMessage>
                </FormControl>

                {/* الشعبة - تظهر فقط بداية من السنة الثانية ثانوي */}
                {tracks && (
                  <FormControl isInvalid={touched.shoba && errors.shoba} isRequired>
                    <FormLabel fontSize="sm">الشعبة</FormLabel>
                    <Select
                      name="shoba"
                      placeholder="اختر الشعبة"
                      value={values.shoba}
                      onChange={handleShobaChange}
                      sx={sxSelectRtl}
                    >
                      {tracks.map((shoba) => (
                        <option key={shoba} value={shoba}>{shoba}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.shoba}</FormErrorMessage>
                  </FormControl>
                )}

                {/* المواد الدراسية */}
                {matieresOptions && (
                  <FormControl
                    isInvalid={touched.matieres && errors.matieres}
                    isRequired
                    gridColumn={{ md: '1 / -1' }}
                  >
                    <FormLabel fontSize="sm">المواد</FormLabel>
                    <CheckboxGroup
                      value={values.matieres}
                      onChange={(vals) => setFieldValue('matieres', vals)}
                    >
                      <Wrap spacing={4}>
                        {matieresOptions.map((matiere) => (
                          <WrapItem key={matiere}>
                            <Checkbox value={matiere}>{matiere}</Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                    <FormErrorMessage>{errors.matieres}</FormErrorMessage>
                  </FormControl>
                )}

                {/* Payment */}
                <FormControl isInvalid={touched.payment_type && errors.payment_type} isRequired>
                  <FormLabel fontSize="sm">الدفع</FormLabel>
                  <Select
                    name="payment_type"
                    placeholder="اختر طريق الدفع"
                    value={values.payment_type}
                    onChange={handleChange}
                    sx={sxSelectRtl}
                  >
                    {paiements.map((paiement) => (
                      <option key={paiement} value={paiement}>{paiement}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.payment_type}</FormErrorMessage>
                </FormControl>

              </SimpleGrid>
            </Form>
          </FormModal>
        );
      }}
    </Formik>
  );
}