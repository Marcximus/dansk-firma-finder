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
        events.push({
          id: generateId('name', startDate, eventIndex++),
          date: startDate,
          category: 'name',
          title: 'Navneændring',
          description: navnObj.navn,
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
        const newForm = form.langbeskrivelse || form.kortbeskrivelse;
        const oldForm = idx < normalizedData.virksomhedsform.length - 1 
          ? (normalizedData.virksomhedsform[idx + 1].langbeskrivelse || 
             normalizedData.virksomhedsform[idx + 1].kortbeskrivelse)
          : undefined;
        
        events.push({
          id: generateId('legal', startDate, eventIndex++),
          date: startDate,
          category: 'legal',
          title: 'Ændring af virksomhedsform',
          description: newForm,
          newValue: newForm,
          oldValue: oldForm,
          severity: 'high',
          metadata: form,
        });
      }
    });
  }

  // Extract capital history
  console.log('[TIMELINE] Checking for capital data:', !!normalizedData?.kapital);
  if (normalizedData?.kapital) {
    console.log('[TIMELINE] Capital array length:', normalizedData.kapital.length);
    if (normalizedData.kapital[0]) {
      console.log('[TIMELINE] Capital data sample:', normalizedData.kapital[0]);
    }
    
    normalizedData.kapital.forEach((kapital: any, idx: number) => {
      const startDate = parseDate(kapital.periode?.gyldigFra);
      if (startDate) {
        const amount = new Intl.NumberFormat('da-DK', { style: 'currency', currency: kapital.valuta || 'DKK' }).format(kapital.beloeb);
        
        // Get previous value for comparison
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

  // Extract accounting form history
  if (normalizedData?.regnskabsform) {
    normalizedData.regnskabsform.forEach((form: any, idx: number) => {
      const startDate = parseDate(form.periode?.gyldigFra);
      if (startDate) {
        const formMap: Record<string, string> = {
          'KLASSE_A': 'Årsregnskabsklasse A',
          'KLASSE_B': 'Årsregnskabsklasse B',
          'KLASSE_C': 'Årsregnskabsklasse C',
          'KLASSE_D': 'Årsregnskabsklasse D',
        };
        
        const formLabel = formMap[form.regnskabsform] || form.regnskabsform;
        const oldForm = idx < normalizedData.regnskabsform.length - 1 
          ? formMap[normalizedData.regnskabsform[idx + 1].regnskabsform] 
          : undefined;
        
        events.push({
          id: generateId('legal', startDate, eventIndex++),
          date: startDate,
          category: 'legal',
          title: 'Ændring af regnskabsform',
          description: formLabel,
          newValue: formLabel,
          oldValue: oldForm,
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
                    title: `${personName} indtrådte som ${roleTitle}`,
                    description: `${roleTitle}`,
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
                      title: `${personName} udtrådte som ${roleTitle}`,
                      description: `${roleTitle}`,
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
                    const percentage = parseFloat(vaerdi.vaerdi);
                    const attrLabel = ejerandelAttr.type === 'EJERANDEL_STEMME_PROCENT' 
                      ? 'Stemmeandel' 
                      : 'Ejerandel';
                    
                    // Get previous value for comparison
                    const prevValue = index < ejerandelAttr.vaerdier.length - 1 
                      ? parseFloat(ejerandelAttr.vaerdier[index + 1].vaerdi) 
                      : null;
                    
                    events.push({
                      id: generateId('ownership', startDate, eventIndex++),
                      date: startDate,
                      category: 'ownership',
                      title: `${personName} - ${attrLabel} ændret`,
                      description: `${attrLabel}: ${percentage}%`,
                      newValue: `${percentage}%`,
                      oldValue: prevValue ? `${prevValue}%` : undefined,
                      severity: 'medium',
                      metadata: { relation, org, medlem, vaerdi, type: 'ownership_change' },
                    });
                  }
                });
              }
            }
            
            // Extract VALGFORM (election form) changes
            const valgformAttr = medlem.attributter?.find((a: any) => a.type === 'VALGFORM');
            if (valgformAttr?.vaerdier) {
              valgformAttr.vaerdier.forEach((vaerdi: any, index: number) => {
                const startDate = parseDate(vaerdi.periode?.gyldigFra);
                
                if (startDate && vaerdi.vaerdi) {
                  const prevValue = index < valgformAttr.vaerdier.length - 1 
                    ? valgformAttr.vaerdier[index + 1].vaerdi 
                    : null;
                  
                  events.push({
                    id: generateId(category, startDate, eventIndex++),
                    date: startDate,
                    category,
                    title: `${personName} - Valgform ændret`,
                    description: `Valgform: ${vaerdi.vaerdi}`,
                    newValue: vaerdi.vaerdi,
                    oldValue: prevValue || undefined,
                    severity: 'low',
                    metadata: { relation, org, medlem, vaerdi, type: 'valgform_change' },
                  });
                }
              });
            }

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
