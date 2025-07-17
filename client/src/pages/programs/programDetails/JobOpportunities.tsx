import { FC } from "react";
import { useParams } from "react-router-dom";

import FadeInSection from "../../../componentLibrary/FadeInSection";
import { programs } from "../../../data/ProgramData";

const JobOpportunities: FC = () => {
  const { courseId } = useParams();
  const program = programs.find((p) => p.id === courseId);
  const jobs = program?.jobOpportunities;

  if (!jobs) {
    return null;
  }

  return (
    <section className="px-6 md:px-20 py-14">
      <FadeInSection>
        <h2 className="text-3xl font-bold text-primary mb-8">
          Job Opportunities for Graduates of BSc (Hons.) {program.title}
        </h2>
      </FadeInSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm md:text-base">
        {/* Roles */}
        <div>
          <FadeInSection>
            <p className="font-semibold mb-4">
              Graduates of {program.title} can be employed as:
            </p>
          </FadeInSection>
          <ul className="list-disc pl-5 space-y-2">
            {jobs.roles.map((role: string, i: number) => (
              <FadeInSection key={i}>
                <li>{role}</li>
              </FadeInSection>
            ))}
          </ul>
        </div>

        {/* Industries */}
        <div>
          <FadeInSection>
            <p className="font-semibold mb-4">
              They can work in various establishments such as:
            </p>
          </FadeInSection>
          <ul className="list-disc pl-5 space-y-2">
            {jobs.industries.map((industry: string, i: number) => (
              <FadeInSection key={i}>
                <li>{industry}</li>
              </FadeInSection>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default JobOpportunities;
