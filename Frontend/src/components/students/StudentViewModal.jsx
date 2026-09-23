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
  Wrap,
  WrapItem,
  Box,
} from '@chakra-ui/react';

function Field({ label, value }) {
  return (
    <VStack align="flex-start" spacing={0.5}>
      <Text fontSize="xs" color="ink.400">{label}</Text>
      <Text fontSize="sm" fontWeight="600" color="ink.900">{value || '—'}</Text>
    </VStack>
  );
}

function StatusBadge({ status }) {
  const map = {
    'payé': { bg: 'green.50', color: 'green.700', label: 'مدفوع' },
    'en attente': { bg: 'orange.50', color: 'orange.700', label: 'في الانتظار' },
    'non payé': { bg: 'red.50', color: 'red.700', label: 'غير مدفوع' },
  };
  const cfg = map[status] || { bg: 'ink.50', color: 'ink.600', label: status || '—' };
  return (
    <Badge bg={cfg.bg} color={cfg.color} borderRadius="full" px={2.5} py={1} fontSize="11px">
      {cfg.label}
    </Badge>
  );
}

export default function StudentViewModal({ isOpen, onClose, student, onEdit }) {
  if (!student) return null;

  const subscription = student.subscription;
  const packages = student.studentPackage || [];

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
              <HStack spacing={2} wrap="wrap">
                {student.stage && (
                  <Badge bg="brand.50" color="brand.700" borderRadius="full" px={2} fontSize="10px">
                    {student.stage}
                  </Badge>
                )}
                {student.level && (
                  <Badge bg="ink.50" color="ink.600" borderRadius="full" px={2} fontSize="10px">
                    {student.level}
                  </Badge>
                )}
                {student.section && (
                  <Badge bg="ink.50" color="ink.600" borderRadius="full" px={2} fontSize="10px">
                    {student.section}
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
            <Field label="الهاتف" value={student.phone} />
            <Field label="المرحلة" value={student.stage} />
            <Field label="المستوى" value={student.level} />
            <Field label="الشعبة" value={student.section} />
          </SimpleGrid>

          <Divider my={4} borderColor="ink.100" />

          <Text fontSize="xs" fontWeight="700" color="ink.500" mb={3} textTransform="uppercase" letterSpacing="wide">
            معلومات الوالدين
          </Text>
          <SimpleGrid columns={2} spacing={5}>
            <Field label="اسم الأب" value={student.father_name} />
            <Field label="اسم الأم" value={student.mother_name} />
            <Field label="هاتف الأب" value={student.father_phone} />
            <Field label="هاتف الأم" value={student.mother_phone} />
          </SimpleGrid>

          <Divider my={4} borderColor="ink.100" />

          <Text fontSize="xs" fontWeight="700" color="ink.500" mb={3} textTransform="uppercase" letterSpacing="wide">
            معلومات الاشتراك
          </Text>
          {subscription ? (
            <VStack align="flex-start" spacing={3}>
              <HStack spacing={2} wrap="wrap">
                <StatusBadge status={subscription.status} />
                {subscription.is_offer && (
                  <Badge bg="purple.50" color="purple.700" borderRadius="full" px={2.5} py={1} fontSize="11px">
                    عرض خاص
                  </Badge>
                )}
              </HStack>
              <SimpleGrid columns={2} spacing={5}>
                <Field label="المبلغ" value={subscription.amount != null ? `${subscription.amount} د.ت` : null} />
              </SimpleGrid>
            </VStack>
          ) : (
            <Text fontSize="sm" color="ink.400">لا يوجد اشتراك</Text>
          )}

          <Divider my={4} borderColor="ink.100" />

          <Text fontSize="xs" fontWeight="700" color="ink.500" mb={3} textTransform="uppercase" letterSpacing="wide">
            الباقة الدراسية
          </Text>
          {packages.length > 0 ? (
            <VStack align="stretch" spacing={4}>
              {packages.map((sp) => {
                const pkg = sp.packageStudentPackage;
                if (!pkg) return null;
                return (
                  <Box key={sp.id} p={3} borderRadius="xl" bg="ink.50">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="700" color="ink.900">
                        {pkg.name} {pkg.section ? `— ${pkg.section}` : ''}
                      </Text>
                      <Text fontSize="sm" fontWeight="600" color="brand.700">
                        {pkg.amount} د.ت
                      </Text>
                    </HStack>
                    {pkg.packageSubject?.length > 0 && (
                      <Wrap spacing={2}>
                        {pkg.packageSubject.map((subj) => (
                          <WrapItem key={subj.id}>
                            <Badge bg="white" color="ink.700" borderRadius="full" px={2.5} py={1} fontSize="11px">
                              {subj.name}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    )}
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Text fontSize="sm" color="ink.400">لا توجد باقة دراسية</Text>
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