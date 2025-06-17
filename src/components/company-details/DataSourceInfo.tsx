
import React from 'react';

const DataSourceInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2">Data Source</h4>
      <p className="text-sm text-blue-700">
        This information is sourced from the Danish Business Authority (Erhvervsstyrelsen) CVR registry. 
        Some detailed information may require additional API access or manual lookup.
      </p>
    </div>
  );
};

export default DataSourceInfo;
