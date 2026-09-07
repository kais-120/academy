import { useEffect } from 'react';
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

const EMPTY_FORM = {
  name: '',
  last_name: '',
  cin:'',
  phone: '',
  salary: '',
  status: 'نشط',
  role:""
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
      ["نشط", "في إجازة", "غير نشط"],
      'حالة غير صالحة.'
    )
    .required('الحالة مطلوبة.'),

  role: Yup.string()
    .oneOf(
      [
        'كاتب(ة)',
  'محاسب(ة)',
  'سائق',
  'عامل(ة) نظافة',
  'عون أمن',
      ],
      'الدور غير صالح.'
    )
    .required('الدور مطلوب.'),
});

export default function EmployFormModal({
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

    enableReinitialize: true,

    onSubmit: async (values) => {
      await onSubmit({
        ...values,
        salary: Number(values.salary),
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (person) {
        formik.setValues({
          ...EMPTY_FORM,
          ...person,
          salary: person.salary ?? '',
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode
          ? `Modifier — ${person.last_name} ${person.name}`
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
              value={formik.values.role}
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
                w="3.2rem"
                color="ink.400"
                fontSize="sm"
              >
                دت
              </InputLeftElement>
            </InputGroup>

            <FormErrorMessage>
              {formik.errors.salary}
            </FormErrorMessage>
          </FormControl>

          {/* Status */}
            <FormControl
              isInvalid={
                formik.touched.status &&
                Boolean(formik.errors.status)
              }
            >
              <FormLabel fontSize="sm">
                Statut
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