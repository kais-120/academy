import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Select,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  useDisclosure,
  Text,
  Wrap,
  SimpleGrid,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { Wallet, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import DataTable from '../common/DataTable';
import PaymentsSubNav from './PaymentsSubNav';
import { AxiosToken } from '../../api/Api';

const STATUS_COLORS = {
  'payé': { bg: 'positive.50', color: 'positive.600' },
  'غير مدفوع': { bg: 'accent.50', color: 'accent.500' },
  'en attente': { bg: 'warning.50', color: 'warning.500' },
};

const STATUS_LABELS = {
  'payé': 'مدفوع',
  'غير مدفوع': 'غير مدفوع',
  'en attente': 'قيد الانتظار',
};

const MONTH_LABELS = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const PERSON_TYPE_LABELS = {
  employ: 'عامل',
  supervisor: 'مشرف',
};

const now = new Date();

export default function PaymentsStaff() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [payTarget, setPayTarget] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const payModal = useDisclosure();

  const fetchSalaries = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosToken.get('/staff-payment/staff-salaries', {
        params: { month, year },
      });
      setRows(response.data.salaries || []);
    } catch {
      toast({ title: 'تعذّر تحميل الرواتب', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const yearOptions = useMemo(() => {
    const y = now.getFullYear();
    return [y - 1, y, y + 1];
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch = !term || `${r.name} ${r.last_name}`.toLowerCase().includes(term);
      const matchesType = !typeFilter || r.person_type === typeFilter;
      const matchesStatus = !statusFilter || r.payment.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rows, search, typeFilter, statusFilter]);

 const totalPaye = useMemo(
  () => filtered.filter((r) => r.payment.status === 'payé').reduce((sum, r) => sum + Number(r.payment.amount), 0),
  [filtered]
);
  const totalMasseSalariale = useMemo(
  () => filtered.reduce((sum, r) => sum + Number(r.total_salary), 0),
  [filtered]
);
  const totalRestant = useMemo(
    () => filtered.filter((r) => r.payment.status !== 'payé').length,
    [filtered]
  );

  const askPay = (row) => {
    setPayTarget(row);
    payModal.onOpen();
  };

  const handleConfirmPay = async () => {
    if (!payTarget) return;
    setIsPaying(true);
    try {
      await AxiosToken.post('/staff-payment/staff-payments/confirm', {
        person_type: payTarget.person_type,
        person_id: payTarget.person_id,
        month,
        year,
      });
      toast({
        title: 'تم تأكيد الدفع',
        description: `${payTarget.name} ${payTarget.last_name} — ${payTarget.total_salary.toLocaleString('fr-FR')} د.ت`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      payModal.onClose();
      setPayTarget(null);
      fetchSalaries();
    } catch (error) {
      toast({
        title: 'تعذّر تأكيد الدفع',
        description: error?.response?.data?.message || '',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsPaying(false);
    }
  };


  const columns = [
    { key: 'salary_id', label: 'المعرّف', sortable: true },
    { key: 'name', label: 'الاسم', sortable: true, render: (row) => `${row.name} ${row.last_name}` },
    {
      key: 'person_type',
      label: 'الصنف',
      sortable: true,
      render: (row) => (
        <Badge bg="ink.100" color="ink.700" borderRadius="full" px={2.5}>
          {PERSON_TYPE_LABELS[row.person_type] || row.person_type}
          {row.role ? ` — ${row.role}` : ''}
        </Badge>
      ),
    },
    { key: 'base_salary', label: 'الراتب الأساسي', sortable: true, isNumeric: true, render: (row) => `${row.base_salary.toLocaleString('fr-FR')} د.ت` },
    { key: 'absence_days', label: 'أيام الغياب', sortable: true, isNumeric: true },
    { key: 'total_salary', label: 'الصافي', sortable: true, isNumeric: true, render: (row) => `${row.total_salary.toLocaleString('fr-FR')} د.ت` },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (row) => {
        const c = STATUS_COLORS[row.payment.status] || { bg: 'ink.100', color: 'ink.700' };
        return (
          <Badge bg={c.bg} color={c.color} borderRadius="full" px={2.5}>
            {STATUS_LABELS[row.payment.status] || row.payment.status}
          </Badge>
        );
      },
    },
  ];

  return (
    <Box dir="rtl">
      <PaymentsSubNav />

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={5} mb={6}>
        <Box bg="brand.600" borderRadius="2xl" p={5} color="white" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.800">إجمالي المدفوع</Text>
            <Wallet size={18} />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700">{totalPaye.toLocaleString('fr-FR')} د.ت</Text>
          <Text fontSize="xs" color="whiteAlpha.700" mt={1}>{MONTH_LABELS[month - 1]} {year}</Text>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">كتلة الأجور (ضمن التحديد)</Text>
            <Icon as={CheckCircle2} boxSize={4.5} color="positive.500" />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="ink.900">{totalMasseSalariale.toLocaleString('fr-FR')} د.ت</Text>
          <Text fontSize="xs" color="ink.400" mt={1}>ضمن التحديد الحالي</Text>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">المدفوعات المتبقية</Text>
            <Icon as={Clock} boxSize={4.5} color="warning.500" />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="ink.900">{totalRestant}</Text>
          <Text fontSize="xs" color="ink.400" mt={1}>قيد الانتظار (ضمن التحديد)</Text>
        </Box>
      </SimpleGrid>

      <Wrap spacing={3} mb={5} align="center">
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث عن اسم…" />

        <Select
          w={{ base: 'full', sm: '140px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          sx={{ textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem', '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' } }}
        >
          {MONTH_LABELS.map((label, idx) => (
            <option key={idx + 1} value={idx + 1}>{label}</option>
          ))}
        </Select>

        <Select
          w={{ base: 'full', sm: '110px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem', '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' } }}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>

        <Select
          w={{ base: 'full', sm: '150px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem', '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' } }}
        >
          <option value="">جميع الأصناف</option>
          <option value="employ">عامل</option>
          <option value="supervisor">مشرف</option>
        </Select>

        <Select
          w={{ base: 'full', sm: '160px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem', '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' } }}
        >
          <option value="">جميع الحالات</option>
          <option value="payé">مدفوع</option>
          <option value="غير مدفوع">غير مدفوع</option>
        </Select>

        {(search || typeFilter || statusFilter) && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}>
            إعادة التعيين
          </Button>
        )}

        <HStack spacing={1.5} ml="auto" color="ink.400">
          <CreditCard size={15} />
          <Text fontSize="xs">{filtered.length} راتب(رواتب)</Text>
        </HStack>
      </Wrap>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={8}
        isLoading={isLoading}
        emptyMessage="لا توجد أي رواتب تطابق هذه المعايير."
        renderActions={(row) => (
          <Tooltip label="الدفع" hasArrow>
            <IconButton
              aria-label="الدفع"
              disabled={row.payment.status === 'en attente' || row.payment.status === 'payé' }
              icon={<Wallet size={16} />}
              size="sm"
              variant="ghost"
              color="positive.600"
              _hover={{ bg: 'positive.50' }}
              onClick={() => askPay(row)}
            />
          </Tooltip>
        )}
      />

      <Modal isOpen={payModal.isOpen} onClose={payModal.onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>تأكيد الدفع</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="ink.600">
              هل تريد تأكيد الدفع لـ{' '}
              <Text as="span" fontWeight="700" color="ink.900">
                {payTarget ? `${payTarget.name} ${payTarget.last_name}` : ''}
              </Text>{' '}؟
            </Text>
            {payTarget && (
              <Text fontSize="xs" color="ink.400" mt={2}>{payTarget.total_salary.toLocaleString('fr-FR')} د.ت</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={payModal.onClose}>إلغاء</Button>
            <Button colorScheme="green" onClick={handleConfirmPay} isLoading={isPaying}>تأكيد</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}