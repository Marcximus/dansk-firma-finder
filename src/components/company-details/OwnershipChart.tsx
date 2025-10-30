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

interface ChartDataPoint {
  name: string;
  value: number;
  displayValue: string;
  color: string;
  ownershipValue?: string;
  votingValue?: string;
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
    ownershipValue: owner.ejerandel || 'Ikke oplyst',
    votingValue: owner.stemmerettigheder || 'Ikke oplyst',
  })).filter(d => d.value > 0);

  // Prepare data for voting rights (inner ring)
  const votingData = owners.map((owner, index) => ({
    name: owner.navn,
    value: parsePercentage(owner.stemmerettigheder),
    displayValue: owner.stemmerettigheder || 'Ikke oplyst',
    color: COLORS[index % COLORS.length],
    ownershipValue: owner.ejerandel || 'Ikke oplyst',
    votingValue: owner.stemmerettigheder || 'Ikke oplyst',
  })).filter(d => d.value > 0);

  if (ownershipData.length === 0 && votingData.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-semibold text-sm mb-2 border-b border-border pb-2">{data.name}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-muted-foreground">Ejerandel:</span>
              <span className="text-xs font-medium">{data.ownershipValue}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-muted-foreground">Stemmerettigheder:</span>
              <span className="text-xs font-medium">{data.votingValue}</span>
            </div>
          </div>
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
              label={({ name, displayValue }) => `${name}: ${displayValue}`}
              labelLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1 }}
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
    </div>
  );
};

export default OwnershipChart;
