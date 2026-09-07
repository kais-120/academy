import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Flex,
  Icon,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Spinner,
} from '@chakra-ui/react';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Briefcase,
  Wallet,
  CheckCircle2,
  Clock,
  UserPlus,
  BadgeDollarSign,
  DatabaseBackup,
  School,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import GenderChart from '../components/charts/GenderChart';
import LevelChart from '../components/charts/LevelChart';
import PaymentsChart from '../components/charts/PaymentsChart';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { AxiosToken } from '../api/Api';
import { useNavigate } from 'react-router-dom';

const ACTIVITY_ICONS = {
  pay: { icon: BadgeDollarSign, color: 'positive.500', bg: 'positive.50' },
  create: { icon: UserPlus, color: 'brand.600', bg: 'brand.50' },
  update: { icon: Wallet, color: 'accent.500', bg: 'accent.50' },
  delete: { icon: DatabaseBackup, color: 'warning.500', bg: 'warning.50' },
  login: { icon: ShieldCheck, color: 'ink.500', bg: 'ink.50' },
};

function InfoRow({ icon, label, value }) {
  return (
    <HStack spacing={3} align="flex-start">
      <Flex w="34px" h="34px" borderRadius="lg" bg="brand.50" align="center" justify="center" flexShrink={0}>
        <Icon as={icon} boxSize={4} color="brand.600" />
      </Flex>
      <VStack spacing={0} align="flex-start">
        <Text fontSize="xs" color="ink.400">{label}</Text>
        <Text fontSize="sm" fontWeight="600" color="ink.900">{value || '—'}</Text>
      </VStack>
    </HStack>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [usersStatus, setUsersStatus] = useState({});
  const [gendersStatus, setGendersStatus] = useState([]);
  const [studentsByLevel, setStudentsByLevel] = useState([]);
  const [tuitionFees, setTuitionFees] = useState({});
  const [schoolInfo, setSchoolInfo] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [paymentsThisMonth, setPaymentsThisMonth] = useState({
    total: 0,
    collected: 0,
    pending: 0,
  });
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const [
          usersStatusResponse,
          gendersStatusResponse,
          studentsByLevelResponse,
          tuitionFeesResponse,
          schoolInfoResponse,
          activityLogsResponse,
          paymentsSummaryResponse,
          monthlyPaymentsResponse,
        ] = await Promise.all([
          AxiosToken.get('/dashboard/totals'),
          AxiosToken.get('/dashboard/students-by-gender'),
          AxiosToken.get('/dashboard/students-by-level'),
          AxiosToken.get('/dashboard/tuition-fees'),
          AxiosToken.get('/school-info'),
          AxiosToken.get('/activity-logs?limit=5&page=1'),
          // AxiosToken.get('/dashboard/payments-summary'),
          AxiosToken.get(`/dashboard/monthly-payments?year=${new Date().getFullYear()}`),
        ]);

        setUsersStatus(usersStatusResponse.data);
        setGendersStatus(gendersStatusResponse.data.genderDistribution);
        setStudentsByLevel(studentsByLevelResponse.data.studentsByLevel);
        setTuitionFees(tuitionFeesResponse.data.tuitionFees);
        setSchoolInfo(schoolInfoResponse.data.schoolInfo?.[0]);
        setRecentActivities(activityLogsResponse.data.data || []);
        setPaymentsThisMonth(
          paymentsSummaryResponse.data.paymentsThisMonth || {
            total: 0,
            collected: 0,
            pending: 0,
          }
        );
        setMonthlyPayments(monthlyPaymentsResponse.data.monthlyPayments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    dataFetch();
  }, []);

  const year = new Date().getFullYear();
  const pendingPct =
    paymentsThisMonth.total > 0
      ? Math.round((paymentsThisMonth.pending / paymentsThisMonth.total) * 100)
      : 0;

  // useEffect(() => {
  //       if (user?.role !== "مديرة") {
  //           navigate("/student", { replace: true });
  //       }
  //   }, [user, navigate]);

  return (
    <VStack align="stretch" spacing={7} dir='rtl'>
      {/* رسالة الترحيب */}
      <Box dir='rtl'>
        <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="ink.900">
          مرحبًا، {user?.name || 'مدير'}
        </Text>
        <Text fontSize="sm" color="ink.500" mt={1}>
          إليك نظرة عامة على مدرستك اليوم {year} - {year + 1}.
        </Text>
      </Box>

      {/* بطاقات الإحصائيات الرئيسية */}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={5}>
        <StatCard
          label="إجمالي التلاميذ"
          value={usersStatus.totalStudents}
          icon={GraduationCap}
          iconColor="brand.600"
          iconBg="brand.50"
        />
        <StatCard
          label="إجمالي المعلّمين"
          value={usersStatus.totalTeachers}
          icon={Users}
          iconColor="accent.500"
          iconBg="accent.50"
        />
        <StatCard
          label="إجمالي المراقبين"
          value={usersStatus.totalSupervisors}
          icon={ShieldCheck}
          iconColor="warning.500"
          iconBg="warning.50"
        />
        <StatCard
          label="إجمالي الموظفين"
          value={usersStatus.totalEmployees}
          icon={Briefcase}
          iconColor="positive.500"
          iconBg="positive.50"
        />
      </SimpleGrid>

      {/* بطاقات المدفوعات (بيانات حقيقية من جدول payments) */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={5}>
        <Box bg="brand.600" borderRadius="2xl" p={5} color="white" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.800">مدفوعات هذا الشهر</Text>
            <Wallet size={18} />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700">
            {paymentsThisMonth.total.toLocaleString('fr-FR')} د.ت
          </Text>
          <Text fontSize="xs" color="whiteAlpha.700" mt={1}>المبلغ الإجمالي المسجَّل هذا الشهر</Text>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">المدفوعات المُنجَزة</Text>
            <Icon as={CheckCircle2} boxSize={4.5} color="positive.500" />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="ink.900">
            {paymentsThisMonth.collected.toLocaleString('fr-FR')} د.ت
          </Text>
          <Badge mt={2} bg="positive.50" color="positive.600" borderRadius="full" px={2}>
            {100 - pendingPct}% محصَّل
          </Badge>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">المدفوعات قيد الانتظار</Text>
            <Icon as={Clock} boxSize={4.5} color="warning.500" />
          </HStack>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="ink.900">
            {paymentsThisMonth.pending.toLocaleString('fr-FR')} د.ت
          </Text>
          <Badge mt={2} bg="warning.50" color="warning.500" borderRadius="full" px={2}>
            {pendingPct}% قيد الانتظار
          </Badge>
        </Box>
      </SimpleGrid>

      {/* الرسوم البيانية */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={5}>
        <Box gridColumn={{ xl: 'span 2' }} bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <Text fontFamily="heading" fontWeight="700" color="ink.900" mb={1}>المدفوعات الشهرية</Text>
          <Text fontSize="xs" color="ink.400" mb={2}>تطوّر التحصيل خلال السنة {year}</Text>
          {isLoading ? (
            <Flex justify="center" align="center" py={8}>
              <Spinner color="brand.600" size="sm" />
            </Flex>
          ) : (
            <PaymentsChart data={monthlyPayments} />
          )}
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <Text fontFamily="heading" fontWeight="700" color="ink.900" mb={1}>توزيع التلاميذ</Text>
          <Text fontSize="xs" color="ink.400" mb={2}>حسب الجنس</Text>
          <GenderChart data={gendersStatus} />
        </Box>
      </SimpleGrid>

      <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
        <Text fontFamily="heading" fontWeight="700" color="ink.900" mb={1}>التلاميذ حسب المستوى</Text>
        <Text fontSize="xs" color="ink.400" mb={2}>الأعداد موزّعة على 7 مستويات</Text>
        <LevelChart data={studentsByLevel} />
      </Box>

      {/* الأنشطة الأخيرة + معلومات المدرسة */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={5}>
        <Box gridColumn={{ xl: 'span 2' }} bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={4}>
            <Text fontFamily="heading" fontWeight="700" color="ink.900">الأنشطة الأخيرة</Text>
            <Button
              size="sm"
              variant="ghost"
              colorScheme="brand"
              onClick={() => navigate('/activity-logs')}
            >
              عرض الكل
            </Button>
          </HStack>

          {isLoading ? (
            <Flex justify="center" align="center" py={8}>
              <Spinner color="brand.600" size="sm" />
            </Flex>
          ) : recentActivities.length === 0 ? (
            <Text fontSize="sm" color="ink.400">لا توجد أنشطة حاليًا</Text>
          ) : (
            <VStack align="stretch" spacing={4} divider={<Divider borderColor="ink.100" />}>
              {recentActivities.map((activity) => {
                const meta = ACTIVITY_ICONS[activity.action] || ACTIVITY_ICONS.update;
                return (
                  <HStack key={activity.id} spacing={3} align="flex-start">
                    <Flex w="36px" h="36px" borderRadius="lg" bg={meta.bg} align="center" justify="center" flexShrink={0}>
                      <Icon as={meta.icon} boxSize={4} color={meta.color} />
                    </Flex>
                    <VStack spacing={0} align="flex-start">
                      <Text fontSize="sm" color="ink.800" fontWeight="500">
                        {activity.description}
                      </Text>
                      <Text fontSize="xs" color="ink.400">
                        {new Date(activity.createdAt).toLocaleString('fr-FR')} — {activity.user_name}
                      </Text>
                    </VStack>
                  </HStack>
                );
              })}
            </VStack>
          )}
        </Box>

        <VStack align="stretch" spacing={5}>
          <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
            <HStack mb={4} spacing={2}>
              <Icon as={School} boxSize={4.5} color="brand.600" />
              <Text fontFamily="heading" fontWeight="700" color="ink.900">معلومات المدرسة</Text>
            </HStack>
            <VStack align="stretch" spacing={3.5}>
              <InfoRow icon={MapPin} label="العنوان" value={schoolInfo.address} />
              <InfoRow icon={Phone} label="الهاتف" value={schoolInfo.phone} />
              <InfoRow icon={Mail} label="البريد الإلكتروني" value={schoolInfo.email} />
              <InfoRow icon={CalendarDays} label="السنة الدراسية" value={schoolInfo.academic_year} />
            </VStack>
          </Box>
        </VStack>
      </SimpleGrid>

      {/* تعريفة الدراسة */}
      <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
        <HStack justify="space-between" mb={4}>
          <Text fontFamily="heading" fontWeight="700" color="ink.900">تعريفة الدراسة</Text>
          <Badge bg="brand.50" color="brand.700" borderRadius="full" px={2.5} py={1}>
            {schoolInfo.schoolYear}
          </Badge>
        </HStack>
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>المستوى</Th>
                <Th isNumeric>التعريفة الشهرية</Th>
                <Th isNumeric>التعريفة السنوية</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tuitionFees?.monthly?.map((monthlyFee) => {
                const yearlyFee = tuitionFees.yearly.find(
                  (fee) => fee.label === monthlyFee.label
                );

                return (
                  <Tr key={monthlyFee.id}>
                    <Td fontWeight="500" color="ink.800">
                      {monthlyFee.label}
                    </Td>

                    <Td isNumeric fontWeight="600" color="ink.900">
                      {monthlyFee.amount.toLocaleString('fr-FR')} د.ت
                    </Td>

                    <Td isNumeric fontWeight="600" color="ink.900">
                      {yearlyFee
                        ? yearlyFee.amount.toLocaleString('fr-FR')
                        : '-'}{' '}
                      {yearlyFee && 'د.ت'}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </VStack>
  );
}