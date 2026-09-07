import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';

/**
 * Coquille de modal réutilisable pour tous les formulaires de l'application
 * (élèves, maîtres, surveillants, employés, paiements…).
 */
export default function FormModal({ isOpen, onClose, title, children, footer, size = 'xl' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent dir='rtl' borderRadius="2xl" mx={4}>
        <ModalHeader fontFamily="heading" fontWeight="700" color="ink.900" borderBottom="1px solid" borderColor="ink.100">
          {title}
        </ModalHeader>
        <ModalCloseButton
  insetInlineStart="3"
  insetInlineEnd="auto"
/>
        <ModalBody py={5}>{children}</ModalBody>
        {footer && (
          <ModalFooter borderTop="1px solid" borderColor="ink.100" gap={2}>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
