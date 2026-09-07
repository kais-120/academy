
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Button,
  Switch,
  HStack,
  Text,
  Spinner,
  Box,
  useOutsideClick,
} from '@chakra-ui/react';
import FormModal from '../common/FormModal';
import { absenceMotifs } from '../../data/register';

const EMPTY_FORM = {
  personne: '',
  date: '',
  reason: '',
  justification: false,
};

/**
 * حقل البحث عن الشخص بالاسم مع قائمة منسدلة للنتائج.
 * يستخدم للطلاب والموظفين والأساتذة والمراقبين.
 */
function PersonSearchField({
  label,
  searchValue,
  onSearchChange,
  onSelect,
  isOpen,
  onOpen,
  onClose,
  isDisabled,
  isLoading,
  placeholder,
  items,
  errorMessage,
  isPhone,
}) {
  const boxRef = useRef(null);

  useOutsideClick({
    ref: boxRef,
    handler: onClose,
  });

  return (
    <FormControl isInvalid={Boolean(errorMessage)} isRequired>
      <FormLabel fontSize="sm">{label}</FormLabel>

      <Box position="relative" ref={boxRef}>
        <HStack>
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => !isDisabled && onOpen()}
            placeholder={placeholder}
            isDisabled={isDisabled}
            autoComplete="off"
          />

          {isLoading && <Spinner size="sm" flexShrink={0} />}
        </HStack>

        {isOpen && !isDisabled && (
          <Box
            position="absolute"
            top="calc(100% + 4px)"
            left={0}
            right={0}
            zIndex={20}
            bg="white"
            border="1px solid"
            borderColor="ink.200"
            borderRadius="md"
            boxShadow="0 4px 12px rgba(16,26,46,0.12)"
            maxH="200px"
            overflowY="auto"
          >
            {items.length === 0 ? (
              <Text
                fontSize="sm"
                color="ink.400"
                px={3}
                py={2}
              >
                لا توجد نتائج.
              </Text>
            ) : (
              items.map((it) => (
                <Box
                  key={it.id}
                  px={3}
                  py={2}
                  fontSize="sm"
                  cursor="pointer"
                  _hover={{ bg: 'ink.50' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(it);
                  }}
                >
                  {isPhone
                    ? `${it.name} ${it.last_name} - ${it.cin}`
                    : `${it.name} ${it.last_name}`}
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>

      <FormErrorMessage>{errorMessage}</FormErrorMessage>
    </FormControl>
  );
}

/**
 * إنشاء Yup validation schema حسب نوع الشخص.
 */
function buildValidationSchema({
  isStudentMode,
  isPersonSearchMode,
  secondaryFieldKey,
  secondaryFieldLabel,
  personLabel,
}) {
  const shape = {
    date: yup
      .string()
      .required('التاريخ مطلوب.'),

    reason: yup
      .string()
      .required('سبب الغياب مطلوب.'),

    justification: yup.boolean(),
  };

  if (isStudentMode || isPersonSearchMode) {
    shape.person_id = yup
      .mixed()
      .test(
        'required',
        `${personLabel} مطلوب.`,
        (v) => v !== '' && v !== null && v !== undefined
      );

    shape.personne = yup.string();
  } else {
    shape.personne = yup
      .string()
      .trim()
      .required(`${personLabel} مطلوب.`);
  }

  if (!isPersonSearchMode) {
    shape[secondaryFieldKey] = yup
      .string()
      .required(`${secondaryFieldLabel} مطلوب.`);
  }

  return yup.object().shape(shape);
}

/**
 * نموذج تسجيل الغياب.
 * يستخدم للطلاب والأساتذة والمراقبين والموظفين.
 */
export default function AbsenceRoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  absence = null,
  isSaving = false,
  personLabel,
  secondaryFieldKey,
  secondaryFieldLabel,
  secondaryOptions,
  students,
  persons,
}) {
  const isStudentMode = Boolean(students);
  const studentsIsUrl = typeof students === 'string';

  const isPersonSearchMode = Boolean(persons);
  const personsIsUrl = typeof persons === 'string';

  const emptyForm = useMemo(
    () => ({
      ...EMPTY_FORM,

      ...(isStudentMode || isPersonSearchMode
        ? { person_id: '' }
        : {}),

      ...(!isPersonSearchMode
        ? { [secondaryFieldKey]: '' }
        : {}),
    }),
    [
      isStudentMode,
      isPersonSearchMode,
      secondaryFieldKey,
    ]
  );

  const validationSchema = useMemo(
    () =>
      buildValidationSchema({
        isStudentMode,
        isPersonSearchMode,
        secondaryFieldKey,
        secondaryFieldLabel,
        personLabel,
      }),
    [
      isStudentMode,
      isPersonSearchMode,
      secondaryFieldKey,
      secondaryFieldLabel,
      personLabel,
    ]
  );

  const formik = useFormik({
    initialValues: emptyForm,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: false,

    onSubmit: (values) => {
      // person_id يتم إرساله إلى API
      // personne يستخدم فقط للعرض والبحث.
      onSubmit(values);
    },
  });

  const isEditMode = Boolean(absence);

  const selectedNiveau =
    formik.values[secondaryFieldKey];

  // إظهار الأخطاء بعد أول محاولة إرسال فقط.
  const fieldError = (name) =>
    formik.submitCount > 0
      ? formik.errors[name]
      : undefined;

  // =========================================================
  // وضع الطالب
  // =========================================================

  const [studentsList, setStudentsList] = useState(
    Array.isArray(students) ? students : []
  );

  const [studentsLoading, setStudentsLoading] =
    useState(false);

  const [studentsError, setStudentsError] =
    useState(null);

  const [studentSearch, setStudentSearch] =
    useState('');

  const [isStudentListOpen, setIsStudentListOpen] =
    useState(false);

  useEffect(() => {
    if (!isOpen || !isStudentMode) return;

    if (Array.isArray(students)) {
      setStudentsList(students);
      setStudentsError(null);
      return;
    }

    if (studentsIsUrl) {
      setStudentsLoading(true);
      setStudentsError(null);

      fetch(students)
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              'تعذر تحميل قائمة الطلاب.'
            );
          }

          return res.json();
        })
        .then((data) => {
          setStudentsList(
            Array.isArray(data) ? data : []
          );
        })
        .catch((err) => {
          setStudentsError(
            err.message || 'حدث خطأ أثناء التحميل.'
          );
        })
        .finally(() => {
          setStudentsLoading(false);
        });
    }
  }, [
    isOpen,
    isStudentMode,
    students,
    studentsIsUrl,
  ]);

  const classes = useMemo(() => {
    if (!isStudentMode) return [];

    return [
      ...new Set(
        studentsList
          .map((s) => s.class)
          .filter(Boolean)
      ),
    ];
  }, [isStudentMode, studentsList]);

  const studentsInNiveau = useMemo(() => {
    if (!isStudentMode || !selectedNiveau) {
      return [];
    }

    return studentsList.filter(
      (s) => s.class === selectedNiveau
    );
  }, [
    isStudentMode,
    studentsList,
    selectedNiveau,
  ]);

  const searchedStudents = useMemo(() => {
    const term = studentSearch
      .trim()
      .toLowerCase();

    if (!term) {
      return studentsInNiveau;
    }

    return studentsInNiveau.filter((s) =>
      `${s.name} ${s.last_name}`
        .toLowerCase()
        .includes(term)
    );
  }, [studentsInNiveau, studentSearch]);

  useEffect(() => {
    if (isStudentMode) {
      setStudentSearch(
        formik.values.personne || ''
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isStudentMode,
    formik.values.personne,
  ]);

  const handleNiveauChange = (e) => {
    const value = e.target.value;

    formik.setFieldValue(
      secondaryFieldKey,
      value
    );

    formik.setFieldValue('person_id', '');
    formik.setFieldValue('personne', '');
  };

  const handleStudentSearchChange = (value) => {
    setStudentSearch(value);
    setIsStudentListOpen(true);

    if (formik.values.person_id) {
      formik.setFieldValue('person_id', '');
      formik.setFieldValue('personne', '');
    }
  };

  const selectStudent = (student) => {
    const label =
      `${student.name} ${student.last_name}`;

    formik.setFieldValue(
      'person_id',
      student.id
    );

    formik.setFieldValue(
      'personne',
      label
    );

    setStudentSearch(label);
    setIsStudentListOpen(false);
  };

  // =========================================================
  // وضع الأساتذة / المراقبين / الموظفين
  // =========================================================

  const [personsList, setPersonsList] =
    useState(
      Array.isArray(persons) ? persons : []
    );

  const [personsLoading, setPersonsLoading] =
    useState(false);

  const [personsError, setPersonsError] =
    useState(null);

  const [personSearch, setPersonSearch] =
    useState('');

  const [isPersonListOpen, setIsPersonListOpen] =
    useState(false);

  useEffect(() => {
    if (!isOpen || !isPersonSearchMode) return;

    if (Array.isArray(persons)) {
      setPersonsList(persons);
      setPersonsError(null);
      return;
    }

    if (personsIsUrl) {
      setPersonsLoading(true);
      setPersonsError(null);

      fetch(persons)
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              `تعذر تحميل قائمة ${personLabel}.`
            );
          }

          return res.json();
        })
        .then((data) => {
          setPersonsList(
            Array.isArray(data) ? data : []
          );
        })
        .catch((err) => {
          setPersonsError(
            err.message ||
              'حدث خطأ أثناء التحميل.'
          );
        })
        .finally(() => {
          setPersonsLoading(false);
        });
    }
  }, [
    isOpen,
    isPersonSearchMode,
    persons,
    personsIsUrl,
    personLabel,
  ]);

  const searchedPersons = useMemo(() => {
    const term = personSearch
      .trim()
      .toLowerCase();

    if (!term) {
      return personsList;
    }

    return personsList.filter((p) =>
      `${p.name} ${p.last_name}`
        .toLowerCase()
        .includes(term)
    );
  }, [personsList, personSearch]);

  useEffect(() => {
    if (isPersonSearchMode) {
      setPersonSearch(
        formik.values.personne || ''
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isPersonSearchMode,
    formik.values.personne,
  ]);

  const handlePersonSearchChange = (value) => {
    setPersonSearch(value);
    setIsPersonListOpen(true);

    if (formik.values.person_id) {
      formik.setFieldValue('person_id', '');
      formik.setFieldValue('personne', '');
    }
  };

  const selectPerson = (person) => {
    const label =
      `${person.name} ${person.last_name}`;

    formik.setFieldValue(
      'person_id',
      person.id
    );

    formik.setFieldValue(
      'personne',
      label
    );

    setPersonSearch(label);
    setIsPersonListOpen(false);
  };

  // =========================================================
  // إعادة ضبط النموذج
  // =========================================================

  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: absence
          ? {
              ...emptyForm,
              ...absence,
            }
          : emptyForm,
      });

      setIsStudentListOpen(false);
      setIsPersonListOpen(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, absence]);

  const today =
    new Date().toLocaleDateString('en-CA');

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode
          ? 'تعديل الغياب'
          : `تسجيل غياب — ${personLabel}`
      }
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
          >
            إلغاء
          </Button>

          <Button
            onClick={formik.handleSubmit}
            isLoading={isSaving}
            loadingText="جاري الحفظ…"
          >
            {isEditMode ? 'حفظ' : 'إضافة'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={4}
        >
          {/* =================================================
              وضع الطالب
          ================================================= */}

          {isStudentMode && (
            <>
              <FormControl
                isInvalid={Boolean(
                  fieldError(secondaryFieldKey)
                )}
                isRequired
              >
                <FormLabel fontSize="sm">
                  {secondaryFieldLabel}
                </FormLabel>

                <Select
                  placeholder={
                    studentsLoading
                      ? 'جاري التحميل…'
                      : `اختر — ${secondaryFieldLabel}`
                  }
                  value={selectedNiveau}
                  onChange={handleNiveauChange}
                  isDisabled={studentsLoading}
                >
                  {classes.map((c) => (
                    <option
                      key={c}
                      value={c}
                    >
                      {c}
                    </option>
                  ))}
                </Select>

                <FormErrorMessage>
                  {fieldError(
                    secondaryFieldKey
                  )}
                </FormErrorMessage>

                {studentsError && (
                  <Text
                    fontSize="xs"
                    color="danger.500"
                    mt={1}
                  >
                    {studentsError}
                  </Text>
                )}
              </FormControl>

              <PersonSearchField
                label={personLabel}
                searchValue={studentSearch}
                onSearchChange={
                  handleStudentSearchChange
                }
                onSelect={selectStudent}
                isOpen={isStudentListOpen}
                onOpen={() =>
                  setIsStudentListOpen(true)
                }
                onClose={() =>
                  setIsStudentListOpen(false)
                }
                isDisabled={
                  !selectedNiveau ||
                  studentsLoading
                }
                isLoading={studentsLoading}
                placeholder={
                  selectedNiveau
                    ? `البحث عن ${personLabel}`
                    : `اختر أولاً ${secondaryFieldLabel}`
                }
                items={searchedStudents}
                errorMessage={fieldError(
                  'person_id'
                )}
                isPhone={false}
              />

              <FormControl
                isInvalid={Boolean(
                  fieldError('date')
                )}
                isRequired
              >
                <FormLabel fontSize="sm">
                  التاريخ
                </FormLabel>

                <Input
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  max={today}
                />

                <FormErrorMessage>
                  {fieldError('date')}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={Boolean(
                  fieldError('reason')
                )}
                isRequired
              >
                <FormLabel fontSize="sm">
                  سبب الغياب
                </FormLabel>

                <Select
                  placeholder="اختر"
                  name="reason"
                  value={formik.values.reason}
                  onChange={formik.handleChange}
                >
                  {absenceMotifs.map((m) => (
                    <option
                      key={m}
                      value={m}
                    >
                      {m}
                    </option>
                  ))}
                </Select>

                <FormErrorMessage>
                  {fieldError('reason')}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                gridColumn={{ md: 'span 2' }}
              >
                <FormLabel fontSize="sm">
                  التبرير
                </FormLabel>

                <HStack
                  h="40px"
                  spacing={3}
                >
                  <Switch
                    colorScheme="blue"
                    isChecked={
                      formik.values.justification
                    }
                    onChange={(e) =>
                      formik.setFieldValue(
                        'justification',
                        e.target.checked
                      )
                    }
                  />

                  <Text
                    fontSize="sm"
                    color="ink.600"
                  >
                    {formik.values.justification
                      ? 'مبرر'
                      : 'غير مبرر'}
                  </Text>
                </HStack>
              </FormControl>
            </>
          )}

          {/* =================================================
              وضع الأساتذة / المراقبين / الموظفين
          ================================================= */}

          {isPersonSearchMode && (
            <>
              <Box
                gridColumn={{
                  md: 'span 2',
                }}
              >
                <PersonSearchField
                  label={personLabel}
                  searchValue={personSearch}
                  onSearchChange={
                    handlePersonSearchChange
                  }
                  onSelect={selectPerson}
                  isOpen={isPersonListOpen}
                  onOpen={() =>
                    setIsPersonListOpen(true)
                  }
                  onClose={() =>
                    setIsPersonListOpen(false)
                  }
                  isDisabled={personsLoading}
                  isLoading={personsLoading}
                  placeholder={`البحث عن ${personLabel}`}
                  items={searchedPersons}
                  errorMessage={fieldError(
                    'person_id'
                  )}
                  isPhone={true}
                />

                {personsError && (
                  <Text
                    fontSize="xs"
                    color="danger.500"
                    mt={1}
                  >
                    {personsError}
                  </Text>
                )}
              </Box>

              <FormControl
                isInvalid={Boolean(
                  fieldError('date')
                )}
                isRequired
              >
                <FormLabel fontSize="sm">
                  التاريخ
                </FormLabel>

                <Input
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  max={today}
                />

                <FormErrorMessage>
                  {fieldError('date')}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={Boolean(
                  fieldError('reason')
                )}
                isRequired
              >
                <FormLabel fontSize="sm">
                  سبب الغياب
                </FormLabel>

                <Select
                  placeholder="اختر"
                  name="reason"
                  value={formik.values.reason}
                  onChange={formik.handleChange}
                   sx={{
                    textAlign: 'right', paddingRight: '1rem', paddingLeft: '2rem',
                    '& + div': { insetInlineEnd: 'auto', insetInlineStart: '0.5rem' },
                  }}
                >
                  {absenceMotifs.map((m) => (
                    <option
                      key={m}
                      value={m}
                    >
                      {m}
                    </option>
                  ))}
                </Select>

                <FormErrorMessage>
                  {fieldError('reason')}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                gridColumn={{
                  md: 'span 2',
                }}
              >
                <FormLabel fontSize="sm">
                  التبرير
                </FormLabel>

                <HStack
                  h="40px"
                  spacing={3}
                >
                  <Switch
                    colorScheme="blue"
                    isChecked={
                      formik.values.justification
                    }
                    onChange={(e) =>
                      formik.setFieldValue(
                        'justification',
                        e.target.checked
                      )
                    }
                  />

                  <Text
                    fontSize="sm"
                    color="ink.600"
                  >
                    {formik.values.justification
                      ? 'مبرر'
                      : 'غير مبرر'}
                  </Text>
                </HStack>
              </FormControl>
            </>
          )}

          {/* =================================================
              الوضع العادي بدون students أو persons
          ================================================= */}

          {!isStudentMode &&
            !isPersonSearchMode && (
              <>
                <FormControl
                  isInvalid={Boolean(
                    fieldError('personne')
                  )}
                  isRequired
                  gridColumn={{
                    md: 'span 2',
                  }}
                >
                  <FormLabel fontSize="sm">
                    {personLabel}
                  </FormLabel>

                  <Input
                    name="personne"
                    value={formik.values.personne}
                    onChange={formik.handleChange}
                    placeholder="الاسم واللقب"
                  />

                  <FormErrorMessage>
                    {fieldError('personne')}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={Boolean(
                    fieldError(
                      secondaryFieldKey
                    )
                  )}
                  isRequired
                >
                  <FormLabel fontSize="sm">
                    {secondaryFieldLabel}
                  </FormLabel>

                  <Select
                    placeholder={`اختر — ${secondaryFieldLabel}`}
                    name={secondaryFieldKey}
                    value={
                      formik.values[
                        secondaryFieldKey
                      ]
                    }
                    onChange={formik.handleChange}
                  >
                    {secondaryOptions.map(
                      (opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </option>
                      )
                    )}
                  </Select>

                  <FormErrorMessage>
                    {fieldError(
                      secondaryFieldKey
                    )}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={Boolean(
                    fieldError('date')
                  )}
                  isRequired
                >
                  <FormLabel fontSize="sm">
                    التاريخ
                  </FormLabel>

                  <Input
                    type="date"
                    name="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    max={today}
                  />

                  <FormErrorMessage>
                    {fieldError('date')}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={Boolean(
                    fieldError('reason')
                  )}
                  isRequired
                >
                  <FormLabel fontSize="sm">
                    سبب الغياب
                  </FormLabel>

                  <Select
                    placeholder="اختر"
                    name="reason"
                    value={formik.values.reason}
                    onChange={formik.handleChange}
                  >
                    {absenceMotifs.map((m) => (
                      <option
                        key={m}
                        value={m}
                      >
                        {m}
                      </option>
                    ))}
                  </Select>

                  <FormErrorMessage>
                    {fieldError('reason')}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">
                    التبرير
                  </FormLabel>

                  <HStack
                    h="40px"
                    spacing={3}
                  >
                    <Switch
                      colorScheme="blue"
                      isChecked={
                        formik.values.justification
                      }
                      onChange={(e) =>
                        formik.setFieldValue(
                          'justification',
                          e.target.checked
                        )
                      }
                    />

                    <Text
                      fontSize="sm"
                      color="ink.600"
                    >
                      {formik.values.justification
                        ? 'مبرر'
                        : 'غير مبرر'}
                    </Text>
                  </HStack>
                </FormControl>
              </>
            )}
        </SimpleGrid>
      </form>
    </FormModal>
  );
}

