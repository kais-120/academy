import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Badge,
  useToast,
  useDisclosure,
  Text,
  Wrap,
  SimpleGrid,
  Icon,
  Select,
} from '@chakra-ui/react';
import { Plus, ShoppingCart, Wallet, CreditCard } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import PaymentsSubNav from '../components/payments/PaymentsSubNav';
import PurchaseFormModal from '../components/payments/PurchaseFormModal';
import { AxiosToken } from '../api/Api';
import { Navigate, useLocation } from 'react-router-dom';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function Payments() {
  const toast = useToast();
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const formModal = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AxiosToken.get('/purchases');
        setPurchases(response.data.purchases);
      } catch {
        console.error('error');
      }
    };
    fetchData();
  }, [isSaving]);

  const availableMonths = useMemo(() => {
    const set = new Set(purchases.map((p) => p.createdAt.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [purchases]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return purchases.filter((p) => {
      const matchesSearch = !term || p.label.toLowerCase().includes(term);
      const matchesMonth = !monthFilter || p.createdAt.startsWith(monthFilter);
      return matchesSearch && matchesMonth;
    });
  }, [purchases, search, monthFilter]);

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const totalCeMois = useMemo(
    () => purchases.filter((p) => p.createdAt.startsWith(currentMonthKey)).reduce((sum, p) => sum + p.amount, 0),
    [purchases, currentMonthKey]
  );
  const totalFiltre = useMemo(() => filtered.reduce((sum, p) => sum + p.amount, 0), [filtered]);

  const openAdd = () => { formModal.onOpen(); };

  const handleCreateSubmit = async (formData) => {
    setIsSaving(true);
    try {
      const response = await AxiosToken.post('/purchases', formData);
      setPurchases((prev) => [response.data.purchase, ...prev]);
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
    { key: 'label', label: 'الوصف', sortable: true },
    { key: 'quantity', label: 'الكمية', sortable: true, isNumeric: true },
    { key: 'unitPrice', label: 'سعر الوحدة', sortable: true, isNumeric: true, render: (row) => `${row.unitPrice.toLocaleString('fr-FR')} د.ت` },
    { key: 'amount', label: 'المبلغ الإجمالي', sortable: true, isNumeric: true, render: (row) => `${row.amount.toLocaleString('fr-FR')} د.ت` },
    { key: 'datePaiement', label: 'التاريخ', sortable: true, render: (row) => formatDate(row.createdAt) },
  ];
  const location = useLocation();
  
    // Redirige /register vers /register/absences (qui redirige lui-même vers
    // la catégorie Élèves) par défaut.
    if (location.pathname === '/payments') {
      return <Navigate to="/payments/eleves" replace />;
    }

  return (
    <Box dir="rtl">
      <PaymentsSubNav />

      </Box>
  );
}