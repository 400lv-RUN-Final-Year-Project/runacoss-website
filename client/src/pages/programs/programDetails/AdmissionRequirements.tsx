import FadeInSection from "../../../componentLibrary/FadeInSection";

const AdmissionRequirements = () => {
  return (
    <section className="px-6 md:px-20 py-14 text-sm md:text-base leading-[1.75rem] space-y-10">
      <FadeInSection>
        <h2 className="text-3xl font-bold text-primary">
          Admission Requirements for Bachelor of Science in Computer Science
        </h2>
      </FadeInSection>

      {/* 100 Level Entry */}
      <div className="space-y-4">
        <FadeInSection>
          <p>This outlines the admission requirements for the Bachelor of Science (BSc) in Computer Science program at Redeemer's University.</p>
        </FadeInSection>

        <FadeInSection>
          <h3 className="font-semibold text-lg text-primary">Entry Levels and Qualifications – 100 Level Entry (UTME)</h3>
        </FadeInSection>

        <FadeInSection>
          <p>Admission to the 100 level is through the Unified Tertiary Matriculation Examination (UTME). Applicants must possess five (5) credit passes in Senior Secondary Certificate Examination (SSCE) or its equivalent, including:</p>
        </FadeInSection>

        <FadeInSection>
          <ul className="list-disc pl-5 space-y-2">
            <li>English Language</li>
            <li>Mathematics</li>
            <li>Physics</li>
            <li>Two other science subjects (Further Math, Chemistry, Biology, Agricultural Science, Geography)</li>
          </ul>
        </FadeInSection>

        <FadeInSection>
          <p>The required UTME subjects are:</p>
        </FadeInSection>

        <FadeInSection>
          <ul className="list-disc pl-5 space-y-2">
            <li>English Language</li>
            <li>Mathematics</li>
            <li>Physics</li>
            <li>One of: Chemistry, Biology, or Geography</li>
          </ul>
        </FadeInSection>
      </div>

      {/* 200 Level Direct Entry */}
      <div className="space-y-4">
        <FadeInSection>
          <h3 className="font-semibold text-lg text-primary">Entry Levels and Qualifications – 200 Level Entry (Direct Entry)</h3>
        </FadeInSection>

        <FadeInSection>
          <p>To qualify for admission to the 200 level, applicants must meet the 100 level entry requirements and possess one of the following qualifications:</p>
        </FadeInSection>

        <FadeInSection>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Two (2) Advanced Level passes in Mathematics and one of Physics, Chemistry, Biology, or Geography in GCE 'A' Level, JUPEB, IJMB, or its equivalent.
            </li>
            <li>
              Upper Credit in National Diploma (ND) or National Certificate of Education (NCE) in Computer Science or a related discipline.
            </li>
          </ul>
        </FadeInSection>
      </div>

      {/* Transfer Students */}
      <div className="space-y-4">
        <FadeInSection>
          <h3 className="font-semibold text-lg text-primary">Entry Levels and Qualifications – Transfer Students</h3>
        </FadeInSection>

        <FadeInSection>
          <p>Students transferring from another program within Redeemer's University or from another recognized university must:</p>
        </FadeInSection>

        <FadeInSection>
          <ul className="list-disc pl-5 space-y-2">
            <li>Have a minimum of Second Class Lower Division standing</li>
            <li>Have completed at least one full academic session in Computer Science or a related discipline at a Senate-recognized university.</li>
            <li>Provide transcript and transfer approval</li>
            <li>Fulfill 100 level entry equivalents or credit level passes</li>
          </ul>
        </FadeInSection>

        <FadeInSection>
          <p>Transfer applications are subject to approval by the Departmental Board of Studies, Faculty Board of Studies, and the University Senate. Transfer students must complete a minimum of three (3) academic sessions (six (6) semesters) at Redeemer's University to be eligible for a BSc in Computer Science.</p>
        </FadeInSection>
      </div>

      {/* Program Duration */}
      <div className="space-y-4">
        <FadeInSection>
          <h3 className="font-semibold text-lg text-primary">Program Duration</h3>
        </FadeInSection>

        <FadeInSection>
          <ul className="list-disc pl-5 space-y-2">
            <li>Students admitted at the 100 level must complete a minimum of four (4) academic sessions (eight (8) semesters).</li>
            <li>Students admitted at the 200 level must complete a minimum of three (3) academic sessions (six (6) semesters).</li>
            <li>Students who do not meet the graduation requirements within the standard duration may be granted a maximum of two (2) additional academic years to complete outstanding courses.</li>
          </ul>
        </FadeInSection>
      </div>
    </section>
  );
};

export default AdmissionRequirements;
