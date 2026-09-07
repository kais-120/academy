import EmployPageBase from '../components/Employes/EmployPageBase';
import { employees, employeeRoles, employeeStatuses } from '../data/employees';

export default function Employees() {
  return (
    <EmployPageBase
      pageTitle="الموظفون"
      entityLabel="الموظف"
      initialData={employees}
      roleFieldKey="role"
      roleFieldLabel="الوظيفة"
      roleOptions={employeeRoles}
      statusOptions={employeeStatuses}
    />
  );
}
