import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { HiChevronLeft, HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import Navbar from "../../../componentLibrary/NavBar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../context/AuthContext";
import apiService from "../../../services/api";
import { Blog } from "../../../services/types";
import Footer from "../../contact/Footer";

const BlogList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const highlightSlug = params.get("highlight");
  const { user } = useAuth();

  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: blogsData, loading, error, execute: fetchBlogs } = useApi<any>(apiService.getBlogs);
  const { loading: deleting, execute: deleteBlog } = useApi(apiService.deleteBlog);

  useEffect(() => {
    fetchBlogs(currentPage, 20);
  }, [currentPage, fetchBlogs]);

  useEffect(() => {
    if (highlightSlug && blogsData?.blogs) {
      const blog = blogsData.blogs.find((b: Blog) => b._id === highlightSlug);
      if (blog) setActiveBlog(blog);
    }
  }, [highlightSlug, blogsData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    navigate("/blogs"); // clear highlight
  };

  const handleDeleteBlog = async (blogId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(blogId);
        // Refresh the blogs list
        fetchBlogs(currentPage, 20);
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  const filteredBlogs = blogsData?.blogs?.filter((b: Blog) =>
    `${b.title} ${b.user.firstName} ${b.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading && !blogsData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blogs</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchBlogs(currentPage, 20)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="px-6 md:px-20 py-20 relative">
        {/* Header + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div
              className="p-3 bg-blue-bg text-primary rounded-full cursor-pointer flex items-center justify-center"
              onClick={() => navigate("/home#blogs")}
            >
              <HiChevronLeft size={28} />
            </div>
            <h2 className="text-3xl font-bold text-primary">Blog Posts</h2>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full md:w-80 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
            {user && (
              <Link
                to="/blogs/new"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <HiPlus className="w-4 h-4" />
                <span>Create Blog</span>
              </Link>
            )}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog: Blog) => (
              <div key={blog._id} className="group space-y-2">
                <Link
                  to={`/blogs?highlight=${blog._id}`}
                  className={`block ${
                    highlightSlug === blog._id ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                  <p className="text-sm font-bold text-primary group-hover:underline mt-2">
                    {blog.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    By {blog.user.firstName} {blog.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </Link>
                
                {/* Action buttons for blog owner */}
                {user && user._id === blog.user._id && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Link
                      to={`/blogs/edit/${blog._id}`}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit blog"
                    >
                      <HiPencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={(e) => handleDeleteBlog(blog._id, e)}
                      disabled={deleting}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Delete blog"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full">
              {searchTerm ? "No blogs match your search." : "No blogs available."}
            </p>
          )}
        </div>

        {/* Pagination */}
        {blogsData && blogsData.totalPages > 1 && (
          <div className="flex justify-center mt-10 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {blogsData.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(blogsData.totalPages, prev + 1))}
              disabled={currentPage === blogsData.totalPages}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Modal */}
        {activeBlog && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 max-w-xl w-full relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => {
                  setActiveBlog(null);
                  navigate("/blogs");
                }}
                className="absolute top-2 right-2 text-gray-600 text-xl"
              >
                ×
              </button>
              <div className="w-full h-56 bg-gray-200 rounded mb-4 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">
                {activeBlog.title}
              </h2>
              <p className="text-sm italic text-gray-600 mb-4">
                By {activeBlog.user.firstName} {activeBlog.user.lastName} • {new Date(activeBlog.createdAt).toLocaleDateString()}
              </p>
              <div className="whitespace-pre-wrap text-sm text-gray-800">
                {activeBlog.content}
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
};

export default BlogList;
