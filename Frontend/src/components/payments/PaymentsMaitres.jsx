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
  VStack,
  Divider,
} from '@chakra-ui/react';
import { Wallet, CheckCircle2, Clock, CreditCard, History as HistoryIcon } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import DataTable from '../common/DataTable';
import PaymentsSubNav from './PaymentsSubNav';
import { paymentStatuses } from '../../data/payments';
import { AxiosToken } from '../../api/Api';

const STATUS_COLORS = {
  payé: { bg: 'positive.50', color: 'positive.600' },
  "no payé": { bg: 'accent.50', color: 'accent.500' },
  'en attente': { bg: 'warning.50', color: 'warning.500' },
};

const ARABIC_MONTHS = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

// Clé "YYYY-MM" construite depuis les vrais champs month/year de la ligne de paie — PAS createdAt
function periodKey(payment) {
  return `${payment.year}-${pad2(payment.month)}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

// "YYYY-MM" -> "سبتمبر 2026"
function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return `${ARABIC_MONTHS[month - 1]} ${year}`;
}

export default function PaymentsMaitres() {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const now = new Date();
  const currentPeriodKey = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;

  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState(currentPeriodKey); // <- mois courant par défaut, pas ''
  const [statusFilter, setStatusFilter] = useState('');

  const [payTarget, setPayTarget] = useState(null);
  const [historyPerson, setHistoryPerson] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  const payModal = useDisclosure();
  const historyModal = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await AxiosToken.get('/teacher-payment', { params: { month: now.getMonth() + 1, year: now.getFullYear() } });
        setPayments(response.data.payments);
      } catch {
        toast({ title: 'خطأ أثناء تحميل المدفوعات', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableMonths = useMemo(() => {
    const set = new Set(payments.map((p) => periodKey(p))); // <- period réelle, pas createdAt
    return Array.from(set).sort().reverse();
  }, [payments]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payments.filter((p) => {
      const matchesSearch = !term || (p.paymentTeacher.name + ' ' + p.paymentTeacher.last_name).toLowerCase().includes(term);
      const matchesMonth = !monthFilter || periodKey(p) === monthFilter; // <- period réelle, pas createdAt
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [payments, search, monthFilter, statusFilter]);

  const totalEncaisseCeMois = useMemo(
    () =>
      payments
        .filter((p) => periodKey(p) === currentPeriodKey && p.status !== 'en attente') // <- period réelle
        .reduce((sum, p) => sum + Number(p.amount), 0),
    [payments, currentPeriodKey]
  );
  const totalPayeFiltre = useMemo(
    () => filtered.filter((p) => p.status === 'payé' || p.status === 'partiel').reduce((sum, p) => sum + Number(p.amount), 0),
    [filtered]
  );

  const historyRows = useMemo(() => {
    if (!historyPerson) return [];
    return payments
      .filter((p) => p.paymentTeacher?.id === historyPerson.paymentTeacher?.id)
      .sort((a, b) => (b.year - a.year) || (b.month - a.month)); // <- tri par période réelle
  }, [payments, historyPerson]);

  const askPay = (p) => { setPayTarget(p); payModal.onOpen(); };
  const openHistory = (p) => { setHistoryPerson(p); historyModal.onOpen(); };

  const handleConfirmPay = async () => {
    if (!payTarget) return;
    setIsPaying(true);
    try {
      const response = await AxiosToken.patch(`/teacher-payments/${payTarget.id}/pay`);
      setPayments((prev) => prev.map((p) => (p.id === payTarget.id ? response.data.payment : p)));
      toast({
        title: 'تم تأكيد الدفع',
        description: `${payTarget.paymentTeacher.name} ${payTarget.paymentTeacher.last_name} — ${Number(payTarget.amount).toLocaleString('fr-FR')} د.ت`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      payModal.onClose();
      setPayTarget(null);
    } catch {
      toast({ title: 'فشل تأكيد الدفع', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsPaying(false);
    }
  };

  const columns = [
    { key: 'id', label: 'المعرّف', sortable: true },
    { key: 'maitre', label: 'المعلم', sortable: true, render: (row) => row.paymentTeacher.name + ' ' + row.paymentTeacher.last_name },
    { key: 'periode', label: 'الفترة', sortable: true, render: (row) => formatMonthLabel(periodKey(row)) },
    { key: 'hour_count', label: 'عدد الساعات', sortable: true },
    { key: 'amount', label: 'المبلغ', sortable: true, isNumeric: true, render: (row) => `${Number(row.amount).toLocaleString('fr-FR')} د.ت` },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
     render: (row) => {
    const statusLabels = {
        "payé": "مدفوع",
        "no payé": "غير مدفوع",
        "en attente": "قيد الانتظار",
    };

    const c = STATUS_COLORS[row.status] || {
        bg: "ink.100",
        color: "ink.700"
    };

    return (
        <Badge
            bg={c.bg}
            color={c.color}
            borderRadius="full"
            px={2.5}
        >
            {statusLabels[row.status] || row.status}
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
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.800">إجمالي المحصّل هذا الشهر</Text>
            <Wallet size={18} />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700">{totalEncaisseCeMois.toLocaleString('fr-FR')} د.ت</Text>
          <Text fontSize="xs" color="whiteAlpha.700" mt={1}>{formatMonthLabel(currentPeriodKey)}</Text>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">إجمالي المدفوع (مُصفّى)</Text>
            <Icon as={CheckCircle2} boxSize={4.5} color="positive.500" />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="ink.900">{totalPayeFiltre.toLocaleString('fr-FR')} د.ت</Text>
          <Text fontSize="xs" color="ink.400" mt={1}>ضمن التحديد الحالي</Text>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">المدفوعات المتبقية</Text>
            <Icon as={Clock} boxSize={4.5} color="warning.500" />
          </HStack>
          <Text fontSize="xs" color="ink.400" mt={1}>قيد الانتظار (ضمن التحديد)</Text>
        </Box>
      </SimpleGrid>

      <Wrap spacing={3} mb={5} align="center">
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث عن معلم…" />

        <Select
          w={{ base: 'full', sm: '170px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          sx={{ textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem', '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' } }}
        >
          <option value="">جميع الأشهر</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>{formatMonthLabel(m)}</option>
          ))}
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
          {paymentStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        {(search || monthFilter !== currentPeriodKey || statusFilter) && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setMonthFilter(currentPeriodKey); setStatusFilter(''); }}>
            إعادة التعيين
          </Button>
        )}

        <HStack spacing={1.5} ml="auto" color="ink.400">
          <CreditCard size={15} />
          <Text fontSize="xs">{filtered.length} دفعة(ات)</Text>
        </HStack>
      </Wrap>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={8}
        isLoading={isLoading}
        emptyMessage="لا توجد أي مدفوعات تطابق هذه المعايير."
        renderActions={(row) => (
          <HStack spacing={1}>
            <Tooltip label="الدفع" hasArrow>
              <IconButton
                aria-label="الدفع"
                disabled={row.status !== 'no payé'}
                icon={<Wallet size={16} />}
                size="sm"
                variant="ghost"
                color="positive.600"
                _hover={{ bg: 'positive.50' }}
                onClick={() => askPay(row)}
              />
            </Tooltip>
            <Tooltip label="السجل" hasArrow>
              <IconButton aria-label="السجل" icon={<HistoryIcon size={16} />} size="sm" variant="ghost" onClick={() => openHistory(row)} />
            </Tooltip>
          </HStack>
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
                {payTarget ? `${payTarget.paymentTeacher.name} ${payTarget.paymentTeacher.last_name}` : ''}
              </Text>{' '}؟
            </Text>
            {payTarget && (
              <Text fontSize="xs" color="ink.400" mt={2}>{Number(payTarget.amount).toLocaleString('fr-FR')} د.ت</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={payModal.onClose}>إلغاء</Button>
            <Button colorScheme="green" onClick={handleConfirmPay} isLoading={isPaying}>تأكيد</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={historyModal.isOpen} onClose={historyModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>
            سجل المدفوعات
            {historyPerson && (
              <Text fontSize="sm" fontWeight="400" color="ink.500" mt={1}>
                {historyPerson.paymentTeacher.name} {historyPerson.paymentTeacher.last_name}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {historyRows.length === 0 ? (
              <Text fontSize="sm" color="ink.500">لا توجد أي مدفوعات مسجّلة لهذا المعلم.</Text>
            ) : (
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {historyRows.map((p) => {
                  const c = STATUS_COLORS[p.status] || { bg: 'ink.100', color: 'ink.700' };
                  return (
                    <HStack key={p.id} justify="space-between" py={3}>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" color="ink.800">{formatMonthLabel(periodKey(p))}</Text>
                        <Text fontSize="xs" color="ink.400">{Number(p.amount).toLocaleString('fr-FR')} د.ت — {formatDate(p.createdAt)}</Text>
                      </Box>
                      <Badge bg={c.bg} color={c.color} borderRadius="full" px={2.5}>{p.status}</Badge>
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={historyModal.onClose}>إغلاق</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}