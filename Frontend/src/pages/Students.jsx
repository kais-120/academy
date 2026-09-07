import { useEffect, useMemo, useState } from 'react';
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
  FormErrorMessage,
  Input,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Plus, Eye, Pencil, Trash2, Download, Users, RefreshCcw, FileText, FileSpreadsheet, Gift, CheckCircle2, XCircle, UserPlus } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StudentFormModal from '../components/students/StudentFormModal';
import StudentViewModal from '../components/students/StudentViewModal';
import { students as initialStudents } from '../data/students';
import { levels } from '../data/school';
import { AxiosToken } from '../api/Api';
import BacStudentFormModal from '../components/students/BacStudentFormModal';


function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

// عدد الإخوة المسموح بهم في العروض: 3 و 4 فقط
function getOfferMessage(count) {
  const num = Number(count);
  if (!num) return null;
  if (num === 3) {
    return { status: 'success', text: 'الطفل الثالث يستفيد من تخفيض 50% على معلوم التسجيل.', promotion: 'discount_50' };
  }
  if (num === 4) {
    return { status: 'success', text: 'الطفل الرابع يستفيد من تسجيل مجاني بالكامل.', promotion: 'free' };
  }
  return { status: 'info', text: 'لا يوجد عرض خاص متاح حاليا لهذا العدد من الإخوة.', promotion: null };
}

// تحويل رمز العرض إلى نص واضح للمستخدم داخل نموذج التلميذ
function getPromotionLabel(promotion) {
  if (promotion === 'discount_50') return 'خصم 50% على معلوم التسجيل';
  if (promotion === 'free') return 'تسجيل مجاني بالكامل';
  return null;
}

export default function Students() {
  const toast = useToast();
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentToReenroll, setStudentToReenroll] = useState(null);
  const [reenrollStatus, setReenrollStatus] = useState('');


  const [exportLevel, setExportLevel] = useState('');
  const [uniqueIsError, setUniqueIsError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  // --- عروض (offres selon nombre d'enfants) ---
  const [fatherName, setFatherName] = useState('');
  const [siblingsCount, setSiblingsCount] = useState('');
  const [offerErrors, setOfferErrors] = useState({});
  const [isApplyingOffer, setIsApplyingOffer] = useState(false);
// جلسة إضافة التلاميذ ضمن العرض
const [offerSession, setOfferSession] = useState(null);
  // العرض الجاري تطبيقه عند إضافة تلميذ جديد من نافذة العروض
  const [pendingOffer, setPendingOffer] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [yearAcademy, setYearAcademy] = useState("");

  const formModal = useDisclosure();
  const viewModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const exportModal = useDisclosure();
  const offersModal = useDisclosure();

  const today = new Date();
const year = today.getFullYear();

const startDate = new Date(year, 9, 1);  // September 1
const endDate = new Date(year, 9, 30);   // September 30

const isDisabled = today >= startDate && today <= endDate;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await AxiosToken.get("/student");
        setStudents(response.data.students)
      } catch {
        console.error("error")
      }
      finally{
        setIsLoading(false)
      }
    }
    fetchData()
  }, [isSaving, isDeleting])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await AxiosToken.get("/school-info");
         if (response.data?.schoolInfo) {
            setYearAcademy(response.data.schoolInfo?.[0]?.academic_year);
        }
      } catch {
        console.error("error")
      }
      finally{
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        !term ||
        `${s.name} ${s.last_name} ${s.address}`.toLowerCase().includes(term);
      const matchesLevel = !levelFilter || s.class === levelFilter;
      const matchesGender = !genderFilter || s.gender === genderFilter;
      return matchesSearch && matchesLevel && matchesGender;
    })
      .map((p, idx) => ({ ...p, displayNumber: idx + 1 }));

  }, [students, search, levelFilter, genderFilter]);

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
// بدء جلسة إضافة التلاميذ حسب العرض
const handleStartOfferSession = () => {
  if (!validateOfferForm()) return;
  const target = Number(siblingsCount);
  const offer = getOfferMessage(siblingsCount);
  setOfferSession({
    fatherName: fatherName.trim(),
    target,
    promotion: offer?.promotion || null,
    addedStudents: [],
  });
};
// إلغاء الجلسة والرجوع لنقطة البداية
const handleCancelOfferSession = () => {
  setOfferSession(null);
  setFatherName('');
  setSiblingsCount('');
  setOfferErrors({});
};
// فتح نافذة إضافة تلميذ التالي ضمن الجلسة الحالية
const handleAddNextStudentInOffer = () => {
  if (!offerSession) return;
  const position = offerSession.addedStudents.length + 1;
  const isLast = position === offerSession.target;

  setPendingOffer({
    fatherName: offerSession.fatherName,
    position,
    isLast,
    promotion: offerSession.promotion,
  });

  setSelectedStudent(null);
  offersModal.onClose();
  formModal.onOpen();
};

