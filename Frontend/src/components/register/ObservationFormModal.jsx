import { useEffect, useState } from 'react';
import { SimpleGrid, FormControl, FormLabel, FormErrorMessage, Input, Select, Button, Textarea } from '@chakra-ui/react';
import FormModal from '../common/FormModal';
import { observationTypes } from '../../data/register';

const EMPTY_FORM = { date: '', concerne: '', type: '', auteur: '', observation: '' };

export default function ObservationFormModal({ isOpen, onClose, onSubmit, item = null, isSaving = false }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEditMode = Boolean(item);

  useEffect(() => {
    if (isOpen) {
      setForm(item ? { ...EMPTY_FORM, ...item } : EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, item]);

  const setField = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.date) next.date = 'La date est requise.';
    if (!form.concerne.trim()) next.concerne = 'Ce champ est requis.';
    if (!form.type) next.type = 'Le type est requis.';
    if (!form.auteur.trim()) next.auteur = 'L\u2019auteur est requis.';
    if (!form.observation.trim()) next.observation = 'L\u2019observation est requise.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifier l\u2019observation' : 'Ajouter une observation'}
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
          <FormControl isInvalid={Boolean(errors.date)} isRequired>
            <FormLabel fontSize="sm">Date</FormLabel>
            <Input type="date" value={form.date} onChange={setField('date')} />
            <FormErrorMessage>{errors.date}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.type)} isRequired>
            <FormLabel fontSize="sm">Type</FormLabel>
            <Select placeholder="Sélectionner" value={form.type} onChange={setField('type')}>
              {observationTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <FormErrorMessage>{errors.type}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.concerne)} isRequired gridColumn={{ md: 'span 2' }}>
            <FormLabel fontSize="sm">Concerne</FormLabel>
            <Input value={form.concerne} onChange={setField('concerne')} placeholder="Yassine Jlassi — 2ème année" />
            <FormErrorMessage>{errors.concerne}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.auteur)} isRequired gridColumn={{ md: 'span 2' }}>
            <FormLabel fontSize="sm">Auteur</FormLabel>
            <Input value={form.auteur} onChange={setField('auteur')} placeholder="Mohamed Ben Ali" />
            <FormErrorMessage>{errors.auteur}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.observation)} isRequired gridColumn={{ md: 'span 2' }}>
            <FormLabel fontSize="sm">Observation</FormLabel>
            <Textarea value={form.observation} onChange={setField('observation')} placeholder="Décrire l’observation…" rows={4} />
            <FormErrorMessage>{errors.observation}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>
      </form>
    </FormModal>
  );
}
