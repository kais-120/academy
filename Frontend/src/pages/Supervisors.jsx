import StaffPageBase from '../components/staff/StaffPageBase';
import SupervisorsPageBase from '../components/supervisors/SupervisorsPageBase';
import { supervisors, supervisorRoles, supervisorStatuses } from '../data/supervisors';

export default function Supervisors() {
  return (
    <SupervisorsPageBase
      pageTitle="المشرفون"
      entityLabel="مشرف"
      initialData={supervisors}
      roleFieldKey="role"
      roleFieldLabel="الوظيفة"
      roleOptions={supervisorRoles}
      statusOptions={supervisorStatuses}
    />
  );
}
