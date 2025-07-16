import { FaPhone } from "react-icons/fa";
// import { AiFillLinkedin } from "react-icons/ai";
import { AiFillInstagram, AiFillTwitterCircle } from "react-icons/ai";
import { FaTiktok } from "react-icons/fa";
import Logo from "../../assets/icons/fullLogo.svg?url";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-6">
      <div className="container mx-auto px-6 lg:px-20">
        {/* First Row: Subscribe - Logo - Social Media */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 pb-4 border-b border-gray-400">
          {/* Subscribe Box */}
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="example@run.edu.ng"
              className="rounded-full px-4 py-2 text-black w-64"
            />
            <button className="bg-secondary text-black font-semibold px-4 py-2 rounded-full">
              Subscribe
            </button>
          </div>

          {/* Logo */}
          <div>
            <img src={Logo} />
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-4 text-2xl">
            {/* <a href="https://www.linkedin.com" aria-label="LinkedIn" className="hover:text-secondary">
              <AiFillLinkedin />
            </a> */}
            <a
              href="https://www.instagram.com/the_runacoss"
              aria-label="Instagram"
              className="hover:text-secondary"
            >
              <AiFillInstagram />
            </a>
            <a
              href="https://x.com/the_runacoss"
              aria-label="Twitter"
              className="hover:text-secondary"
            >
              <AiFillTwitterCircle />
            </a>
            <a
              href="https://www.tiktok.com/@runacoss_"
              aria-label="Tiktok"
              className="hover:text-secondary"
            >
              <FaTiktok />
            </a>
          </div>
        </div>

        {/* Second Row: Navigation - Contact */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 pt-4">
          {/* Custom Navigation Links - Hidden on Mobile */}
          <div className="hidden lg:flex gap-6 text-sm">
            <a href="/home#home" className="hover:text-secondary">
              Home
            </a>
            <a href="/home#about" className="hover:text-secondary">
              About us
            </a>
            <a href="/home#programs" className="hover:text-secondary">
              Programs
            </a>
            <a href="/home#news" className="hover:text-secondary">
              News
            </a>
            <a href="/home#repository" className="hover:text-secondary">
              Repository
            </a>
            <a href="/home#blogs" className="hover:text-secondary">
              Blogs
            </a>
            <a href="/dues" className="hover:text-secondary">
              Dues
            </a>
            <a href="/home#contact" className="hover:text-secondary">
              Contact
            </a>
          </div>

          {/* Contact Info */}
          <div className="flex gap-8 items-center text-sm">
            <span>info@run.edu.ng</span>
            <div className="flex items-center gap-2">
              <FaPhone />
              <span>+234 904-4166-310</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
