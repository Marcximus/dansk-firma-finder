
// CVR number search query builder
export const buildCvrQuery = (cvr: string) => {
  return {
    "_source": [
      "Vrvirksomhed.cvrNummer",
      "Vrvirksomhed.navne",
      "Vrvirksomhed.beliggenhedsadresse",
      "Vrvirksomhed.hovedbranche",
      "Vrvirksomhed.virksomhedsform",
      "Vrvirksomhed.virksomhedsstatus",
      "Vrvirksomhed.deltagerRelation",
      "Vrvirksomhed.virksomhedsRelation",
      "Vrvirksomhed.attributter",
      "Vrvirksomhed.livsforloeb",
      "Vrvirksomhed.telefonNummer",
      "Vrvirksomhed.elektroniskPost",
      "Vrvirksomhed.hjemmeside",
      "Vrvirksomhed.maanedsbeskaeftigelse",
      "Vrvirksomhed.erstMaanedsbeskaeftigelse",
      "Vrvirksomhed.aarsbeskaeftigelse",
      "Vrvirksomhed.kvartalsbeskaeftigelse",
      "Vrvirksomhed.kapitalforhold"
    ],
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "Vrvirksomhed.cvrNummer": parseInt(cvr)
            }
          }
        ]
      }
    }
  };
};
