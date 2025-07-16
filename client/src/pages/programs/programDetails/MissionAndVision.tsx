import { FC } from "react";
import FadeInSection from "../../../componentLibrary/FadeInSection";

type MissionAndVisionProps = {
  mission: string;
  vision: string;
  whatYouLearn: string[];
};

const MissionAndVision: FC<MissionAndVisionProps> = ({ mission, vision, whatYouLearn }) => {
  return (
    <section className="px-6 md:px-20 py-14 bg-blue-bg">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Mission and Vision - Left */}
        <div>
          <div className="space-y-16">
            <div>
              <FadeInSection><h2 className="text-2xl font-semibold text-primary mb-4">Mission of the Association</h2></FadeInSection>
              <FadeInSection><p className="text-lg leading-loose">{mission}</p></FadeInSection>
            </div>

            <div>
              <FadeInSection><h2 className="text-2xl font-semibold text-primary mb-4">Vision of the Association</h2></FadeInSection>
              <FadeInSection><p className="text-lg leading-loose">{vision}</p></FadeInSection>
            </div>
          </div>
        </div>

        {/* What You'll Learn - Right */}
        <div>
          <FadeInSection><h2 className="text-2xl font-semibold text-primary mb-4">What you'll learn</h2></FadeInSection>
          <ul className="list-disc pl-6 text-lg leading-8">
            {whatYouLearn.map((item, index) => (
              <FadeInSection><li key={index}>{item}</li></FadeInSection>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default MissionAndVision;
