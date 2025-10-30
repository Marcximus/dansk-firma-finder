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
  isCertain?: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const parsePercentageRange = (percentageStr: string | undefined): { min: number; max: number; isRange: boolean } => {
  if (!percentageStr || percentageStr === 'Ikke oplyst') return { min: 0, max: 0, isRange: false };
  
  // Handle ranges like "10-15%" or "67-90%"
  const match = percentageStr.match(/(\d+)(?:-(\d+))?%?/);
  if (!match) return { min: 0, max: 0, isRange: false };
  
  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;
  
  return { min, max, isRange: min !== max };
};

const OwnershipChart: React.FC<OwnershipChartProps> = ({ owners }) => {
  if (!owners || owners.length === 0) return null;

  // Calculate dynamic height based on number of owners
  const calculateHeight = (numOwners: number): string => {
    if (numOwners <= 1) return 'h-[180px] sm:h-[200px] md:h-[220px]';
    if (numOwners === 2) return 'h-[200px] sm:h-[220px] md:h-[260px]';
    if (numOwners === 3) return 'h-[220px] sm:h-[250px] md:h-[280px]';
    return 'h-[240px] sm:h-[270px] md:h-[300px]'; // 4 or more
  };

  // Prepare data for ownership (outer ring) with uncertainty ranges
  const ownershipData: ChartDataPoint[] = [];
  owners.forEach((owner, index) => {
    const range = parsePercentageRange(owner.ejerandel);
    const color = COLORS[index % COLORS.length];
    
    if (range.min > 0) {
      // Add certain minimum
      ownershipData.push({
        name: owner.navn,
        value: range.min,
        displayValue: owner.ejerandel || 'Ikke oplyst',
        color,
        ownershipValue: owner.ejerandel || 'Ikke oplyst',
        votingValue: owner.stemmerettigheder || 'Ikke oplyst',
        isCertain: true,
      });
      
      // Add uncertainty range if it exists
      if (range.isRange && range.max > range.min) {
        ownershipData.push({
          name: `${owner.navn} (usikkerhed)`,
          value: range.max - range.min,
          displayValue: owner.ejerandel || 'Ikke oplyst',
          color,
          ownershipValue: owner.ejerandel || 'Ikke oplyst',
          votingValue: owner.stemmerettigheder || 'Ikke oplyst',
          isCertain: false,
        });
      }
    }
  });

  // Prepare data for voting rights (inner ring) with uncertainty ranges
  const votingData: ChartDataPoint[] = [];
  owners.forEach((owner, index) => {
    const range = parsePercentageRange(owner.stemmerettigheder);
    const color = COLORS[index % COLORS.length];
    
    if (range.min > 0) {
      // Add certain minimum
      votingData.push({
        name: owner.navn,
        value: range.min,
        displayValue: owner.stemmerettigheder || 'Ikke oplyst',
        color,
        ownershipValue: owner.ejerandel || 'Ikke oplyst',
        votingValue: owner.stemmerettigheder || 'Ikke oplyst',
        isCertain: true,
      });
      
      // Add uncertainty range if it exists
      if (range.isRange && range.max > range.min) {
        votingData.push({
          name: `${owner.navn} (usikkerhed)`,
          value: range.max - range.min,
          displayValue: owner.stemmerettigheder || 'Ikke oplyst',
          color,
          ownershipValue: owner.ejerandel || 'Ikke oplyst',
          votingValue: owner.stemmerettigheder || 'Ikke oplyst',
          isCertain: false,
        });
      }
    }
  });

  if (ownershipData.length === 0 && votingData.length === 0) return null;

  const heightClass = calculateHeight(owners.length);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const displayName = data.name.replace(' (usikkerhed)', '');
      const isUncertain = data.isCertain === false;
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-semibold text-sm mb-2 border-b border-border pb-2">{displayName}</p>
          {isUncertain && (
            <p className="text-xs text-muted-foreground italic mb-2">Usikkerhedsområde i ejerandelen</p>
          )}
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
    <div className={`w-full ${heightClass}`}>
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
              paddingAngle={1}
              dataKey="value"
              label={(entry) => entry.isCertain !== false ? `${entry.name.replace(' (usikkerhed)', '')}: ${entry.displayValue}` : ''}
              labelLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1 }}
            >
              {ownershipData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  fillOpacity={entry.isCertain === false ? 0.3 : 1}
                  stroke={entry.isCertain === false ? entry.color : undefined}
                  strokeWidth={entry.isCertain === false ? 2 : 0}
                  strokeDasharray={entry.isCertain === false ? "4 4" : undefined}
                />
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
              paddingAngle={1}
              dataKey="value"
            >
              {votingData.map((entry, index) => (
                <Cell 
                  key={`cell-voting-${index}`} 
                  fill={entry.color}
                  fillOpacity={entry.isCertain === false ? 0.2 : 0.7}
                  stroke={entry.isCertain === false ? entry.color : undefined}
                  strokeWidth={entry.isCertain === false ? 2 : 0}
                  strokeDasharray={entry.isCertain === false ? "4 4" : undefined}
                />
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
