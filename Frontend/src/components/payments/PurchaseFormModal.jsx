import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
  Text,
} from '@chakra-ui/react';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { AxiosToken } from '../../api/Api';

const validationSchema = Yup.object({
  item: Yup.string()
    .trim()
    .required('وصف المشتري مطلوب')
    .min(2, 'يجب أن يحتوي الوصف على حرفين على الأقل'),
  quantity: Yup.number()
    .typeError('الكمية يجب أن تكون رقماً')
    .required('الكمية مطلوبة')
    .integer('الكمية يجب أن تكون عدداً صحيحاً')
    .min(1, 'الكمية يجب أن تكون أكبر من 0'),
  unit_price: Yup.number()
    .typeError('سعر الوحدة يجب أن يكون رقماً')
    .required('سعر الوحدة مطلوب')
    .min(0, 'سعر الوحدة لا يمكن أن يكون سالباً'),
});

export default function PurchaseFormModal({ isOpen, onClose, onSubmit, isSaving, setIsSaving }) {
  const formik = useFormik({
    initialValues: {
      item: '',
      quantity: 1,
      unit_price: '',
    },
    validationSchema,
     onSubmit: (values) => {
    const total_price =
      Number(values.quantity) * Number(values.unit_price);

    onSubmit({
      item: values.item,
      quantity: Number(values.quantity),
      unit_price: Number(values.unit_price),
      total_price,
    });
  },
});

  const total = (Number(formik.values.quantity) || 0) * (Number(formik.values.unit_price) || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="xl" dir="rtl">
        <ModalHeader>إضافة مشترى جديد</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit} noValidate>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={formik.touched.item && !!formik.errors.item}>
                <FormLabel fontSize="sm">وصف المشترى</FormLabel>
                <Input
                  name="item"
                  value={formik.values.item}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="مثال: أدوات مكتبية"
                />
                <FormErrorMessage>{formik.errors.item}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={formik.touched.quantity && !!formik.errors.quantity}>
                <FormLabel fontSize="sm">الكمية</FormLabel>
                <NumberInput
                  min={1}
                  value={formik.values.quantity}
                  onChange={(valueString) => formik.setFieldValue('quantity', valueString)}
                  onBlur={() => formik.setFieldTouched('quantity', true)}
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>{formik.errors.quantity}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={formik.touched.unit_price && !!formik.errors.unit_price}>
                <FormLabel fontSize="sm">سعر الوحدة (د.ت)</FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={formik.values.unit_price}
                  onChange={(valueString) => formik.setFieldValue('unit_price', valueString)}
                  onBlur={() => formik.setFieldTouched('unit_price', true)}
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>{formik.errors.unit_price}</FormErrorMessage>
              </FormControl>

              <Text fontSize="sm" color="gray.600">
                السعر الإجمالي: {total.toFixed(2)} د.ت
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>إلغاء</Button>
            <Button type="submit" colorScheme="green" isLoading={isSaving}>حفظ</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}