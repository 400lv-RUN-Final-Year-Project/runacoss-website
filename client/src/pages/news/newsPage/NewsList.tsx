import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FadeInSection from "../../../componentLibrary/FadeInSection";
import { newsData, NewsItem } from "../../../data/NewsData";
import Navbar from "../../../componentLibrary/NavBar";
import { HiChevronLeft } from "react-icons/hi";
import Footer from "../../contact/Footer";

const NewsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const highlightSlug = params.get("highlight");

  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (highlightSlug) {
      const article = newsData.find((n) => n.slug === highlightSlug);
      if (article) setActiveArticle(article);
    }
  }, [highlightSlug]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    navigate("/news"); // remove highlight when searching
  };

  const filteredNews = newsData.filter((item) =>
    `${item.title} ${item.category} ${item.author}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <section className="px-6 md:px-20 py-20 relative">
        {/* Header + Search Row */}
<div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
  {/* Left side: Back button + Heading */}
  <div className="flex items-center gap-4">
    <div
      className="p-3 bg-blue-bg text-primary rounded-full cursor-pointer flex items-center justify-center"
      onClick={() => navigate("/home#news")}
    >
      <HiChevronLeft size={28} />
    </div>
    <FadeInSection>
      <h2 className="text-3xl font-bold text-primary">Latest News</h2>
    </FadeInSection>
  </div>

  {/* Right side: Search */}
  <input
    type="text"
    placeholder="Search news..."
    value={searchTerm}
    onChange={handleSearchChange}
    className="w-full md:w-1/2 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
  />
</div>



        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {filteredNews.length > 0 ? (
            filteredNews.map((item) => (
              <FadeInSection key={item.id}>
                <Link
                  to={`/news?highlight=${item.slug}`}
                  className={`block group space-y-2 ${
                    highlightSlug === item.slug ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="rounded-xl w-full h-48 object-cover group-hover:opacity-90 transition"
                  />
                  <p className="text-xs text-secondary">
                    {item.category} • {item.date}
                  </p>
                  <h3 className="font-semibold text-primary group-hover:underline text-lg">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600">By {item.author}</p>
                </Link>
              </FadeInSection>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full">
              No news matches your search.
            </p>
          )}
        </div>

        {/* Modal */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 max-w-xl w-full relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => {
                  setActiveArticle(null);
                  navigate("/news");
                }}
                className="absolute top-2 right-2 text-gray-600 text-xl"
              >
                ×
              </button>
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-56 object-cover rounded mb-4"
              />
              <p className="text-xs text-secondary mb-1">
                {activeArticle.category} • {activeArticle.date}
              </p>
              <h2 className="text-xl font-bold text-primary mb-2">
                {activeArticle.title}
              </h2>
              <p className="text-sm italic text-gray-600 mb-4">
                By {activeArticle.author} ({activeArticle.position})
              </p>
              <div className="whitespace-pre-wrap text-sm text-gray-800">
                {activeArticle.content}
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
};

export default NewsList;
