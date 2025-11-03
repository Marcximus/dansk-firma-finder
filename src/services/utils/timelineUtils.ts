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
  showFinancial: true,
  showLegal: true,
  showContact: true,
  showCapital: true,
  showPurpose: true,
};

const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    const cleaned = dateString.trim();
    const parsed = parseISO(cleaned);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
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
    if (data.Vrvirksomhed) return data.Vrvirksomhed;
    if (data.navne || data.deltagerRelation || data.beliggenhedsadresse) return data;
    return data;
  };

  const normalizedData = normalizeData(cvrData);

  // Extract actual company founding date FIRST
  if (normalizedData?.stiftelsesDato) {
    const foundingDate = parseDate(normalizedData.stiftelsesDato);
    if (foundingDate) {
      events.push({
        id: generateId('founding', foundingDate, eventIndex++),
        date: foundingDate,
        category: 'legal',
        title: 'Virksomhed stiftet',
        description: normalizedData.navne?.[normalizedData.navne.length - 1]?.navn || 'Ukendt navn',
        severity: 'high',
      });
    }
  }

  // Extract name history (ALL are name changes, not creation)
  if (normalizedData?.navne && normalizedData.navne.length > 0) {
    // Process all name entries, skip the oldest if we already showed founding
    const nameEntries = normalizedData.stiftelsesDato ? normalizedData.navne.slice(0, -1) : normalizedData.navne;
    
    nameEntries.forEach((navnObj: any, idx: number) => {
      const startDate = parseDate(navnObj.periode?.gyldigFra);
      if (startDate) {
        const oldName = normalizedData.navne[idx + 1]?.navn;
        const title = oldName 
          ? `Selskabet skiftede navn fra "${oldName}" til "${navnObj.navn}"`
          : `Selskabets navn blev registreret som "${navnObj.navn}"`;
        
        events.push({
          id: generateId('name', startDate, eventIndex++),
          date: startDate,
          category: 'name',
          title,
          description: '',
          newValue: navnObj.navn,
          oldValue: oldName,
          severity: 'medium',
          metadata: navnObj,
        });
      }
    });
  }

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

        const newAddress = formatAddr(addr);
        const oldAddress = idx < normalizedData.beliggenhedsadresse.length - 1 ? formatAddr(normalizedData.beliggenhedsadresse[idx + 1]) : undefined;
        
        events.push({
          id: generateId('address', startDate, eventIndex++),
          date: startDate,
          category: 'address',
          title: 'Selskabets adresse blev ændret',
          description: newAddress,
          newValue: newAddress,
          oldValue: oldAddress,
          severity: 'low',
          metadata: addr,
        });
      }
    });
  }

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
          'TVANGSOPLØST': 'Tvangsopløst',
          'UNDER TVANGSOPLØSNING': 'Under tvangsopløsning',
          'UNDER KONKURS': 'Under konkurs',
          'OPLØST EFTER KONKURS': 'Opløst efter konkurs',
          'OPLØSTEFTERKONKURS': 'Opløst efter konkurs',
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

  // Extract detailed bankruptcy/liquidation status stages
  if (normalizedData?.status) {
    normalizedData.status.forEach((statusObj: any) => {
      const startDate = parseDate(statusObj.periode?.gyldigFra);
      if (startDate) {
        const statusText = statusObj.statustekst || statusObj.kreditoplysningtekst || 'Ukendt status';
        const kredText = statusObj.kreditoplysningtekst ? ` (${statusObj.kreditoplysningtekst})` : '';
        
        events.push({
          id: generateId('status-detail', startDate, eventIndex++),
          date: startDate,
          category: 'status',
          title: `Detaljeret status: ${statusText}`,
          description: `${statusText}${kredText}`,
          newValue: statusText,
          severity: statusObj.kreditoplysningkode === 3 ? 'high' : 'medium',
          metadata: statusObj,
        });
      }
    });
  }

  // Extract industry history
  if (normalizedData?.hovedbranche) {
    normalizedData.hovedbranche.forEach((branche: any, idx: number) => {
      const startDate = parseDate(branche.periode?.gyldigFra);
      if (startDate) {
        const currentIndustry = branche.branchetekst || `Branchekode: ${branche.branchekode}`;
        const oldIndustry = idx < normalizedData.hovedbranche.length - 1 
          ? (normalizedData.hovedbranche[idx + 1].branchetekst || `Branchekode: ${normalizedData.hovedbranche[idx + 1].branchekode}`)
          : null;
        
        const title = oldIndustry
          ? `Hovedbranche ændret fra ${oldIndustry} til ${currentIndustry}`
          : `Hovedbranche registreret som ${currentIndustry}`;
        
        events.push({
          id: generateId('industry', startDate, eventIndex++),
          date: startDate,
          category: 'industry',
          title,
          description: '',
          newValue: branche.branchetekst,
          oldValue: oldIndustry || undefined,
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
        const newForm = form.langbeskrivelse || form.kortbeskrivelse;
        const oldForm = idx < normalizedData.virksomhedsform.length - 1 
          ? (normalizedData.virksomhedsform[idx + 1].langbeskrivelse || 
             normalizedData.virksomhedsform[idx + 1].kortbeskrivelse)
          : null;
        
        // Skip if no valid data
        if (!newForm) return;
        
        // Natural language
        const title = oldForm 
          ? `Virksomhedsformen blev ændret fra ${oldForm} til ${newForm}`
          : `Virksomhedsform registreret som ${newForm}`;
        
        events.push({
          id: generateId('legal', startDate, eventIndex++),
          date: startDate,
          category: 'legal',
          title,
          description: '',
          newValue: newForm,
          oldValue: oldForm || undefined,
          severity: 'high',
          metadata: form,
        });
      }
    });
  }

  // Extract detailed capital history from kapitalforhold
  console.log('[TIMELINE] Checking for kapitalforhold data:', !!normalizedData?.kapitalforhold);
  if (normalizedData?.kapitalforhold && normalizedData.kapitalforhold.length > 0) {
    console.log('[TIMELINE] Kapitalforhold array length:', normalizedData.kapitalforhold.length);
    
    // Group by gyldigFra date to handle multiple payments on same date
    const groupedByDate = new Map<string, any[]>();
    normalizedData.kapitalforhold.forEach((forhold: any) => {
      const dateKey = forhold.periode?.gyldigFra;
      if (dateKey) {
        if (!groupedByDate.has(dateKey)) {
          groupedByDate.set(dateKey, []);
        }
        groupedByDate.get(dateKey)!.push(forhold);
      }
    });
    
    // Process each date group
    Array.from(groupedByDate.entries()).forEach(([dateKey, forholdList]) => {
      const startDate = parseDate(dateKey);
      if (!startDate) return;
      
      // Sort by newest first within the group
      forholdList.sort((a, b) => {
        const aDate = a.vedtaegterDato || a.beslutningsDato || dateKey;
        const bDate = b.vedtaegterDato || b.beslutningsDato || dateKey;
        return bDate.localeCompare(aDate);
      });
      
      const firstForhold = forholdList[0];
      const totalCapital = firstForhold.kapitalbeloeb;
      const currency = firstForhold.valuta || 'DKK';
      
      // Build description from all payments
      const paymentDescriptions: string[] = [];
      let isPartiallyPaid = false;
      
      forholdList.forEach((forhold: any) => {
        if (forhold.beloeb) {
          const amount = new Intl.NumberFormat('da-DK', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          }).format(forhold.beloeb);
          
          let paymentDesc = `kr. ${amount},00`;
          
          // Add payment method
          if (forhold.indbetalingstype) {
            const paymentType = forhold.indbetalingstype === 'KONTANT' ? 'indbetalt kontant' : 'indbetalt';
            paymentDesc += `, ${paymentType}`;
          }
          
          // Add exchange rate if available
          if (forhold.kurs) {
            const kurs = new Intl.NumberFormat('da-DK', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            }).format(forhold.kurs);
            paymentDesc += `, kurs ${kurs}`;
          }
          
          // Check if partially paid
          if (forhold.delvisbetalt && forhold.indbetaltBeloeb) {
            const indbetalt = new Intl.NumberFormat('da-DK', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            }).format(forhold.indbetaltBeloeb);
            paymentDesc += `, heraf samlet indbetalt kr. ${indbetalt}`;
            isPartiallyPaid = true;
          }
          
          paymentDescriptions.push(paymentDesc);
        }
      });
      
      // Format total capital
      const formattedTotal = new Intl.NumberFormat('da-DK', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(totalCapital);
      
      // Build full description
      let description = paymentDescriptions.join('. ') + '.';
      description += ` Kapitalen udgør herefter kr. ${formattedTotal},00`;
      if (isPartiallyPaid) {
        description += ', delvist indbetalt';
      }
      description += '.';
      
      // Determine title based on context
      let title = 'Kapitalforhøjelse';
      if (firstForhold.beslutningsDato) {
        const beslutningDate = parseDate(firstForhold.beslutningsDato);
        if (beslutningDate) {
          const formattedDate = format(beslutningDate, 'd. MMMM yyyy', { locale: da });
          title = `Kapitalforhøjelse besluttet den ${formattedDate}`;
        }
      }
      
      // Add metadata for extra info
      let metadataDesc = '';
      if (firstForhold.vedtaegterDato) {
        const vedtaegterDate = parseDate(firstForhold.vedtaegterDato);
        if (vedtaegterDate) {
          metadataDesc = `Vedtægter ændret: ${format(vedtaegterDate, 'd. MMMM yyyy', { locale: da })}`;
        }
      }
      
      events.push({
        id: generateId('capital', startDate, eventIndex++),
        date: startDate,
        category: 'capital',
        title,
        description: metadataDesc ? `${metadataDesc}\n\n${description}` : description,
        newValue: `kr. ${formattedTotal},00`,
        severity: 'high',
        metadata: { forholdList, totalCapital, currency },
      });
    });
  } else if (normalizedData?.kapital) {
    // Fallback to simple capital data if kapitalforhold not available
    console.log('[TIMELINE] Using fallback kapital data, length:', normalizedData.kapital.length);
    
    normalizedData.kapital.forEach((kapital: any, idx: number) => {
      const startDate = parseDate(kapital.periode?.gyldigFra);
      if (startDate) {
        const amount = new Intl.NumberFormat('da-DK', { style: 'currency', currency: kapital.valuta || 'DKK' }).format(kapital.beloeb);
        
        const prevKapital = idx < normalizedData.kapital.length - 1 
          ? normalizedData.kapital[idx + 1] 
          : null;
        const oldAmount = prevKapital ? new Intl.NumberFormat('da-DK', { 
          style: 'currency', 
          currency: prevKapital.valuta || 'DKK' 
        }).format(prevKapital.beloeb) : undefined;
        
        events.push({
          id: generateId('capital', startDate, eventIndex++),
          date: startDate,
          category: 'capital',
          title: 'Kapitalændring',
          description: `Selskabskapital: ${amount}`,
          newValue: amount,
          oldValue: oldAmount,
          severity: 'medium',
          metadata: kapital,
        });
      }
    });
  }

  // Extract annual employment data
  if (normalizedData?.aarsbeskaeftigelse) {
    normalizedData.aarsbeskaeftigelse.forEach((employment: any) => {
      if (employment.aar) {
        const date = new Date(employment.aar, 0, 1);
        
        const antalAnsatte = employment.antalAnsatte ?? employment.antalAarsvaerk ?? employment.antalInklusivEjere;
        if (antalAnsatte !== null && antalAnsatte !== undefined) {
          const beskrivelse = [
            employment.antalAarsvaerk !== null ? `Årsværk: ${employment.antalAarsvaerk}` : null,
            employment.antalAnsatte !== null ? `Ansatte: ${employment.antalAnsatte}` : null,
            employment.antalInklusivEjere !== null ? `Inkl. ejere: ${employment.antalInklusivEjere}` : null,
          ].filter(Boolean).join(', ');
          
          events.push({
            id: generateId('employment-annual', date, eventIndex++),
            date: date,
            category: 'financial',
            title: `Ansættelsesdata ${employment.aar}`,
            description: beskrivelse,
            newValue: String(antalAnsatte),
            severity: 'low',
            metadata: { employment, type: 'annual' },
          });
        }
      }
    });
  }

  // Extract quarterly employment data
  if (normalizedData?.kvartalsbeskaeftigelse) {
    normalizedData.kvartalsbeskaeftigelse.forEach((employment: any) => {
      if (employment.aar && employment.kvartal) {
        const month = (employment.kvartal - 1) * 3;
        const date = new Date(employment.aar, month, 1);
        
        const antalAnsatte = employment.antalAarsvaerk ?? employment.antalAnsatte;
        if (antalAnsatte !== null && antalAnsatte !== undefined) {
          events.push({
            id: generateId('employment-quarterly', date, eventIndex++),
            date: date,
            category: 'financial',
            title: `Ansatte Q${employment.kvartal} ${employment.aar}`,
            description: `Årsværk: ${employment.antalAarsvaerk ?? 'Ikke oplyst'}`,
            newValue: String(antalAnsatte),
            severity: 'low',
            metadata: { employment, type: 'quarterly' },
          });
        }
      }
    });
  }

  // Extract P-number (production unit) changes
  if (normalizedData?.penheder && normalizedData.penheder.length > 0) {
    normalizedData.penheder.forEach((penhed: any, idx: number) => {
      const startDate = parseDate(penhed.periode?.gyldigFra);
      const endDate = parseDate(penhed.periode?.gyldigTil);
      
      if (startDate && idx < normalizedData.penheder.length - 1) {
        events.push({
          id: generateId('pnumber', startDate, eventIndex++),
          date: startDate,
          category: 'legal',
          title: 'Produktionsenhed tilføjet',
          description: `P-nummer: ${penhed.pNummer}`,
          newValue: String(penhed.pNummer),
          severity: 'low',
          metadata: { penhed },
        });
      }
      
      if (endDate && endDate.getTime() !== startDate?.getTime()) {
        events.push({
          id: generateId('pnumber-end', endDate, eventIndex++),
          date: endDate,
          category: 'legal',
          title: 'Produktionsenhed lukket',
          description: `P-nummer: ${penhed.pNummer}`,
          oldValue: String(penhed.pNummer),
          severity: 'low',
          metadata: { penhed },
        });
      }
    });
  }

  // Extract capital changes from KAPITAL attribute with detailed comparison
  if (normalizedData?.attributter) {
    const kapitalAttr = normalizedData.attributter.find((attr: any) => attr.type === 'KAPITAL');
    
    if (kapitalAttr && kapitalAttr.vaerdier && kapitalAttr.vaerdier.length > 0) {
      // Sort values by date (oldest first for chronological comparison)
      const sortedKapital = [...kapitalAttr.vaerdier].sort((a: any, b: any) => {
        const dateA = parseDate(a.periode?.gyldigFra);
        const dateB = parseDate(b.periode?.gyldigFra);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
      
      // Get currency from KAPITALVALUTA attribute
      const valutaAttr = normalizedData.attributter.find((attr: any) => attr.type === 'KAPITALVALUTA');
      const currency = valutaAttr?.vaerdier?.[0]?.vaerdi || 'DKK';
      
      // Process each capital value
      for (let i = 0; i < sortedKapital.length; i++) {
        const current = sortedKapital[i];
        const previous = i > 0 ? sortedKapital[i - 1] : null;
        
        const startDate = parseDate(current.periode?.gyldigFra);
        if (!startDate || !current.vaerdi) continue;
        
        const currentValue = parseFloat(current.vaerdi);
        const previousValue = previous ? parseFloat(previous.vaerdi) : null;
        
        // Skip if no change
        if (previousValue !== null && currentValue === previousValue) continue;
        
        let title: string;
        let description: string;
        let severity: 'low' | 'medium' | 'high';
        
        if (previousValue === null) {
          // Initial capital
          title = 'Selskabskapital registreret';
          description = `Stiftelseskapital: ${currentValue.toLocaleString('da-DK')} ${currency}`;
          severity = 'high';
        } else if (currentValue > previousValue) {
          // Capital increase
          const increase = currentValue - previousValue;
          title = 'Kapitalforhøjelse';
          description = `Kapital forhøjet fra ${previousValue.toLocaleString('da-DK')} ${currency} til ${currentValue.toLocaleString('da-DK')} ${currency}. Forhøjelse: ${increase.toLocaleString('da-DK')} ${currency}`;
          severity = 'high';
        } else {
          // Capital decrease
          const decrease = previousValue - currentValue;
          title = 'Kapitalnedsættelse';
          description = `Kapital nedsat fra ${previousValue.toLocaleString('da-DK')} ${currency} til ${currentValue.toLocaleString('da-DK')} ${currency}. Nedsættelse: ${decrease.toLocaleString('da-DK')} ${currency}`;
          severity = 'high';
        }
        
        events.push({
          id: generateId('capital', startDate, eventIndex++),
          date: startDate,
          category: 'capital',
          title,
          description,
          oldValue: previousValue !== null ? `${previousValue.toLocaleString('da-DK')} ${currency}` : undefined,
          newValue: `${currentValue.toLocaleString('da-DK')} ${currency}`,
          severity,
          metadata: { 
            current, 
            previous,
            currentValue,
            previousValue,
            currency 
          },
        });
      }
    }
  }

  // Extract additional important attributes from attributter array
  if (normalizedData?.attributter) {
    normalizedData.attributter.forEach((attr: any) => {
      if (!attr.vaerdier || attr.vaerdier.length === 0) return;
      
      // Map attribute types to categories and labels
      const attrConfig: Record<string, { category: 'financial' | 'legal', label: string, severity: 'low' | 'medium' | 'high' }> = {
        'TEGNINGSREGEL': { category: 'legal', label: 'Tegningsregel ændret', severity: 'medium' },
        'VEDTÆGT_SENESTE': { category: 'legal', label: 'Vedtægter opdateret', severity: 'low' },
        'FØRSTE_REGNSKABSPERIODE_START': { category: 'financial', label: 'Første regnskabsperiode start', severity: 'low' },
        'FØRSTE_REGNSKABSPERIODE_SLUT': { category: 'financial', label: 'Første regnskabsperiode slut', severity: 'low' },
        'REGNSKABSÅR_START': { category: 'financial', label: 'Regnskabsår start ændret', severity: 'low' },
        'REGNSKABSÅR_SLUT': { category: 'financial', label: 'Regnskabsår slut ændret', severity: 'low' },
        'KAPITALVALUTA': { category: 'financial', label: 'Valuta ændret', severity: 'medium' },
      };
      
      const config = attrConfig[attr.type];
      if (!config) return;
      
      attr.vaerdier.forEach((vaerdi: any, idx: number) => {
        const startDate = parseDate(vaerdi.periode?.gyldigFra);
        if (startDate && vaerdi.vaerdi) {
          const oldValue = idx < attr.vaerdier.length - 1 ? attr.vaerdier[idx + 1].vaerdi : undefined;
          
          events.push({
            id: generateId(config.category, startDate, eventIndex++),
            date: startDate,
            category: config.category,
            title: config.label,
            description: vaerdi.vaerdi,
            newValue: vaerdi.vaerdi,
            oldValue: oldValue,
            severity: config.severity,
            metadata: { attr, vaerdi },
          });
        }
      });
    });
  }

  // Extract accounting form history
  if (normalizedData?.regnskabsform) {
    normalizedData.regnskabsform.forEach((form: any, idx: number) => {
      const startDate = parseDate(form.periode?.gyldigFra);
      if (startDate) {
        const formMap: Record<string, string> = {
          'KLASSE_A': 'regnskabsklasse A',
          'KLASSE_B': 'regnskabsklasse B',
          'KLASSE_C': 'regnskabsklasse C',
          'KLASSE_D': 'regnskabsklasse D',
        };
        
        const formLabel = formMap[form.regnskabsform] || form.regnskabsform;
        const oldFormLabel = idx < normalizedData.regnskabsform.length - 1 
          ? formMap[normalizedData.regnskabsform[idx + 1].regnskabsform] 
          : null;
        
        const title = oldFormLabel
          ? `Regnskabsformen blev ændret fra ${oldFormLabel} til ${formLabel}`
          : `Regnskabsform registreret som ${formLabel}`;
        
        events.push({
          id: generateId('legal', startDate, eventIndex++),
          date: startDate,
          category: 'legal',
          title,
          description: '',
          newValue: formLabel,
          oldValue: oldFormLabel || undefined,
          severity: 'low',
          metadata: form,
        });
      }
    });
  }

  // Extract production unit (produktionsenhed) changes
  if (normalizedData?.produktionsenhed) {
    normalizedData.produktionsenhed.forEach((enhed: any) => {
      const startDate = parseDate(enhed.periode?.gyldigFra);
      const endDate = parseDate(enhed.periode?.gyldigTil);
      
      if (startDate) {
        const enhedName = enhed.navn || enhed.pNummer || 'Produktionsenhed';
        const address = [
          enhed.beliggenhedsadresse?.vejnavn,
          enhed.beliggenhedsadresse?.husnummerFra,
          enhed.beliggenhedsadresse?.postnummer,
          enhed.beliggenhedsadresse?.postdistrikt
        ].filter(Boolean).join(', ');
        
        // Opening event
        events.push({
          id: generateId('legal', startDate, eventIndex++),
          date: startDate,
          category: 'legal',
          title: 'Produktionsenhed åbnet',
          description: `${enhedName}${address ? ': ' + address : ''}`,
          newValue: enhedName,
          severity: 'medium',
          metadata: enhed,
        });
        
        // Closing event (if closed)
        if (endDate) {
          events.push({
            id: generateId('legal', endDate, eventIndex++),
            date: endDate,
            category: 'legal',
            title: 'Produktionsenhed lukket',
            description: `${enhedName}${address ? ': ' + address : ''}`,
            oldValue: enhedName,
            severity: 'medium',
            metadata: enhed,
          });
        }
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

  // Extract email history
  if (normalizedData?.elektroniskPost) {
    normalizedData.elektroniskPost.forEach((email: any) => {
      const startDate = parseDate(email.periode?.gyldigFra);
      if (startDate) {
        events.push({
          id: generateId('contact', startDate, eventIndex++),
          date: startDate,
          category: 'contact',
          title: email.periode?.gyldigTil ? 'Email fjernet' : 'Email tilføjet',
          description: email.kontaktoplysning,
          newValue: email.kontaktoplysning,
          severity: 'low',
          metadata: email,
        });
      }
    });
  }

  // Extract phone history
  if (normalizedData?.telefonNummer) {
    normalizedData.telefonNummer.forEach((phone: any) => {
      const startDate = parseDate(phone.periode?.gyldigFra);
      if (startDate) {
        events.push({
          id: generateId('contact', startDate, eventIndex++),
          date: startDate,
          category: 'contact',
          title: phone.periode?.gyldigTil ? 'Telefon fjernet' : 'Telefon tilføjet',
          description: phone.kontaktoplysning,
          newValue: phone.kontaktoplysning,
          severity: 'low',
          metadata: phone,
        });
      }
    });
  }

  // Extract website history
  if (normalizedData?.hjemmeside) {
    normalizedData.hjemmeside.forEach((website: any) => {
      const startDate = parseDate(website.periode?.gyldigFra);
      if (startDate) {
        events.push({
          id: generateId('contact', startDate, eventIndex++),
          date: startDate,
          category: 'contact',
          title: website.periode?.gyldigTil ? 'Hjemmeside fjernet' : 'Hjemmeside tilføjet',
          description: website.kontaktoplysning,
          newValue: website.kontaktoplysning,
          severity: 'low',
          metadata: website,
        });
      }
    });
  }

  // Extract secondary industry history
  ['bibranche1', 'bibranche2', 'bibranche3'].forEach((branchField) => {
    if (normalizedData?.[branchField]) {
      normalizedData[branchField].forEach((branche: any) => {
        const startDate = parseDate(branche.periode?.gyldigFra);
        if (startDate) {
          events.push({
            id: generateId('industry', startDate, eventIndex++),
            date: startDate,
            category: 'industry',
            title: branche.periode?.gyldigTil ? 'Bibranche fjernet' : 'Bibranche tilføjet',
            description: branche.branchetekst || `Branchekode: ${branche.branchekode}`,
            newValue: branche.branchetekst,
            severity: 'low',
            metadata: branche,
          });
        }
      });
    }
  });

  // Extract reklamebeskyttelse history
  if (normalizedData?.reklamebeskyttelse) {
    normalizedData.reklamebeskyttelse.forEach((reklame: any) => {
      const startDate = parseDate(reklame.periode?.gyldigFra);
      if (startDate) {
        events.push({
          id: generateId('legal', startDate, eventIndex++),
          date: startDate,
          category: 'legal',
          title: reklame.reklamebeskyttet ? 'Reklamebeskyttelse aktiveret' : 'Reklamebeskyttelse deaktiveret',
          description: reklame.reklamebeskyttet ? 'Virksomheden er nu beskyttet mod reklamehenvendelser' : 'Reklamebeskyttelse fjernet',
          severity: 'low',
          metadata: reklame,
        });
      }
    });
  }

  // Extract auditor (revisor) changes from deltagerRelation
  if (normalizedData?.deltagerRelation) {
    normalizedData.deltagerRelation.forEach((relation: any) => {
      const deltager = relation.deltager;
      
      // Find REVISION organizations
      deltager?.organisationer?.forEach((org: any) => {
        if (org.hovedtype === 'REVISION') {
          const revisorName = deltager.navne?.[0]?.navn || 'Ukendt revisor';
          
          org.medlemsData?.forEach((medlem: any) => {
            medlem.attributter?.forEach((attr: any) => {
              if (attr.type === 'FUNKTION') {
                attr.vaerdier?.forEach((vaerdi: any) => {
                  const startDate = parseDate(vaerdi.periode?.gyldigFra);
                  const endDate = parseDate(vaerdi.periode?.gyldigTil);
                  
                  if (startDate) {
                    events.push({
                      id: generateId('auditor', startDate, eventIndex++),
                      date: startDate,
                      category: 'financial',
                      title: `Ny revisor tilknyttet: ${revisorName}`,
                      description: `Revisionsvirksomhed: ${revisorName}`,
                      newValue: revisorName,
                      severity: 'medium',
                      metadata: { deltager, org, medlem },
                    });
                  }
                  
                  if (endDate && endDate.getTime() !== startDate?.getTime()) {
                    events.push({
                      id: generateId('auditor-end', endDate, eventIndex++),
                      date: endDate,
                      category: 'financial',
                      title: `Revisor fratrådt: ${revisorName}`,
                      description: `Revisionsvirksomhed forlod selskabet`,
                      oldValue: revisorName,
                      severity: 'medium',
                      metadata: { deltager, org, medlem },
                    });
                  }
                });
              }
            });
          });
        }
      });
    });
  }

  // Extract management, board, and ownership from deltagerRelation
  if (normalizedData?.deltagerRelation) {
    normalizedData.deltagerRelation.forEach((relation: any) => {
      const personName = relation.deltager?.navne?.[0]?.navn || 'Ukendt person';
      
      relation.organisationer?.forEach((org: any) => {
        if (org.medlemsData) {
          org.medlemsData.forEach((medlem: any) => {
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

            // Extract FUNKTION (role) changes - each vaerdi is a separate event
            const funktionAttr = medlem.attributter?.find((a: any) => a.type === 'FUNKTION');
            if (funktionAttr?.vaerdier) {
              funktionAttr.vaerdier.forEach((vaerdi: any, index: number) => {
                const startDate = parseDate(vaerdi.periode?.gyldigFra);
                const endDate = parseDate(vaerdi.periode?.gyldigTil);
                
                if (startDate) {
                  const roleTitle = vaerdi.vaerdi || 'Rolle';
                  
                  // Role start event
                  events.push({
                    id: generateId(category, startDate, eventIndex++),
                    date: startDate,
                    category,
                    title: `${personName} indtrådte som ${roleTitle.toLowerCase()} i selskabet`,
                    description: '',
                    newValue: personName,
                    severity,
                    metadata: { relation, org, medlem, vaerdi, type: 'role_start' },
                  });
                  
                  // Role end event (if ended)
                  if (endDate) {
                    events.push({
                      id: generateId(category, endDate, eventIndex++),
                      date: endDate,
                      category,
                      title: `${personName} udtrådte som ${roleTitle.toLowerCase()} i selskabet`,
                      description: '',
                      oldValue: personName,
                      severity: 'medium',
                      metadata: { relation, org, medlem, vaerdi, type: 'role_end' },
                    });
                  }
                }
              });
            }
            
            // Extract EJERANDEL_PROCENT (ownership percentage) changes
            if (category === 'ownership') {
              const ejerandelAttr = medlem.attributter?.find((a: any) => 
                a.type === 'EJERANDEL_PROCENT' || a.type === 'EJERANDEL_STEMME_PROCENT'
              );
              
              if (ejerandelAttr?.vaerdier) {
                ejerandelAttr.vaerdier.forEach((vaerdi: any, index: number) => {
                  const startDate = parseDate(vaerdi.periode?.gyldigFra);
                  
                  if (startDate && vaerdi.vaerdi) {
                    // Multiply by 100 to get actual percentage (0.3333 → 33.33)
                    const actualPercentage = parseFloat(vaerdi.vaerdi) * 100;
                    const prevActualPercentage = index < ejerandelAttr.vaerdier.length - 1 
                      ? parseFloat(ejerandelAttr.vaerdier[index + 1].vaerdi) * 100 
                      : null;
                    
                    // Round for display
                    const displayPercent = Math.round(actualPercentage * 10) / 10;
                    const prevDisplayPercent = prevActualPercentage ? Math.round(prevActualPercentage * 10) / 10 : null;
                    
                    // Skip if no change
                    if (prevDisplayPercent !== null && displayPercent === prevDisplayPercent) {
                      return;
                    }
                    
                    // Natural language based on change type
                    let title: string;
                    
                    if (!prevDisplayPercent) {
                      // First time ownership registered
                      title = `${personName} registreret som ejer med ca. ${displayPercent}% af stemmerne`;
                    } else if (displayPercent > prevDisplayPercent) {
                      // Ownership increased
                      title = `${personName} forøgede sin andel af stemmerne i selskabet fra ca. ${prevDisplayPercent}% til ca. ${displayPercent}%`;
                    } else {
                      // Ownership decreased
                      title = `${personName} reducerede sin andel af stemmerne i selskabet fra ca. ${prevDisplayPercent}% til ca. ${displayPercent}%`;
                    }
                    
                    events.push({
                      id: generateId('ownership', startDate, eventIndex++),
                      date: startDate,
                      category: 'ownership',
                      title,
                      description: '',
                      newValue: `${displayPercent}%`,
                      oldValue: prevDisplayPercent ? `${prevDisplayPercent}%` : undefined,
                      severity: 'medium',
                      metadata: { relation, org, medlem, vaerdi, type: 'ownership_change' },
                    });
                  }
                });
              }
            }
            
            // VALGFORM events are skipped - they are administrative noise and low value

            // Helper function to format attribute values
            const formatAttributeValue = (attrType: string, value: string): string => {
              // Format dates
              if (attrType.includes('DATO') || attrType === 'VALGDATO' || attrType === 'STARTDATO' || attrType === 'SLUTTDATO') {
                try {
                  const date = new Date(value);
                  return format(date, 'd. MMMM yyyy', { locale: da });
                } catch {
                  return value;
                }
              }

              // Format percentages (if not already processed)
              if (attrType.includes('PROCENT')) {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                  return `${num}%`;
                }
              }

              // Format numbers with thousands separators
              if (attrType.includes('ANTAL') || attrType.includes('VAERDI')) {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                  return new Intl.NumberFormat('da-DK').format(num);
                }
              }

              return value;
            };

            // Extract ALL other attribute changes (STILLING, TITEL, etc.)
            medlem.attributter?.forEach((attr: any) => {
              if (!attr.vaerdier || attr.vaerdier.length === 0) return;
              
              // Skip already processed attributes
              if (['FUNKTION', 'EJERANDEL_PROCENT', 'EJERANDEL_STEMME_PROCENT', 'VALGFORM'].includes(attr.type)) {
                return;
              }
              
              // Attributes to completely skip (administrative metadata)
              const skipAttributes = [
                'EJERANDEL_MEDDELELSE_DATO',
                'SIDST_OPDATERET',
                'OPRETTET_DATO',
              ];

              if (skipAttributes.includes(attr.type)) {
                return;
              }
              
              // Process other attribute types
              const attrLabels: Record<string, string> = {
                // Management/Board attributes
                'STILLING': 'Stilling',
                'TITEL': 'Titel',
                'VALGDATO': 'Valgdato',
                'AFSAETTELSEGRUND': 'Afsættelsesgrund',
                
                // Ownership attributes
                'EJERANDEL_STEMMERET_PROCENT': 'Stemmeandel',
                'EJERANDEL_KAPITAL_KLASSE': 'Kapitalklasse',
                'EJERANDEL_VEDERLAGS_FORM': 'Vederlagsform',
                'EJERANDEL_ANTAL_ANPARTER': 'Antal anparter',
                'EJERANDEL_ANTAL_AKTIER': 'Antal aktier',
                'EJERANDEL_PAALYDENDE_VAERDI': 'Pålydende værdi',
                
                // Other attributes
                'STARTDATO': 'Startdato',
                'SLUTTDATO': 'Slutdato',
              };
              
              // Only show if we have a label mapping (skip unknown attributes)
              if (!attrLabels[attr.type]) {
                console.log(`[TIMELINE] Skipping unknown attribute: ${attr.type}`);
                return;
              }
              
              const label = attrLabels[attr.type];
              
              attr.vaerdier.forEach((vaerdi: any, index: number) => {
                const startDate = parseDate(vaerdi.periode?.gyldigFra);
                if (startDate && vaerdi.vaerdi) {
                  const prevValue = index < attr.vaerdier.length - 1
                    ? attr.vaerdier[index + 1].vaerdi
                    : null;

                  const formattedNewValue = formatAttributeValue(attr.type, vaerdi.vaerdi);
                  const formattedOldValue = prevValue ? formatAttributeValue(attr.type, prevValue) : null;

                  events.push({
                    id: generateId(category, startDate, eventIndex++),
                    date: startDate,
                    category,
                    title: `${personName} - ${label}`,
                    description: formattedOldValue 
                      ? `${formattedOldValue} → ${formattedNewValue}`
                      : formattedNewValue,
                    newValue: formattedNewValue,
                    oldValue: formattedOldValue || undefined,
                    severity: 'low',
                    metadata: { relation, org, medlem, vaerdi, type: 'attribute_change', attrType: attr.type },
                  });
                }
              });
            });
          });
        }
      });
    });
  }

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
