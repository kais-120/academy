import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Wrap,
  WrapItem,
  IconButton,
  Icon,
  useToast,
  useDisclosure,
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
  Select,
  NumberInput,
  NumberInputField,
  Checkbox,
  CheckboxGroup,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRef } from 'react';

import { AxiosToken } from '../api/Api'; // عدّل المسار حسب مشروعك

// ---------------------------------------------------------------------------
// شعب الباكالوريا + المواد الخاصة بكل شعبة
// ---------------------------------------------------------------------------

const BAC_SHOBA_OPTIONS = ['علوم تجريبية', 'آداب', 'إعلامية', 'اقتصاد وتصرف', 'رياضيات', 'تكنولوجية'];

const MATIERES_BY_SHOBA = {
  'رياضيات': ['الرياضيات', 'الفيزياء', 'علوم الحياة والأرض', 'العربية', 'الفرنسية', 'الإنجليزية', 'الإعلامية', 'الفلسفة'],
  'علوم تجريبية': ['الرياضيات', 'الفيزياء', 'علوم الحياة والأرض', 'العربية', 'الفرنسية', 'الإنجليزية', 'الإعلامية', 'الفلسفة'],
  'تكنولوجية': ['الرياضيات', 'الفيزياء', 'التكنولوجيا / العلوم التقنية', 'الإعلامية', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'إعلامية': ['الرياضيات', 'الخوارزميات والبرمجة', 'الإعلامية / TIC', 'الفيزياء', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'اقتصاد وتصرف': ['الاقتصاد', 'التصرف', 'الرياضيات', 'التاريخ والجغرافيا', 'الإعلامية', 'العربية', 'الفرنسية', 'الإنجليزية', 'الفلسفة'],
  'آداب': ['العربية', 'الفلسفة', 'التاريخ والجغرافيا', 'الفرنسية', 'الإنجليزية', 'الإعلامية'],
};

const sxSelectRtl = {
  textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem',
  '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' },
};

const EMPTY_PACKAGE = {
  name: '',
  shoba: '',
  price: '',
  matieres: [],
};

const packageSchema = Yup.object({
  name: Yup.string().trim().required('اسم الباقة مطلوب.'),
  shoba: Yup.string().trim().required('الشعبة مطلوبة.'),
  price: Yup.number()
    .typeError('السعر يجب أن يكون رقمًا.')
    .min(0, 'السعر لا يمكن أن يكون سالبًا.')
    .required('السعر مطلوب.'),
  matieres: Yup.array().of(Yup.string()).min(1, 'اختر مادة واحدة على الأقل.'),
});

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null); // null = إنشاء جديد
  const [deletingPackage, setDeletingPackage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  // -------------------------------------------------------------------------
  // جلب الباقات
  // -------------------------------------------------------------------------
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await AxiosToken.get('/package');
      setPackages(response.data.packages ?? response.data ?? []);
    } catch (err) {
      console.error('error fetching packages', err);
      toast({ title: 'تعذّر تحميل الباقات', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // -------------------------------------------------------------------------
  // إنشاء / تعديل
  // -------------------------------------------------------------------------
  const openCreateModal = () => {
    setEditingPackage(null);
    formModal.onOpen();
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    formModal.onOpen();
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsSaving(true);
    try {
      if (editingPackage) {
        await AxiosToken.put(`/package/${editingPackage.id}`, values);
        toast({ title: 'تم تحديث الباقة بنجاح', status: 'success', duration: 2500 });
      } else {
        await AxiosToken.post('/package', values);
        toast({ title: 'تم إضافة الباقة بنجاح', status: 'success', duration: 2500 });
      }
      resetForm();
      formModal.onClose();
      setEditingPackage(null);
      fetchPackages();
    } catch (err) {
      console.error('error saving package', err);
      toast({ title: 'حدث خطأ أثناء الحفظ', status: 'error', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // حذف
  // -------------------------------------------------------------------------
  const askDelete = (pkg) => {
    setDeletingPackage(pkg);
    deleteDialog.onOpen();
  };

  const confirmDelete = async () => {
    if (!deletingPackage) return;
    setIsDeleting(true);
    try {
      await AxiosToken.delete(`/package/${deletingPackage.id}`);
      toast({ title: 'تم حذف الباقة', status: 'success', duration: 2500 });
      deleteDialog.onClose();
      setDeletingPackage(null);
      fetchPackages();
    } catch (err) {
      console.error('error deleting package', err);
      toast({ title: 'تعذّر حذف الباقة', status: 'error', duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container maxW="6xl" py={8} dir="rtl">
      <HStack justify="space-between" mb={6}>
        <VStack align="stretch" spacing={1}>
          <HStack spacing={2}>
            <Icon as={GraduationCap} boxSize={6} color="purple.500" />
            <Heading size="lg">إدارة الباقات</Heading>
          </HStack>
          <Text color="ink.500" fontSize="sm">
            إضافة وتعديل وحذف باقات التسجيل (الشعبة، المواد، السعر).
          </Text>
        </VStack>
        <Button colorScheme="purple" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
          باقة جديدة
        </Button>
      </HStack>

      {loading ? (
        <Center py={16}>
          <Spinner size="lg" color="purple.500" />
        </Center>
      ) : packages.length === 0 ? (
        <Center py={16}>
          <Text color="ink.500">لا توجد باقات بعد. اضغط "باقة جديدة" للبدء.</Text>
        </Center>
      ) : (
        <TableContainer borderWidth="1px" borderColor="ink.200" borderRadius="lg">
          <Table variant="simple">
            <Thead bg="ink.50">
              <Tr>
                <Th textAlign="right">اسم الباقة</Th>
                <Th textAlign="right">الشعبة</Th>
                <Th textAlign="right">السعر</Th>
                <Th textAlign="right">المواد</Th>
                <Th textAlign="right" w="120px">إجراءات</Th>
              </Tr>
            </Thead>
            <Tbody>
              {packages.map((pkg) => (
                <Tr key={pkg.id}>
                  <Td fontWeight="600">{pkg.name}</Td>
                  <Td>
                    <Badge borderRadius="full" px={2.5} bg="ink.100" color="ink.700">
                      {pkg.shoba}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="purple" borderRadius="full" px={2.5}>
                      {pkg.price} د.ت
                    </Badge>
                  </Td>
                  <Td>
                    <Wrap spacing={1}>
                      {(pkg.matieres ?? []).map((m) => (
                        <WrapItem key={m}>
                          <Badge fontSize="0.65rem" borderRadius="full" px={2} bg="ink.100" color="ink.700">
                            {m}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="تعديل"
                        icon={<Pencil size={15} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(pkg)}
                      />
                      <IconButton
                        aria-label="حذف"
                        icon={<Trash2 size={15} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => askDelete(pkg)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* ---------------- Modal إنشاء / تعديل ---------------- */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.onClose} isCentered dir="rtl" size="lg">
        <ModalOverlay />
        <ModalContent dir="rtl">
          <ModalHeader>{editingPackage ? 'تعديل الباقة' : 'باقة جديدة'}</ModalHeader>
          <ModalCloseButton insetInlineStart={3} insetInlineEnd="auto" />
          <Formik
            initialValues={
              editingPackage
                ? {
                    name: editingPackage.name ?? '',
                    shoba: editingPackage.shoba ?? '',
                    price: editingPackage.price ?? '',
                    matieres: editingPackage.matieres ?? [],
                  }
                : EMPTY_PACKAGE
            }
            enableReinitialize
            validationSchema={packageSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleSubmit: formikSubmit, setFieldValue }) => {
  const handleShobaChange = (e) => {
    const shoba = e.target.value;
    setFieldValue('shoba', shoba);
    setFieldValue('matieres', MATIERES_BY_SHOBA[shoba] ?? []);
  };

  const shobaMatieres = values.shoba ? MATIERES_BY_SHOBA[values.shoba] ?? [] : [];

  return (
    <Form>
      <ModalBody>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={touched.name && errors.name} isRequired>
            <FormLabel fontSize="sm">اسم الباقة</FormLabel>
            <Input
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="مثال: باكالوريا رياضيات"
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={touched.shoba && errors.shoba} isRequired>
            <FormLabel fontSize="sm">الشعبة</FormLabel>
            <Select
              name="shoba"
              placeholder="اختر الشعبة"
              value={values.shoba}
              onChange={handleShobaChange}
              sx={sxSelectRtl}
            >
              {BAC_SHOBA_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <FormErrorMessage>{errors.shoba}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={touched.price && errors.price} isRequired>
            <FormLabel fontSize="sm">السعر (د.ت)</FormLabel>
            <NumberInput
              value={values.price}
              onChange={(val) => setFieldValue('price', val)}
              min={0}
            >
              <NumberInputField placeholder="950" />
            </NumberInput>
            <FormErrorMessage>{errors.price}</FormErrorMessage>
          </FormControl>

          {/* المواد تظهر فقط بعد اختيار الشعبة، وتعرض مواد تلك الشعبة فقط */}
          {values.shoba && (
            <FormControl isInvalid={touched.matieres && errors.matieres} isRequired>
              <FormLabel fontSize="sm">المواد — {values.shoba}</FormLabel>
              <CheckboxGroup
                value={values.matieres}
                onChange={(vals) => setFieldValue('matieres', vals)}
              >
                <Wrap spacing={3}>
                  {shobaMatieres.map((m) => (
                    <WrapItem key={m}>
                      <Checkbox value={m}>{m}</Checkbox>
                    </WrapItem>
                  ))}
                </Wrap>
              </CheckboxGroup>
              <FormErrorMessage>{errors.matieres}</FormErrorMessage>
            </FormControl>
          )}
        </VStack>
      </ModalBody>
      <ModalFooter>
        <HStack spacing={2} w="full">
          <Button variant="ghost" onClick={formModal.onClose} isDisabled={isSaving}>
            إلغاء
          </Button>
          <Button
            flex={1}
            colorScheme="purple"
            onClick={formikSubmit}
            isLoading={isSaving}
            loadingText="حفظ…"
          >
            {editingPackage ? 'حفظ التغييرات' : 'إضافة الباقة'}
          </Button>
        </HStack>
      </ModalFooter>
    </Form>
  );
}}
          </Formik>
        </ModalContent>
      </Modal>

      {/* ---------------- تأكيد الحذف ---------------- */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDialog.onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف الباقة
            </AlertDialogHeader>
            <AlertDialogBody>
              هل أنت متأكد من حذف الباقة "{deletingPackage?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDialog.onClose}>
                إلغاء
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} isLoading={isDeleting} mr={3}>
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}