
import React from 'react';

interface ManagementPerson {
  role: string;
  name: string;
  address: string;
}

interface ManagementCardProps {
  management: ManagementPerson[];
}

const ManagementCard: React.FC<ManagementCardProps> = ({ management }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4 pb-2 border-b">
        <h3 className="text-lg font-semibold">Management & Board</h3>
        <span className="text-sm text-muted-foreground">Information from CVR Registry</span>
      </div>
      <ul className="space-y-4">
        {management.map((person, index) => (
          <li key={index} className="pb-4 border-b last:border-0">
            <div className="text-sm font-medium text-muted-foreground">{person.role}</div>
            <div className="font-medium">{person.name}</div>
            <div className="text-sm text-muted-foreground">{person.address}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagementCard;
