import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  SimpleGrid,
  VStack,
  Text,
  Avatar,
  HStack,
  Badge,
  Divider,
} from '@chakra-ui/react';

function Field({ label, value }) {
  return (
    <VStack align="flex-start" spacing={0.5}>
      <Text fontSize="xs" color="ink.400">{label}</Text>
      <Text fontSize="sm" fontWeight="600" color="ink.900">{value || '—'}</Text>
    </VStack>
  );
}

function SubBadge({ ok, label }) {
  return (
    <Badge
      bg={ok ? 'green.50' : 'red.50'}
      color={ok ? 'green.700' : 'red.700'}
      borderRadius="full"
      px={2.5}
      py={1}
      fontSize="11px"
    >
      {ok ? '✓' : '✕'} {label}
    </Badge>
  );
}

const PROMOTION_LABELS = {
  discount_50: 'تخفيض ٪50',
  free: 'مجاني',
};

export default function StudentViewModal({ isOpen, onClose, student, onEdit }) {
  if (!student) return null;
  console.log(student.birthday)
  const age = student.birthday
    ? Math.floor((Date.now() - new Date(student.birthday).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  const subscription = student.subscription;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="2xl" mx={4} dir="rtl">
        <ModalHeader borderBottom="1px solid" borderColor="ink.100">
          <HStack spacing={3}>
            <Avatar name={`${student.name} ${student.last_name}`} bg="brand.600" color="white" />
            <VStack spacing={0} align="flex-start">
              <Text fontFamily="heading" fontWeight="700" color="ink.900">
                {student.name} {student.last_name}
              </Text>
              <HStack spacing={2}>
                <Badge bg="brand.50" color="brand.700" borderRadius="full" px={2} fontSize="10px">
                  {student.classe}
                </Badge>
                {student.unique_id && (
                  <Badge bg="ink.50" color="ink.600" borderRadius="full" px={2} fontSize="10px">
                    #{student.unique_id}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton
        insetInlineStart="3"
        insetInlineEnd="auto"
      />
        <ModalBody py={5}>
          <SimpleGrid columns={2} spacing={5}>
            <Field label="الجنس" value={student.gender} />
            <Field  label="عمر" value={age ? `سنوات ${age}` : '—'} />
            <Field label="تاريخ الميلاد" value={student.birthday} />
            <Field label="موقع" value={student.address} />
          </SimpleGrid>

          <Divider my={4} borderColor="ink.100" />

          <Text fontSize="xs" fontWeight="700" color="ink.500" mb={3} textTransform="uppercase" letterSpacing="wide">
            معلومات الوالدين
          </Text>
          <SimpleGrid columns={2} spacing={5}>
            <Field label="اسم الأب" value={student.father_name} />
            <Field label="اسم الأم" value={student.mother_name} />
            <Field label="هاتف الأب" value={student.father_phone} />
            <Field label="رقم هاتف الأم" value={student.mother_phone} />
          </SimpleGrid>

          <Divider my={4} borderColor="ink.100" />

          <Text fontSize="xs" fontWeight="700" color="ink.500" mb={3} textTransform="uppercase" letterSpacing="wide">
            معلومات الاشتراك
          </Text>
          {subscription ? (
            <VStack align="flex-start" spacing={3}>
              <HStack spacing={2} wrap="wrap">
                <SubBadge ok={subscription.transport} label="النقل" />
                <SubBadge ok={subscription.is_take_uniform} label="الزي المدرسي" />
                <SubBadge ok={subscription.is_take_book} label="الكتب" />
              </HStack>
              <SimpleGrid columns={2} spacing={5}>
                {subscription.transport && (
                  <Field label="المنطقة" value={subscription.zone} />
                )}
                <Field label="نوع الدفع" value={subscription.payment_type} />
                <Field
                  label="تخفيض"
                  value={subscription.promotion ? (PROMOTION_LABELS[subscription.promotion] || subscription.promotion) : null}
                />
                <Field label="عدد الإخوة" value={subscription.siblings_count} />
              </SimpleGrid>
            </VStack>
          ) : (
            <Text fontSize="sm" color="ink.400">لا يوجد اشتراك</Text>
          )}
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="ink.100" gap={2}>
          <Button variant="outline" onClick={onClose}>غلق</Button>
          <Button onClick={() => { onClose(); onEdit(student); }}>قم بتعديل بيانات هذا التلميذ</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}