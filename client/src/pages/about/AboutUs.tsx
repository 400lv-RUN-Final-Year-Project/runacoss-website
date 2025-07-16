import TextLink from "../../componentLibrary/TextLink";
import AboutImage from "../../assets/images/abouttt.png";
import FadeInSection from "../../componentLibrary/FadeInSection";
import Navbar from "../../componentLibrary/NavBar";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-12 lg:px-20 space-y-10 ">
        {/* Top Section: Text and Image Side-by-Side */}
        <div className="flex flex-col lg:flex-row items-center">
          {/* Text Block */}
          <div className="w-full lg:w-3/5 space-y-6">
            <FadeInSection>
              <h1 className="font-extrabold text-3xl mb-4">
                Innovate, Collaborate, Lead
              </h1>
            </FadeInSection>
            <FadeInSection>
              <p className="font-normal text-base md:text-lg !leading-9 text-left md:text-justify">
                The Redeemer’s University Association of Computer Science Students
                (RUNACOSS) is a vibrant community for students passionate about
                computing. We create opportunities for learning, networking, and
                professional growth through engaging events, hands-on workshops,
                and academic support. Our mission is to equip students with skills
                and knowledge to thrive in the tech industry. We also foster
                innovation and collaboration through student-led initiatives and
                real-world tech projects.
              </p>
            </FadeInSection>
            <TextLink href="/about-runacoss" text="Read more" />
          </div>

          {/* Image Block */}
          <div className="w-full lg:w-2/5 flex justify-end">
            <img
              src={AboutImage}
              alt="About RUNACOSS"
              className="w-full max-w-sm h-auto rounded-2xl"
            />
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="bg-blue-bg rounded-3xl px-6 md:px-8 py-10">
          <FadeInSection>
            <h5 className="text-xl font-semibold text-primary mb-8">
              Why choose RUNACOSS?
            </h5>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 lg:gap-20 text-sm text-primary">
            <div>
              <FadeInSection>
                <h6 className="font-semibold text-base mb-2">Programs</h6>
              </FadeInSection>
              <FadeInSection>
                <p className="leading-7">
                  We offer five specialized programs, including Software
                  Engineering, Cybersecurity, and Data Analysis, designed to equip
                  students with practical and industry-relevant skills.
                </p>
              </FadeInSection>
            </div>
            <div>
              <FadeInSection>
                <h6 className="font-semibold text-base mb-2">Courses</h6>
              </FadeInSection>
              <FadeInSection>
                <p className="leading-7">
                  With over 150 courses, our curriculum blends theory with
                  hands-on experience, covering key areas like programming,
                  artificial intelligence, and cloud computing.
                </p>
              </FadeInSection>
            </div>
            <div>
              <FadeInSection>
                <h6 className="font-semibold text-base mb-2">
                  Years of Excellence
                </h6>
              </FadeInSection>
              <FadeInSection>
                <p className="leading-7">
                  For over 15 years, RUNACOSS has fostered innovation, learning,
                  and a strong network of professionals, empowering students for
                  success in tech.
                </p>
              </FadeInSection>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
