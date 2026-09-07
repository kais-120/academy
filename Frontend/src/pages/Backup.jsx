import { useState } from 'react';
import {
  Box,
  SimpleGrid,
  HStack,
  VStack,
  Text,
  Icon,
  Flex,
  Button,
  Badge,
  Progress,
  useToast,
  useDisclosure,
  Divider,
  IconButton,
  Tooltip,
  Wrap,
} from '@chakra-ui/react';
import {
  DatabaseBackup,
  CheckCircle2,
  XCircle,
  HardDrive,
  Cloud,
  CloudOff,
  RotateCcw,
  Settings2,
  Link2,
  Unlink,
  Download,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { lastBackupInfo, backupHistory as initialHistory, googleDriveInfo } from '../data/backup';

const STATUS_META = {
  success: { label: 'Sauvegarde réussie', color: 'positive.600', bg: 'positive.50', icon: CheckCircle2 },
  failed: { label: 'Échec de la sauvegarde', color: 'danger.500', bg: 'danger.50', icon: XCircle },
};

function formatDateTime(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function Backup() {
  const toast = useToast();
  const [lastBackup, setLastBackup] = useState(lastBackupInfo);
  const [history, setHistory] = useState(initialHistory);
  const [drive, setDrive] = useState(googleDriveInfo);

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);

  const restoreDialog = useDisclosure();
  const disconnectDialog = useDisclosure();

  const statusMeta = STATUS_META[lastBackup.status] || STATUS_META.success;

  const handleCreateBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        const next = prev + Math.random() * 25 + 10;
        if (next >= 100) {
          clearInterval(interval);
          const now = new Date().toISOString();
          const newSize = `${(25 + Math.random()).toFixed(1)} MB`;
          setLastBackup({ date: now, status: 'success', size: newSize });
          setHistory((prevHist) => [
            { id: Math.max(0, ...prevHist.map((h) => h.id)) + 1, date: now, size: newSize, status: 'success', type: 'Manuelle' },
            ...prevHist,
          ]);
          setIsBackingUp(false);
          toast({ title: 'Sauvegarde créée avec succès', status: 'success', duration: 3000, isClosable: true });
          return 100;
        }
        return next;
      });
    }, 350);
  };

  const handleRestore = () => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      restoreDialog.onClose();
      toast({ title: 'Données restaurées avec succès', status: 'success', duration: 3000, isClosable: true });
    }, 1600);
  };

  const handleConnectDrive = () => {
    setIsConnectingDrive(true);
    // Prépare seulement l'interface — aucune intégration réelle pour le moment.
    setTimeout(() => {
      setDrive({ connected: true, account: 'admin@ecole.tn', lastSync: new Date().toISOString() });
      setIsConnectingDrive(false);
      toast({ title: 'Google Drive connecté (démo)', status: 'success', duration: 3000, isClosable: true });
    }, 1200);
  };

  const handleDisconnectDrive = () => {
    setDrive({ connected: false, account: null, lastSync: null });
    disconnectDialog.onClose();
    toast({ title: 'Google Drive déconnecté', status: 'info', duration: 3000, isClosable: true });
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => formatDateTime(row.date),
    },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'size', label: 'Taille', sortable: true },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (row) => {
        const meta = STATUS_META[row.status] || STATUS_META.success;
        return (
          <Badge bg={meta.bg} color={meta.color} borderRadius="full" px={2.5}>
            {row.status === 'success' ? 'Réussie' : 'Échouée'}
          </Badge>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader title="Sauvegarde" subtitle="Gérez les sauvegardes de la base de données de l’école." />

      {/* Statut actuel */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={5} mb={6}>
        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">Dernière sauvegarde</Text>
            <Icon as={DatabaseBackup} boxSize={4.5} color="brand.600" />
          </HStack>
          <Text fontFamily="heading" fontSize="lg" fontWeight="700" color="ink.900">
            {formatDateTime(lastBackup.date)}
          </Text>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">Statut</Text>
            <Icon as={statusMeta.icon} boxSize={4.5} color={statusMeta.color} />
          </HStack>
          <Badge bg={statusMeta.bg} color={statusMeta.color} borderRadius="full" px={3} py={1} fontSize="sm">
            {statusMeta.label}
          </Badge>
        </Box>

        <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="600" color="ink.500">Taille</Text>
            <Icon as={HardDrive} boxSize={4.5} color="accent.500" />
          </HStack>
          <Text fontFamily="heading" fontSize="lg" fontWeight="700" color="ink.900">
            {lastBackup.size}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Actions */}
      <Box bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card" mb={6}>
        <Text fontFamily="heading" fontWeight="700" color="ink.900" mb={4}>Actions</Text>

        {isBackingUp && (
          <Box mb={4}>
            <HStack justify="space-between" mb={1.5}>
              <Text fontSize="xs" color="ink.500">Sauvegarde en cours…</Text>
              <Text fontSize="xs" color="ink.500">{Math.min(100, Math.round(backupProgress))}%</Text>
            </HStack>
            <Progress value={Math.min(100, backupProgress)} borderRadius="full" size="sm" colorScheme="blue" bg="ink.100" />
          </Box>
        )}

        <Wrap spacing={3}>
          <Button leftIcon={<DatabaseBackup size={17} />} onClick={handleCreateBackup} isLoading={isBackingUp} loadingText="Sauvegarde en cours…">
            Créer une sauvegarde
          </Button>
          <Button leftIcon={<RotateCcw size={17} />} variant="outline" onClick={restoreDialog.onOpen}>
            Restaurer une sauvegarde
          </Button>
          <Button leftIcon={<Settings2 size={17} />} variant="ghost" onClick={() => document.getElementById('google-drive-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Configurer Google Drive
          </Button>
        </Wrap>
      </Box>

      {/* Google Drive */}
      <Box id="google-drive-section" bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="ink.200" boxShadow="card" mb={6}>
        <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
          <HStack spacing={3}>
            <Flex w="44px" h="44px" borderRadius="xl" bg={drive.connected ? 'positive.50' : 'ink.100'} align="center" justify="center">
              <Icon as={drive.connected ? Cloud : CloudOff} boxSize={5} color={drive.connected ? 'positive.500' : 'ink.400'} />
            </Flex>
            <VStack align="flex-start" spacing={0}>
              <Text fontFamily="heading" fontWeight="700" color="ink.900">Google Drive</Text>
              <Text fontSize="xs" color="ink.400">Sauvegarde automatique dans le cloud (à venir)</Text>
            </VStack>
          </HStack>
          <Badge
            bg={drive.connected ? 'positive.50' : 'ink.100'}
            color={drive.connected ? 'positive.600' : 'ink.500'}
            borderRadius="full"
            px={3}
            py={1}
          >
            Statut : {drive.connected ? 'Connecté' : 'Non connecté'}
          </Badge>
        </HStack>

        <Divider borderColor="ink.100" mb={4} />

        {drive.connected ? (
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <VStack align="flex-start" spacing={0.5}>
              <Text fontSize="sm" color="ink.700">
                Compte connecté : <Text as="span" fontWeight="600">{drive.account}</Text>
              </Text>
              <Text fontSize="xs" color="ink.400">Dernière synchronisation : {formatDateTime(drive.lastSync)}</Text>
            </VStack>
            <Button leftIcon={<Unlink size={16} />} variant="outline" size="sm" onClick={disconnectDialog.onOpen}>
              Déconnecter
            </Button>
          </HStack>
        ) : (
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Text fontSize="sm" color="ink.500" maxW="440px">
              Connectez Google Drive pour synchroniser automatiquement vos sauvegardes dans le cloud. Cette intégration sera activée lors du branchement au backend.
            </Text>
            <Button leftIcon={<Link2 size={16} />} onClick={handleConnectDrive} isLoading={isConnectingDrive} loadingText="Connexion…">
              Connecter Google Drive
            </Button>
          </HStack>
        )}
      </Box>

      {/* Historique */}
      <Box mb={2}>
        <Text fontFamily="heading" fontWeight="700" color="ink.900" mb={4}>Historique des sauvegardes</Text>
        <DataTable
          columns={columns}
          data={history}
          pageSize={5}
          emptyMessage="Aucune sauvegarde enregistrée."
          renderActions={(row) => (
            <Tooltip label={row.status === 'success' ? 'Télécharger' : 'Indisponible'} hasArrow>
              <IconButton
                aria-label="Télécharger"
                icon={<Download size={16} />}
                size="sm"
                variant="ghost"
                isDisabled={row.status !== 'success'}
              />
            </Tooltip>
          )}
        />
      </Box>

      <ConfirmDialog
        isOpen={restoreDialog.isOpen}
        onClose={restoreDialog.onClose}
        onConfirm={handleRestore}
        isLoading={isRestoring}
        title="Restaurer la dernière sauvegarde ?"
        message="Cette action remplacera les données actuelles par celles de la dernière sauvegarde réussie. Cette opération est irréversible."
        confirmLabel="Restaurer"
      />

      <ConfirmDialog
        isOpen={disconnectDialog.isOpen}
        onClose={disconnectDialog.onClose}
        onConfirm={handleDisconnectDrive}
        title="Déconnecter Google Drive ?"
        message="Les sauvegardes ne seront plus synchronisées automatiquement vers le cloud."
        confirmLabel="Déconnecter"
      />
    </Box>
  );
}
