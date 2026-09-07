import AbsenceRolePage from '../../components/register/AbsenceRolePage';
import { absencesEleves } from '../../data/register';
import { levels } from '../../data/school';

export default function AbsenceEleves() {
  return (
    <AbsenceRolePage
      personLabel="تلميذ"
      initialData={absencesEleves}
      secondaryFieldKey="niveau"
      secondaryFieldLabel="القسم"
      searchFieldLabel="الاقسام"
      secondaryOptions={levels}
      personsEndpoint="/student"
      personsMode="students"
      personsResponseKey="students"
    />
  );
}