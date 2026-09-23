import { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Button,
  Text,
} from '@chakra-ui/react';

const EMPTY = { label: '', start_date: '', end_date: '' };

export default function SchoolYearFormModal({
  isOpen,
  onClose,
  onSubmit,
  schoolYear,
  isSaving,
}) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setForm(
      schoolYear
        ? {
            label: schoolYear.label,
            start_date: schoolYear.start_date,
            end_date: schoolYear.end_date,
          }
        : EMPTY
    );
  }, [isOpen, schoolYear]);

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.label.trim() || !form.start_date || !form.end_date) {
      setError('جميع الحقول مطلوبة');
      return;
    }
    if (form.end_date < form.start_date) {
      setError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    setError('');
    try {
      await onSubmit({ ...form, label: form.label.trim() });
      onClose();
    } catch {
      // the parent already showed a toast; keep the modal open
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent dir="rtl" borderRadius="2xl">
        <ModalHeader>
          {schoolYear ? 'تعديل السنة الدراسية' : 'إضافة سنة دراسية'}
        </ModalHeader>
        <ModalCloseButton left={4} right="auto" />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>التسمية</FormLabel>
              <Input
                placeholder="2026-2027"
                value={form.label}
                onChange={setField('label')}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>تاريخ البداية</FormLabel>
              <Input
                type="date"
                value={form.start_date}
                onChange={setField('start_date')}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>تاريخ النهاية</FormLabel>
              <Input
                type="date"
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={setField('end_date')}
              />
            </FormControl>

            {error && (
              <Text fontSize="sm" color="danger.500">
                {error}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} isDisabled={isSaving}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            حفظ
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}