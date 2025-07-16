import { useParams } from "react-router-dom";
import Navbar from "../../componentLibrary/NavBar";
import Breadcrumb from "../../componentLibrary/Breadcrumbs";
import RepositoryFileList from "../../componentLibrary/RepositoryFileList";
import Footer from "../contact/Footer";

const RepositoryFileTable = () => {
  const params = useParams<{
    category?: string;
    department?: string;
    level?: string;
    semester?: string;
  }>();

  const category = params.category ?? "";
  const department = params.department ?? "";
  const level = params.level ?? "";
  const semester = params.semester ?? "";

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-20 py-20">
        <Breadcrumb />
        <h1 className="text-2xl font-bold text-gray-900 mb-6" id="repository-files-heading">
          Repository Files
        </h1>
        <RepositoryFileList
          category={category}
          department={department}
          level={level}
          semester={semester}
          className="mt-4"
        />
      </div>
      <Footer />
    </>
  );
};

export default RepositoryFileTable;
