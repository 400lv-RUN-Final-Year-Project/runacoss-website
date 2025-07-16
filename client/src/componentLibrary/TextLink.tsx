import { FC } from 'react';
import { Link } from 'react-router-dom';
import FadeInSection from "./FadeInSection";

type TextLinkProps = {
  text: string;
  href: string;
};

const TextLink: FC<TextLinkProps> = ({ text, href }) => {
  const isInternal = href.startsWith('/');
  return (
    <FadeInSection>
      {isInternal ? (
        <Link
          to={href}
          className="inline-block whitespace-nowrap text-black hover:text-secondary transition-colors duration-200"
        >
          <span className="underline underline-offset-2">{text}</span> -&gt;
        </Link>
      ) : (
        <a
          href={href}
          className="inline-block whitespace-nowrap text-black hover:text-secondary transition-colors duration-200"
          target="_blank" rel="noopener noreferrer"
        >
          <span className="underline underline-offset-2">{text}</span> -&gt;
        </a>
      )}
    </FadeInSection>
  );
};
  
export default TextLink;
