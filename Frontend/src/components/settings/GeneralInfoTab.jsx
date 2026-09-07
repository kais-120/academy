import { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Save } from 'lucide-react';
import { schoolInfo as initialSchoolInfo } from '../../data/school';
import { AxiosToken } from '../../api/Api';

export default function GeneralInfoTab() {
  const toast = useToast();

  const [form, setForm] = useState(initialSchoolInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const setField = (field) => (e) => {
    setForm((f) => ({
      ...f,
      [field]: e.target.value,
    }));
  };

  // =========================
  // Get school information
  // =========================
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        setIsLoading(true);

        const response = await AxiosToken.get('/school-info');

        if (response.data?.schoolInfo) {
          setForm(response.data.schoolInfo?.[0]);
        }
      } catch (error) {
        console.error('Get school info error:', error);

        toast({
          title: 'خطأ',
          description: 'تعذر تحميل معلومات المدرسة',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolInfo();
  }, []);

  // =========================
  // Update school information
  // =========================
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await AxiosToken.put('/school-info', form);

      if (response.data?.schoolInfo) {
        setForm(response.data.schoolInfo);
      }

      toast({
        title: 'تم حفظ المعلومات بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Update school info error:', error);

      toast({
        title: 'خطأ',
        description:
          error.response?.data?.message ||
          'تعذر حفظ معلومات المدرسة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      dir="rtl"
      bg="white"
      borderRadius="2xl"
      p={6}
      border="1px solid"
      borderColor="ink.200"
      boxShadow="card"
    >
      <Text
        fontFamily="heading"
        fontWeight="700"
        color="ink.900"
        mb={1}
      >
        معلومات المدرسة
      </Text>

      <Text fontSize="sm" color="ink.500" mb={5}>
        تظهر هذه المعلومات في لوحة التحكم والوثائق الرسمية.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl gridColumn={{ md: 'span 2' }}>
          <FormLabel fontSize="sm">اسم المدرسة</FormLabel>
          <Input
            value={form.name || ''}
            onChange={setField('name')}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl gridColumn={{ md: 'span 2' }}>
          <FormLabel fontSize="sm">العنوان</FormLabel>
          <Input
            value={form.address || ''}
            onChange={setField('address')}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm">رقم الهاتف</FormLabel>
          <Input
            value={form.phone || ''}
            onChange={setField('phone')}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm">البريد الإلكتروني</FormLabel>
          <Input
            type="email"
            value={form.email || ''}
            onChange={setField('email')}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm">المدير</FormLabel>
          <Input
            value={form.director || ''}
            onChange={setField('director')}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm">السنة الدراسية</FormLabel>
          <Input
            value={form.academic_year || ''}
            onChange={setField('academic_year')}
            isDisabled={isLoading}
          />
        </FormControl>
      </SimpleGrid>

      <HStack justify="flex-start" mt={6}>
        <Button
          rightIcon={<Save size={16} />}
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="جاري الحفظ..."
          isDisabled={isLoading}
        >
          حفظ التعديلات
        </Button>
      </HStack>
    </Box>
  );
}