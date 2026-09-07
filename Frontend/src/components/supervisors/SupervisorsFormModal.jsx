import { useEffect, useState } from 'react';
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Button,
  InputGroup,
  InputRightElement,
  InputLeftElement,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormModal from '../common/FormModal';

const ADMIN_ROLE = 'مقتصد';

const EMPTY_FORM = {
  name: '',
  last_name: '',
  phone: '',
  cin: '',
  salary: '',
  role: '',
  status: 'actif',
  email: '',
  password: '',
};

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('الاسم مطلوب.'),

  last_name: Yup.string()
    .trim()
    .required('اللقب مطلوب.'),

  phone: Yup.string()
    .trim()
    .required('رقم الهاتف مطلوب.')
    .matches(/^\d{8}$/, 'يجب أن يتكون رقم الهاتف من 8 أرقام.'),
 cin: Yup.string()
    .trim()
    .required('رقم بطاقة التعريف مطلوب.')
    .matches(/^\d{8}$/, 'يجب أن يتكون رقم بطاقة التعريف من 8 أرقام.'),
    
  salary: Yup.number()
    .typeError('الراتب يجب أن يكون رقمًا.')
    .positive('الراتب يجب أن يكون موجبًا.')
    .required('الراتب مطلوب.'),

  status: Yup.string()
    .oneOf(
      ['نشط', 'في إجازة', 'غير نشط'],
      'حالة غير صالحة.'
    )
    .required('الحالة مطلوبة.'),

  role: Yup.string()
    .oneOf(
      [
        'قيم الساحة',
  'مراقب الدراسة',
  'مسؤول الانضباط',
        'مسؤول التسيير',
        ADMIN_ROLE,
      ],
      'الدور غير صالح.'
    )
    .required('الدور مطلوب.'),

  email: Yup.string()
    .when('role', {
      is: ADMIN_ROLE,
      then: (schema) =>
        schema
          .trim()
          .email('البريد الإلكتروني غير صالح.')
          .required('البريد الإلكتروني مطلوب.'),
      otherwise: (schema) => schema.strip(),
    }),

  password: Yup.string()
    .when(['role', '$isEditMode'], {
      is: (role, isEditMode) => role === ADMIN_ROLE && !isEditMode,
      then: (schema) =>
        schema
          .min(6, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.')
          .required('كلمة المرور مطلوبة.'),
      otherwise: (schema) => schema.strip(),
    }),
});

