import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  useToast,
  useDisclosure,
  Text,
  Wrap,
  SimpleGrid,
  Icon,
  Select,
} from '@chakra-ui/react';
import { Plus, ShoppingCart, Wallet, CreditCard } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import DataTable from '../common/DataTable';
import PaymentsSubNav from './PaymentsSubNav';
import PurchaseFormModal from './PurchaseFormModal';
import { AxiosToken } from '../../api/Api';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('ar-TN', { month: 'long', year: 'numeric' });
}

export default function PaymentsAchats() {
  const toast = useToast();
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [totalCeMois, setTotalCeMois] = useState(0);
  const [totalFiltre, setTotalFiltre] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const formModal = useDisclosure();

  // Fetch the raw purchases list (drives the table + available months)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await AxiosToken.get('/purchase');
        setPurchases(response.data.purchases);
      } catch {
        console.error('error');
      }finally{
        setIsLoading(false)
      }
    };
    fetchData();
  }, [isSaving]);

  // Fetch the summary totals from the backend (Promise.all on the server side)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await AxiosToken.get('/purchase/summary', {
          params: { label: search, monthFilter },
        });
        setTotalCeMois(data.totalCeMois);
        setTotalFiltre(data.totalFiltre);
        setFilteredCount(data.filteredCount);
      } catch (err) {
        console.error('error fetching summary', err);
      }
    };
    fetchSummary();
  }, [search, monthFilter, isSaving]);

  const availableMonths = useMemo(() => {
    const set = new Set(purchases.map((p) => p.createdAt.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [purchases]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return purchases.filter((p) => {
      const matchesSearch = !term || p.item.toLowerCase().includes(term);
      const matchesMonth = !monthFilter || p.createdAt.startsWith(monthFilter);
      return matchesSearch && matchesMonth;
    });
  }, [purchases, search, monthFilter]);

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const openAdd = () => { formModal.onOpen(); };

  const handleCreateSubmit = async (formData) => {
    setIsSaving(true);
    try {
      await AxiosToken.post('/purchase', formData);
      toast({ title: 'تم تسجيل المشترى', status: 'success', duration: 3000, isClosable: true });
      formModal.onClose();
    } catch {
      toast({ title: 'حدث خطأ أثناء التسجيل', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: 'id', label: 'المعرّف', sortable: true },
    { key: 'item', label: 'الوصف', sortable: true },
    { key: 'quantity', label: 'الكمية', sortable: true, isNumeric: true },
    { key: 'unit_price', label: 'سعر الوحدة', sortable: true, isNumeric: true, render: (row) => `${row.unit_price?.toLocaleString('fr-FR')} د.ت` },
    { key: 'total_price', label: 'المبلغ الإجمالي', sortable: true, isNumeric: true, render: (row) => `${row.total_price?.toLocaleString('fr-FR')} د.ت` },
    { key: 'datePaiement', label: 'التاريخ', sortable: true, render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <Box dir="rtl">
      <PaymentsSubNav />

      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5} mb={6}>
        <Box bg="brand.600" borderRadius="2xl" p={5} color="white" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.800">إجمالي المشتريات هذا الشهر</Text>
            <ShoppingCart size={18} />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700">{totalCeMois?.toLocaleString('fr-FR')} د.ت</Text>
          <Text fontSize="xs" color="whiteAlpha.700" mt={1}>{formatMonthLabel(currentMonthKey)}</Text>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">إجمالي ضمن التحديد الحالي</Text>
            <Icon as={Wallet} boxSize={4.5} color="brand.600" />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="ink.900">{totalFiltre?.toLocaleString('fr-FR')} د.ت</Text>
          <Text fontSize="xs" color="ink.400" mt={1}>{filteredCount} مشترى/مشتريات</Text>
        </Box>
      </SimpleGrid>

      <Wrap spacing={3} mb={5} align="center">
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث عن مشترى…" />

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

        {(search || monthFilter) && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setMonthFilter(''); }}>
            إعادة التعيين
          </Button>
        )}

        <Button size="sm" colorScheme="green" leftIcon={<Plus size={16} />} onClick={openAdd}>
          إضافة مشترى جديد
        </Button>

        <HStack spacing={1.5} ml="auto" color="ink.400">
          <CreditCard size={15} />
          <Text fontSize="xs">{filtered.length} مشترى/مشتريات</Text>
        </HStack>
      </Wrap>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={8}
        emptyMessage="لا توجد أي مشتريات تطابق هذه المعايير."
      />

      <PurchaseFormModal isOpen={formModal.isOpen} onClose={formModal.onClose} onSubmit={handleCreateSubmit} isSaving={isSaving} />
    </Box>
  );
}