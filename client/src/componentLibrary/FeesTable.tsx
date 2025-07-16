import { useState } from "react";

export interface FeeItem {
  title: string;
  amount: number;
  installments: number;
}

export type FeeStructure = {
  [level: string]: FeeItem[];
};

interface Props {
  data: FeeStructure;
}

const FeeTable = ({ data }: Props) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (level: string) => {
    setOpenSections(prev => ({ ...prev, [level]: !prev[level] }));
  };

  return (
    <div className="space-y-8">
      {Object.entries(data).map(([level, fees]) => {
        const isOpen = openSections[level] ?? false;
        const total = fees.reduce((sum, item) => sum + item.amount, 0);

        return (
          <div key={level} className="overflow-hidden border-b-2 border-primary/20 rounded-xl w-full">
            <button
              className="w-full flex justify-between items-center px-6 py-4 text-sm font-semibold text-primary"
              onClick={() => toggleSection(level)}
            >
              <span>{level} level</span>
              <span>{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className="p-4 bg-white">
                <table className="w-full text-sm text-left border border-primary/30 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="text-gray-600 bg-white">
                      <th className="border border-primary/30 px-3 py-4">#</th>
                      <th className="border border-primary/30 px-3 py-4">Fee</th>
                      <th className="border border-primary/30 px-3 py-4">Amount (₦)</th>
                      <th className="border border-primary/30 px-3 py-4">Installments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((item, i) => (
                      <tr key={i}>
                        <td className="border border-primary/30 px-3 py-4">{i + 1}</td>
                        <td className="border border-primary/30 px-3 py-4">{item.title}</td>
                        <td className="border border-primary/30 px-3 py-4">{item.amount.toLocaleString()}</td>
                        <td className="border border-primary/30 px-3 py-4">{item.installments}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} className="border border-primary/30 px-3 py-4 font-semibold text-right">
                        Total
                      </td>
                      <td className="border border-primary/30 px-3 py-4 font-bold">
                        {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-primary/30 px-3 py-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeeTable;
