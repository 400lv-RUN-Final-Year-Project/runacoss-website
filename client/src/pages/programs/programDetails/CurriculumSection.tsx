import { FC } from "react";
import { useParams } from "react-router-dom";
import CurriculumTable from "../../../componentLibrary/CurriculumTable";
import { curriculumByDepartment } from "../../../data/CurriculumData";

const CurriculumSection: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const curriculum = curriculumByDepartment[courseId ?? ""];

  if (!curriculum) {
    return <div className="text-center py-10 text-red-500">Curriculum not available for this department.</div>;
  }

  return (
    <section className="px-6 md:px-20 py-14">
      <h2 className="text-3xl font-bold text-primary mb-8">Curriculum</h2>
      <CurriculumTable data={curriculum} />
    </section>
  );
};

export default CurriculumSection;
