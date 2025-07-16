import { FC } from "react";
import FadeInSection from "../../../componentLibrary/FadeInSection";

const facilities = [
  {
    label: "Software Laboratory",
    image: "/assets/images/facilities/software-lab.jpg",
  },
  {
    label: "Hardware Laboratory",
    image: "/assets/images/facilities/hardware-lab.jpg",
  },
  {
    label: "Library",
    image: "/assets/images/facilities/library.jpg",
  },
  {
    label: "International IT Laboratory",
    image: "/assets/images/facilities/international-it-lab.jpg",
  },
];

const Facilities: FC = () => {
  return (
    <section className="px-6 md:px-20 py-14">
      <FadeInSection>
        <h2 className="text-3xl font-bold text-primary mb-8">Facilities</h2>
      </FadeInSection>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {facilities.map((facility, index) => (
          <FadeInSection key={index}>
            <div className="space-y-2">
              <img
                src={facility.image}
                alt={facility.label}
                className="rounded-xl w-full h-36 md:h-40 object-cover"
              />
              <p className="text-center text-sm md:text-base">{facility.label}</p>
            </div>
          </FadeInSection>
        ))}
      </div>
    </section>
  );
};

export default Facilities;
