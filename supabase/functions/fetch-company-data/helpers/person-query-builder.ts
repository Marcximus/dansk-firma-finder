
// Person name search query builder - searches for a person's active relations
export const buildPersonQuery = (personName: string) => {
  const today = new Date().toISOString().split('T')[0];
  
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
      "Vrvirksomhed.kvartalsbeskaeftigelse"
    ],
    "query": {
      "nested": {
        "path": "Vrvirksomhed.deltagerRelation",
        "query": {
          "bool": {
            "must": [
              {
                "nested": {
                  "path": "Vrvirksomhed.deltagerRelation.deltager",
                  "query": {
                    "nested": {
                      "path": "Vrvirksomhed.deltagerRelation.deltager.navne",
                      "query": {
                        "bool": {
                          "should": [
                            {
                              "match_phrase": {
                                "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                  "query": personName,
                                  "boost": 10
                                }
                              }
                            },
                            {
                              "match": {
                                "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                  "query": personName,
                                  "operator": "and",
                                  "boost": 5
                                }
                              }
                            }
                          ],
                          "minimum_should_match": 1
                        }
                      }
                    }
                  }
                }
              },
              {
                "nested": {
                  "path": "Vrvirksomhed.deltagerRelation.organisationer",
                  "query": {
                    "nested": {
                      "path": "Vrvirksomhed.deltagerRelation.organisationer.medlemsData",
                      "query": {
                        "bool": {
                          "should": [
                            {
                              "bool": {
                                "must_not": {
                                  "exists": {
                                    "field": "Vrvirksomhed.deltagerRelation.organisationer.medlemsData.periode.gyldigTil"
                                  }
                                }
                              }
                            },
                            {
                              "range": {
                                "Vrvirksomhed.deltagerRelation.organisationer.medlemsData.periode.gyldigTil": {
                                  "gte": today
                                }
                              }
                            }
                          ],
                          "minimum_should_match": 1
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    },
    "size": 100,
    "sort": [
      { "_score": { "order": "desc" } }
    ]
  };
};
