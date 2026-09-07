import { useEffect, useMemo, useState } from 'react';
import { Box, Button, HStack, Select, Badge, IconButton, Tooltip, useToast, useDisclosure, Text, Wrap } from '@chakra-ui/react';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import DataTable from '../common/DataTable';
import ConfirmDialog from '../common/ConfirmDialog';
import AbsenceSubNav from './AbsenceSubNav';
import AbsenceRoleFormModal from './AbsenceRoleFormModal';
import { AxiosToken } from '../../api/Api';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

/**
 * Page générique de gestion des absences pour une catégorie donnée
 * (Élèves, Maîtres, Surveillants, Employés) — recherche, filtre sur le
 * champ secondaire, ajout/modification/suppression, toasts.
 *
 * @param {string} personLabel        Ex: "Élève"
 * @param {Array}  initialData
 * @param {string} secondaryFieldKey  'niveau' | 'matiere' | 'role'
 * @param {string} secondaryFieldLabel
 * @param {Array}  secondaryOptions
 *
 * @param {string} [personsEndpoint]  Optionnel — endpoint GET (ex: "/student", "/teacher") pour
 *                                    charger la liste utilisée par le modal. SANS cette prop :
 *                                    aucun fetch, Input libre (legacy) — donc ne pas la mettre
 *                                    pour une page qui n'est pas encore migrée.
 * @param {'students'|'search'} [personsMode]
 *                                    'students' -> Élève : niveau (auto, depuis .class) +
 *                                                  recherche par nom filtrée par niveau.
 *                                                  Transmis au modal via `students`.
 *                                    'search'   -> Maîtres / Surveillants / Employés : recherche
 *                                                  par nom directe, sans select secondaire.
 *                                                  Transmis au modal via `persons`.
 * @param {string} [personsResponseKey] Optionnel — clé dans response.data contenant le tableau
 *                                      (ex: "students", "teachers"). Sans elle : response.data
 *                                      utilisé directement s'il est un tableau, sinon response.data.data.
 */
