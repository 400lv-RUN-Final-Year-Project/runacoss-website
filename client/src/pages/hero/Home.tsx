import Button from "../../componentLibrary/Button";
import SocialsButton from "../../componentLibrary/SocialsButton";
import HeroImage from "../../assets/images/hero-bg-remove.png";
import FadeInSection from "../../componentLibrary/FadeInSection";

const Home = () => {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row items-center">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center z-[-1] "
        style={{ backgroundImage: "url('/assets/hero-bg.png')" }}
      />

      {/* Left Section */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-6 md:px-12 lg:px-20 py-14">
        <div className="max-w-xl space-y-8">
     <FadeInSection>
           <h1 className="text-3xl md:text-4xl !leading-normal font-extrabold text-primary">
  Empower your tech journey, build future-ready skills, connect with like minds, 
  and lead in today’s digital world <br /> — all with <span className="text-secondary">RUNACOSS</span>
</h1>
     </FadeInSection>
<FadeInSection>
<p className="text-xl leading-10 text-primary mt-4">
  Say goodbye to isolation and hello to growth, community, and opportunity with <span className="text-secondary">RUNACOSS</span>.
</p>
</FadeInSection>

          <div className="flex gap-4 flex-wrap mt-16">
            <Button text="Join RUNACOSS" link="https://adms.run.edu.ng/signup"  />
            <SocialsButton />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 h-[40vh] lg:h-[75vh] ">
        <img
          src={HeroImage}
          alt="Student working"
          className="w-full h-full object-cover object-center rounded-none lg:rounded-l-3xl"
        />
      </div>
    </div>
  );
};

export default Home;
