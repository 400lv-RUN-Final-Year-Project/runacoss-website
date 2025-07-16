import VisionImage from "../../assets/images/vision.png";
import ObjectiveImage from "../../assets/images/uni-students.jpg";
import PhilosophyImage from "../../assets/images/philosophyImage.png";
import Navbar from "../../componentLibrary/NavBar";
import { HiChevronLeft } from "react-icons/hi";
import FadeInSection from "../../componentLibrary/FadeInSection";
import ExecutiveCarousel from "./Executives";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="px-6 md:px-20 py-20 space-y-10 ">
        <div className="flex items-center gap-3 mb-5">
          <a href="/home">
            <HiChevronLeft size={24} className="text-primary cursor-pointer" />
          </a>
          <h1 className="text-3xl font-extrabold text-primary">About Us</h1>
        </div>

        {/* Vision and Mission Section */}
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          <div className="flex-1 space-y-6 leading-10">
            <FadeInSection>
              <h2 className="text-2xl font-bold">Vision of the Association</h2>
            </FadeInSection>

            <FadeInSection>
              <p>
                To train students to become highly skilled and internationally
                competitive Computer Scientists and to contribute to Computer
                Science development through production of novel research
                outcomes that will enhance quality of lives and technological
                advancement. They should be able to cultivate and maintain the
                highest standards of computer practice and technology.
              </p>
            </FadeInSection>

            <FadeInSection>
              <h2 className="text-2xl font-bold">Mission of the Association</h2>
            </FadeInSection>
            <FadeInSection>
              <p>
                The mission is to produce high-level manpower particularly in
                computer science, who would be able to cope with the demands of
                advances and development in information and communication
                technology and who would be relevant in the fast-paced
                computer-driven global community. We aim to achieve this through
                our passionate and result-oriented faculty, detailed and
                up-to-date academic curriculum as well as well-equipped
                laboratories and training faculties within the serene and
                academic-friendly atmosphere of the University.
              </p>
            </FadeInSection>
          </div>
          <div className="flex-1 flex items-stretch">
            <img
              src={VisionImage}
              alt="Vision and Mission"
              className="w-full h-full object-cover max-h-full rounded-lg"
            />
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          <div className="flex-1 flex items-stretch">
            <img
              src={PhilosophyImage}
              alt="Philosophy"
              className="w-full h-full object-cover max-h-full rounded-lg"
            />
          </div>
          <div className="flex-1 space-y-6 leading-8">
            <FadeInSection>
              <h2 className="text-2xl font-bold">Philosophy</h2>
            </FadeInSection>
            <FadeInSection>
              <p>
                Our philosophy is that our graduates would excel in character
                and learning and be able to compete most effectively in
                academics and morals with counterparts from the best
                institutions in the world. They should be able to cultivate and
                maintain the highest standards of computer practice and computer
                technology. We will therefore produce high-level manpower
                particularly in computer science, who would be able to cope with
                the demands of advances and development in information and
                communication technology and who would be relevant in the
                fast-growing computer technology sector.
              </p>
            </FadeInSection>
          </div>
        </div>

        {/* Specific Objectives Section */}
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          <div className="flex-1 space-y-6 leading-10">
            <FadeInSection>
              <h2 className="text-2xl font-bold">
                Specific Objectives of the Association
              </h2>
            </FadeInSection>
            <ul className="list-disc list-inside space-y-2">
              <FadeInSection>
                <li>
                  To produce Computer Scientists who would be abreast of the
                  state-of-the-art technologies in computing.
                </li>
              </FadeInSection>
              <FadeInSection>
                <li>
                  To produce graduates who could be employers of labour in
                  addition to securing gainful employment within and across the
                  frontiers of the country (Nigeria) and in the global
                  community.
                </li>
              </FadeInSection>
              <FadeInSection>
                <li>
                  To employ the use of modern instructional materials and
                  solution-based teaching techniques in the training of students
                  to engender impactful research, teaching, and learning
                  outcomes.
                </li>
              </FadeInSection>
              <FadeInSection>
                <li>
                  To initiate and encourage students' research propositions that
                  are geared towards solving societal problems and propelling
                  the department as a renowned Computer Science training and
                  research hub.
                </li>
              </FadeInSection>
              <FadeInSection>
                <li>
                  To get regular training and re-training on emerging research
                  and effective teaching techniques to adequately impart
                  students with updated knowledge in various aspects of
                  computing.
                </li>
              </FadeInSection>
            </ul>
          </div>
          <div className="flex-1 flex items-stretch">
            <img
              src={ObjectiveImage}
              alt="Objectives"
              className="w-full h-full object-cover max-h-full rounded-lg"
            />
          </div>
        </div>

        {/* Executives */}
        <div>
          <ExecutiveCarousel />
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
