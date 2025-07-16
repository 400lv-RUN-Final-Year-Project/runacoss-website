import { FC } from 'react';
import TikTokIcon from "../assets/icons/tiktok.svg?url";
import InstagramIcon from "../assets/icons/instagram.svg?url";

const SocialsButton: FC = () => {
  return (
    <div className="flex items-center bg-white rounded-full px-3 py-2 space-x-2 shadow-md w-fit">
      {/* TikTok */}
      <a
        href="https://www.tiktok.com/@runacoss_?_t=ZM-8vqxYCJ89qB&_r=1"
        target="_blank"
      >
        <div className="w-8 h-8 bg-secondary flex items-center justify-center rounded-full">
          <img src={TikTokIcon} alt="TikTok" className="w-5 h-5" />
        </div>
      </a>

      {/* Instragram */}
      <a
        href="https://www.instagram.com/the_runacoss?igsh=MWplOG1udnM0NjI4bA=="
        target="_blank"
      >
        <div className="w-8 h-8 bg-secondary flex items-center justify-center rounded-full">
          <img src={InstagramIcon} alt="Instagram" className="w-5 h-5" />
        </div>
      </a>

      {/* Username */}
      <span className="text-primary font-medium text-sm">therunacoss</span>
    </div>
  );
};

export default SocialsButton;
