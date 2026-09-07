import { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useDisclosure,
  useToast,
  Avatar,
  Text,
  Divider,
  VStack,
} from '@chakra-ui/react';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Bus,
  UserCog,
  Eye,
  EyeOff,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import GeneralInfoTab from '../components/settings/GeneralInfoTab';
import TuitionFeesTab from '../components/settings/TuitionFeesTab';
import DaycareBooksFeesTab from '../components/settings/DaycareBooksFeesTab';
import TransportFeesTab from '../components/settings/TransportFeesTab';

const TABS = [
  { label: 'عام', icon: Building2, panel: GeneralInfoTab },
  { label: 'مصاريف الدراسة', icon: GraduationCap, panel: TuitionFeesTab },
  { label: 'معاليم الميدعة والكتب', icon: BookOpen, panel: DaycareBooksFeesTab },
  { label: 'مصاريف النقل', icon: Bus, panel: TransportFeesTab },
];

function getAuthSession() {
  try {
    const session = sessionStorage.getItem('alamal_auth_session');
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

function saveAuthSession(session) {
  try {
    sessionStorage.setItem('alamal_auth_session', JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

/* ---------------------------------------------------------
   Modale : Gérer le profil administrateur
--------------------------------------------------------- */
function AdminProfileModal({ isOpen, onClose, session, onSaved }) {
  const toast = useToast();

  const [form, setForm] = useState({
    nom: session?.nom || '',
    prenom: session?.prenom || '',
    telephone: session?.telephone || '',
    motDePasse: '',
    confirmationMotDePasse: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nom.trim()) newErrors.nom = 'Le nom est requis.';
    if (!form.prenom.trim()) newErrors.prenom = 'Le prénom est requis.';

    if (form.telephone && !/^[0-9+\s]{6,15}$/.test(form.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide.';
    }

    if (form.motDePasse || form.confirmationMotDePasse) {
      if (form.motDePasse.length < 6) {
        newErrors.motDePasse = 'Minimum 6 caractères.';
      }
      if (form.motDePasse !== form.confirmationMotDePasse) {
        newErrors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      // TODO: remplacer par un vrai appel API (ex: PUT /api/admin/profile)
      // await api.put('/admin/profile', form);

      const updatedSession = {
        ...session,
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
      };
      saveAuthSession(updatedSession);
      onSaved?.(updatedSession);

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setForm((prev) => ({ ...prev, motDePasse: '', confirmationMotDePasse: '' }));
      onClose();
    } catch (err) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement.",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent dir="rtl" borderRadius="xl">
        <ModalHeader>
          <Flex align="center" gap={3}>
            <Avatar
              size="sm"
              name={`${form.prenom} ${form.nom}`}
              bg="brand.600"
              color="white"
            />
            <Box>
              <Text fontSize="md" fontWeight="600">
                Gérer le profil
              </Text>
              <Text fontSize="xs" color="ink.500" fontWeight="400">
                {session?.role || 'Administrateur'}
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Flex gap={3}>
              <FormControl isInvalid={!!errors.prenom}>
                <FormLabel fontSize="sm">Prénom</FormLabel>
                <Input
                  value={form.prenom}
                  onChange={handleChange('prenom')}
                  placeholder="Prénom"
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl isInvalid={!!errors.nom}>
                <FormLabel fontSize="sm">Nom</FormLabel>
                <Input
                  value={form.nom}
                  onChange={handleChange('nom')}
                  placeholder="Nom"
                  borderRadius="lg"
                />
              </FormControl>
            </Flex>

            <FormControl isInvalid={!!errors.telephone}>
              <FormLabel fontSize="sm">Numéro de téléphone</FormLabel>
              <Input
                type="tel"
                value={form.telephone}
                onChange={handleChange('telephone')}
                placeholder="+216 XX XXX XXX"
                borderRadius="lg"
              />
            </FormControl>

            <Divider />

            <Text fontSize="sm" fontWeight="600" color="ink.600">
              Changer le mot de passe (optionnel)
            </Text>

            <FormControl isInvalid={!!errors.motDePasse}>
              <FormLabel fontSize="sm">Nouveau mot de passe</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.motDePasse}
                  onChange={handleChange('motDePasse')}
                  placeholder="••••••••"
                  borderRadius="lg"
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Afficher le mot de passe"
                    icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword((v) => !v)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmationMotDePasse}>
              <FormLabel fontSize="sm">Confirmer le mot de passe</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmationMotDePasse}
                  onChange={handleChange('confirmationMotDePasse')}
                  placeholder="••••••••"
                  borderRadius="lg"
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Afficher la confirmation"
                    icon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirm((v) => !v)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            onClick={handleSubmit}
            isLoading={isSaving}
          >
            Enregistrer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/* ---------------------------------------------------------
   Page Settings
--------------------------------------------------------- */
export default function Settings() {
  const [session, setSession] = useState(getAuthSession());
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isDirector = session?.role === 'مدير';

  const visibleTabs = isDirector
    ? TABS
    : TABS.filter((tab) => tab.panel !== GeneralInfoTab);

  return (
    <Box dir="rtl">
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={3}
        mb={2}
      >
        <PageHeader
          title="الإعدادات"
          subtitle="معلومات المدرسة، المصاريف وإعدادات العرض."
        />

        <Button
          leftIcon={<UserCog size={16} />}
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          borderRadius="lg"
          onClick={onOpen}
          flexShrink={0}
        >
          إدارة الملف الشخصي
        </Button>
      </Flex>

      <Tabs variant="unstyled">
        <TabList
          bg="white"
          border="1px solid"
          borderColor="ink.200"
          borderRadius="xl"
          p={1.5}
          w="fit-content"
          maxW="full"
          overflowX="auto"
          mb={6}
        >
          {visibleTabs.map((t) => (
            <Tab
              key={t.label}
              px={4}
              py={2}
              borderRadius="lg"
              fontSize="sm"
              fontWeight="500"
              color="ink.600"
              whiteSpace="nowrap"
              _selected={{
                bg: 'brand.600',
                color: 'white',
                fontWeight: '600',
              }}
              _hover={{
                bg: 'ink.50',
              }}
              transition="all 0.15s ease"
            >
              <t.icon size={16} style={{ marginRight: 8 }} />
              {t.label}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {visibleTabs.map((t) => {
            const Panel = t.panel;

            return (
              <TabPanel key={t.label} px={0}>
                <Panel />
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>

      <AdminProfileModal
        isOpen={isOpen}
        onClose={onClose}
        session={session}
        onSaved={setSession}
      />
    </Box>
  );
}