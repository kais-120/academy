import { useMemo, useState } from 'react';
import { Box, Button, HStack, Badge, IconButton, Tooltip, useToast, useDisclosure, Text, Wrap } from '@chakra-ui/react';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LateFormModal from '../../components/register/LateFormModal';
import { lateRecords as initialLateRecords } from '../../data/register';

export default function Late() {
  const toast = useToast();
  const [records, setRecords] = useState(initialLateRecords);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formModal = useDisclosure();
  const deleteDialog = useDisclosure();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => !term || r.eleve.toLowerCase().includes(term));
  }, [records, search]);

  const openAdd = () => { setSelected(null); formModal.onOpen(); };
  const openEdit = (r) => { setSelected(r); formModal.onOpen(); };
  const askDelete = (r) => { setToDelete(r); deleteDialog.onOpen(); };

  const handleSubmit = (formData) => {
    setIsSaving(true);
    setTimeout(() => {
      if (selected) {
        setRecords((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...formData } : r)));
        toast({ title: 'Retard modifié', status: 'success', duration: 3000, isClosable: true });
      } else {
        const newRecord = { ...formData, id: Math.max(0, ...records.map((r) => r.id)) + 1 };
        setRecords((prev) => [newRecord, ...prev]);
        toast({ title: 'Retard enregistré', status: 'success', duration: 3000, isClosable: true });
      }
      setIsSaving(false);
      formModal.onClose();
    }, 600);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setRecords((prev) => prev.filter((r) => r.id !== toDelete.id));
      toast({ title: 'Retard supprimé', status: 'info', duration: 3000, isClosable: true });
      setIsDeleting(false);
      deleteDialog.onClose();
      setToDelete(null);
    }, 500);
  };

  const columns = [
    { key: 'eleve', label: 'Élève', sortable: true },
    { key: 'heureArrivee', label: 'Heure arrivée', sortable: true },
    {
      key: 'retard',
      label: 'Retard',
      sortable: true,
      isNumeric: true,
      render: (row) => (
        <Badge bg={row.retard > 20 ? 'danger.50' : 'warning.50'} color={row.retard > 20 ? 'danger.500' : 'warning.500'} borderRadius="full" px={2.5}>
          {row.retard} min
        </Badge>
      ),
    },
    {
      key: 'justifiee',
      label: 'Justification',
      sortable: true,
      render: (row) => (
        <HStack spacing={1.5}>
          {row.justifiee ? <CheckCircle2 size={15} color="var(--chakra-colors-positive-500)" /> : <XCircle size={15} color="var(--chakra-colors-danger-500)" />}
          <Text fontSize="sm" color={row.justifiee ? 'positive.600' : 'danger.500'} fontWeight="600">
            {row.justifiee ? 'Justifié' : 'Non justifié'}
          </Text>
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      <Wrap spacing={3} mb={5} align="center">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un élève…" />
        {search && (
          <Button size="sm" variant="ghost" onClick={() => setSearch('')}>Réinitialiser</Button>
        )}
        <HStack spacing={1.5} ml="auto" color="ink.400">
          <Text fontSize="xs">{filtered.length} résultat(s)</Text>
        </HStack>
        <Button leftIcon={<Plus size={17} />} onClick={openAdd}>Déclarer un retard</Button>
      </Wrap>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={8}
        emptyMessage="Aucun retard enregistré."
        renderActions={(row) => (
          <HStack spacing={1}>
            <Tooltip label="Modifier" hasArrow>
              <IconButton aria-label="Modifier" icon={<Pencil size={16} />} size="sm" variant="ghost" onClick={() => openEdit(row)} />
            </Tooltip>
            <Tooltip label="Supprimer" hasArrow>
              <IconButton aria-label="Supprimer" icon={<Trash2 size={16} />} size="sm" variant="ghost" color="danger.500" _hover={{ bg: 'danger.50' }} onClick={() => askDelete(row)} />
            </Tooltip>
          </HStack>
        )}
      />

      <LateFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.onClose}
        onSubmit={handleSubmit}
        record={selected}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer ce retard ?"
        message={toDelete ? `Voulez-vous vraiment supprimer le retard de ${toDelete.eleve} ?` : ''}
      />
    </Box>
  );
}
