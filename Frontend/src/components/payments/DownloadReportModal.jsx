import { useState } from 'react';
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
  Select,
  RadioGroup,
  Radio,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FileText, FileSpreadsheet } from 'lucide-react';

const YEARS = [2024, 2025, 2026];
const MONTHS = [
  { value: '01', label: 'جانفي' },
  { value: '02', label: 'فيفري' },
  { value: '03', label: 'مارس' },
  { value: '04', label: 'أفريل' },
  { value: '05', label: 'ماي' },
  { value: '06', label: 'جوان' },
  { value: '07', label: 'جويلية' },
  { value: '08', label: 'أوت' },
  { value: '09', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
];

export default function DownloadReportModal({ isOpen, onClose, onSubmit }) {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState('all');
  const [type, setType] = useState('pdf');

  const handleConfirm = () => {
    onSubmit({ year, month, type });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent dir="rtl">
        <ModalHeader>تحميل التقرير</ModalHeader>
        <ModalCloseButton
  insetInlineStart="3"
  insetInlineEnd="auto"
/>
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isDisabled={month === 'all'}>
              <FormLabel fontSize="sm">السنة</FormLabel>
              <Select value={year} onChange={(e) => setYear(e.target.value)} 
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
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">الشهر</FormLabel>
              <Select value={month} onChange={(e) => setMonth(e.target.value)} 
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
                <option value="all">كل الفترة (جميع الأشهر)</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">صيغة الملف</FormLabel>
              <RadioGroup value={type} onChange={setType}>
                <Stack direction="row" spacing={5}>
                  <Radio value="pdf">
                    <Stack direction="row" align="center" spacing={1.5}>
                      <FileText size={16} />
                      <Text fontSize="sm">PDF</Text>
                    </Stack>
                  </Radio>
                  <Radio value="excel">
                    <Stack direction="row" align="center" spacing={1.5}>
                      <FileSpreadsheet size={16} />
                      <Text fontSize="sm">Excel</Text>
                    </Stack>
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" ml={3} onClick={onClose}>إلغاء</Button>
          <Button colorScheme="green" onClick={handleConfirm}>تحميل</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}