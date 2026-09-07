import StaffPageBase from '../components/staff/StaffPageBase';
import { teachers, subjects, teacherStatuses } from '../data/teachers';

export default function Teachers() {
  return (
    <StaffPageBase
      pageTitle="المعلمون"
      entityLabel="معلم"
      initialData={teachers}
      roleFieldKey="matiere"
      roleFieldLabel="المواد"
      roleOptions={subjects}
      showStatus
      statusOptions={teacherStatuses}
    />
  );
}
