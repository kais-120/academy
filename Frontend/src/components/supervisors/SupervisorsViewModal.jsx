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
} from '@chakra-ui/react';

function Field({ label, value }) {
  return (
    <VStack align="flex-start" spacing={0.5}>
      <Text fontSize="xs" color="ink.400">{label}</Text>
      <Text fontSize="sm" fontWeight="600" color="ink.900">{value || '—'}</Text>
    </VStack>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

/**
 * Modal de consultation générique pour le personnel (maîtres, surveillants, employés).
 */
export default function SupervisorsViewModal({ isOpen, onClose, person, onEdit, roleFieldKey, roleFieldLabel }) {
  if (!person) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader borderBottom="1px solid" borderColor="ink.100">
          <HStack spacing={3}>
            <Avatar name={`${person.last_name} ${person.name}`} bg="brand.600" color="white" />
            <VStack spacing={0} align="flex-start">
              <Text fontFamily="heading" fontWeight="700" color="ink.900">
                {person.last_name} {person.name}
              </Text>
              <Badge bg="brand.50" color="brand.700" borderRadius="full" px={2} fontSize="10px">
                {person[roleFieldKey]}
              </Badge>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={5}>
          <SimpleGrid columns={2} spacing={5}>
            <Field label="Téléphone" value={person.phone} />
            <Field label={roleFieldLabel} value={person[roleFieldKey]} />
            <Field label="Date dépôt salaire" value={formatDate(person.date_deposited)} />
            <Field label="Salaire" value={person.salary ? `${person.salary.toLocaleString('fr-FR')} DT` : '—'} />
            {person.status && <Field label="Statut" value={person.status} />}
          </SimpleGrid>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="ink.100" gap={2}>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button onClick={() => { onClose(); onEdit(person); }}>Modifier</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
