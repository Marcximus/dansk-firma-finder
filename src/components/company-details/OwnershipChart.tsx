import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Owner {
  navn: string;
  ejerandel?: string;
  stemmerettigheder?: string;
  type?: string;
}

interface OwnershipChartProps {
  owners: Owner[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const parsePercentage = (percentageStr: string | undefined): number => {
  if (!percentageStr || percentageStr === 'Ikke oplyst') return 0;
  
  // Handle ranges like "10-15%" or "67-90%"
  const match = percentageStr.match(/(\d+)(?:-(\d+))?%?/);
  if (!match) return 0;
  
  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;
  
  // Return midpoint of range
  return (min + max) / 2;
};

const OwnershipChart: React.FC<OwnershipChartProps> = ({ owners }) => {
  if (!owners || owners.length === 0) return null;

  // Prepare data for ownership (outer ring)
  const ownershipData = owners.map((owner, index) => ({
    name: owner.navn,
    value: parsePercentage(owner.ejerandel),
    displayValue: owner.ejerandel || 'Ikke oplyst',
    color: COLORS[index % COLORS.length],
  })).filter(d => d.value > 0);

  // Prepare data for voting rights (inner ring)
  const votingData = owners.map((owner, index) => ({
    name: owner.navn,
    value: parsePercentage(owner.stemmerettigheder),
    displayValue: owner.stemmerettigheder || 'Ikke oplyst',
    color: COLORS[index % COLORS.length],
  })).filter(d => d.value > 0);

  // Calculate total to see if there are other owners
  const totalOwnership = ownershipData.reduce((sum, d) => sum + d.value, 0);
  const totalVoting = votingData.reduce((sum, d) => sum + d.value, 0);

  // Add "Andre" (Others) if total is less than 100%
  if (totalOwnership < 100 && totalOwnership > 0) {
    ownershipData.push({
      name: 'Andre',
      value: 100 - totalOwnership,
      displayValue: `${(100 - totalOwnership).toFixed(1)}%`,
      color: 'hsl(var(--muted))',
    });
  }

  if (totalVoting < 100 && totalVoting > 0) {
    votingData.push({
      name: 'Andre',
      value: 100 - totalVoting,
      displayValue: `${(100 - totalVoting).toFixed(1)}%`,
      color: 'hsl(var(--muted))',
    });
  }

  if (ownershipData.length === 0 && votingData.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm">{payload[0].payload.name}</p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.displayValue}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Outer ring - Ownership */}
          {ownershipData.length > 0 && (
            <Pie
              data={ownershipData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              dataKey="value"
              label={({ value, name }) => `${name}: ${value.toFixed(1)}%`}
              labelLine={false}
            >
              {ownershipData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          )}
          
          {/* Inner ring - Voting Rights */}
          {votingData.length > 0 && (
            <Pie
              data={votingData}
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="55%"
              paddingAngle={2}
              dataKey="value"
            >
              {votingData.map((entry, index) => (
                <Cell key={`cell-voting-${index}`} fill={entry.color} opacity={0.7} />
              ))}
            </Pie>
          )}
          
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 space-y-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-current opacity-100"></div>
          <span className="text-muted-foreground">Ejerandel (ydre ring)</span>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-current opacity-70"></div>
          <span className="text-muted-foreground">Stemmerettigheder (indre ring)</span>
        </div>
      </div>
    </div>
  );
};

export default OwnershipChart;
