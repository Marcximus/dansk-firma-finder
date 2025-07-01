
// Helper functions for extracting signing rules and management data
export const extractSigningRulesData = (cvrData: any) => {
  console.log('extractSigningRulesData - Input data:', cvrData);
  
  if (!cvrData?.Vrvirksomhed) {
    console.log('extractSigningRulesData - No Vrvirksomhed data found');
    return null;
  }
  
  const vrvirksomhed = cvrData.Vrvirksomhed;
  const relations = vrvirksomhed.deltagerRelation || [];
  console.log('extractSigningRulesData - Processing relations:', relations);

  const getSigningRules = () => {
    const tegningsregler = vrvirksomhed.tegningsregler || [];
    let signingRules = tegningsregler.map((regel: any) => regel.regel || regel.beskrivelse || regel.tekst).filter(Boolean);
    
    const attributter = vrvirksomhed.attributter || [];
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
    
    console.log('Signing rules extraction:', signingRules);
    return signingRules;
  };

  const result = {
    signingRules: getSigningRules(),
    management: relations.filter((relation: any) => 
      relation.organisationer?.some((org: any) => org.hovedtype === 'DIREKTION')
    ),
    board: relations.filter((relation: any) => 
      relation.organisationer?.some((org: any) => org.hovedtype === 'BESTYRELSE')
    ),
    auditors: relations.filter((relation: any) => 
      relation.organisationer?.some((org: any) => org.hovedtype === 'REVISION')
    )
  };

  console.log('extractSigningRulesData - Final result:', result);
  return result;
};
