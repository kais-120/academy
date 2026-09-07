import { useEffect, useMemo, useState } from 'react';
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Button,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import FormModal from '../common/FormModal';
import { students } from '../../data/students';
import { paymentTypes, paymentModes, paymentStatuses } from '../../data/payments';

const EMPTY_FORM = {
  eleve: '',
  niveau: '',
  typePaiement: '',
  montant: '',
  datePaiement: '',
  modePaiement: '',
  statut: '',
};

export default function PaymentFormModal({ isOpen, onClose, onSubmit, payment = null, isSaving = false }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEditMode = Boolean(payment);

  const studentOptions = useMemo(
    () => students.map((s) => ({ label: `${s.prenom} ${s.nom}`, niveau: s.niveau })),
    []
  );

  useEffect(() => {
    if (isOpen) {
      setForm(payment ? { ...EMPTY_FORM, ...payment } : EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, payment]);

  const setField = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleEleveChange = (e) => {
    const label = e.target.value;
    const match = studentOptions.find((s) => s.label === label);
    setForm((f) => ({ ...f, eleve: label, niveau: match ? match.niveau : f.niveau }));
  };

  const validate = () => {
    const next = {};
    if (!form.eleve) next.eleve = 'L\u2019élève est requis.';
    if (!form.typePaiement) next.typePaiement = 'Le type de paiement est requis.';
    if (form.montant === '' || Number(form.montant) < 0) next.montant = 'Le montant doit être positif ou nul.';
    if (!form.datePaiement) next.datePaiement = 'La date est requise.';
    if (!form.modePaiement) next.modePaiement = 'Le mode de paiement est requis.';
    if (!form.statut) next.statut = 'Le statut est requis.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, montant: Number(form.montant) });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifier le paiement' : 'Nouveau paiement'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} isLoading={isSaving} loadingText="Enregistrement…">
            {isEditMode ? 'Enregistrer' : 'Enregistrer le paiement'}
          </Button>
        </>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isInvalid={Boolean(errors.eleve)} isRequired gridColumn={{ md: 'span 2' }}>
            <FormLabel fontSize="sm">Élève</FormLabel>
            <Select placeholder="Sélectionner un élève" value={form.eleve} onChange={handleEleveChange}>
              {studentOptions.map((s) => (
                <option key={s.label} value={s.label}>{s.label}</option>
              ))}
            </Select>
            {form.niveau && <FormHelperText>Niveau : {form.niveau}</FormHelperText>}
            <FormErrorMessage>{errors.eleve}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.typePaiement)} isRequired>
            <FormLabel fontSize="sm">Type de paiement</FormLabel>
            <Select placeholder="Sélectionner" value={form.typePaiement} onChange={setField('typePaiement')}>
              {paymentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <FormErrorMessage>{errors.typePaiement}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.montant)} isRequired>
            <FormLabel fontSize="sm">Montant</FormLabel>
            <InputGroup>
              <Input type="number" min="0" value={form.montant} onChange={setField('montant')} placeholder="1200" />
              <InputRightElement w="3.2rem" color="ink.400" fontSize="sm">DT</InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.montant}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.datePaiement)} isRequired>
            <FormLabel fontSize="sm">Date de paiement</FormLabel>
            <Input type="date" value={form.datePaiement} onChange={setField('datePaiement')} />
            <FormErrorMessage>{errors.datePaiement}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.modePaiement)} isRequired>
            <FormLabel fontSize="sm">Mode de paiement</FormLabel>
            <Select placeholder="Sélectionner" value={form.modePaiement} onChange={setField('modePaiement')}>
              {paymentModes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <FormErrorMessage>{errors.modePaiement}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.statut)} isRequired gridColumn={{ md: 'span 2' }}>
            <FormLabel fontSize="sm">Statut</FormLabel>
            <Select placeholder="Sélectionner" value={form.statut} onChange={setField('statut')}>
              {paymentStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <FormErrorMessage>{errors.statut}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>
      </form>
    </FormModal>
  );
}
