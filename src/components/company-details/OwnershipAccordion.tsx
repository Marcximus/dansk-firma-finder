
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { extractOwnershipData } from '@/services/cvrUtils';
import { Building2, MapPin, Calendar, Percent, Users, Network, User, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateCompanyUrl, generatePersonUrl } from '@/lib/urlUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import OwnershipChart from './OwnershipChart';

interface OwnershipAccordionProps {
  cvrData: any;
  subsidiaries: any[];
}

const OwnershipAccordion: React.FC<OwnershipAccordionProps> = ({ 
  cvrData, 
  subsidiaries
}) => {
  const navigate = useNavigate();
  const ownershipData = extractOwnershipData(cvrData);
  console.log('OwnershipAccordion - Extracted Data:', ownershipData);

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
          {/* Legale ejere with chart */}
          <div className="mb-4 sm:mb-6">
            <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Legale ejere
            </h4>
            
            {/* Grid layout: list on left, chart on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Owner list */}
              <div className="space-y-2 sm:space-y-3">
                {ownershipData?.currentOwners && ownershipData.currentOwners.length > 0 ? (
                  ownershipData.currentOwners.map((ejer: any, index: number) => {
                    const isPerson = ejer.type === 'PERSON';
                    const isCompany = ejer.type === 'VIRKSOMHED';
                    const isListed = ejer.type === 'LISTED' || ejer._isListedCompany;
                    const borderColor = isPerson ? 'border-teal-200' : isListed ? 'border-blue-200' : 'border-purple-200';
                    
                    return (
                      <div key={index} className={`border-l-2 sm:border-l-4 ${borderColor} pl-3 sm:pl-4 py-2`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          {isListed ? (
                            <div className="font-semibold text-sm sm:text-base flex items-center gap-1.5">
                              <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              {ejer.navn}
                            </div>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      if (!ejer.navn || !ejer.type) {
                                        console.warn('[OwnershipAccordion] Invalid owner data:', ejer);
                                        return;
                                      }
                                      
                                      if (isPerson) {
                                        const url = generatePersonUrl(ejer.navn, ejer.identifier);
                                        navigate(url);
                                      } else if (isCompany && ejer.identifier) {
                                        const url = generateCompanyUrl(ejer.navn, ejer.identifier);
                                        navigate(url);
                                      }
                                    }}
                                    className="font-semibold text-sm sm:text-base hover:text-primary underline decoration-dotted underline-offset-2 text-left flex items-center gap-1.5"
                                    disabled={!isPerson && !isCompany}
                                  >
                                    {isPerson ? (
                                      <User className="h-4 w-4 text-teal-600 flex-shrink-0" />
                                    ) : isCompany ? (
                                      <Building2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                    ) : null}
                                    {ejer.navn}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {isPerson && 'Se personens tilknytninger'}
                                    {isCompany && 'Se virksomhedsoplysninger'}
                                    {!isPerson && !isCompany && 'Ingen detaljer tilgængelige'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {isPerson && (
                            <Badge variant="outline" className="text-xs">
                              Person
                            </Badge>
                          )}
                          {isCompany && ejer.cvr && (
                            <Badge variant="outline" className="text-xs">
                              CVR: {ejer.cvr}
                            </Badge>
                          )}
                        </div>
                        {!isListed && ejer.adresse && (
                          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mb-1 break-words mt-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{ejer.adresse}</span>
                          </div>
                        )}
                        {isListed && (
                          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Ejerskabet er fordelt blandt offentlige aktionærer
                          </div>
                        )}
                        {!isListed && (
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
                            {ejer.periode && ejer.periode.gyldigFra && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="break-words">Periode: {ejer.periode.gyldigFra || 'Ukendt'} - {ejer.periode.gyldigTil || 'Nuværende'}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted-foreground text-xs sm:text-sm border-l-2 sm:border-l-4 border-gray-200 pl-3 sm:pl-4 py-2">
                    Ingen oplysninger tilgængelige
                  </div>
                )}
              </div>
              
              {/* Ownership chart */}
              {ownershipData?.currentOwners && ownershipData.currentOwners.length > 0 && (
                <div className="flex items-center justify-center">
                  <OwnershipChart owners={ownershipData.currentOwners} />
                </div>
              )}
            </div>
          </div>
          
          {/* Datterselskaber */}
          <div className="mb-4 sm:mb-6">
            <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-600" />
              Datterselskaber
            </h4>
            <div className="space-y-2 sm:space-y-3">
              {subsidiaries && subsidiaries.length > 0 ? (
                subsidiaries.map((subsidiary: any, index: number) => (
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
                            className="font-semibold text-sm sm:text-base hover:text-primary underline decoration-dotted underline-offset-2 text-left flex items-center gap-1.5"
                            disabled={!subsidiary.cvr}
                          >
                            <Building2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
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
                        <Badge variant="outline" className="text-xs">
                          CVR: {subsidiary.cvr}
                        </Badge>
                      </div>
                    )}
                    {subsidiary.adresse && (
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mb-1 break-words">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="break-words">{subsidiary.adresse}</span>
                      </div>
                    )}
                    {subsidiary.status && (
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Status: {subsidiary.status}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm space-y-0.5">
                      {subsidiary.ejerandel && subsidiary.ejerandel !== 'Ikke oplyst' && (
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 flex-shrink-0" />
                          <span>Ejerandel: <span className="font-medium">{subsidiary.ejerandel}</span></span>
                        </div>
                      )}
                    </div>
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
