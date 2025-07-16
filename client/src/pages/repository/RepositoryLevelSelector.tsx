import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../componentLibrary/NavBar";
import { Icon } from "@iconify/react";
import Breadcrumbs from "../../componentLibrary/Breadcrumbs";
import Footer from "../contact/Footer";

const levels = ["100", "200", "300", "400"];
const semesters = [
  { label: "1st Semester", slug: "first" },
  { label: "2nd Semester", slug: "second" },
];

type Folder = {
  full: string;
  short: string;
  path: string;
};

const RepositoryLevelSelector = () => {
  const { category = "general", department = "general" } = useParams();
  const navigate = useNavigate();

  const isMobile = () => window.innerWidth < 768;

  const folders: Folder[] = levels.flatMap((level) =>
    semesters.map((sem) => ({
      full: `${level} Level – ${sem.label}`,
      short: `${level}lv – ${sem.label.replace("Semester", "sem")}`,
      path: `/repository/${category}/${department}/${level}/${sem.slug}`,
    }))
  );

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-20 py-20">
        <Breadcrumbs />
        <div className="rounded-xl border border-primary/20 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {folders.map((folder) => (
                <tr
                  key={folder.path}
                  onClick={() => navigate(folder.path)}
                  className="hover:bg-gray-50 border-t text-gray-700 cursor-pointer"
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Icon icon="mdi:folder" width={18} />
                    <span className="font-mono">
                      {isMobile() ? folder.short : folder.full}
                    </span>
                  </td>
                  <td className="px-4 py-3">Folder</td>
                  <td className="px-4 py-3">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RepositoryLevelSelector;

