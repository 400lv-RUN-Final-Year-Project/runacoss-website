import { Link } from "react-router-dom";
import AuthorAvatar from "../../assets/images/authorAvatar.png";
import TextLink from "../../componentLibrary/TextLink";
import FadeInSection from "../../componentLibrary/FadeInSection";
import { blogData } from "../../data/BlogsData";

type Blog = {
  id: string;
  title: string;
  snippet: string;
  author: string;
  date: string;
  image: string;
  avatar: string;
};

const Blogs = () => {
  return (
    <>
      <div className="bg-white">
        {/* Header */}
        <div className="px-6 md:px-20 flex justify-between items-center mb-10">
          <h1 className="font-extrabold text-2xl text-primary">BLOGS</h1>
          <TextLink href="/blogs" text="Read more" />
        </div>

        {/* Carousel (mobile) / Grid (desktop) */}
        <div className="overflow-x-auto md:overflow-visible px-6 md:px-20">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 snap-x scroll-smooth">
            {blogData.slice(0, 4).map((blog) => (
              <Link
                key={blog.id}
                to={`/blogs?highlight=${blog.slug}`}
                className="min-w-[80%] md:min-w-0 snap-start"
              >
                <BlogCard blog={blog} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const BlogCard = ({ blog }: { blog: Blog }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer">
      <div className="relative w-full h-72">
        <img
          src={blog.image}
          alt="Blog"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full h-24">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-md" />
          <div className="relative z-10 p-3">
            <FadeInSection>
              <h2 className="font-semibold text-sm text-primary mb-1">
                {blog.title}
              </h2>
            </FadeInSection>
            <FadeInSection>
              <p className="text-xs text-black line-clamp-3">{blog.snippet}</p>
            </FadeInSection>
          </div>
        </div>
      </div>
      <div className="flex items-center p-2">
        <img
          src={blog.avatar || AuthorAvatar}
          alt="Author"
          className="w-8 h-8 rounded-full mr-2 object-cover"
        />
        <div className="text-xs">
          <p className="text-primary font-medium">{blog.author}</p>
          <p className="text-[10px]">{blog.date}</p>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
