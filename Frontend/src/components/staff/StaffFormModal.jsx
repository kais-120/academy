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
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  InputLeftElement,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormModal from '../common/FormModal';

const EMPTY_FORM = {
  name: '',
  last_name: '',
  cin:"",
  phone: '',
  matieres: [],
  price_by_hour: '',
  status: 'نشط',
};

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('الاسم مطلوب.'),

  last_name: Yup.string()
    .trim()
    .required('اللقب مطلوب.'),

    cin: Yup.string()
    .trim()
    .required('رقم بطاقة التعريف مطلوب.')
    .matches(/^\d{8}$/, 'يجب أن يتكون رقم بطاقة التعريف من 8 أرقام.'),

  phone: Yup.string()
    .trim()
    .required('رقم الهاتف مطلوب.')
    .matches(/^\d{8}$/, 'يجب أن يتكون رقم الهاتف من 8 أرقام.'),

  matieres: Yup.array()
    .of(Yup.string())
    .min(1, 'يرجى اختيار مادة واحدة على الأقل.')
    .required('المواد مطلوبة.'),

  price_by_hour: Yup.number()
    .typeError('يجب أن يكون سعر الساعة رقمًا.')
    .positive('يجب أن يكون سعر الساعة أكبر من صفر.')
    .required('سعر الساعة مطلوب.'),

  status: Yup.string()
    .oneOf(
      ['نشط', 'في إجازة', 'غير نشط'],
      'الحالة غير صالحة.'
    )
    .required('الحالة مطلوبة.'),
});

export default function StaffFormModal({
  isOpen,
  onClose,
  onSubmit,
  person = null,
  isSaving = false,
  entityLabel,
  roleFieldLabel,
  roleOptions,
  showStatus = false,
  statusOptions = [],
  cinError
}) {
  const isEditMode = Boolean(person);
  console.log(person)

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
       const personMatieres = person.subject;

formik.setValues({
  ...EMPTY_FORM,
  ...person,
  price_by_hour: person.price_by_hour ?? '',
  matieres: Array.isArray(personMatieres)
    ? personMatieres.map((matiere) => matiere.label)
    : [],
});
      } else {
        formik.resetForm({
          values: {
            ...EMPTY_FORM,
            status: statusOptions[0] || 'نشط',
          },
        });
      }
    }
  }, [isOpen, person]);

  const selectedMatieres = formik.values.matieres || [];

  const removeMatiere = (opt) => {
    formik.setFieldValue(
      'matieres',
      selectedMatieres.filter((v) => v !== opt)
    );
  };

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
            الغاء
          </Button>

          <Button
            onClick={formik.handleSubmit}
            isLoading={isSaving}
            loadingText="Enregistrement…"
          >
            {isEditMode
              ? 'حفظ التغييرات'
              : 'أضف المعلم '}
          </Button>
        </>
      }
      size="lg"
    >
      <form onSubmit={formik.handleSubmit} noValidate>
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

          {/* Matières — multi-select */}
          <FormControl
            isInvalid={
              formik.touched.matieres &&
              Boolean(formik.errors.matieres)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              {roleFieldLabel || 'Matières'}
            </FormLabel>

            <Menu closeOnSelect={false}>
              <MenuButton

                as={Button}
                variant="outline"
                fontWeight="normal"
                w="100%"
                textAlign="right"
                onBlur={() => formik.setFieldTouched('matieres', true)}
              >
                {selectedMatieres.length
                  ? `${selectedMatieres.length} تم الاختيار`
                  : 'اختر المواد'}
              </MenuButton>

              <MenuList maxH="240px" overflowY="auto" zIndex="popover">
                <MenuOptionGroup
                  type="checkbox"
                  value={selectedMatieres}
                  onChange={(vals) =>
                    formik.setFieldValue('matieres', vals)
                  }
                >
                  {roleOptions.map((opt) => (
                    <MenuItemOption key={opt} value={opt}>
                      {opt}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>

            {selectedMatieres.length > 0 && (
              <Wrap mt={2}>
                {selectedMatieres.map((opt) => (
                  <WrapItem key={opt}>
                    <Tag size="sm" borderRadius="full">
                      <TagLabel>{opt}</TagLabel>
                      <TagCloseButton onClick={() => removeMatiere(opt)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}

            <FormErrorMessage>
              {formik.errors.matieres}
            </FormErrorMessage>
          </FormControl>


          {/* Salaire */}
          <FormControl
            isInvalid={
              formik.touched.price_by_hour &&
              Boolean(formik.errors.price_by_hour)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              سعر الساعة
            </FormLabel>

            <InputGroup>
              <Input
                type="number"
                min="0"
                name="price_by_hour"
                value={formik.values.price_by_hour}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="15"
                textAlign={"right"}
                dir='ltr'
              />

              <InputLeftElement
                w="3.2rem"
                color="ink.400"
                fontSize="sm"
                dir='ltr'
              >
                DT
              </InputLeftElement>
            </InputGroup>

            <FormErrorMessage>
              {formik.errors.price_by_hour}
            </FormErrorMessage>
          </FormControl>

          {/* Status */}
          {showStatus && (
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
          )}
        </SimpleGrid>
      </form>
    </FormModal>
  );
}