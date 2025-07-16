import React, { useState } from "react";
import Navbar from "../../componentLibrary/NavBar";
import { repositoryCategories } from '../../data/RepositoryFileData';
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/icons/runacossLogo.svg?url";
import Footer from "../contact/Footer";

const navLinks = [
  { name: "Home", path: "/home" },
  { name: "About us", path: "/about-runacoss" },
  { name: "Programs", path: "/programs" },
  { name: "News", path: "/news" },
  { name: "Repository", path: "/repository" },
  { name: "Blogs", path: "/blogs" },
  { name: "Dues", path: "/dues" },
  { name: "Contact", path: "/contact" },
];

const RepositoryLanding = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Filter categories by search
  const filteredCategories = repositoryCategories.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 mb-8">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Search Bar */}
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Search repository categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-96 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
          />
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center gap-3 p-6 border border-gray-100 hover:border-primary"
                onClick={() => navigate(`/repository/${cat.name}`)}
              >
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-2" style={{ background: cat.color + '22' }}>
                  <Icon className="text-3xl" style={{ color: cat.color }} />
                </span>
                <div className="font-bold text-lg text-gray-900 text-center">{cat.label}</div>
                {/* Placeholder for item count */}
                <div className="text-xs text-gray-400 font-mono">0 items</div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RepositoryLanding;

