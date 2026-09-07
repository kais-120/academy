import AbsenceRolePage from '../../components/register/AbsenceRolePage';
import { absencesSurveillants } from '../../data/register';
import { supervisorRoles } from '../../data/supervisors';

export default function AbsenceSurveillants() {
  return (
    <AbsenceRolePage
      personLabel="Surveillant"
      initialData={absencesSurveillants}
      secondaryFieldKey="role"
      secondaryFieldLabel="Rôle"
      searchFieldLabel="الوظائف"
      secondaryOptions={supervisorRoles}
      personsEndpoint="/supervisor"
      personsMode="search"
      personsResponseKey="supervisors"
    />
  );
}