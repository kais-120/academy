import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  Button,
  HStack,
  Badge,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { Save } from 'lucide-react';
import { AxiosToken } from '../../api/Api';

// booksDisabled = true => معاليم الكتب غير متاحة لهذا المستوى
const DEFAULT_LEVELS = [
  { id: 'prescolaire', label: 'تحضيري (Préscolaire)', daycare: 0, books: 0, booksDisabled: false },
  { id: 'annee1', label: 'السنة الأولى', daycare: 0, books: 0, booksDisabled: false },
  { id: 'annee2', label: 'السنة الثانية', daycare: 0, books: 0, booksDisabled: false },
  { id: 'annee3', label: 'السنة الثالثة', daycare: 0, books: 0, booksDisabled: false },
  { id: 'annee4', label: 'السنة الرابعة', daycare: 0, books: 0, booksDisabled: false },
  { id: 'annee5', label: 'السنة الخامسة', daycare: 0, books: 0, booksDisabled: true },
  { id: 'annee6', label: 'السنة السادسة', daycare: 0, books: 0, booksDisabled: true },
];

export default function DaycareBooksFeesTab() {
  const [levels, setLevels] = useState([]);
  const toast = useToast();

  useEffect(() => {
     const fetchData = async () => {
       try {
         const response = await AxiosToken.get('/daycare-books-fee');
         setLevels(response.data.data)
 
       } catch (error) {
         console.error('Error:', error);
 
         toast({
           title: 'حدث خطأ أثناء جلب المعاليم',
           status: 'error',
           duration: 3000,
           isClosable: true,
         });
       }
     };
 
     fetchData();
   }, []);

  const handleChange = (id, field, value) => {
    setLevels((prev) =>
      prev.map((lvl) =>
        lvl.id === id ? { ...lvl, [field]: Number(value) || 0 } : lvl
      )
    );
  };

  const getTotal = (lvl) => {
  const daycare = Number(lvl.daycare) || 0;
  const books = Number(lvl.books) || 0;

  return daycare + (lvl.books_disabled ? 0 : books);
};

 const handleSave = async () => {
  try {
    const payload = {
      levels: levels.map((lvl) => ({
        level_id: lvl.level_id,
        daycare: Number(lvl.daycare) || 0,
        books: Number(lvl.books) || 0,
        books_disabled: Boolean(lvl.books_disabled),
      })),
    };

    const response = await AxiosToken.put(
      '/daycare-books-fee',
      payload
    );

    // Update state with the values returned by backend
    setLevels(response.data.data);

    toast({
      title: 'تم الحفظ بنجاح',
      description: 'تم تحديث معاليم الميدعة والكتب لكل المستويات.',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  } catch (error) {
    console.error('Error saving fees:', error);

    toast({
      title: 'حدث خطأ أثناء الحفظ',
      description:
        error.response?.data?.message ||
        'تعذر تحديث المعاليم',
      status: 'error',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  }
};
  return (
    <Card
      bg="white"
      border="1px solid"
      borderColor="ink.200"
      borderRadius="xl"
      shadow="none"
    >
      <CardHeader pb={0}>
        <Heading size="sm" color="ink.800">
          معاليم الميدعة والكتب حسب المستوى
        </Heading>
        <Text fontSize="sm" color="ink.500" mt={1}>
          حدد معاليم الميدعة والكتب لكل مستوى من التحضيري إلى السنة السادسة.
        </Text>
      </CardHeader>

      <CardBody>
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th color="ink.500">المستوى</Th>
                <Th color="ink.500" isNumeric>معاليم الميدعة (د.ت)</Th>
                <Th color="ink.500" isNumeric>معاليم الكتب (د.ت)</Th>
                <Th color="ink.500" isNumeric>المجموع</Th>
              </Tr>
            </Thead>
            <Tbody>
              {levels.map((lvl) => (
                <Tr key={lvl.id}>
                  <Td fontWeight="500" color="ink.700" whiteSpace="nowrap">
                    {lvl.label}
                  </Td>

                  <Td isNumeric>
                    <NumberInput
                      value={lvl.daycare}
                      onChange={(v) => handleChange(lvl.id, 'daycare', v)}
                      min={0}
                      precision={2}
                      maxW="150px"
                      ml="auto"
                    >
                      <NumberInputField
                        textAlign="right"
                        borderColor="ink.200"
                        _focus={{ borderColor: 'brand.600' }}
                      />
                    </NumberInput>
                  </Td>

                  <Td isNumeric>
                    <Tooltip
                      label="معاليم الكتب غير متاحة لهذا المستوى"
                      isDisabled={!lvl.books_disabled}
                      hasArrow
                    >
                      <Box display="inline-block">
                        <NumberInput
                          value={lvl.books_disabled ? 0 : lvl.books}
                          onChange={(v) => handleChange(lvl.id, 'books', v)}
                          min={0}
                          precision={2}
                          maxW="150px"
                          ml="auto"
                          isDisabled={lvl.books_disabled}
                        >
                          <NumberInputField
                            textAlign="right"
                            borderColor="ink.200"
                            _focus={{ borderColor: 'brand.600' }}
                            _disabled={{
                              bg: 'ink.50',
                              color: 'ink.400',
                              cursor: 'not-allowed',
                            }}
                          />
                        </NumberInput>
                      </Box>
                    </Tooltip>
                  </Td>

                  <Td isNumeric>
                    <Badge
                      colorScheme="green"
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="md"
                      fontSize="sm"
                    >
                      {getTotal(lvl)?.toFixed(2) || 0} د.ت
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <HStack justify="flex-end" mt={6}>
          <Button
            leftIcon={<Save size={16} />}
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            onClick={handleSave}
          >
            حفظ التغييرات
          </Button>
        </HStack>
      </CardBody>
    </Card>
  );
}