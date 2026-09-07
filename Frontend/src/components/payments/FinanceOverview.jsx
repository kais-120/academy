import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Wrap,
  SimpleGrid,
  Select,
  Skeleton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import PaymentsSubNav from './PaymentsSubNav';
import DownloadReportModal from './DownloadReportModal';
import { AxiosToken } from '../../api/Api';

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('ar-TN', { month: 'long', year: 'numeric' });
}

// School has no data before this month — don't offer earlier months in the dropdown.
const SCHOOL_START_YEAR = 2026;
const SCHOOL_START_MONTH = 9; // September

// Builds "YYYY-MM" keys from the current month back to SCHOOL_START,
// since the backend doesn't expose a list of months with data.
function buildAvailableMonthKeys() {
  const keys = [];
  const now = new Date();
  const start = new Date(SCHOOL_START_YEAR, SCHOOL_START_MONTH - 1, 1);
  let cursor = new Date(now.getFullYear(), now.getMonth(), 1);

  while (cursor >= start) {
    keys.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
  }
  return keys;
}

const EMPTY_SUMMARY = {
  revenue: 0,
  expenses: { staff: 0, teachers: 0, purchases: 0, total: 0 },
  netProfit: 0,
};

export default function FinanceOverview() {
  const toast = useToast();
  const availableMonths = useMemo(() => buildAvailableMonthKeys(), []);
  const [monthFilter, setMonthFilter] = useState(availableMonths[0]);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);

  const downloadModal = useDisclosure();

  useEffect(() => {
    const [year, month] = monthFilter.split('-').map(Number);

    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const res = await AxiosToken.get('/dashboard/summary-financial', {
          params: { month, year },
        });
        setSummary(res.data);
      } catch {
        setSummary(EMPTY_SUMMARY);
        toast({ title: 'حدث خطأ أثناء التسجيل', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [monthFilter, toast]);

  const handleDownload = async ({ year, month, type }) => {
    try {
      const params = new URLSearchParams({ year, month, type });
      const res = await AxiosToken.get(`/download/reports?${params}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // err.response?.data is a Blob here too (since responseType is 'blob'), so parse it for the real message
      let message = 'فشل إنشاء التقرير';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          message = JSON.parse(text).message || message;
        } catch {}
      }
      toast({ title: message, status: 'error' });
    }
  };

  return (
    <Box dir="rtl">
      <PaymentsSubNav />

      <Wrap spacing={3} mb={5} align="center">
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
          {availableMonths.map((m) => (
            <option key={m} value={m}>{formatMonthLabel(m)}</option>
          ))}
        </Select>

        <Button size="sm" variant="outline" leftIcon={<Download size={16} />} onClick={downloadModal.onOpen} ml="auto">
          تحميل التقرير
        </Button>
      </Wrap>

      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5} mb={6}>
        <Skeleton isLoaded={!isLoading} borderRadius="2xl">
          <Box bg="brand.600" borderRadius="2xl" p={5} color="white" boxShadow="card">
            <HStack justify="space-between" mb={3}>
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.800">الربح هذا الشهر</Text>
              <TrendingUp size={18} />
            </HStack>
            <Text fontFamily="heading" fontSize="2xl" fontWeight="700">{summary.netProfit.toLocaleString('fr-FR')} د.ت</Text>
            <Text fontSize="xs" color="whiteAlpha.700" mt={1}>{formatMonthLabel(monthFilter)}</Text>
          </Box>
        </Skeleton>

        <Skeleton isLoaded={!isLoading} borderRadius="2xl">
          <Box bg="red.500" borderRadius="2xl" p={5} color="white" boxShadow="card">
            <HStack justify="space-between" mb={3}>
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.800">إجمالي المصاريف</Text>
              <TrendingDown size={18} />
            </HStack>
            <Text fontFamily="heading" fontSize="2xl" fontWeight="700">{summary.expenses.total.toLocaleString('fr-FR')} د.ت</Text>
            <Text fontSize="xs" color="whiteAlpha.700" mt={1}>{formatMonthLabel(monthFilter)}</Text>
          </Box>
        </Skeleton>
      </SimpleGrid>

      <DownloadReportModal
        isOpen={downloadModal.isOpen}
        onClose={downloadModal.onClose}
        onSubmit={handleDownload}
        availableMonths={availableMonths}
      />
    </Box>
  );
}