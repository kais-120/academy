import { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
} from '@chakra-ui/react';

/**
 * Boîte de dialogue de confirmation réutilisable — utilisée avant toute
 * action destructive (suppression d'un élève, d'un maître, etc.).
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer la suppression',
  message = 'Cette action est irréversible. Voulez-vous continuer ?',
  confirmLabel = 'حذف',
  isLoading = false,
}) {
  const cancelRef = useRef();

  return (
    <AlertDialog  isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent dir='rtl' borderRadius="xl" mx={4}>
          <AlertDialogHeader fontFamily="heading" fontSize="lg" fontWeight="700" color="ink.900">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text fontSize="sm" color="ink.600">{message}</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="outline">
              إلغاء
            </Button>
            <Button colorScheme="red" bg="danger.500" _hover={{ bg: 'red.600' }} onClick={onConfirm} ml={3} isLoading={isLoading}>
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
