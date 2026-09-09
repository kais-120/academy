import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Save } from 'lucide-react';
import { AxiosToken } from '../../api/Api';

export default function TuitionFeesTab() {
  const toast = useToast();

  const [fees, setFees] = useState([
    { level: 'ابتدائي', amount: 30 },
    { level: 'اعدادي', amount: 40 },
    { level: 'ثانوي', amount: 45 },
    { level: 'باكالوريا', amount: 50 },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Get prices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AxiosToken.get('/price');

        setFees(response.data.price);
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

  // Update amount
  const updateAmount = (level, value) => {
    setFees((prev) =>
      prev.map((fee) =>
        fee.level === level
          ? {
              ...fee,
              amount: value,
            }
          : fee
      )
    );
  };

  // Save
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Send all prices to backend
      await AxiosToken.put('/price', {
        price: fees,
      });

      toast({
        title: 'تم تحديث المعاليم بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error:', error);

      toast({
        title: 'حدث خطأ أثناء حفظ المعاليم',
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
      <Box mb={1}>
        <Text
          fontFamily="heading"
          fontWeight="700"
          color="ink.900"
        >
          معاليم الدراسة
        </Text>

        <Text fontSize="sm" color="ink.500" mt={1}>
          قم بتعديل المعاليم حسب المرحلة الدراسية، ثم قم بحفظ التغييرات.
        </Text>
      </Box>

      <TableContainer mt={5}>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>المرحلة الدارسية</Th>

              <Th isNumeric>المعلوم الشهري بالمادة</Th>
            </Tr>
          </Thead>

          <Tbody>
            {fees.map((fee) => (
              <Tr key={fee.id}>
                <Td fontWeight="500" color="ink.800">
                  {fee.label}
                </Td>

                <Td isNumeric>
                  <InputGroup
                    size="sm"
                    maxW="150px"
                    ml="auto"
                  >
                    <Input
                      type="number"
                      min="0"
                      textAlign="right"
                      value={fee.amount}
                      onChange={(e) =>
                        updateAmount(
                          fee.level,
                          Number(e.target.value)
                        )
                      }
                      borderRadius="lg"
                      dir="ltr"
                    />

                    <InputLeftElement
                      w="2.5rem"
                      color="ink.400"
                      fontSize="xs"
                    >
                      د.ت
                    </InputLeftElement>
                  </InputGroup>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <HStack justify="flex-start" mt={6}>
        <Button
          rightIcon={<Save size={16} />}
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="جاري الحفظ..."
        >
          حفظ المعاليم
        </Button>
      </HStack>
    </Box>
  );
}