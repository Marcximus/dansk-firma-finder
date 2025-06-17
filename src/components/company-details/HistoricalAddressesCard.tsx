
import React from 'react';

interface HistoricalAddress {
  period: string;
  address: string;
}

interface HistoricalAddressesCardProps {
  historicalAddresses: HistoricalAddress[];
}

const HistoricalAddressesCard: React.FC<HistoricalAddressesCardProps> = ({ historicalAddresses }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Historical Addresses</h3>
      <ul className="space-y-4">
        {historicalAddresses.map((item, index) => (
          <li key={index} className="pb-4 border-b last:border-0">
            <div className="font-medium">{item.period}</div>
            <div className="text-muted-foreground text-sm whitespace-pre-line">
              {item.address}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoricalAddressesCard;
