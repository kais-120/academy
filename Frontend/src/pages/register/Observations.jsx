import { useMemo, useState } from 'react';
import { Box, Button, HStack, Select, Badge, IconButton, Tooltip, useToast, useDisclosure, Text, Wrap } from '@chakra-ui/react';
import { Plus, Pencil, Trash2, MessageSquareText } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ObservationFormModal from '../../components/register/ObservationFormModal';
import { observations as initialObservations, observationTypes } from '../../data/register';

const TYPE_COLORS = {
  Positive: { bg: 'positive.50', color: 'positive.600' },
  Négative: { bg: 'danger.50', color: 'danger.500' },
  Neutre: { bg: 'ink.100', color: 'ink.700' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function Observations() {
  const toast = useToast();
  const [items, setItems] = useState(initialObservations);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formModal = useDisclosure();
  const deleteDialog = useDisclosure();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((o) => {
      const matchesSearch = !term || `${o.concerne} ${o.observation} ${o.auteur}`.toLowerCase().includes(term);
      const matchesType = !typeFilter || o.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  const openAdd = () => { setSelected(null); formModal.onOpen(); };
  const openEdit = (o) => { setSelected(o); formModal.onOpen(); };
  const askDelete = (o) => { setToDelete(o); deleteDialog.onOpen(); };

  const handleSubmit = (formData) => {
    setIsSaving(true);
    setTimeout(() => {
      if (selected) {
        setItems((prev) => prev.map((o) => (o.id === selected.id ? { ...o, ...formData } : o)));
        toast({ title: 'Observation modifiée', status: 'success', duration: 3000, isClosable: true });
      } else {
        const newItem = { ...formData, id: Math.max(0, ...items.map((o) => o.id)) + 1 };
        setItems((prev) => [newItem, ...prev]);
        toast({ title: 'Observation ajoutée', status: 'success', duration: 3000, isClosable: true });
      }
      setIsSaving(false);
      formModal.onClose();
    }, 600);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setItems((prev) => prev.filter((o) => o.id !== toDelete.id));
      toast({ title: 'Observation supprimée', status: 'info', duration: 3000, isClosable: true });
      setIsDeleting(false);
      deleteDialog.onClose();
      setToDelete(null);
    }, 500);
  };

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (row) => formatDate(row.date) },
    { key: 'concerne', label: 'Concerne', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => {
        const c = TYPE_COLORS[row.type] || TYPE_COLORS.Neutre;
        return <Badge bg={c.bg} color={c.color} borderRadius="full" px={2.5}>{row.type}</Badge>;
      },
    },
    { key: 'auteur', label: 'Auteur' },
    {
      key: 'observation',
      label: 'Observation',
      render: (row) => (
        <Text fontSize="sm" color="ink.700" maxW="320px" whiteSpace="normal" noOfLines={2}>
          {row.observation}
        </Text>
      ),
    },
  ];

  return (
    <Box>
      <Wrap spacing={3} mb={5} align="center">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un nom, une observation…" />
        <Select
          w={{ base: 'full', sm: '160px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Tous les types</option>
          {observationTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        {(search || typeFilter) && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setTypeFilter(''); }}>
            Réinitialiser
          </Button>
        )}
        <HStack spacing={1.5} ml="auto" color="ink.400">
          <MessageSquareText size={15} />
          <Text fontSize="xs">{filtered.length} résultat(s)</Text>
        </HStack>
        <Button leftIcon={<Plus size={17} />} onClick={openAdd}>Ajouter une observation</Button>
      </Wrap>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={6}
        emptyMessage="Aucune observation enregistrée."
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

      <ObservationFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.onClose}
        onSubmit={handleSubmit}
        item={selected}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer cette observation ?"
        message={toDelete ? `Voulez-vous vraiment supprimer cette observation concernant ${toDelete.concerne} ?` : ''}
      />
    </Box>
  );
}
