import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Icon,
  Badge,
  Select,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  IconButton,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  BadgeDollarSign,
  UserPlus,
  Wallet,
  DatabaseBackup,
  ShieldCheck,
  History,
  ChevronRight,
  ChevronLeft,
  Search,
  RotateCcw,
} from 'lucide-react';
import { AxiosToken } from '../api/Api';

const ACTIVITY_ICONS = {
  pay: { icon: BadgeDollarSign, color: 'positive.500', bg: 'positive.50', label: 'دفع' },
  create: { icon: UserPlus, color: 'brand.600', bg: 'brand.50', label: 'إضافة' },
  update: { icon: Wallet, color: 'accent.500', bg: 'accent.50', label: 'تعديل' },
  delete: { icon: DatabaseBackup, color: 'warning.500', bg: 'warning.50', label: 'حذف' },
  login: { icon: ShieldCheck, color: 'ink.500', bg: 'ink.50', label: 'تسجيل دخول' },
};

const ENTITY_LABELS = {
  student: 'تلميذ',
  supervisor: 'مراقب',
  category: 'صنف',
  subscription: 'اشتراك',
  user: 'مستخدم',
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const limit = 15;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (action) params.append('action', action);
      if (entityType) params.append('entity_type', entityType);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await AxiosToken.get(`/activity-logs?${params.toString()}`);
      setLogs(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, action, entityType, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = search
    ? logs.filter(
        (log) =>
          log.description?.toLowerCase().includes(search.toLowerCase()) ||
          log.user_name?.toLowerCase().includes(search.toLowerCase()) ||
          log.entity_name?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const resetFilters = () => {
    setAction('');
    setEntityType('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
  };

  return (
    <VStack align="stretch" spacing={6} dir="rtl">
      {/* رأس الصفحة */}
      <HStack justify="space-between">
        <HStack spacing={3}>
          <Flex w="42px" h="42px" borderRadius="xl" bg="brand.50" align="center" justify="center">
            <Icon as={History} boxSize={5} color="brand.600" />
          </Flex>
          <Box>
            <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="ink.900">
              سجل الأنشطة
            </Text>
            <Text fontSize="sm" color="ink.500">
              {total} نشاط مسجَّل
            </Text>
          </Box>
        </HStack>
      </HStack>

      {/* الفلاتر */}
      <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
        <HStack spacing={4} flexWrap="wrap" align="flex-end">
          <Box minW="200px" flex="1">
            <Text fontSize="xs" color="ink.400" mb={1}>بحث</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={Search} boxSize={4} color="ink.400" />
              </InputLeftElement>
              <Input
                placeholder="ابحث بالاسم أو الوصف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="ink.50"
                borderRadius="lg"
              />
            </InputGroup>
          </Box>

          <Box minW="160px">
            <Text fontSize="xs" color="ink.400" mb={1}>نوع العملية</Text>
            <Select
              placeholder="الكل"
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              bg="ink.50"
              borderRadius="lg"
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
              <option value="create">إضافة</option>
              <option value="update">تعديل</option>
              <option value="delete">حذف</option>
              <option value="pay">دفع</option>
              <option value="login">تسجيل دخول</option>
            </Select>
          </Box>

          <Box minW="160px">
            <Text fontSize="xs" color="ink.400" mb={1}>الكيان</Text>
            <Select
            sx={{
            textAlign: 'right',
            paddingRight: '1rem',
            paddingLeft: '2rem',
            '& + div': {
              insetInlineEnd: 'auto',
              insetInlineStart: '0.5rem',
            },
          }}
              placeholder="الكل"
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              bg="ink.50"
              borderRadius="lg"
            >
              <option value="student">تلميذ</option>
              <option value="supervisor">مراقب</option>
              <option value="category">صنف</option>
              <option value="subscription">اشتراك</option>
              <option value="user">مستخدم</option>
            </Select>
          </Box>

          <Box minW="150px">
            <Text fontSize="xs" color="ink.400" mb={1}>من تاريخ</Text>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              bg="ink.50"
              borderRadius="lg"
            />
          </Box>

          <Box minW="150px">
            <Text fontSize="xs" color="ink.400" mb={1}>إلى تاريخ</Text>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              bg="ink.50"
              borderRadius="lg"
            />
          </Box>

          <Button
            leftIcon={<RotateCcw size={15} />}
            variant="ghost"
            colorScheme="brand"
            onClick={resetFilters}
          >
            إعادة تعيين
          </Button>
        </HStack>
      </Box>

      {/* الجدول */}
      <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
        {isLoading ? (
          <Flex justify="center" align="center" py={10}>
            <Spinner color="brand.600" />
          </Flex>
        ) : filteredLogs.length === 0 ? (
          <Flex justify="center" align="center" py={10}>
            <Text fontSize="sm" color="ink.400">لا توجد أنشطة مطابقة</Text>
          </Flex>
        ) : (
          <TableContainer>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>العملية</Th>
                  <Th>الوصف</Th>
                  <Th>الكيان</Th>
                  <Th>المستخدم</Th>
                  <Th>الصفة</Th>
                  <Th>التاريخ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.map((log) => {
                  const meta = ACTIVITY_ICONS[log.action] || ACTIVITY_ICONS.update;
                  return (
                    <Tr key={log.id}>
                      <Td>
                        <HStack spacing={2}>
                          <Flex
                            w="28px"
                            h="28px"
                            borderRadius="md"
                            bg={meta.bg}
                            align="center"
                            justify="center"
                          >
                            <Icon as={meta.icon} boxSize={3.5} color={meta.color} />
                          </Flex>
                          <Text fontSize="sm" fontWeight="500" color="ink.800">
                            {meta.label}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="ink.800">{log.description}</Text>
                      </Td>
                      <Td>
                        {log.entity_type ? (
                          <Badge bg="ink.50" color="ink.600" borderRadius="full" px={2}>
                            {ENTITY_LABELS[log.entity_type] || log.entity_type}
                            {log.entity_name ? ` · ${log.entity_name}` : ''}
                          </Badge>
                        ) : (
                          <Text fontSize="xs" color="ink.300">—</Text>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="ink.800">{log.user_name}</Text>
                      </Td>
                      <Td>
                        <Badge
                          bg={log.user_role === 'مدير' ? 'brand.50' : 'accent.50'}
                          color={log.user_role === 'مدير' ? 'brand.700' : 'accent.600'}
                          borderRadius="full"
                          px={2}
                        >
                          {log.user_role}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="ink.500">
                          {new Date(log.createdAt).toLocaleString('fr-FR')}
                        </Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* الترقيم بين الصفحات */}
        {!isLoading && filteredLogs.length > 0 && (
          <HStack justify="space-between" mt={5}>
            <Text fontSize="xs" color="ink.400">
              صفحة {page} من {totalPages}
            </Text>
            <HStack spacing={2}>
              <IconButton
                icon={<ChevronRight size={16} />}
                size="sm"
                variant="outline"
                isDisabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="السابق"
              />
              <IconButton
                icon={<ChevronLeft size={16} />}
                size="sm"
                variant="outline"
                isDisabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="التالي"
              />
            </HStack>
          </HStack>
        )}
      </Box>
    </VStack>
  );
}