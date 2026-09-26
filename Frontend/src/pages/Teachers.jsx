import StaffPageBase from '../components/staff/StaffPageBase';
import { subjects, teacherStatuses } from '../data/teachers';

export default function Teachers() {
  return (
    <StaffPageBase
      pageTitle="المعلمون"
      entityLabel="معلم"
      roleFieldKey="matiere"
      roleFieldLabel="المواد"
      roleOptions={subjects}
      showStatus
      statusOptions={teacherStatuses}
    />
  );
}
