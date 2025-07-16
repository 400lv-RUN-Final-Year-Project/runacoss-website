import TextLink from "../../componentLibrary/TextLink";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import Navbar from "../../componentLibrary/NavBar";

const programs = [
  {
    id: "01",
    title: "Computer Science",
    description:
      "Learn the fundamentals of computing, programming, and problem-solving. Gain expertise in algorithms, software development, and system design.",
    link: "/about",
  },
  {
    id: "02",
    title: "Cyber Security",
    description:
      "Understand how to protect systems and networks from cyber threats. Explore encryption, ethical hacking, and risk management.",
    link: "/about",
  },
  {
    id: "03",
    title: "Information Technology",
    description:
      "Learn about IT infrastructure, networking, and system administration. Focus on practical solutions for business and technology challenges.",
    link: "/about",
  },
];

import FadeInSection from "../../componentLibrary/FadeInSection";

const Programs = () => {
  return (
    <>
      <div className="border-b border-gray-200 mb-16">
        <Navbar />
      </div>
      <div className="bg-white">
        {/* Header */}
        <div className="px-6 md:px-20">
          <h1 className="font-extrabold text-3xl mb-7 text-primary">PROGRAMS</h1>
        </div>

        {/* Slider on mobile */}
        <div className="px-6 md:px-20">
          <div className="block md:hidden">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={16}
              slidesPerView={1.1}
              className="!pb-8"
            >
              {programs.map((program) => (
                <SwiperSlide key={program.id}>
                  <div className="bg-[#F5F6FA] py-6 px-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow max-w-[350px] mx-auto">
                    <FadeInSection>
                      <div className="flex justify-between items-start mb-7">
                        <h3 className="font-semibold text-primary text-lg">
                          {program.title}
                        </h3>
                        <span className="text-sm text-primary bg-white font-medium rounded-full px-2 py-1">
                          {program.id}
                        </span>
                      </div>
                    </FadeInSection>
                    <FadeInSection>
                      <p className="text-sm text-[#333] leading-relaxed mb-3">
                        {program.description}
                      </p>
                    </FadeInSection>

                    <TextLink
                      text="More details"
                      href={`/programs/${program.id}`}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-x-8 gap-y-12">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-[#F5F6FA] py-6 px-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <FadeInSection>
                  <div className="flex justify-between items-start mb-7">
                    <h3 className="font-semibold text-primary text-lg">
                      {program.title}
                    </h3>
                    <span className="text-sm text-primary bg-white font-medium rounded-full px-2 py-1">
                      {program.id}
                    </span>
                  </div>
                </FadeInSection>
                <FadeInSection>
                  <p className="text-sm text-[#333] leading-relaxed mb-3">
                    {program.description}
                  </p>
                </FadeInSection>
                <TextLink text="More details" href={`/programs/${program.id}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Programs;

