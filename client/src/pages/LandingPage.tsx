import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../componentLibrary/NavBar";
import About from "./about/AboutUs";
import Blogs from "./blogs/Blogs";
import Contact from "./contact/Contact";
import Footer from "./contact/Footer";
import Home from "./hero/Home";
import News from "./news/News";
import Programs from "./programs/Programs";
import { repositoryCategories } from "../data/RepositoryFileData";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth" });
        }, 100); // slight delay to ensure DOM is ready
      }
    }
  }, [location]);

  return (
    <div className="space-y-7 scroll-smooth">
      <Navbar />

      <section id="home" className="min-h-screen">
        <Home />
      </section>

      <section id="about" className="pt-24 min-h-screen">
        <About />
      </section>

      <section id="programs" className="pt-20">
        <Programs />
      </section>

      <section id="news" className="pt-20 min-h-screen">
        <News />
      </section>

      <section id="repository" className="pt-20">
        {/* Repository Preview Grid */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">Repository Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {repositoryCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer flex items-center gap-4 p-5 border border-gray-100 hover:border-primary"
                  onClick={() => navigate(`/repository/${cat.name}`)}
                >
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ background: cat.color + '22' }}>
                      <Icon className="text-3xl" style={{ color: cat.color }} />
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">{cat.label}</div>
                    <div className="text-gray-500 text-sm">{cat.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="blogs" className="pt-20">
        <Blogs />
      </section>

      <section id="contact" className="pt-20 min-h-screen">
        <Contact />
      </section>

      <div className="w-full flex justify-center py-2">
        <Link
          to="/admin/login"
          className="text-xs text-primary hover:underline opacity-70"
        >
          Admin Login
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;
