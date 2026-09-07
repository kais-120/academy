import { useEffect } from 'react';
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  InputLeftElement,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import FormModal from '../common/FormModal';

const EMPTY_FORM = {
  label: '',
  amount: '',
  amountYearly: '',
};

const validationSchema = Yup.object({
  label: Yup.string()
    .trim()
    .required('اسم المنطقة مطلوب.'),

  amount: Yup.number()
    .typeError('يجب أن يكون المعلوم رقمًا.')
    .positive('يجب أن يكون المعلوم أكبر من صفر.')
    .required('المعلوم مطلوب.'),
  amountYearly: Yup.number()
    .typeError('يجب أن يكون المعلوم رقمًا.')
    .positive('يجب أن يكون المعلوم أكبر من صفر.')
    .required('المعلوم مطلوب.'),
});

export default function TransportFeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  fee = null,
  isSaving = false,
}) {
  const isEditMode = Boolean(fee);

  const formik = useFormik({
    initialValues: EMPTY_FORM,
    validationSchema,

    onSubmit: (values) => {
      onSubmit({
        ...values,
        amount: Number(values.amount),
        amount_yearly: Number(values.amountYearly),
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      formik.setValues(
        fee
          ? {
              label: fee.zone ?? '',
              amount: fee.amount ?? '',
            }
          : EMPTY_FORM
      );

      formik.setTouched({});
      formik.setErrors({});
    }
  }, [isOpen, fee]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'تعديل المنطقة' : 'إضافة منطقة'}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            إلغاء
          </Button>

          <Button
            onClick={formik.handleSubmit}
            isLoading={isSaving}
            loadingText="جاري الحفظ..."
          >
            {isEditMode ? 'حفظ' : 'إضافة'}
          </Button>
        </>
      }
      size="md"
    >
      <form dir='rtl' onSubmit={formik.handleSubmit} noValidate>
        <SimpleGrid columns={1} spacing={4}>

          {/* المنطقة */}
          <FormControl
            isInvalid={
              formik.touched.label &&
              Boolean(formik.errors.label)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              اسم المنطقة
            </FormLabel>

            <Input
              name="label"
              value={formik.values.label}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="المنطقة 5"
            />

            <FormErrorMessage>
              {formik.errors.label}
            </FormErrorMessage>
          </FormControl>

          {/* المعلوم */}
          <FormControl
            isInvalid={
              formik.touched.amount &&
              Boolean(formik.errors.amount)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              المعلوم الشهري
            </FormLabel>

            <InputGroup>
              <Input
                name="amount"
                type="number"
                min="0"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="100"
                dir="ltr"
                textAlign={"right"}
              />
              
              <InputLeftElement
                w="3.2rem"
                color="ink.400"
                fontSize="sm"
              >
                د.ت
              </InputLeftElement>
            </InputGroup>

            <FormErrorMessage>
              {formik.errors.amount}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={
              formik.touched.amountYearly &&
              Boolean(formik.errors.amountYearly)
            }
            isRequired
          >
            <FormLabel fontSize="sm">
              المعلوم السنوي
            </FormLabel>

            <InputGroup>
              <Input
                name="amountYearly"
                type="number"
                min="0"
                value={formik.values.amountYearly}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="100"
                dir="ltr"
                textAlign={"right"}
              />
              
              <InputLeftElement
                w="3.2rem"
                color="ink.400"
                fontSize="sm"
              >
                د.ت
              </InputLeftElement>
            </InputGroup>

            <FormErrorMessage>
              {formik.errors.amountYearly}
            </FormErrorMessage>
          </FormControl>


        </SimpleGrid>
      </form>
    </FormModal>
  );
}