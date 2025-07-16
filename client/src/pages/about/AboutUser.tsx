import AboutImage from "../../assets/images/abouttt.png";
import FadeInSection from "../../componentLibrary/FadeInSection";

const AboutUser = () => {
  return (
    <div className="px-6 md:px-12 lg:px-20 space-y-10 ">
      {/* Top Section: Text and Image Side-by-Side */}
      <div className="flex flex-col lg:flex-row items-center">
        {/* Text Block */}
        <div className="w-full lg:w-3/5 space-y-6">
          <FadeInSection>
            <h1 className="font-extrabold text-3xl mb-4">
              About RUNACOSS for Students
            </h1>
          </FadeInSection>
          <FadeInSection>
            <p className="font-normal text-base md:text-lg !leading-9 text-left md:text-justify">
              Welcome to the Redeemer’s University Association of Computer Science Students (RUNACOSS) user page! Here, you’ll discover how our vibrant student community supports your journey in computing. We offer opportunities for learning, networking, and professional growth through events, workshops, and academic support. Our mission is to help you thrive in the tech industry, foster innovation, and connect you with real-world projects and like-minded peers.
            </p>
          </FadeInSection>
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
            Why join RUNACOSS?
          </h5>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 lg:gap-20 text-sm text-primary">
          <div>
            <FadeInSection>
              <h6 className="font-semibold text-base mb-2">Student Programs</h6>
            </FadeInSection>
            <FadeInSection>
              <p className="leading-7">
                Explore specialized programs like Software Engineering, Cybersecurity, and Data Analysis, all designed to give you practical, industry-relevant skills.
              </p>
            </FadeInSection>
          </div>
          <div>
            <FadeInSection>
              <h6 className="font-semibold text-base mb-2">Courses & Activities</h6>
            </FadeInSection>
            <FadeInSection>
              <p className="leading-7">
                Choose from over 150 courses and participate in hands-on activities, covering programming, AI, cloud computing, and more.
              </p>
            </FadeInSection>
          </div>
          <div>
            <FadeInSection>
              <h6 className="font-semibold text-base mb-2">
                Community & Support
              </h6>
            </FadeInSection>
            <FadeInSection>
              <p className="leading-7">
                Join a network of students and professionals, benefit from 15+ years of excellence, and get empowered for success in tech.
              </p>
            </FadeInSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUser; 