import { useEffect, useMemo, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Button,
  Textarea,
} from '@chakra-ui/react';
import FormModal from '../common/FormModal';
import { AxiosToken } from '../../api/Api';

const SENSE_OPTIONS = [
  { value: 'دخول', label: 'دخول' },
  { value: 'خروج', label: 'خروج' },
];

const EMPTY_VALUES = {
  date: '',
  time: '',
  sense: '',
  justification: '',
  teacher_id: '',
  noticed: '',
};

const validationSchema = Yup.object({
  date: Yup.string().required('التاريخ مطلوب.'),
  time: Yup.string()
    .required('الوقت مطلوب.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'وقت غير صالح.'),
  sense: Yup.string()
    .required('الاتجاه مطلوب.')
    .oneOf(SENSE_OPTIONS.map((o) => o.value), 'اتجاه غير صالح.'),
  justification: Yup.string().required('التبرير مطلوب.'),
  teacher_id: Yup.number()
    .typeError('المعلّم مطلوب.')
    .required('المعلّم مطلوب.')
    .integer('معرّف المعلّم غير صالح.'),
  noticed: Yup.string().max(255, 'يجب ألا يتجاوز 255 حرفًا.'),
});

/**
 * نافذة نموذج لتسجيل حضور/انصراف المعلّمين (دخول أو خروج).
 * تتوافق الحقول مع ما ينتظره المتحكم createScoring.
 */
export default function TeacherScoringFormModal({
  isOpen,
  onClose,
  onSubmit,
  scoring = null,
  isSaving = false,
}) {
  const isEditMode = Boolean(scoring);
  const [teachers,setTeachers] = useState([])

    useEffect(() => {
    const loadPeople = async () => {
      try {
        const data = await AxiosToken.get("/teacher");
  
        setTeachers(data.data.teachers);
      } catch (error) {
        console.error('Error loading personnel:', error);
    };
    }
    loadPeople();
  }, [isSaving]);

  const initialValues = useMemo(
    () => ({
      ...EMPTY_VALUES,
      ...(scoring
        ? {
            ...scoring,
            justification:
              scoring.justification === true || scoring.justification === false
                ? String(scoring.justification)
                : scoring.justification ?? '',
          }
        : {}),
    }),
    [scoring]
  );


const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    await onSubmit({
      ...values,
      teacher_id: Number(values.teacher_id),
      justification: values.justification === 'true',
    });

    resetForm();
  } finally {
    setSubmitting(false);
  }
};




  function generateTimeSlots(startHour = 8, endHour = 18, stepMinutes = 30) {
  const slots = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === endHour && m > 0) break; // stop exactly at 18:00
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}
const timeSlots = useMemo(() => generateTimeSlots(8, 18, 30), []);

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, submitForm }) => (
        <FormModal
          isOpen={isOpen}
          onClose={onClose}
          title={isEditMode ? 'تعديل التسجيل' : 'تسجيل حضور — معلّم'}
          footer={
            <>
              <Button variant="outline" onClick={onClose}>إلغاء</Button>
              <Button onClick={submitForm} isLoading={isSaving} loadingText="جارٍ الحفظ…">
                {isEditMode ? 'حفظ' : 'إضافة'}
              </Button>
            </>
          }
          size="lg"
        >
          <Form noValidate dir='rtl'>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={Boolean(touched.date && errors.date)} isRequired>
                <FormLabel fontSize="sm">التاريخ</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={values.date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <FormErrorMessage>{errors.date}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(touched.time && errors.time)} isRequired>
  <FormLabel fontSize="sm">الوقت</FormLabel>
  <Select
    name="time"
    placeholder="اختر الوقت"
    value={values.time}
    onChange={handleChange}
    onBlur={handleBlur}
     sx={{
          textAlign: 'right',
          paddingRight: '1rem',
          paddingLeft: '2rem',
          '& + div': {
            insetInlineEnd: 'auto',
            insetInlineStart: '0.5rem',
          },
        }}
  >
    {timeSlots.map((t) => (
      <option key={t} value={t}>{t}</option>
    ))}
  </Select>
  <FormErrorMessage>{errors.time}</FormErrorMessage>
</FormControl>

              <FormControl isInvalid={Boolean(touched.teacher_id && errors.teacher_id)} isRequired>
                <FormLabel fontSize="sm">المعلّم</FormLabel>
                <Select
                  name="teacher_id"
                  placeholder="اختر"
                  value={values.teacher_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                   sx={{
          textAlign: 'right',
          paddingRight: '1rem',
          paddingLeft: '2rem',
          '& + div': {
            insetInlineEnd: 'auto',
            insetInlineStart: '0.5rem',
          },
        }}
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.last_name} - {t.cin}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.teacher_id}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(touched.sense && errors.sense)} isRequired>
                <FormLabel fontSize="sm">الاتجاه</FormLabel>
                <Select
                  name="sense"
                  placeholder="اختر"
                  value={values.sense}
                  onChange={handleChange}
                  onBlur={handleBlur}
                   sx={{
          textAlign: 'right',
          paddingRight: '1rem',
          paddingLeft: '2rem',
          '& + div': {
            insetInlineEnd: 'auto',
            insetInlineStart: '0.5rem',
          },
        }}
                >
                  {SENSE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.sense}</FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={Boolean(touched.justification && errors.justification)}
                isRequired
                gridColumn={{ md: 'span 2' }}
              >
                <FormLabel fontSize="sm">التبرير</FormLabel>
                <Select
                  name="justification"
                  placeholder="اختر"
                  value={values.justification}
                  onChange={handleChange}
                  onBlur={handleBlur}
                   sx={{
          textAlign: 'right',
          paddingRight: '1rem',
          paddingLeft: '2rem',
          '& + div': {
            insetInlineEnd: 'auto',
            insetInlineStart: '0.5rem',
          },
        }}
                >
                  <option value="true">مُبرَّر</option>
                  <option value="false">غير مُبرَّر</option>
                </Select>
                <FormErrorMessage>{errors.justification}</FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={Boolean(touched.noticed && errors.noticed)}
                gridColumn={{ md: 'span 2' }}
              >
                <FormLabel fontSize="sm">ملاحظة</FormLabel>
                <Field
                  as={Textarea}
                  name="noticed"
                  value={values.noticed}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="اختياري…"
                  rows={3}
                />
                <FormErrorMessage>{errors.noticed}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </Form>
        </FormModal>
      )}
    </Formik>
  );
}