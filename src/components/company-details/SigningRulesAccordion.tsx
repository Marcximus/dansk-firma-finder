
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Crown, Shield, UserCheck, FileText } from 'lucide-react';

interface SigningRulesAccordionProps {
  cvrData: any;
}

const SigningRulesAccordion: React.FC<SigningRulesAccordionProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  const relations = cvrData.deltagerRelation || [];

  const getPersonName = (deltager: any) => {
    if (!deltager) return 'Ukendt';
    const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
    return currentName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
  };

  const getPersonAddress = (deltager: any) => {
    if (!deltager) return 'Adresse ikke tilgængelig';
    
    const currentAddress = deltager.adresser?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                          deltager.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
    
    const addr = currentAddress || 
                deltager.adresser?.[deltager.adresser.length - 1] ||
                deltager.beliggenhedsadresse?.[deltager.beliggenhedsadresse.length - 1];
    
    if (!addr) return 'Adresse ikke tilgængelig';
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage}. sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return streetAddress && postalInfo ? `${streetAddress}, ${postalInfo}` : 'Adresse ikke tilgængelig';
  };

  const getRoleIcon = (hovedtype: string) => {
    switch (hovedtype) {
      case 'DIREKTION':
        return <Crown className="h-4 w-4 text-amber-600" />;
      case 'BESTYRELSE':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'REVISION':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleDisplayName = (hovedtype: string, memberData?: any) => {
    let baseName = hovedtype;
    
    switch (hovedtype) {
      case 'DIREKTION':
        baseName = 'Direktion';
        break;
      case 'BESTYRELSE':
        baseName = 'Bestyrelse';
        break;
      case 'REVISION':
        baseName = 'Revisor';
        break;
      default:
        baseName = hovedtype.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    if (memberData && memberData.attributter) {
      const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
      if (funkAttribute && funkAttribute.vaerdier && funkAttribute.vaerdier.length > 0) {
        const specificRole = funkAttribute.vaerdier[0].vaerdi;
        if (specificRole !== hovedtype) {
          return `${baseName} - ${specificRole}`;
        }
      }
    }

    return baseName;
  };

  const formatPeriod = (periode: any) => {
    if (!periode) return 'Ukendt periode';
    const from = periode.gyldigFra || 'Ukendt';
    const to = periode.gyldigTil || 'Nuværende';
    return `${from} - ${to}`;
  };

  const getSigningRules = () => {
    // Look for signing rules in various places in the CVR data
    const tegningsregler = cvrData.tegningsregler || [];
    const aktiekapital = cvrData.aktiekapital || [];
    const kapitalforhold = cvrData.kapitalforhold || [];
    
    // Extract signing rules from different sources
    let signingRules = [];
    
    if (tegningsregler.length > 0) {
      signingRules = tegningsregler.map((regel: any) => regel.regel || regel.beskrivelse || regel.tekst);
    }
    
    // Check for signing rules in company attributes
    const attributter = cvrData.attributter || [];
    const signingAttributes = attributter.filter((attr: any) => 
      attr.type === 'TEGNINGSREGEL' || attr.type === 'BINDING_RULE'
    );
    
    signingAttributes.forEach((attr: any) => {
      if (attr.vaerdier) {
        attr.vaerdier.forEach((value: any) => {
          if (value.vaerdi) {
            signingRules.push(value.vaerdi);
          }
        });
      }
    });
    
    return signingRules.filter(Boolean);
  };

  const signingRules = getSigningRules();

  // Separate by role types
  const management = relations.filter((relation: any) => 
    relation.organisationer?.some((org: any) => org.hovedtype === 'DIREKTION')
  );
  
  const board = relations.filter((relation: any) => 
    relation.organisationer?.some((org: any) => org.hovedtype === 'BESTYRELSE')
  );
  
  const auditors = relations.filter((relation: any) => 
    relation.organisationer?.some((org: any) => org.hovedtype === 'REVISION')
  );

  const renderPersons = (persons: any[], title: string, icon: JSX.Element) => {
    if (persons.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <div className="space-y-3">
          {persons.map((relation: any, index: number) => {
            const personName = getPersonName(relation.deltager);
            const personAddress = getPersonAddress(relation.deltager);

            return (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="font-semibold text-base">{personName}</div>
                <div className="text-sm text-muted-foreground mb-2">{personAddress}</div>
                
                {relation.organisationer && relation.organisationer.map((org: any, orgIndex: number) => (
                  <div key={orgIndex} className="text-sm">
                    <div className="font-medium">
                      {getRoleDisplayName(org.hovedtype, org.medlemsData?.[0])}
                    </div>
                    {org.medlemsData && org.medlemsData.map((medlem: any, medlemIndex: number) => (
                      <div key={medlemIndex} className="text-xs text-muted-foreground mt-1">
                        {medlem.periode && (
                          <div>Periode: {formatPeriod(medlem.periode)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AccordionItem value="signing-rules" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="text-lg font-semibold">Tegningsregel og personkreds</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {signingRules.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tegningsregel
              </h4>
              <div className="space-y-2">
                {signingRules.map((rule: string, index: number) => (
                  <div key={index} className="border-l-4 border-green-200 pl-4 py-2">
                    <div className="font-medium text-sm">{rule}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderPersons(management, 'Direktion', <Crown className="h-4 w-4 text-amber-600" />)}
          {renderPersons(board, 'Bestyrelse', <Shield className="h-4 w-4 text-blue-600" />)}
          {renderPersons(auditors, 'Revisor', <UserCheck className="h-4 w-4 text-green-600" />)}

          {management.length === 0 && board.length === 0 && auditors.length === 0 && signingRules.length === 0 && (
            <div className="text-muted-foreground">Ingen oplysninger om tegningsregler og personkreds tilgængelige</div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SigningRulesAccordion;
