
// CVR number search query builder
export const buildCvrQuery = (cvr: string) => {
  return {
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
