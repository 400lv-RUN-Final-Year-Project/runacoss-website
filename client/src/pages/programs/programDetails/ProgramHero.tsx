import { FC } from "react";
import { HiChevronLeft } from "react-icons/hi";
import HeroImage from "../../../assets/images/programHero.jpg";
import Button from "../../../componentLibrary/Button";
import Navbar from "../../../componentLibrary/NavBar";
import FadeInSection from "../../../componentLibrary/FadeInSection";

type ProgramHeroProps = {
  title: string;
  description: string;
};

const ProgramHero: FC<ProgramHeroProps> = ({ title, description }) => {
  return (
    <section className="hero text-primary flex flex-col lg:flex-row items-center justify-between w-full min-h-screen">
      <Navbar />

      {/* Left Section (Text) */}
      <div className="w-full lg:w-1/2 h-full flex items-start justify-center px-6 md:px-12 lg:px-20 pt-24 pb-16 ">
        <div className="max-w-xl space-y-8">
          <div className="flex items-center space-x-3 mb-6">
            <div
              className="p-3 bg-blue-bg text-primary rounded-full cursor-pointer flex items-center justify-center"
              onClick={() => window.history.back()}
            >
              <HiChevronLeft size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-relaxed flex items-center">
              {title}
            </h1>
          </div>
          <FadeInSection>
            <p className="text-sm md:text-lg mb-8 max-w-xl mx-auto md:mx-0 !leading-10">
              {description}
            </p>
          </FadeInSection>

          <div className="flex justify-start md:justify-start space-x-4">
            <Button
              text="Apply Now"
              link="https://adms.run.edu.ng/signup"
              length="long"
            />
            <Button text="Contact Advisor" link="#" length="long" />
          </div>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="w-full lg:w-1/2 h-full">
        <img
          src={HeroImage}
          alt="Workspace"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default ProgramHero;
