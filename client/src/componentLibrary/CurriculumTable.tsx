import { useState } from "react";
import { Curriculum } from "../services/types";

interface Props {
  data: Curriculum;
}

const CurriculumTable = ({ data }: Props) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {Object.entries(data).map(([level, semesters]) => {
        const semesterEntries = Object.entries(semesters);

        return (
          <div key={level} className="space-y-5">
            {semesterEntries.map(([semester, courses]) => {
              const sectionKey = `${level}-${semester}`;
              const isOpen = openSections[sectionKey] ?? false;

              const compulsory = courses.filter(c => c.type === "Compulsory");
              const electives = courses.filter(c => c.type === "Elective");

              return (
                <div key={sectionKey} className="overflow-hidden border-b-2 border-primary/20 rounded-xl w-full">
                  <button
                    className="w-full flex justify-between items-center px-6 py-4 text-sm font-semibold text-primary"
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <span>{level} level – {semester}</span>
                    <span>{isOpen ? "−" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div className="p-4 space-y-10 bg-white">
                      {compulsory.length > 0 && (
                        <table className="w-full text-sm text-left border border-primary/30 rounded-xl overflow-hidden">
                          <thead>
                            <tr>
                              <th colSpan={4} className="border border-primary/30 px-3 py-4 font-semibold text-primary bg-white">
                                Compulsory
                              </th>
                            </tr>
                            <tr className="text-gray-600">
                              <th className="border border-primary/30 px-3 py-4">#</th>
                              <th className="border border-primary/30 px-3 py-4">Title</th>
                              <th className="border border-primary/30 px-3 py-4">Code</th>
                              <th className="border border-primary/30 px-3 py-4">Units</th>
                            </tr>
                          </thead>
                          <tbody>
                            {compulsory.map((course, i) => (
                              <tr key={i}>
                                <td className="border border-primary/30 px-3 py-4">{i + 1}</td>
                                <td className="border border-primary/30 px-3 py-4">{course.title}</td>
                                <td className="border border-primary/30 px-3 py-4">{course.code}</td>
                                <td className="border border-primary/30 px-3 py-4">{course.units}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {electives.length > 0 && (
                        <table className="w-full text-sm text-left border border-primary/30 rounded-xl overflow-hidden">
                          <thead>
                            <tr>
                              <th colSpan={4} className="border border-primary/30 px-3 py-4 font-semibold text-primary bg-white">
                                Electives
                              </th>
                            </tr>
                            <tr className="text-gray-600">
                              <th className="border border-primary/30 px-3 py-4">#</th>
                              <th className="border border-primary/30 px-3 py-4">Title</th>
                              <th className="border border-primary/30 px-3 py-4">Code</th>
                              <th className="border border-primary/30 px-3 py-4">Units</th>
                            </tr>
                          </thead>
                          <tbody>
                            {electives.map((course, i) => (
                              <tr key={i}>
                                <td className="border border-primary/30 px-3 py-4">{i + 1}</td>
                                <td className="border border-primary/30 px-3 py-4">{course.title}</td>
                                <td className="border border-primary/30 px-3 py-4">{course.code}</td>
                                <td className="border border-primary/30 px-3 py-4">{course.units}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default CurriculumTable;
