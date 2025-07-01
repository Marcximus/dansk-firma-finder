
import React from 'react';

const DataSourceInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2">Datakilde</h4>
      <p className="text-sm text-blue-700">
        Disse oplysninger kommer fra Erhvervsstyrelsens CVR-register. 
        Nogle detaljerede oplysninger kan kræve yderligere API-adgang eller manuel opslag.
      </p>
    </div>
  );
};

export default DataSourceInfo;
