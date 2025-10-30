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
  ring?: 'ownership' | 'voting';
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const parsePercentageRange = (percentageStr: string | undefined): { min: number; max: number; midpoint: number; isRange: boolean } => {
  if (!percentageStr || percentageStr === 'Ikke oplyst') return { min: 0, max: 0, midpoint: 0, isRange: false };
  
  // Handle ranges like "10-15%" or "67-90%"
  const match = percentageStr.match(/(\d+)(?:-(\d+))?%?/);
  if (!match) return { min: 0, max: 0, midpoint: 0, isRange: false };
  
  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;
  const midpoint = (min + max) / 2;
  
  return { min, max, midpoint, isRange: min !== max };
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

  // Prepare data for ownership (outer ring) - use midpoint for segment size
  const ownershipData: ChartDataPoint[] = [];
  owners.forEach((owner, index) => {
    const range = parsePercentageRange(owner.ejerandel);
    const color = COLORS[index % COLORS.length];
    
    if (range.midpoint > 0) {
      ownershipData.push({
        name: owner.navn,
        value: range.midpoint,
        displayValue: owner.ejerandel || 'Ikke oplyst',
        color,
        ownershipValue: owner.ejerandel || 'Ikke oplyst',
        votingValue: owner.stemmerettigheder || 'Ikke oplyst',
        isCertain: !range.isRange,
        ring: 'ownership',
      });
    }
  });

  // Prepare data for voting rights (inner ring) - use midpoint for segment size
  const votingData: ChartDataPoint[] = [];
  owners.forEach((owner, index) => {
    const range = parsePercentageRange(owner.stemmerettigheder);
    const color = COLORS[index % COLORS.length];
    
    if (range.midpoint > 0) {
      votingData.push({
        name: owner.navn,
        value: range.midpoint,
        displayValue: owner.stemmerettigheder || 'Ikke oplyst',
        color,
        ownershipValue: owner.ejerandel || 'Ikke oplyst',
        votingValue: owner.stemmerettigheder || 'Ikke oplyst',
        isCertain: !range.isRange,
        ring: 'voting',
      });
    }
  });

  if (ownershipData.length === 0 && votingData.length === 0) return null;

  const heightClass = calculateHeight(owners.length);

  const CustomTooltip = ({ active, payload, coordinate }: any) => {
    if (active && payload && payload.length && coordinate) {
      const data = payload[0].payload;
      const isOwnershipRing = data.ring === 'ownership';
      
      // Parse the relevant range based on which ring is being hovered
      const range = parsePercentageRange(isOwnershipRing ? data.ownershipValue : data.votingValue);
      const label = isOwnershipRing ? 'Ejerandel' : 'Stemmerettigheder';
      const value = isOwnershipRing ? data.ownershipValue : data.votingValue;
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[220px]">
          <p className="font-semibold text-sm mb-3 border-b border-border pb-2">{data.name}</p>
          
          <div>
            <div className="flex justify-between items-center gap-4 mb-1">
              <span className="text-xs font-medium text-foreground">{label}:</span>
              <span className="text-xs font-semibold text-foreground">{value}</span>
            </div>
            {range.isRange && (
              <div className="ml-2 space-y-0.5">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-muted-foreground">• Minimum:</span>
                  <span className="text-xs text-muted-foreground">{range.min}%</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-muted-foreground">• Maksimum:</span>
                  <span className="text-xs text-muted-foreground">{range.max}%</span>
                </div>
              </div>
            )}
          </div>
          
          {range.isRange && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-sm">💡</span>
                <span>{label} er et estimat baseret på intervaller</span>
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full ${heightClass}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {ownershipData.map((entry, index) => {
              // Extract HSL values from the color string
              const colorMatch = entry.color.match(/hsl\(var\(--chart-(\d+)\)\)/);
              const chartNum = colorMatch ? colorMatch[1] : '1';
              
              return (
                <radialGradient
                  key={`gradient-${index}`}
                  id={`gradient-${index}`}
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor={`hsl(var(--chart-${chartNum}))`} stopOpacity="1" />
                  <stop offset="100%" stopColor={`hsl(var(--chart-${chartNum}))`} stopOpacity="0.4" />
                </radialGradient>
              );
            })}
          </defs>
          
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
            >
              {ownershipData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index})`}
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
              paddingAngle={2}
              dataKey="value"
            >
              {votingData.map((entry, index) => (
                <Cell 
                  key={`cell-voting-${index}`} 
                  fill={entry.color}
                  fillOpacity={0.6}
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