export default function AbsenceRolePage({
  personLabel,
  initialData,
  secondaryFieldKey,
  secondaryFieldLabel,
  secondaryOptions,
  personsEndpoint,
  personsMode,
  personsResponseKey,
  searchFieldLabel,
}) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [secondaryFilter, setSecondaryFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [personsData, setPersonsData] = useState([]);
      const [isLoading, setIsLoading] = useState(false);


  const formModal = useDisclosure();
  const deleteDialog = useDisclosure();

 
  useEffect(() => {
    if (!personsEndpoint) return;
    setIsLoading(true)

    Promise.all([
      AxiosToken.get(personsEndpoint),
      AxiosToken.get(`absence${personsEndpoint}`),
    ])
      .then(([legacyResponse, absenceResponse]) => {
        const legacyList = personsResponseKey
          ? legacyResponse.data[personsResponseKey]
          : (Array.isArray(legacyResponse.data) ? legacyResponse.data : legacyResponse.data.data);

        const absenceList = absenceResponse.data.persons

       
        setPersonsData(Array.isArray(legacyList) ? legacyList : []);
        setItems(absenceList)
      })
      .catch(() => {
        console.error(`Erreur lors du chargement de la liste — ${personLabel}`);
      }).finally( () => {
        setIsLoading(false)
      })
  }, [personsEndpoint, personsResponseKey, personLabel, isSaving]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((a) => {
      const matchesSearch = !term || a.personne.toLowerCase().includes(term);
      const matchesSecondary = !secondaryFilter || a[secondaryFieldKey] === secondaryFilter;
      return matchesSearch && matchesSecondary;
    });
  }, [items, search, secondaryFilter, secondaryFieldKey]);

  const openAdd = () => { setSelected(null); formModal.onOpen(); };
  const openEdit = (a) => { setSelected(a); formModal.onOpen(); };
  const askDelete = (a) => { setToDelete(a); deleteDialog.onOpen(); };

  const handleSubmit = async (formData) => {
    if (!personsEndpoint) return;
    try{
    setIsSaving(true);
        const response = await AxiosToken.post(`absence${personsEndpoint}`,formData);
        formModal.onClose()
    }catch{

        console.error("error")
    }finally{
      setIsSaving(false)
    }

   
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setItems((prev) => prev.filter((a) => a.id !== toDelete.id));
      toast({ title: 'Absence supprimée', status: 'info', duration: 3000, isClosable: true });
      setIsDeleting(false);
      deleteDialog.onClose();
      setToDelete(null);
    }, 500);
  };

  const columns = [
    { key: 'personne', label: personLabel, sortable: true,
      render: (row) => `${row.person?.name ?? ''} ${row.person?.last_name ?? ''}`
     },
    {
      key: secondaryFieldKey,
      label: secondaryFieldLabel,
      sortable: true,
      render: (row) => (
        <Badge bg="ink.100" color="ink.700" borderRadius="full" px={2.5}>
           {secondaryFieldKey === "الاقسام"
        ? row.person?.class
        : secondaryFieldKey === "المادة"
        ? row.person?.subjects?.map(subject => subject).join(", ")
        : row.person?.role}
        </Badge>
      ),
    },
    { key: 'date', label: 'التاريخ', sortable: true, render: (row) => formatDate(row.date) },
    { key: 'reason', label: 'السبب' },
    {
      key: 'justification',
      label: 'عذر',
      sortable: true,
      render: (row) => (
        <HStack spacing={1.5}>
          {row.justification ? <CheckCircle2 size={15} color="var(--chakra-colors-positive-500)" /> : <XCircle size={15} color="var(--chakra-colors-danger-500)" />}
          <Text fontSize="sm" color={row.justification ? 'positive.600' : 'danger.500'} fontWeight="600">
            {row.justification ? 'Justifiée' : 'Non justifiée'}
          </Text>
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      <AbsenceSubNav />

      <Wrap spacing={3} mb={5} align="center">
        <SearchBar value={search} onChange={setSearch} placeholder={`بحث - ${personLabel}…`} />
        <Select
          w={{ base: 'full', sm: '200px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={secondaryFilter}
          onChange={(e) => setSecondaryFilter(e.target.value)}
          sx={{
          textAlign: 'right',
          paddingRight: '1rem',
          paddingLeft: '2rem',
          '& + div': {
            insetInlineEnd: 'auto',
            insetInlineStart: '0.5rem',
          },
        }}
        >
          <option value="">{`جميع - ${searchFieldLabel}`}</option>
          {secondaryOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
        {(search || secondaryFilter) && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setSecondaryFilter(''); }}>
            إعادة ضبط
          </Button>
        )}
        <HStack spacing={1.5} ml="auto" color="ink.400">
          <Text fontSize="xs">{filtered.length} نتيجة</Text>
        </HStack>
        <Button leftIcon={<Plus size={17} />} onClick={openAdd}>الإبلاغ عن الغياب</Button>
      </Wrap>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={8}
        isLoading={isLoading}
        emptyMessage="لم يتم تسجيل أي غيابات."
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

      <AbsenceRoleFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.onClose}
        onSubmit={handleSubmit}
        absence={selected}
        isSaving={isSaving}
        personLabel={personLabel}
        secondaryFieldKey={secondaryFieldKey}
        secondaryFieldLabel={secondaryFieldLabel}
        secondaryOptions={secondaryOptions}
        students={personsMode === 'students' ? personsData : undefined}
        persons={personsMode === 'search' ? personsData : undefined}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer cette absence ?"
        message={toDelete ? `Voulez-vous vraiment supprimer l\u2019absence de ${toDelete.personne} du ${formatDate(toDelete.date)} ?` : ''}
      />
    </Box>
  );
}