import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react";

const isMobile = () => window.innerWidth < 768;

const formatLabel = (segment: string, key?: string) => {
  const mobile = isMobile();

  if (key === "repository") return mobile ? "Repo" : "Repository";

  if (key === "department") {
    const map = {
      cs: "CSC",
      it: "IT",
      cyb: "CYB",
    };
    return mobile ? map[segment as keyof typeof map] ?? segment : formatWords(segment);
  }

  if (key === "semester") {
    return mobile ? segment.replace("Semester", "s") : formatWords(segment);
  }

  if (key === "level-semester") {
    const [level, sem] = segment.split("-");
    return mobile
      ? `${level.trim()}lv ${sem.trim()[0]}s`
      : `${level.trim()} Level ${sem.trim()}`;
  }

  return formatWords(segment);
};


const formatWords = (input: string) =>
  input.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const Breadcrumb = () => {
  const { category, department, level, semester } = useParams();

  const segments = [
    {
      label: formatLabel("repository", "repository"),
      icon: "mdi:folder-outline",
      to: "/home#repository",
    },
    category && {
      label: formatLabel(category),
      to: `/repository/${category}`,
    },
    department &&
      category && {
        label: formatLabel(department, "department"),
        to: `/repository/${category}/${department}`,
      },
    level &&
      semester &&
      category &&
      department && {
        label: `${level}lv ${formatLabel(semester, "semester")}`,
        to: `/repository/${category}/${department}/${level}/${semester}`,
      },
  ].filter(Boolean) as { label: string; to?: string; icon?: string }[];

  return (
    <nav className="flex items-center text-sm text-gray-500 gap-1 mb-6">
      {segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300">›</span>}
          {seg.to ? (
            <Link
              to={seg.to}
              className="hover:underline flex items-center gap-1"
            >
              {seg.icon && <Icon icon={seg.icon} className="text-lg" />}
              {seg.label}
            </Link>
          ) : (
            <span className="text-gray-600">{seg.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
