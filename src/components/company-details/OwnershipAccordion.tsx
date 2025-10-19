
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { extractOwnershipData } from '@/services/cvrUtils';
import { Building2, MapPin, Calendar, Percent, Users, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateCompanyUrl } from '@/lib/urlUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OwnershipAccordionProps {
  cvrData: any;
}

const OwnershipAccordion: React.FC<OwnershipAccordionProps> = ({ cvrData }) => {
  console.log('OwnershipAccordion - Raw CVR Data:', cvrData);
  
  const navigate = useNavigate();
  const ownershipData = extractOwnershipData(cvrData);
  console.log('OwnershipAccordion - Extracted Data:', ownershipData);

  const renderOwners = (owners: any[], title: string, icon: JSX.Element, isFormer: boolean = false) => {
    return (
      <div className="mb-4 sm:mb-6">
        <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <div className="space-y-2 sm:space-y-3">
          {owners && owners.length > 0 ? (
            owners.map((ejer: any, index: number) => (
              <div key={index} className={`border-l-2 sm:border-l-4 ${isFormer ? 'border-red-200' : 'border-green-200'} pl-3 sm:pl-4 py-2`}>
                <div className="font-semibold text-sm sm:text-base">{ejer.navn}</div>
                <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mb-1 break-words">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="break-words">{ejer.adresse}</span>
                </div>
                <div className="text-xs sm:text-sm space-y-0.5">
                  {ejer.ejerandel && ejer.ejerandel !== 'Ikke oplyst' && (
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3 flex-shrink-0" />
                      <span>Ejerandel: <span className="font-medium">{ejer.ejerandel}</span></span>
                    </div>
                  )}
                  {ejer.stemmerettigheder && ejer.stemmerettigheder !== 'Ikke oplyst' && (
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3 flex-shrink-0" />
                      <span>Stemmerettigheder: <span className="font-medium">{ejer.stemmerettigheder}</span></span>
                    </div>
                  )}
                  {ejer.periode && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">Periode: {ejer.periode.gyldigFra || 'Ukendt'} - {ejer.periode.gyldigTil || 'Nuværende'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-xs sm:text-sm border-l-2 sm:border-l-4 border-gray-200 pl-3 sm:pl-4 py-2">
              Ingen oplysninger tilgængelige
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AccordionItem value="ownership" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Building2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Ejerforhold & Datterselskaber</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-2 sm:space-y-4 md:space-y-6">
          {/* Legale ejere */}
          {renderOwners(ownershipData?.currentOwners || [], 'Legale ejere', <Users className="h-4 w-4 text-green-600" />)}
          
          {/* Datterselskaber */}
          <div className="mb-4 sm:mb-6">
            <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-600" />
              Datterselskaber
            </h4>
            <div className="space-y-2 sm:space-y-3">
              {ownershipData?.subsidiaries && ownershipData.subsidiaries.length > 0 ? (
                ownershipData.subsidiaries.map((subsidiary: any, index: number) => (
                  <div key={index} className="border-l-2 sm:border-l-4 border-purple-200 pl-3 sm:pl-4 py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              if (subsidiary.cvr && subsidiary.navn) {
                                const url = generateCompanyUrl(subsidiary.navn, subsidiary.cvr.toString());
                                navigate(url);
                              }
                            }}
                            className="font-semibold text-sm sm:text-base hover:text-primary underline decoration-dotted underline-offset-2 text-left"
                            disabled={!subsidiary.cvr}
                          >
                            {subsidiary.navn}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Se virksomhedsoplysninger for dette datterselskab</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {subsidiary.cvr && (
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                        CVR: {subsidiary.cvr}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mb-1 break-words">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{subsidiary.adresse}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">{subsidiary.relationtype}</span>
                    </div>
                    {subsidiary.periode && (
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>Periode: {subsidiary.periode.gyldigFra || 'Ukendt'} - {subsidiary.periode.gyldigTil || 'Nuværende'}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs sm:text-sm border-l-2 sm:border-l-4 border-gray-200 pl-3 sm:pl-4 py-2">
                  Ingen datterselskaber registreret
                </div>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default OwnershipAccordion;
