import AbsenceRolePage from '../../components/register/AbsenceRolePage';
import { absencesMaitres } from '../../data/register';
import { subjects } from '../../data/teachers';

export default function AbsenceMaitres() {
  return (
    <AbsenceRolePage
      personLabel="المعلمون"
      initialData={absencesMaitres}
      secondaryFieldKey="matiere"
      secondaryFieldLabel="مواد"
      searchFieldLabel="المواد"
      secondaryOptions={subjects}
      personsEndpoint="/teacher"
      personsMode="search"
      personsResponseKey="teachers"
    />
  );
}