export default function SupervisorsFormModal({
  isOpen,
  onClose,
  onSubmit,
  person = null,
  isSaving = false,
  entityLabel,
  roleFieldKey,
  roleFieldLabel,
  roleOptions,
  showStatus = true,
  statusOptions = [],
  cinError
}) {
  const isEditMode = Boolean(person);

  const formik = useFormik({
    initialValues: EMPTY_FORM,
    validationSchema,
    validationContext: { isEditMode },

    enableReinitialize: true,

    onSubmit: async (values) => {
      const payload = {
        ...values,
        salary: Number(values.salary),
      };

      if (values.role !== ADMIN_ROLE) {
        delete payload.email;
        delete payload.password;
      } else if (isEditMode && !payload.password) {
        delete payload.password;
      }

      await onSubmit(payload);
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (person) {
        formik.setValues({
          ...EMPTY_FORM,
          ...person,
          salary: person.salary ?? '',
          password: '',
        });
      } else {
        formik.resetForm({
          values: {
            ...EMPTY_FORM,
            status: statusOptions[0] || 'actif',
          },
        });
      }
    }
  }, [isOpen, person]);

  const isAdminRole = formik.values.role === ADMIN_ROLE;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode
          ? `تعديل — ${person.last_name} ${person.name}`
          : `اضافة ${entityLabel}`
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
  إلغاء
</Button>

<Button
  onClick={formik.handleSubmit}
  isLoading={isSaving}
  loadingText="جارٍ الحفظ…"
>
  {isEditMode
    ? 'حفظ التعديلات'
    : 'إضافة'}
</Button>
        </>
      }
      size="lg"
    >
      <form dir='rtl' onSubmit={formik.handleSubmit} noValidate>
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={4}
        >

          <FormControl
            isInvalid={
              (formik.touched.cin && Boolean(formik.errors.cin) || cinError)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              رقم بطاقة التعريف
            </FormLabel>

            <Input
              name="cin"
              value={formik.values.cin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="12345678"
            />

            <FormErrorMessage>
              {formik.errors.cin || cinError && "رقم بطاقة التعريف مستعمل"}
            </FormErrorMessage>
          </FormControl>
          
          {/* Nom */}
          <FormControl
            isInvalid={
              formik.touched.name && Boolean(formik.errors.name)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              الاسم
            </FormLabel>

            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="محمد"
            />

            <FormErrorMessage>
              {formik.errors.name}
            </FormErrorMessage>
          </FormControl>

          {/* Prénom */}
          <FormControl
            isInvalid={
              formik.touched.last_name &&
              Boolean(formik.errors.last_name)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              اللقب
            </FormLabel>

            <Input
              name="last_name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="علي"
            />

            <FormErrorMessage>
              {formik.errors.last_name}
            </FormErrorMessage>
          </FormControl>

          {/* Téléphone */}
          <FormControl
            isInvalid={
              formik.touched.phone &&
              Boolean(formik.errors.phone)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
               رقم الهاتف
            </FormLabel>

            <Input
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="20123456"
            />

            <FormErrorMessage>
              {formik.errors.phone}
            </FormErrorMessage>
          </FormControl>

          {/* Role / matière */}
          <FormControl
          isInvalid={
              formik.touched.role &&
              Boolean(formik.errors.role)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              وظيفة
            </FormLabel>

            <Select
              name="role"
              placeholder={`اختر الوظيفة`}
              value={formik.values.role || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
          sx={{ textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem', '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' } }}

            >
              {roleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {formik.errors.role}
            </FormErrorMessage>
          </FormControl>

          {/* Salaire */}
          <FormControl
            isInvalid={
              formik.touched.salary &&
              Boolean(formik.errors.salary)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              الراتب
            </FormLabel>

            <InputGroup>
              <Input
                type="number"
                min="0"
                name="salary"
                value={formik.values.salary}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="1200"
                dir="ltr"
                textAlign="right"
              />
              <InputLeftElement
                textAlign="left"
                w="3.2rem"
                color="ink.400"
                fontSize="sm">دت
                </InputLeftElement>
              
            </InputGroup>

            <FormErrorMessage>
              {formik.errors.salary}
            </FormErrorMessage>
          </FormControl>

          {/* Email — only for مسؤول الإدارة */}
          {isAdminRole && (
            <FormControl
              isInvalid={
                formik.touched.email && Boolean(formik.errors.email)
              }
              isRequired
            >
              <FormLabel fontSize="sm">
                البريد الإلكتروني
              </FormLabel>

              <Input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="example@domain.com"
                dir="ltr"
                textAlign="right"
              />

              <FormErrorMessage>
                {formik.errors.email}
              </FormErrorMessage>
            </FormControl>
          )}

          {/* Password — only for مسؤول الإدارة */}
          {isAdminRole && (
            <FormControl
              isInvalid={
                formik.touched.password &&
                Boolean(formik.errors.password)
              }
              isRequired={!isEditMode}
            >
              <FormLabel fontSize="sm">
                كلمة المرور
              </FormLabel>

              <Input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={
                  isEditMode ? 'اتركه فارغًا لعدم التغيير' : '••••••••'
                }
                dir="ltr"
                textAlign="right"
              />

              <FormErrorMessage>
                {formik.errors.password}
              </FormErrorMessage>
            </FormControl>
          )}

          {/* Status */}
            <FormControl
              isInvalid={
                formik.touched.status &&
                Boolean(formik.errors.status)
              }
            >
              <FormLabel fontSize="sm">
                الحالة
              </FormLabel>

              <Select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>

              <FormErrorMessage>
                {formik.errors.status}
              </FormErrorMessage>
            </FormControl>
          
        </SimpleGrid>
      </form>
    </FormModal>
  );
}