import { FC, ReactNode } from 'react';

type ButtonProps = {
  text: string;
  link?: string;
  onClick?: () => void;
  icon?: ReactNode;
  length?: "short" | "long";
};

const Button: FC<ButtonProps> = ({
  text,
  link,
  onClick,
  icon,
  length = "short",
}) => {
  const baseClasses =
    "font-semibold text-sm rounded-3xl px-4 py-4 inline-flex items-center bg-secondary shadow-md whitespace-nowrap min-w-[140px] ";
  const sizeClass = length === "short" ? "w-fit" : "w-full justify-center";

  const className = `${baseClasses} ${sizeClass}`;

  const content = (
    <>
      {icon && <span className="mr-2 w-6 h-6 flex-shrink-0">{icon}</span>}
      <span>{text}</span>
    </>
  );

  if (link) {
    return (
      <a href={link} target="_blank">
        <button className={className}>{content}</button>
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export default Button;
