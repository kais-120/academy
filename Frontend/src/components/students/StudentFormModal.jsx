import { useState } from 'react';
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

const getTracksForLevel = (level) => TRACKS_BY_LEVEL[level] || null;

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

const MATIERES_BY_SHOBA = {
  'رياضيات': ['الرياضيات', 'الفيزياء', 'علوم الحياة والأرض', 'العربية', 'الفرنسية', 'الإنجليزية', 'الإعلامية', 'الفلسفة'],
  'علوم تجريبية': ['الرياضيات', 'الفيزياء', 'علوم الحياة والأرض', 'العربية', 'الفرنسية', 'الإنجليزية', 'الإعلامية', 'الفلسفة'],
  'تكنولوجية': ['الرياضيات', 'الفيزياء', 'التكنولوجيا / العلوم التقنية', 'الإعلامية', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'إعلامية': ['الرياضيات', 'الخوارزميات والبرمجة', 'الإعلامية / TIC', 'الفيزياء', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'اقتصاد وتصرف': ['الاقتصاد', 'التصرف', 'الرياضيات', 'التاريخ والجغرافيا', 'الإعلامية', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'آداب': ['العربية', 'الفلسفة', 'التاريخ والجغرافيا', 'الفرنسية', 'الإنجليزية', 'الإعلامية'],
};

const getMatieresOptions = (stage, level, section) => {
  if (stage === 'ابتدائي') return MATIERES_PRIMAIRE;
  if (stage === 'اعدادي') return MATIERES_IIDADI;
  if (stage === 'ثانوي') {
    if (level === 'السنة الأولى ثانوي') return MATIERES_THANAWI_1;
    if (section) return MATIERES_BY_SHOBA[section] || null;
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
  last_name: '',
  father_name: '',
  mother_name: '',
  father_phone: '',
  mother_phone: '',
  stage: '',
  level: '',
  section: '',
  materials: [],
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

  stage: Yup.string()
    .trim()
    .required('المرحلة مطلوبة.'),

  level: Yup.string()
    .trim()
    .required('المستوى مطلوب.'),

  section: Yup.string()
    .trim()
    .when('level', {
      is: (level) => Boolean(getTracksForLevel(level)),
      then: (schema) => schema.required('الشعبة مطلوبة.'),
      otherwise: (schema) => schema.notRequired(),
    }),

  materials: Yup.array()
    .of(Yup.string())
    .min(1, 'اختر مادة واحدة على الأقل.'),
});

export default function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  student = null,
  isSaving = false,
  setUniqueIsError = () => {},
}) {
  const isEditMode = Boolean(student);

  const mapStudentToFormValues = (s) => ({
    name: s.name ?? '',
    last_name: s.last_name ?? '',
    father_name: s.father_name ?? '',
    mother_name: s.mother_name ?? '',
    father_phone: s.father_phone ?? '',
    mother_phone: s.mother_phone ?? '',
    stage: s.stage ?? '',
    level: s.level ?? '',
    section: s.section ?? '',
    materials: s.materials ?? [],
  });

  const initialValues = student ? mapStudentToFormValues(student) : EMPTY_FORM;

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
        const tracks = getTracksForLevel(values.level);
        const availableLevels = STAGE_LEVELS[values.stage] || [];
        const materialsOptions = getMatieresOptions(values.stage, values.level, values.section);

        const handleStageChange = (e) => {
          const stage = e.target.value;
          setFieldValue('stage', stage);
          setFieldValue('level', '');
          setFieldValue('section', '');
          setFieldValue('materials', []);
        };

        const handleLevelChange = (e) => {
          const level = e.target.value;
          setFieldValue('level', level);
          setFieldValue('section', '');
          setFieldValue('materials', []);
        };

        const handleSectionChange = (e) => {
          const section = e.target.value;
          setFieldValue('section', section);
          setFieldValue('materials', []);
        };

        return (
          <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={
              isEditMode
                ? `تعديل التلميذ — ${student.name} ${student.last_name}`
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

                {/* Father */}
                <FormControl>
                  <FormLabel fontSize="sm">اسم الأب</FormLabel>
                  <Input
                    name="father_name"
                    value={values.father_name}
                    onChange={handleChange}
                    placeholder="كريم علي"
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

                {/* المرحلة (stage) */}
                <FormControl isInvalid={touched.stage && errors.stage} isRequired>
                  <FormLabel fontSize="sm">المرحلة</FormLabel>
                  <Select
                    name="stage"
                    placeholder="اختر المرحلة"
                    value={values.stage}
                    onChange={handleStageChange}
                    sx={sxSelectRtl}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.stage}</FormErrorMessage>
                </FormControl>

                {/* المستوى (level) */}
                <FormControl isInvalid={touched.level && errors.level} isRequired isDisabled={!values.stage}>
                  <FormLabel fontSize="sm">المستوى</FormLabel>
                  <Select
                    name="level"
                    placeholder="اختر المستوى"
                    value={values.level}
                    onChange={handleLevelChange}
                    isDisabled={!values.stage}
                    sx={sxSelectRtl}
                  >
                    {availableLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.level}</FormErrorMessage>
                </FormControl>

                {/* الشعبة (section) - تظهر فقط بداية من السنة الثانية ثانوي */}
                {tracks && (
                  <FormControl isInvalid={touched.section && errors.section} isRequired>
                    <FormLabel fontSize="sm">الشعبة</FormLabel>
                    <Select
                      name="section"
                      placeholder="اختر الشعبة"
                      value={values.section}
                      onChange={handleSectionChange}
                      sx={sxSelectRtl}
                    >
                      {tracks.map((section) => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.section}</FormErrorMessage>
                  </FormControl>
                )}

                {/* المواد الدراسية (materials) */}
                {materialsOptions && (
                  <FormControl
                    isInvalid={touched.materials && errors.materials}
                    isRequired
                    gridColumn={{ md: '1 / -1' }}
                  >
                    <FormLabel fontSize="sm">المواد</FormLabel>
                    <CheckboxGroup
                      value={values.materials}
                      onChange={(vals) => setFieldValue('materials', vals)}
                    >
                      <Wrap spacing={4}>
                        {materialsOptions.map((materiel) => (
                          <WrapItem key={materiel}>
                            <Checkbox value={materiel}>{materiel}</Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                    <FormErrorMessage>{errors.materials}</FormErrorMessage>
                  </FormControl>
                )}

              </SimpleGrid>
            </Form>
          </FormModal>
        );
      }}
    </Formik>
  );
}