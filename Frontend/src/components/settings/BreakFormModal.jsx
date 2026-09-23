import { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';

export const BREAK_TYPES = [
  { value: 'summer', label: 'عطلة صيفية', colorScheme: 'orange' },
  { value: 'exceptional', label: 'عطلة استثنائية', colorScheme: 'purple' },
];

const emptyForm = { label: '', start_date: '', end_date: '', type: 'exceptional' };

export default function BreakFormModal({
  isOpen,
  onClose,
  onSubmit,
  schoolBreak,
  schoolYear,
  isSaving,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setForm(
      schoolBreak
        ? {
            label: schoolBreak.label,
            start_date: schoolBreak.start_date,
            end_date: schoolBreak.end_date,
            type: schoolBreak.type,
          }
        : emptyForm
    );
  }, [isOpen, schoolBreak]);

  const validate = () => {
    const e = {};
    if (!form.label.trim()) e.label = 'اسم العطلة مطلوب';
    if (!form.start_date) e.start_date = 'تاريخ البداية مطلوب';
    if (!form.end_date) e.end_date = 'تاريخ النهاية مطلوب';
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      e.end_date = 'يجب أن يكون تاريخ النهاية بعد تاريخ البداية';
    }
    if (schoolYear && form.start_date && form.start_date < schoolYear.start_date) {
      e.start_date = 'التاريخ خارج نطاق السنة الدراسية';
    }
    if (schoolYear && form.end_date && form.end_date > schoolYear.end_date) {
      e.end_date = 'التاريخ خارج نطاق السنة الدراسية';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await onSubmit({ ...form, school_year_id: schoolYear.id });
      onClose();
    } catch {
      // parent shows a toast and keeps the modal open
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent dir="rtl">
        <ModalHeader>{schoolBreak ? 'تعديل العطلة' : 'إضافة عطلة'}</ModalHeader>
        <ModalCloseButton left={4} right="auto" />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.label}>
              <FormLabel>اسم العطلة</FormLabel>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="مثال: عطلة الصيف"
              />
              <FormErrorMessage>{errors.label}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>نوع العطلة</FormLabel>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
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
                {BREAK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isInvalid={!!errors.start_date}>
              <FormLabel>تاريخ البداية</FormLabel>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
              <FormErrorMessage>{errors.start_date}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.end_date}>
              <FormLabel>تاريخ النهاية</FormLabel>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
              <FormErrorMessage>{errors.end_date}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            إلغاء
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={isSaving}>
            حفظ
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}