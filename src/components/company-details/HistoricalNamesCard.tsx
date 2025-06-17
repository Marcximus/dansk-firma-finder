
import React from 'react';

interface HistoricalName {
  period: string;
  name: string;
}

interface HistoricalNamesCardProps {
  historicalNames: HistoricalName[];
}

const HistoricalNamesCard: React.FC<HistoricalNamesCardProps> = ({ historicalNames }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Historical Names</h3>
      <ul className="space-y-4">
        {historicalNames.map((item, index) => (
          <li key={index} className="pb-4 border-b last:border-0">
            <div className="font-medium">{item.period}</div>
            <div className="text-muted-foreground text-sm">
              {item.name}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoricalNamesCard;
