import { useEffect, useMemo, useState } from 'react';
import { Box, Button, HStack, Select, Badge, IconButton, Tooltip, useToast, useDisclosure, Text, Wrap } from '@chakra-ui/react';
import { Plus, Pencil, Trash2, LogIn, LogOut } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TeacherMovementFormModal from '../../components/register/TeacherMovementFormModal';
import { teacherMovements as initialMovements, movementDirections } from '../../data/register';
import { AxiosToken } from '../../api/Api';

const SENS_COLORS = {
  "دخول": { bg: 'positive.50', color: 'positive.600', icon: LogIn },
  "خروج": { bg: 'warning.50', color: 'warning.500', icon: LogOut },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function TeacherMovements() {
  const toast = useToast();
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [sensFilter, setSensFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
      const [isLoading, setIsLoading] = useState(false);


  const formModal = useDisclosure();
  const deleteDialog = useDisclosure();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return movements.filter((m) => {
      const matchesSearch = !term || `${m.nom} ${m.prenom} ${m.remarque}`.toLowerCase().includes(term);
      const matchesSens = !sensFilter || m.sens === sensFilter;
      return matchesSearch && matchesSens;
    });
  }, [movements, search, sensFilter]);

  const openAdd = () => { setSelected(null); formModal.onOpen(); };
  const openEdit = (m) => { setSelected(m); formModal.onOpen(); };
  const askDelete = (m) => { setToDelete(m); deleteDialog.onOpen(); };

  useEffect(()=>{
    const dataFetch = async ()=> {
      try{
        setIsLoading(true)
        const response = await AxiosToken.get("/scoring")
        setMovements(response.data.scoring)
      }catch{
        console.error("error")
      }finally{
        setIsLoading(false)
      }
    }
    dataFetch()
  },[isSaving])

  const handleSubmit = async (formData) => {
  setIsSaving(true);

  try {
    await AxiosToken.post("/scoring", formData);
    formModal.onClose();
  } catch {

  } finally {
    setIsSaving(false);
    formModal.onClose();
  }
};

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setMovements((prev) => prev.filter((m) => m.id !== toDelete.id));
      toast({ title: 'تم حذف التسجيل', status: 'info', duration: 3000, isClosable: true });
      setIsDeleting(false);
      deleteDialog.onClose();
      setToDelete(null);
    }, 500);
  };

  const columns = [
    { key: 'date', label: 'التاريخ', sortable: true, render: (row) => formatDate(row.date) },
    { key: 'time', label: 'الوقت', sortable: true },
    { key: 'name', label: 'الاسم', sortable: true, render: (row) => row.scoringTeacher?.name },
    { key: 'last_name', label: 'اللقب', sortable: true, render: (row) => row.scoringTeacher?.last_name},
    {
      key: 'sense',
      label: 'الاتجاه',
      sortable: true,
      render: (row) => {
        const c = SENS_COLORS[row.sense] || SENS_COLORS.دخول;
        return (
          <HStack spacing={1.5}>
            <c.icon size={13} color={`var(--chakra-colors-${c.color.replace('.', '-')})`} />
            <Badge textTransform={"capitalize"} bg={c.bg} color={c.color} borderRadius="full" px={2.5}>{row.sense}</Badge>
          </HStack>
        );
      },
    },
    { key: 'noticed', label: 'ملاحظة', render: (row) => row.remarque || <Text color="ink.400">—</Text> },
  ];

  return (
    <Box
    dir='rtl'
    >
      <Wrap spacing={3} mb={5} align="center">
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث عن معلّم أو ملاحظة…" />
        <Select
          w={{ base: 'full', sm: '160px' }}
          size="sm"
          borderRadius="lg"
          bg="white"
          borderColor="ink.200"
          value={sensFilter}
          onChange={(e) => setSensFilter(e.target.value)}
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
          <option value="">الدخول والخروج</option>
          {movementDirections.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
        {(search || sensFilter) && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setSensFilter(''); }}>
            إعادة التعيين
          </Button>
        )}
        <HStack spacing={1.5} ml="auto" color="ink.400">
          <Text fontSize="xs">{filtered.length} نتيجة(نتائج)</Text>
        </HStack>
        <Button leftIcon={<Plus size={17} />} onClick={openAdd}>تسجيل جديد</Button>
      </Wrap>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={8}
        isLoading={isLoading}
        emptyMessage="لا يوجد أي تسجيل حضور."
        renderActions={(row) => (
          <HStack spacing={1}>
            <Tooltip label="تعديل" hasArrow>
              <IconButton aria-label="تعديل" icon={<Pencil size={16} />} size="sm" variant="ghost" onClick={() => openEdit(row)} />
            </Tooltip>
            <Tooltip label="حذف" hasArrow>
              <IconButton aria-label="حذف" icon={<Trash2 size={16} />} size="sm" variant="ghost" color="danger.500" _hover={{ bg: 'danger.50' }} onClick={() => askDelete(row)} />
            </Tooltip>
          </HStack>
        )}
      />

      <TeacherMovementFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.onClose}
        onSubmit={handleSubmit}
        movement={selected}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="هل تريد حذف هذا التسجيل؟"
        message={toDelete ? `هل تريد فعلاً حذف هذا التسجيل الخاص بـ ${toDelete.prenom} ${toDelete.nom} ؟` : ''}
      />
    </Box>
  );
}