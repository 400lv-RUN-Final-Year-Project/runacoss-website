import { useRef } from "react";
import { executives } from "../../data/Executives";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const ExecutiveCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollAmount = 300;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white relative group">
      <h2 className="text-2xl font-bold text-primary mb-6">Executives</h2>

      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
        bg-white rounded-full shadow-md p-2 transition-opacity opacity-0 group-hover:opacity-100"
      >
        <HiChevronLeft className="text-primary w-6 h-6" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
        bg-white rounded-full shadow-md p-2 transition-opacity opacity-0 group-hover:opacity-100"
      >
        <HiChevronRight className="text-primary w-6 h-6" />
      </button>

      <div
        className="overflow-x-auto scrollbar-hide"
        ref={scrollRef}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-6 snap-x scroll-smooth">
          {executives.map((exec, index) => (
            <a
              key={index}
              href={exec.social}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start min-w-[260px] flex-shrink-0"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow">
                <img
  src={exec.image}
  alt={exec.name}
  className="w-full h-64 object-cover object-top"
/>

                <div className="p-4 text-center">
                  <p className="text-primary font-semibold">{exec.name}</p>
                  <p className="text-sm text-gray-500">{exec.position}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveCarousel;
