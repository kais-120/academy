import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Select,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  useDisclosure,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { Plus, Eye, Pencil, Trash2, Download, Users } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import SearchBar from '../common/SearchBar';
import DataTable from '../common/DataTable';
import ConfirmDialog from '../common/ConfirmDialog';
import EmployViewModal from './EmployViewModal';
import { AxiosToken } from '../../api/Api';
import EmployFormModal from './EmployFormModal';

const STATUS_COLORS = {
  actif: { bg: 'positive.50', color: 'positive.600' },
  'en congé': { bg: 'warning.50', color: 'warning.500' },
  inactif: { bg: 'danger.50', color: 'danger.500' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

/**
 * Page générique de gestion du personnel — encapsule toute la logique CRUD
 * (recherche, filtre, tri, pagination, ajout/modification/suppression, toasts)
 * pour être configurée différemment sur Maîtres / Surveillants / Employés.
 *
 * @param {string} pageTitle          Ex: "Maîtres"
 * @param {string} entityLabel        Ex: "un maître" (utilisé dans les libellés de formulaire)
 * @param {Array}  initialData
 * @param {string} roleFieldKey       'matiere' ou 'role'
 * @param {string} roleFieldLabel     'Matière' ou 'Rôle'
 * @param {Array}  roleOptions
 * @param {boolean} [showStatus]
 * @param {Array}  [statusOptions]
 */
export default function EmployPageBase({
  pageTitle,
  entityLabel,
  initialData,
  roleFieldKey,
  roleFieldLabel,
  roleOptions,
  showStatus = false,
  statusOptions = [],
}) {
  const toast = useToast();
  const [people, setPeople] = useState([]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cinError,setCinError] = useState(false)
      const [isLoading, setIsLoading] = useState(false);

  

  useEffect(() => {
  const loadPeople = async () => {
    try {
      setIsLoading(true)
      const data = await AxiosToken.get("/employ");

      setPeople(data.data.employs);
    } catch (error) {
      console.error('Error loading personnel:', error);

      toast({
        title: 'Erreur',
        description: 'Impossible de charger les membres du personnel.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally{
        setIsLoading(false)
      }
  };

  loadPeople();
}, [toast,isSaving,isDeleting]);

  const formModal = useDisclosure();
  const viewModal = useDisclosure();
  const deleteDialog = useDisclosure();

  const filteredPeople = useMemo(() => {
    const term = search.trim().toLowerCase();
    return people.filter((p) => {
      const matchesSearch = !term || `${p.nom} ${p.prenom} ${p.telephone}`.toLowerCase().includes(term);
      const matchesRole = !roleFilter || p[roleFieldKey] === roleFilter;
      const matchesStatus = !statusFilter || p.statut === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    }).map((p, idx) => ({ ...p, displayNumber: idx + 1 }));
  }, [people, search, roleFilter, statusFilter, roleFieldKey]);

  const openAddModal = () => { setSelectedPerson(null); formModal.onOpen(); };
  const openEditModal = (person) => { setSelectedPerson(person); formModal.onOpen(); };
  const openViewModal = (person) => { setSelectedPerson(person); viewModal.onOpen(); };
  const askDelete = (person) => { setPersonToDelete(person); deleteDialog.onOpen(); };

   const handleSubmit = async (formData) => {
    setIsSaving(true);
    setCinError(false)

    try {
       if (selectedPerson) {
            // UPDATE
            await AxiosToken.put(
              `/employ/${selectedPerson.id}`,
              formData
            );
      
            toast({
              title: 'تم تحديث المعلم بنجاح',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }else{
        const response = await AxiosToken.post(
            "/employ",
            formData
        );

        toast({
        title: 'تم إضافة المعلم بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      }


        formModal.onClose();

    } catch (error) {
        if(error.response.status == 400){
        setCinError(true)
      }
    } finally {
        setIsSaving(false);
    }
};

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await AxiosToken.delete(`/employ/${personToDelete.id}`)
      toast({
        title: 'تم حذف الموظف بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch {
      toast({
        title: 'حدث خطأ أثناء حذف الموظف',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      deleteDialog.onClose();
      setStudentToDelete(null);
    }
  };

  const columns = [
    { key: '#', label: '#', sortable: true,
      render: (row) => row.displayNumber
    },
    {
    key: 'cin',
    label: 'رقم بطاقة التعريف',
    sortable: true,
  },
    { key: 'name', label: 'الاسم', sortable: true },
    { key: 'last_name', label: 'اللقب', sortable: true },
    { key: 'phone', label: 'رقم الهاتف' },
    {
      key: roleFieldKey,
      label: roleFieldLabel,
      sortable: true,
      render: (row) => (
        <Badge bg="ink.100" color="ink.700" borderRadius="full" px={2.5} fontWeight="600">
          {row[roleFieldKey]}
        </Badge>
      ),
    },
    {
      key: 'salary',
      label: 'الراتب',
      sortable: true,
      isNumeric: true,
      render: (row) => `${row.salary.toLocaleString("FR-fr")} DT`,
    },
    ...(showStatus
      ? [{
          key: 'statut',
          label: 'الحالة',
          sortable: true,
          render: (row) => {
            const c = STATUS_COLORS[row.statut] || { bg: 'ink.100', color: 'ink.700' };
            return (
              <Badge bg={c.bg} color={c.color} borderRadius="full" px={2.5}>
                {row.statut}
              </Badge>
            );
          },
        }]
      : []),
  ];

  return (
    <Box
    dir='rtl'
    >
      <PageHeader
        title={pageTitle}
        subtitle={`${people.length} أعضاء الموظفين المسجلين `}
        actions={
          <>
            <Tooltip label="Export bientôt disponible" hasArrow>
              <IconButton aria-label="Exporter" icon={<Download size={17} />} variant="outline" isDisabled />
            </Tooltip>
            <Button leftIcon={<Plus size={17} />} onClick={openAddModal}>
              اضافة {entityLabel}
            </Button>
          </>
        }
      />

      <Wrap spacing={3} mb={5} align="center">
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث بالاسم، أو اللقب، أو رقم الهاتف…" />

        <Select
          w={{ base: 'full', sm: '210px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
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
          <option value="">{`جميع — ${roleFieldLabel.toLowerCase()}`}</option>
          {roleOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>

        {showStatus && (
          <Select
            w={{ base: 'full', sm: '160px' }}
            size="sm"
            borderRadius="lg"
            bg="white"
            borderColor="ink.200"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">جميع الحالات</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        )}

        {(search || roleFilter || statusFilter) && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }}>
             إعادة ضبط
          </Button>
        )}

        <HStack spacing={1.5} ml="auto" color="ink.400">
          <Users size={15} />
          <Text fontSize="xs">{filteredPeople.length} نتيجة</Text>
        </HStack>
      </Wrap>

      <DataTable
        columns={columns}
        data={filteredPeople}
        pageSize={8}
                isLoading={isLoading}

        emptyMessage="لا توجد نتائج مطابقة لهذه المعايير."
        renderActions={(row) => (
          <HStack spacing={1}>
            <Tooltip label="Voir" hasArrow>
              <IconButton aria-label="Voir" icon={<Eye size={16} />} size="sm" variant="ghost" onClick={() => openViewModal(row)} />
            </Tooltip>
            <Tooltip label="Modifier" hasArrow>
              <IconButton aria-label="Modifier" icon={<Pencil size={16} />} size="sm" variant="ghost" onClick={() => openEditModal(row)} />
            </Tooltip>
            <Tooltip label="Supprimer" hasArrow>
              <IconButton
                aria-label="Supprimer"
                icon={<Trash2 size={16} />}
                size="sm"
                variant="ghost"
                color="danger.500"
                _hover={{ bg: 'danger.50' }}
                onClick={() => askDelete(row)}
              />
            </Tooltip>
          </HStack>
        )}
      />

      <EmployFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.onClose}
        onSubmit={handleSubmit}
        person={selectedPerson}
        isSaving={isSaving}
        entityLabel={entityLabel}
        roleFieldKey={roleFieldKey}
        roleFieldLabel={roleFieldLabel}
        roleOptions={roleOptions}
        showStatus={showStatus}
        statusOptions={statusOptions}
        cinError={cinError}
      />

      <EmployViewModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.onClose}
        person={selectedPerson}
        onEdit={openEditModal}
        roleFieldKey={roleFieldKey}
        roleFieldLabel={roleFieldLabel}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="تأكيد الحذف"
        message={
          personToDelete
            ? `هل أنت متأكد من حذف المعلم ${personToDelete.name} ${personToDelete.last_name}؟ لا يمكن التراجع عن هذا الإجراء.`
            : ''
        }
      />
    </Box>
  );
}
