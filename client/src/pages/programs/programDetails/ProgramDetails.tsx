import { useParams } from "react-router-dom";
import ProgramHero from "./ProgramHero";
import MissionAndVision from "./MissionAndVision";
import CurriculumSection from "./CurriculumSection";


import { programs } from "../../../data/ProgramData";
import { feeByDepartment } from "../../../data/FeesData";
import FeeTable from "../../../componentLibrary/FeesTable";
import JobOpportunities from "./JobOpportunities";
import AdmissionRequirements from "./AdmissionRequirements";
import Footer from "../../contact/Footer";


const ProgramDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = programs.find((program) => program.id === courseId);
  const feeData = feeByDepartment[courseId ?? ""];

  if (!course) {
    return <div className="text-center py-20 text-red-500">Course not found.</div>;
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <ProgramHero title={course.title} description={course.description} />

      {/* Mission & Vision */}
      <MissionAndVision
        mission={course.mission}
        vision={course.vision}
        whatYouLearn={course.whatYouLearn}
      />

      {/* Curriculum */}
      <CurriculumSection />

      {/* Fees */}
      {feeData && (
        <section className="px-6 md:px-20 py-10">
          <h2 className="text-3xl font-bold text-primary mb-8">Fees</h2>
          <FeeTable data={feeData} />
        </section>
      )}

      <JobOpportunities />
      <AdmissionRequirements />
      <Footer/>
    </div>
  );
};

export default ProgramDetail;
