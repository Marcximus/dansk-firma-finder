import { format, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';

export interface TimelineEvent {
  id: string;
  date: Date;
  category: 'management' | 'board' | 'ownership' | 'address' | 'name' | 'industry' | 'status' | 'financial' | 'legal' | 'contact' | 'capital' | 'purpose';
  title: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  severity: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface TimelineFilters {
  showManagement: boolean;
  showBoard: boolean;
  showOwnership: boolean;
  showAddress: boolean;
  showName: boolean;
  showIndustry: boolean;
  showStatus: boolean;
  showFinancial: boolean;
  showLegal: boolean;
  showContact: boolean;
  showCapital: boolean;
  showPurpose: boolean;
}

export const defaultFilters: TimelineFilters = {
  showManagement: true,
  showBoard: true,
  showOwnership: true,
  showAddress: true,
  showName: true,
  showIndustry: true,
  showStatus: true,
  showFinancial: false,
  showLegal: true,
  showContact: true,
  showCapital: true,
  showPurpose: true,
};

const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) {
    console.log('[Timeline] Empty date string');
    return null;
  }
  
  try {
    const cleaned = dateString.trim();
    const parsed = parseISO(cleaned);
    
    if (isNaN(parsed.getTime())) {
      console.warn('[Timeline] Invalid date parsed:', dateString);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('[Timeline] Date parsing error:', dateString, error);
    return null;
  }
};

const generateId = (category: string, date: Date, index: number): string => {
  return `${category}-${date.getTime()}-${index}`;
};

export const extractAllHistoricalEvents = (cvrData: any, financialData?: any): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  let eventIndex = 0;

  // Normalize the data structure - handle both flat and nested formats
  const normalizeData = (data: any) => {
    if (!data) return null;
    
    // If data already has the fields we need at top level, use it
    if (data?.navne || data?.deltagerRelation || data?.beliggenhedsadresse) {
      return data;
    }
    
    // Try common nested paths
    if (data?.Vrvirksomhed?.virksomhed) {
      return data.Vrvirksomhed.virksomhed;
    }
    
    if (data?.virksomhed) {
      return data.virksomhed;
    }
    
    return data;
  };

  const normalizedData = normalizeData(cvrData);

  console.log('[Timeline] Data structure:', {
    originalKeys: cvrData ? Object.keys(cvrData) : [],
    hasVrvirksomhed: !!cvrData?.Vrvirksomhed,
    normalizedKeys: normalizedData ? Object.keys(normalizedData) : [],
    hasNavne: !!normalizedData?.navne,
    navneCount: normalizedData?.navne?.length || 0,
    hasDeltagerRelation: !!normalizedData?.deltagerRelation,
    deltagerRelationCount: normalizedData?.deltagerRelation?.length || 0,
    hasBeliggenhedsadresse: !!normalizedData?.beliggenhedsadresse,
    beliggenhedsadresseCount: normalizedData?.beliggenhedsadresse?.length || 0,
  });

  // Extract name history
  if (normalizedData?.navne) {
    normalizedData.navne.forEach((navnObj: any, idx: number) => {
      const startDate = parseDate(navnObj.periode?.gyldigFra);
      if (startDate) {
        const isFirst = idx === normalizedData.navne.length - 1;
        events.push({
          id: generateId('name', startDate, eventIndex++),
          date: startDate,
          category: 'name',
          title: isFirst ? 'Virksomhed oprettet' : 'Navneændring',
          description: navnObj.navn,
          newValue: navnObj.navn,
          oldValue: idx < normalizedData.navne.length - 1 ? normalizedData.navne[idx + 1]?.navn : undefined,
          severity: isFirst ? 'high' : 'medium',
          metadata: navnObj,
        });
      }
    });
  }
  console.log('[Timeline] Extracted name events:', events.filter(e => e.category === 'name').length);

  // Extract address history
  if (normalizedData?.beliggenhedsadresse) {
    normalizedData.beliggenhedsadresse.forEach((addr: any, idx: number) => {
      const startDate = parseDate(addr.periode?.gyldigFra);
      if (startDate) {
        const formatAddr = (a: any) => {
          const parts = [
            a.vejnavn,
            a.husnummerFra ? `${a.husnummerFra}${a.bogstavFra || ''}` : null,
            a.postnummer,
            a.postdistrikt,
          ].filter(Boolean);
          return parts.join(', ');
        };

        events.push({
          id: generateId('address', startDate, eventIndex++),
          date: startDate,
          category: 'address',
          title: 'Adresseændring',
          description: formatAddr(addr),
          newValue: formatAddr(addr),
          oldValue: idx < normalizedData.beliggenhedsadresse.length - 1 ? formatAddr(normalizedData.beliggenhedsadresse[idx + 1]) : undefined,
          severity: 'low',
          metadata: addr,
        });
      }
    });
  }
  console.log('[Timeline] Extracted address events:', events.filter(e => e.category === 'address').length);

  // Extract status history
  if (normalizedData?.virksomhedsstatus) {
    normalizedData.virksomhedsstatus.forEach((status: any, idx: number) => {
      const startDate = parseDate(status.periode?.gyldigFra);
      if (startDate) {
        const statusMap: Record<string, string> = {
          'NORMAL': 'Normal',
          'UNDER_KONKURS': 'Under konkurs',
          'UNDER_REKONSTRUKTION': 'Under rekonstruktion',
          'OPLØST': 'Opløst',
          'UNDER_TVANGSOPLØSNING': 'Under tvangsopløsning',
        };

        events.push({
          id: generateId('status', startDate, eventIndex++),
          date: startDate,
          category: 'status',
          title: 'Statusændring',
          description: statusMap[status.status] || status.status,
          newValue: status.status,
          oldValue: idx < normalizedData.virksomhedsstatus.length - 1 ? normalizedData.virksomhedsstatus[idx + 1]?.status : undefined,
          severity: status.status === 'NORMAL' ? 'low' : 'high',
          metadata: status,
        });
      }
    });
  }

  // Extract industry history
  if (normalizedData?.hovedbranche) {
    normalizedData.hovedbranche.forEach((branche: any, idx: number) => {
      const startDate = parseDate(branche.periode?.gyldigFra);
      if (startDate) {
        events.push({
          id: generateId('industry', startDate, eventIndex++),
          date: startDate,
          category: 'industry',
          title: 'Brancheændring',
          description: branche.branchetekst || `Branchekode: ${branche.branchekode}`,
          newValue: branche.branchetekst,
          severity: 'medium',
          metadata: branche,
        });
      }
    });
  }

  // Extract legal form history
  if (normalizedData?.virksomhedsform) {
    normalizedData.virksomhedsform.forEach((form: any, idx: number) => {
      const startDate = parseDate(form.periode?.gyldigFra);
      if (startDate) {
        events.push({
          id: generateId('legal', startDate, eventIndex++),
          date: startDate,
          category: 'legal',
          title: 'Ændring af virksomhedsform',
          description: form.langbeskrivelse || form.kortbeskrivelse,
          newValue: form.langbeskrivelse,
          severity: 'high',
          metadata: form,
        });
      }
    });
  }

  // Extract capital history
  if (normalizedData?.kapital) {
    normalizedData.kapital.forEach((kapital: any, idx: number) => {
      const startDate = parseDate(kapital.periode?.gyldigFra);
      if (startDate) {
        const amount = new Intl.NumberFormat('da-DK', { style: 'currency', currency: kapital.valuta || 'DKK' }).format(kapital.beloeb);
        events.push({
          id: generateId('capital', startDate, eventIndex++),
          date: startDate,
          category: 'capital',
          title: 'Kapitalændring',
          description: `Selskabskapital: ${amount}`,
          newValue: amount,
          severity: 'medium',
          metadata: kapital,
        });
      }
    });
  }

  // Extract purpose history
  if (normalizedData?.formaal) {
    normalizedData.formaal.forEach((formaal: any, idx: number) => {
      const startDate = parseDate(formaal.periode?.gyldigFra);
      if (startDate) {
        events.push({
          id: generateId('purpose', startDate, eventIndex++),
          date: startDate,
          category: 'purpose',
          title: 'Formålsændring',
          description: formaal.formaalskode,
          newValue: formaal.formaalskode,
          severity: 'low',
          metadata: formaal,
        });
      }
    });
  }
  console.log('[Timeline] Extracted management/board/ownership events:', 
    events.filter(e => ['management', 'board', 'ownership'].includes(e.category)).length);

  // Extract management, board, and ownership from deltagerRelation
  if (normalizedData?.deltagerRelation) {
    normalizedData.deltagerRelation.forEach((relation: any) => {
      const personName = relation.deltager?.navne?.[0]?.navn || 'Ukendt person';
      
      relation.organisationer?.forEach((org: any) => {
        if (org.medlemsData) {
          org.medlemsData.forEach((medlem: any) => {
            const startDate = parseDate(medlem.periode?.gyldigFra);
            const endDate = parseDate(medlem.periode?.gyldigTil);
            
            if (startDate) {
              const functionAttr = medlem.attributter?.find((a: any) => a.type === 'FUNKTION');
              const roleTitle = functionAttr?.vaerdier?.[0]?.vaerdi || 'Rolle';
              
              let category: 'management' | 'board' | 'ownership' = 'management';
              let severity: 'low' | 'medium' | 'high' = 'medium';
              
              if (org.hovedtype === 'REGISTER_DIREKTION') {
                category = 'management';
                severity = 'high';
              } else if (org.hovedtype === 'REGISTER_BESTYRELSE') {
                category = 'board';
                severity = 'high';
              } else if (org.hovedtype === 'EJERREGISTER') {
                category = 'ownership';
                severity = 'high';
              }

              // Entry event
              events.push({
                id: generateId(category, startDate, eventIndex++),
                date: startDate,
                category,
                title: `${personName} indtrådte`,
                description: `${roleTitle} - ${org.organisationsNavn?.[0]?.navn || org.hovedtype}`,
                newValue: personName,
                severity,
                metadata: { relation, org, medlem, type: 'entry' },
              });

              // Exit event (if ended)
              if (endDate) {
                events.push({
                  id: generateId(category, endDate, eventIndex++),
                  date: endDate,
                  category,
                  title: `${personName} udtrådte`,
                  description: `${roleTitle} - ${org.organisationsNavn?.[0]?.navn || org.hovedtype}`,
                  oldValue: personName,
                  severity: 'medium',
                  metadata: { relation, org, medlem, type: 'exit' },
                });
              }
            }
          });
        }
      });
    });
  }

  console.log('[Timeline] Total events extracted:', events.length, {
    byCategory: {
      name: events.filter(e => e.category === 'name').length,
      address: events.filter(e => e.category === 'address').length,
      status: events.filter(e => e.category === 'status').length,
      industry: events.filter(e => e.category === 'industry').length,
      legal: events.filter(e => e.category === 'legal').length,
      capital: events.filter(e => e.category === 'capital').length,
      purpose: events.filter(e => e.category === 'purpose').length,
      management: events.filter(e => e.category === 'management').length,
      board: events.filter(e => e.category === 'board').length,
      ownership: events.filter(e => e.category === 'ownership').length,
    }
  });

  // Sort by date (newest first)
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return events;
};

