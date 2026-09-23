import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Select,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  useDisclosure,
  Text,
  Wrap,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { Plus, Eye, Pencil, Trash2, Download, Users, RefreshCcw, FileText, FileSpreadsheet, Gift, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StudentFormModal from '../components/students/StudentFormModal';
import StudentViewModal from '../components/students/StudentViewModal';
import { STAGES, STAGE_LEVELS } from '../data/school';
import { AxiosToken } from '../api/Api';
import BacStudentFormModal from '../components/students/BacStudentFormModal';


const PAGE_SIZE = 8;

// تحويل رمز العرض إلى نص واضح للمستخدم داخل نموذج التلميذ
function getPromotionLabel(promotion) {
  if (promotion === 'discount_50') return 'خصم 50% على معلوم التسجيل';
  if (promotion === 'free') return 'تسجيل مجاني بالكامل';
  return null;
}

// جلب التلاميذ من الباك اند مع البحث والفلترة والصفحات
async function fetchStudents({ queryKey }) {
  const [, { page, search, levelFilter, genderFilter }] = queryKey;
  const response = await AxiosToken.get('/student', {
    params: {
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      level: levelFilter || undefined,
      gender: genderFilter || undefined,
    },
  });
  return response.data;
}

export default function Students() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [page, setPage] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentToReenroll, setStudentToReenroll] = useState(null);
  const [reenrollStatus, setReenrollStatus] = useState('');

  const [exportLevel, setExportLevel] = useState('');
  const [uniqueIsError, setUniqueIsError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [fatherName, setFatherName] = useState('');
  const [siblingsCount, setSiblingsCount] = useState('');
  const [offerErrors, setOfferErrors] = useState({});
  const [offerSession, setOfferSession] = useState(null);
  const [pendingOffer, setPendingOffer] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReenrolling, setIsReenrolling] = useState(false);
  const [yearAcademy, setYearAcademy] = useState('');

  const formModal = useDisclosure();
  const viewModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const exportModal = useDisclosure();
  const offersModal = useDisclosure();
  const reenrollModal = useDisclosure();

  const today = new Date();
  const year = today.getFullYear();
  const startDate = new Date(year, 9, 1); // September 1
  const endDate = new Date(year, 9, 30); // September 30
  const isDisabled = today >= startDate && today <= endDate;

  // debounce البحث حتى لا نرسل طلب مع كل ضغطة مفتاح
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // نرجع لأول صفحة كلما تغيّر البحث أو الفلاتر
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, levelFilter, genderFilter]);

  const studentsQueryKey = [
    'students',
    { page, search: debouncedSearch, levelFilter, genderFilter },
  ];

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: studentsQueryKey,
    queryFn: fetchStudents,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const students = data?.students ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, totalPages: 1 };

  useEffect(() => {
    if (isError) {
      toast({
        title: 'حدث خطأ أثناء جلب قائمة التلاميذ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [isError, toast]);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const response = await AxiosToken.get('/school-info');
        if (response.data?.schoolInfo) {
          setYearAcademy(response.data.schoolInfo?.[0]?.academic_year);
        }
      } catch {
        console.error('error');
      }
    };
    fetchSchoolInfo();
  }, []);

  const displayedStudents = useMemo(
    () => students.map((s, idx) => ({ ...s, displayNumber: (page - 1) * PAGE_SIZE + idx + 1 })),
    [students, page]
  );

  const invalidateStudents = () => queryClient.invalidateQueries({ queryKey: ['students'] });

  const openAddModal = () => {
    setSelectedStudent(null);
    setPendingOffer(null);
    formModal.onOpen();
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    formModal.onOpen();
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    viewModal.onOpen();
  };

  const askDelete = (student) => {
    setStudentToDelete(student);
    deleteDialog.onOpen();
  };

  const askReenroll = (student) => {
    setStudentToReenroll(student);
    setReenrollStatus('');
    reenrollModal.onOpen();
  };

  const openOffersModal = () => {
    setFatherName('');
    setSiblingsCount('');
    setOfferErrors({});
    setOfferSession(null);
    offersModal.onOpen();
  };

  const handleSubmit = async (formData, { resetForm }) => {
    setIsSaving(true);
    setUniqueIsError(false);

    try {
      let savedStudent = null;

      if (selectedStudent) {
        await AxiosToken.put(`/student/${selectedStudent.id}`, formData);
        toast({
          title: 'تم تعديل التلميذ بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const response = await AxiosToken.post('/student', formData);
        savedStudent = response?.data?.student || response?.data || null;
        toast({
          title: pendingOffer
            ? 'تم إضافة التلميذ بنجاح ضمن العرض'
            : 'تم إضافة التلميذ بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      resetForm();
      formModal.onClose();
      setSelectedStudent(null);
      invalidateStudents();

      if (pendingOffer) {
        const newEntry = {
          id: savedStudent?.id ?? `${Date.now()}`,
          name: savedStudent?.name ?? formData.name,
          last_name: savedStudent?.last_name ?? formData.last_name,
          classe: savedStudent?.class ?? formData.classe,
          promotionApplied: pendingOffer.isLast,
        };

        setOfferSession((prev) =>
          prev ? { ...prev, addedStudents: [...prev.addedStudents, newEntry] } : prev
        );
        setPendingOffer(null);
        offersModal.onOpen();
      } else {
        setPendingOffer(null);
      }
    } catch (error) {
      if (error.response?.status) {
        setUniqueIsError(true);
      }
      toast({
        title: 'حدث خطأ أثناء حفظ بيانات التلميذ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });

      if (pendingOffer) {
        setPendingOffer(null);
        offersModal.onOpen();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await AxiosToken.delete(`/student/${studentToDelete.id}`);
      toast({
        title: 'تم حذف التلميذ بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      invalidateStudents();
    } catch {
      toast({
        title: 'حدث خطأ أثناء حذف التلميذ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      deleteDialog.onClose();
      setStudentToDelete(null);
    }
  };

  const handleReenroll = async () => {
    if (!reenrollStatus) return;
    setIsReenrolling(true);
    try {
      await AxiosToken.post(`/student/${studentToReenroll.id}/reenroll`, {
        type: reenrollStatus,
      });
      toast({
        title:
          reenrollStatus === 'ناجح'
            ? 'تم تسجيل نجاح التلميذ وإعادة تسجيله للسنة القادمة'
            : 'تم تسجيل رسوب التلميذ وإعادة تسجيله لنفس المستوى',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      invalidateStudents();
    } catch {
      toast({
        title: 'حدث خطأ أثناء إعادة تسجيل التلميذ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsReenrolling(false);
      reenrollModal.onClose();
      setStudentToReenroll(null);
      setReenrollStatus('');
    }
  };

  const handleExport = async (format) => {
    try {
      setIsExporting(true);

      const response = await AxiosToken.get('/download/students', {
        params: {
          format,
          level: exportLevel,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type:
          format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `students${exportLevel ? `-${exportLevel}` : ''}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      exportModal.onClose();
    } catch (error) {
      console.error('Export error:', error);

      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل بيانات التلاميذ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBacSubmit = async (formData, { resetForm }) => {
    try {
      setIsSaving(true);
      await AxiosToken.post('/student/offer', formData);
      toast({
        title: 'تم إضافة التلميذ بنجاح ضمن العرض',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      offersModal.onClose();
      resetForm();
      invalidateStudents();
    } catch {
      toast({
        title: 'حدث خطأ أثناء حفظ بيانات التلميذ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: 'displayNumber', label: '#', sortable: false, render: (row) => row.displayNumber },
    { key: 'name', label: 'الاسم', sortable: true },
    { key: 'last_name', label: 'اللقب', sortable: true },
    { key: 'stage', label: 'المرحلة', sortable: true },
    {
      key: 'level',
      label: 'الاقسام',
      sortable: true,
      render: (row) => (
        <Badge bg="ink.100" color="ink.700" borderRadius="full" px={2.5} fontWeight="600">
          {row.level}
        </Badge>
      ),
    },
    { key: 'section', label: 'الشعبة', sortable: true,render:(row) => <Badge bg="ink.100" color="ink.700" borderRadius="full" px={2.5}>{row.section}</Badge> },
  ];

  return (
    <Box dir="rtl">
      <PageHeader
        title="التلاميذ"
        subtitle={
          <>
            <span dir="ltr">{pagination.total}</span> الطلاب المسجلين{' '}
            <span dir="ltr">{yearAcademy || '-'}</span>
          </>
        }
        actions={
          <>
            <Button
              leftIcon={<Download size={17} />}
              variant="outline"
              onClick={() => {
                setExportLevel('');
                exportModal.onOpen();
              }}
            >
              تحميل
            </Button>
            <Button
              leftIcon={<Gift size={17} />}
              variant="outline"
              colorScheme="purple"
              onClick={openOffersModal}
            >
              العروض
            </Button>
            <Button leftIcon={<Plus size={17} />} onClick={openAddModal}>
              إضافة تلميذ
            </Button>
          </>
        }
      />

      <Wrap spacing={3} mb={5} align="center" dir="rtl">
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث بالاسم، أو اللقب، أو الموقع..." />

        <Select
          w={{ base: 'full', sm: '190px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          dir="rtl"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
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
          <option value="">جميع الاقسام </option>
          {STAGES.map((stage) => (
            <optgroup key={stage} label={stage}>
              {STAGE_LEVELS[stage].map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </optgroup>
          ))}
        </Select>


        {(search || levelFilter || genderFilter) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearch('');
              setLevelFilter('');
              setGenderFilter('');
            }}
          >
            إعادة ضبط
          </Button>
        )}

        <HStack spacing={1.5} ml="auto" color="ink.400">
          <Users size={15} />
          <Text fontSize="xs">{pagination.total} نتيجة</Text>
        </HStack>
      </Wrap>

      <DataTable
        columns={columns}
        data={displayedStudents}
        isLoading={isLoading}
        emptyMessage="لا يوجد طالب يستوفي هذه المعايير."
        renderActions={(row) => (
          <HStack spacing={1}>
            <Tooltip label="عرض" hasArrow>
              <IconButton aria-label="عرض" icon={<Eye size={16} />} size="sm" variant="ghost" onClick={() => openViewModal(row)} />
            </Tooltip>
            <Tooltip label="إعادة تسجيل للسنة القادمة" hasArrow>
              <IconButton
                aria-label="إعادة تسجيل"
                icon={<RefreshCcw size={16} />}
                size="sm"
                variant="ghost"
                color="brand.600"
                _hover={{ bg: 'brand.50' }}
                onClick={() => askReenroll(row)}
                disabled={isDisabled}
              />
            </Tooltip>
            <Tooltip label="تعديل" hasArrow>
              <IconButton aria-label="تعديل" icon={<Pencil size={16} />} size="sm" variant="ghost" onClick={() => openEditModal(row)} />
            </Tooltip>
            <Tooltip label="حذف" hasArrow>
              <IconButton
                aria-label="حذف"
                icon={<Trash2 size={16} />}
                size="sm"
                variant="ghost"
                color="danger.500"
                _hover={{ bg: 'danger.50' }}
                onClick={() => askDelete(row)}
              />
            </Tooltip>
          </HStack>
        )}
      />

      {/* ترقيم الصفحات على مستوى الباك اند */}
      {pagination.totalPages > 1 && (
        <HStack justify="center" spacing={4} mt={4} dir="ltr">
          <IconButton
            aria-label="السابق"
            icon={<ChevronLeft size={16} />}
            size="sm"
            variant="outline"
            isDisabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          />
          <Text fontSize="sm" color="ink.500">
            {page} / {pagination.totalPages}
          </Text>
          <IconButton
            aria-label="التالي"
            icon={<ChevronRight size={16} />}
            size="sm"
            variant="outline"
            isDisabled={page >= pagination.totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
          />
        </HStack>
      )}

      <StudentFormModal
        isOpen={formModal.isOpen}
        onClose={() => {
          formModal.onClose();
          setPendingOffer(null);
          if (offerSession) offersModal.onOpen();
        }}
        onSubmit={handleSubmit}
        student={selectedStudent}
        isSaving={isSaving}
        uniqueIsError={uniqueIsError}
        setUniqueIsError={setUniqueIsError}
        lockedFatherName={pendingOffer?.fatherName || null}
        offerPositionLabel={
          pendingOffer ? `الطفل ${pendingOffer.position} من ${offerSession?.target}` : null
        }
        offerPromotionLabel={
          pendingOffer?.isLast ? getPromotionLabel(pendingOffer.promotion) : null
        }
      />

      <StudentViewModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.onClose}
        student={selectedStudent}
        onEdit={openEditModal}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="حذف هذا التلميذ؟"
        message={
          studentToDelete
            ? `هل أنت متأكد من حذف التلميذ ${studentToDelete.last_name} ${studentToDelete.name}؟ هذا الإجراء لا يمكن التراجع عنه.`
            : ''
        }
      />

      <Modal isOpen={reenrollModal.isOpen} onClose={reenrollModal.onClose} isCentered dir="rtl">
        <ModalOverlay />
        <ModalContent dir="rtl">
          <ModalHeader>إعادة تسجيل التلميذ</ModalHeader>
          <ModalCloseButton insetInlineStart={3} insetInlineEnd="auto" />
          <ModalBody>
            <FormControl>
              <FormLabel fontSize="sm">نتيجة التلميذ</FormLabel>
              <Select dir="rtl" value={reenrollStatus} onChange={(e) => setReenrollStatus(e.target.value)}>
                <option value="">اختر النتيجة</option>
                <option value="ناجح">ناجح</option>
                <option value="راسب">راسب</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" isLoading={isReenrolling} isDisabled={!reenrollStatus} onClick={handleReenroll}>
              تأكيد
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={exportModal.isOpen} onClose={exportModal.onClose} isCentered dir="rtl">
        <ModalOverlay />
        <ModalContent dir="rtl">
          <ModalHeader>تحميل بيانات التلاميذ</ModalHeader>
          <ModalCloseButton insetInlineStart={3} insetInlineEnd="auto" />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">اختر القسم / المستوى</FormLabel>
                <Select
                  dir="rtl"
                  value={exportLevel}
                  onChange={(e) => setExportLevel(e.target.value)}
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
                  <option value="">جميع المستويات</option>
                  {STAGES.map((stage) => (
                    <optgroup key={stage} label={stage}>
                      {STAGE_LEVELS[stage].map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2} w="full">
              <Button
                flex={1}
                leftIcon={<FileText size={16} />}
                colorScheme="red"
                variant="outline"
                isLoading={isExporting}
                onClick={() => handleExport('pdf')}
              >
                تحميلPDF
              </Button>
              <Button
                flex={1}
                leftIcon={<FileSpreadsheet size={16} />}
                colorScheme="green"
                variant="outline"
                isLoading={isExporting}
                onClick={() => handleExport('excel')}
              >
                تحميل Excel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <BacStudentFormModal isOpen={offersModal.isOpen} onClose={offersModal.onClose} onSubmit={handleBacSubmit} />
    </Box>
  );
}