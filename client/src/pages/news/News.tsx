import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TextLink from "../../componentLibrary/TextLink";
import FadeInSection from "../../componentLibrary/FadeInSection";
import { newsData } from "../../data/NewsData";

const News = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayedNews = isMobile ? newsData.slice(0, 2) : newsData.slice(1, 6);
  const featured = newsData[0];

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="px-6 md:px-20 flex justify-between items-center mb-5">
        <FadeInSection>
          <h1 className="font-extrabold text-2xl text-primary">NEWS</h1>
        </FadeInSection>
        <TextLink href="/news" text="Read more" />
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-20 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Featured News */}
        <Link
          to={`/news?highlight=${featured.slug}`}
          className="w-full md:col-span-2 space-y-4 group"
        >
          <div className="w-full h-[370px]">
            <img
              src={featured.image}
              alt={featured.title}
              className="rounded-2xl w-full h-full object-cover group-hover:opacity-90 transition"
            />
          </div>

          <FadeInSection>
            <p className="text-xs text-primary">
              {featured.category} &nbsp; | &nbsp; {featured.date} &nbsp; |
              &nbsp; {featured.time}
            </p>
          </FadeInSection>

          <FadeInSection>
            <h2 className="text-xl font-bold text-primary group-hover:underline">
              {featured.title}
            </h2>
          </FadeInSection>

          <FadeInSection>
            <p className="text-sm text-gray-600">
              By {featured.author} ({featured.position})
            </p>
          </FadeInSection>

          <FadeInSection>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
              {featured.content}
            </p>
          </FadeInSection>
        </Link>

        {/* News List */}
        <div className="px-6 md:px-0">
          <div className="flex flex-col space-y-8">
            {displayedNews.map((item) => (
              <Link
                to={`/news?highlight=${item.slug}`}
                key={item.id}
                className="flex space-x-4 h-20 hover:opacity-80 transition"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-20 rounded-lg object-cover"
                />
                <div className="flex flex-col">
                  <p className="text-xs text-primary">{item.category}</p>
                  <h3 className="text-xs font-semibold text-primary leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[10px] mt-1">
                    {item.date} | {item.time}
                  </p>
                  <p className="text-[10px]">By {item.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