// إنهاء الجلسة بعد اكتمال العدد
const handleFinishOfferSession = () => {
  toast({
    title: 'تم إكمال تسجيل جميع التلاميذ ضمن هذا العرض',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
  offersModal.onClose();
  handleCancelOfferSession();
};
  const handleSubmit = async (formData, { resetForm }) => {
  setIsSaving(true);
  setUniqueIsError(false);

  const payload = pendingOffer
    ? {
        ...formData,
        father_name: pendingOffer.fatherName,
        siblings_count: pendingOffer.position,
        promotion: pendingOffer.isLast ? pendingOffer.promotion : null,
      }
    : formData;

  try {
    let savedStudent = null;

    if (selectedStudent) {
      await AxiosToken.put(`/student/${selectedStudent.id}`, payload);
      toast({
        title: 'تم تعديل التلميذ بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      const response = await AxiosToken.post('/student', payload);
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
      offersModal.onOpen(); // نعود لنافذة العروض لعرض الـ card الجديدة
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

    // إن فشلت الإضافة ضمن جلسة عرض، نعيد فتح نافذة العروض بدل تركها معلقة
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
      await AxiosToken.delete(`/student/${studentToDelete.id}`)
      toast({
        title: 'تم حذف التلميذ بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

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
      // Adapte ce endpoint à celui de ton backend si nécessaire
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

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

 const handleExport = async (format) => {
  try {
    setIsExporting(true);

    const response = await AxiosToken.get("/download/students", {
      params: {
        format,
        level: exportLevel,
      },
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type:
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `students${exportLevel ? `-${exportLevel}` : ""}.${format === "pdf" ? "pdf" : "xlsx"}`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

    exportModal.onClose();
  } catch (error) {
    console.error("Export error:", error);

    toast({
      title: "خطأ",
      description: "حدث خطأ أثناء تحميل بيانات التلاميذ",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsExporting(false);
  }
};

  const validateOfferForm = () => {
    const next = {};
    if (!fatherName.trim()) next.fatherName = 'اسم الأب مطلوب.';
    if (!siblingsCount) next.siblingsCount = 'يرجى اختيار عدد الإخوة.';
    setOfferErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleApplyOffer = async () => {
    if (!validateOfferForm()) return;

    setIsApplyingOffer(true);
    try {
      // Adapte ce endpoint à celui de ton backend si nécessaire
      await AxiosToken.post('/promotions', {
        fatherName: fatherName.trim(),
        childrenCount: Number(siblingsCount),
      });
      toast({
        title: 'تم تسجيل العرض بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      offersModal.onClose();
      setFatherName('');
      setSiblingsCount('');
      setOfferErrors({});
    } catch {
      toast({
        title: 'حدث خطأ أثناء تسجيل العرض',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsApplyingOffer(false);
    }
  };

  const handleAddStudentWithOffer = () => {
    if (!validateOfferForm()) return;

    const offer = getOfferMessage(siblingsCount);

    setPendingOffer({
      fatherName: fatherName.trim(),
      childrenCount: Number(siblingsCount),
      promotion: offer?.promotion || null,
    });

    setSelectedStudent(null);
    offersModal.onClose();
    formModal.onOpen();
  };

  const columns = [
    { ket: "displayNumber", label: '#', sortable: false, render: (row) => row.displayNumber },
    { key: 'unique_id', label: 'المعرف الوحيد', sortable: true, render: (row) => row?.unique_id || "-" },
    { key: 'name', label: 'الاسم', sortable: true },
    { key: 'last_name', label: 'اللقب', sortable: true },
    {
      key: 'gender',
      label: 'الجنس',
      sortable: true,
      render: (row) => (
        <Badge
          bg={row.gender === 'بنت' ? 'brand.50' : 'accent.50'}
          color={row.gender === 'ولد' ? 'brand.700' : 'accent.500'}
          borderRadius="full"
          px={2.5}
        >
          {row.gender}
        </Badge>
      ),
    },
    { key: 'birthday', label: 'تاريخ الميلاد', sortable: true, render: (row) => formatDate(row.birthday) },
    {
      key: 'class',
      label: 'الاقسام',
      sortable: true,
      render: (row) => (
        <Badge bg="ink.100" color="ink.700" borderRadius="full" px={2.5} fontWeight="600">
          {row.class}
        </Badge>
      ),
    },
    { key: 'address', label: 'العنوان' },
  ];

  const currentOffer = getOfferMessage(siblingsCount);

  return (
    <Box dir='rtl' >
      <PageHeader
        title="التلاميذ"
        subtitle={
          <>
            <span dir="ltr">{students.length}</span>
            {' '}
           الطلاب المسجلين
            {' '}
            <span dir="ltr">{yearAcademy || "-"}</span>
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

      <Wrap spacing={3} mb={5} align="center" dir='rtl'>
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث بالاسم، أو اللقب، أو الموقع..." />

        <Select
          w={{ base: 'full', sm: '190px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          dir='rtl'
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
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </Select>

        <Select
          dir='rtl'
          w={{ base: 'full', sm: '190px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
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
          <option value="">كل الأجناس</option>
          <option value="ولد">ولد</option>
          <option value="بنت">بنت</option>
        </Select>

        {(search || levelFilter || genderFilter) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setSearch(''); setLevelFilter(''); setGenderFilter(''); }}
          >
            إعادة ضبط
          </Button>
        )}

        <HStack spacing={1.5} ml="auto" color="ink.400">
          <Users size={15} />
          <Text fontSize="xs">{filteredStudents.length} نتيجة</Text>
        </HStack>
      </Wrap>

      <DataTable
        columns={columns}
        data={filteredStudents}
        pageSize={8}
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

      <StudentFormModal
        isOpen={formModal.isOpen}
        onClose={() => {
          formModal.onClose();
          setPendingOffer(null);
          // si l'utilisateur ferme sans valider en pleine session, on rouvre les offres
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
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
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

      <BacStudentFormModal isOpen={offersModal.isOpen} onClose={offersModal.onClose} />

    {/* <Modal isOpen={offersModal.isOpen} onClose={offersModal.onClose} isCentered dir="rtl" size="lg">
  <ModalOverlay />
  <ModalContent dir="rtl">
    <ModalHeader>عروض التسجيل حسب عدد الإخوة</ModalHeader>
    <ModalCloseButton insetInlineStart={3} insetInlineEnd="auto" />

    {!offerSession ? (
      // ---------- الخطوة 1: تحديد الأب وعدد الإخوة ----------
      <>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={Boolean(offerErrors.fatherName)}>
              <FormLabel fontSize="sm">اسم الأب</FormLabel>
              <Input
                dir="rtl"
                placeholder="مثال: محمد بن علي"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                borderRadius="lg"
                borderColor="ink.200"
              />
              <FormErrorMessage>{offerErrors.fatherName}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={Boolean(offerErrors.siblingsCount)}>
              <FormLabel fontSize="sm">عدد الإخوة المراد تسجيلهم</FormLabel>
              <Select
                dir="rtl"
                value={siblingsCount}
                onChange={(e) => setSiblingsCount(e.target.value)}
                placeholder="اختر العدد"
                sx={{
                  textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem',
                  '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' },
                }}
              >
                <option value="3">3</option>
                <option value="4">4</option>
              </Select>
              <FormErrorMessage>{offerErrors.siblingsCount}</FormErrorMessage>
            </FormControl>

            {getOfferMessage(siblingsCount) && (
              <Alert status={getOfferMessage(siblingsCount).status} borderRadius="lg" fontSize="sm">
                <AlertIcon />
                {getOfferMessage(siblingsCount).text}
              </Alert>
            )}

            <Box bg="ink.50" borderRadius="lg" px={4} py={3}>
              <Text fontSize="xs" color="ink.500">
                • الطفل الثالث: تخفيض 50% على معلوم التسجيل.
                <br />
                • الطفل الرابع: تسجيل مجاني بالكامل.
                <br />
                سيتم فتح نموذج تلميذ جديد في كل مرة، مع اسم الأب مثبّتاً تلقائياً، حتى إتمام العدد المطلوب.
              </Text>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2} w="full">
            <Button variant="ghost" onClick={offersModal.onClose}>
              إلغاء
            </Button>
            <Button
              flex={1}
              colorScheme="purple"
              leftIcon={<UserPlus size={16} />}
              onClick={handleStartOfferSession}
            >
              بدء إضافة التلاميذ
            </Button>
          </HStack>
        </ModalFooter>
      </>
    ) : (
      // ---------- الخطوة 2: عرض الـ cards ومتابعة الإضافة ----------
      <>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              الأب: <b>&nbsp;{offerSession.fatherName}&nbsp;</b> — تمت إضافة {offerSession.addedStudents.length} من {offerSession.target}
            </Alert>

            {offerSession.addedStudents.length === 0 && (
              <Text fontSize="sm" color="ink.500">
                لم تتم إضافة أي تلميذ بعد. اضغط على "إضافة تلميذ" للبدء.
              </Text>
            )}

            <VStack spacing={2} align="stretch">
              {offerSession.addedStudents.map((s, idx) => (
                <Box
                  key={s.id}
                  borderWidth="1px"
                  borderColor="ink.200"
                  borderRadius="lg"
                  px={4}
                  py={3}
                >
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Badge borderRadius="full" px={2.5} bg="ink.100" color="ink.700">
                        {idx + 1}
                      </Badge>
                      <Text fontWeight="600">{s.last_name} {s.name}</Text>
                      {s.classe && (
                        <Badge borderRadius="full" px={2.5} bg="ink.100" color="ink.700">
                          {s.classe}
                        </Badge>
                      )}
                    </HStack>
                    {s.promotionApplied && (
                      <Badge colorScheme="purple" borderRadius="full" px={2.5}>
                        <HStack spacing={1}>
                          <Gift size={12} />
                          <Text>العرض مطبق</Text>
                        </HStack>
                      </Badge>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>

            {offerSession.addedStudents.length >= offerSession.target && (
              <Alert status="success" borderRadius="lg" fontSize="sm">
                <AlertIcon />
                تم إكمال تسجيل جميع التلاميذ وتطبيق العرض على آخر تلميذ.
              </Alert>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2} w="full">
            <Button variant="ghost" onClick={handleCancelOfferSession}>
              إلغاء العملية
            </Button>

            {offerSession.addedStudents.length < offerSession.target ? (
              <Button
                flex={1}
                colorScheme="brand"
                leftIcon={<UserPlus size={16} />}
                onClick={handleAddNextStudentInOffer}
              >
                إضافة تلميذ ({offerSession.addedStudents.length + 1} من {offerSession.target})
              </Button>
            ) : (
              <Button
                flex={1}
                colorScheme="green"
                leftIcon={<CheckCircle2 size={16} />}
                onClick={handleFinishOfferSession}
              >
                إنهاء
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </>
    )}
  </ModalContent>
    </Modal> */}
    </Box>
  );
}