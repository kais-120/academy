import { useEffect, useState } from 'react';
import { SimpleGrid, FormControl, FormLabel, FormErrorMessage, Input, Button, Switch, HStack, Text } from '@chakra-ui/react';
import FormModal from '../common/FormModal';

const EMPTY_FORM = { eleve: '', heureArrivee: '', retard: '', justifiee: false };

export default function LateFormModal({ isOpen, onClose, onSubmit, record = null, isSaving = false }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEditMode = Boolean(record);

  useEffect(() => {
    if (isOpen) {
      setForm(record ? { ...EMPTY_FORM, ...record } : EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, record]);

  const setField = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.eleve.trim()) next.eleve = 'Le nom de l\u2019élève est requis.';
    if (!form.heureArrivee) next.heureArrivee = 'L\u2019heure d\u2019arrivée est requise.';
    if (!form.retard || Number(form.retard) <= 0) next.retard = 'Le retard doit être positif (en minutes).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, retard: Number(form.retard) });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifier le retard' : 'Déclarer un retard'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} isLoading={isSaving} loadingText="Enregistrement…">
            {isEditMode ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isInvalid={Boolean(errors.eleve)} isRequired gridColumn={{ md: 'span 2' }}>
            <FormLabel fontSize="sm">Élève</FormLabel>
            <Input value={form.eleve} onChange={setField('eleve')} placeholder="Rayen Kilani" />
            <FormErrorMessage>{errors.eleve}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.heureArrivee)} isRequired>
            <FormLabel fontSize="sm">Heure d’arrivée</FormLabel>
            <Input type="time" value={form.heureArrivee} onChange={setField('heureArrivee')} />
            <FormErrorMessage>{errors.heureArrivee}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.retard)} isRequired>
            <FormLabel fontSize="sm">Retard (minutes)</FormLabel>
            <Input type="number" min="1" value={form.retard} onChange={setField('retard')} placeholder="15" />
            <FormErrorMessage>{errors.retard}</FormErrorMessage>
          </FormControl>

          <FormControl gridColumn={{ md: 'span 2' }}>
            <FormLabel fontSize="sm">Justification</FormLabel>
            <HStack h="40px" spacing={3}>
              <Switch colorScheme="blue" isChecked={form.justifiee} onChange={(e) => setField('justifiee')(e.target.checked)} />
              <Text fontSize="sm" color="ink.600">{form.justifiee ? 'Justifié' : 'Non justifié'}</Text>
            </HStack>
          </FormControl>
        </SimpleGrid>
      </form>
    </FormModal>
  );
}
