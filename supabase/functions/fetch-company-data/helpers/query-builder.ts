
export const buildSearchQuery = (cvr?: string, companyName?: string) => {
  if (cvr) {
    // Search by CVR number - convert to integer for exact match
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
  } else if (companyName) {
    // Search by company name using match query with fuzziness
    return {
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": companyName,
                  "fuzziness": "AUTO",
                  "operator": "and"
                }
              }
            }
          ]
        }
      },
      "size": 100
    };
  } else {
    throw new Error('Either CVR number or company name is required');
  }
};