export const groupEventsByYear = (events: TimelineEvent[]): Record<string, TimelineEvent[]> => {
  const grouped: Record<string, TimelineEvent[]> = {};
  
  events.forEach(event => {
    const year = format(event.date, 'yyyy');
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(event);
  });

  return grouped;
};

export const groupEventsByMonth = (events: TimelineEvent[]): Record<string, TimelineEvent[]> => {
  const grouped: Record<string, TimelineEvent[]> = {};
  
  events.forEach(event => {
    const monthYear = format(event.date, 'MMMM yyyy', { locale: da });
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(event);
  });

  return grouped;
};

export const filterEvents = (events: TimelineEvent[], filters: TimelineFilters): TimelineEvent[] => {
  return events.filter(event => {
    switch (event.category) {
      case 'management': return filters.showManagement;
      case 'board': return filters.showBoard;
      case 'ownership': return filters.showOwnership;
      case 'address': return filters.showAddress;
      case 'name': return filters.showName;
      case 'industry': return filters.showIndustry;
      case 'status': return filters.showStatus;
      case 'financial': return filters.showFinancial;
      case 'legal': return filters.showLegal;
      case 'contact': return filters.showContact;
      case 'capital': return filters.showCapital;
      case 'purpose': return filters.showPurpose;
      default: return true;
    }
  });
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    management: 'Ledelse',
    board: 'Bestyrelse',
    ownership: 'Ejerskab',
    address: 'Adresse',
    name: 'Navn',
    industry: 'Branche',
    status: 'Status',
    financial: 'Økonomi',
    legal: 'Juridisk',
    contact: 'Kontakt',
    capital: 'Kapital',
    purpose: 'Formål',
  };
  return labels[category] || category;
};
