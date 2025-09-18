export const SUBSCRIPTION_TIERS = {
  standard: {
    name: "Standard",
    price_id: "price_1S7GrpCiBj9ds2dS6SoLE0NE",
    product_id: "prod_T3NdHGSrlkTpN9",
    price: 0,
    originalPrice: 49,
    currency: "DKK",
    maxCompanies: 1,
    features: [
      "Grundlæggende notifikationer",
      "Op til 1 virksomhed",
      "Email support",
      "Daglige opdateringer"
    ]
  },
  premium: {
    name: "Premium",
    price_id: "price_1S7GsMCiBj9ds2dS9AwSOf8D",
    product_id: "prod_T3NddRPim0rQkG",
    price: 99,
    originalPrice: 199,
    currency: "DKK",
    maxCompanies: 5,
    features: [
      "Avancerede notifikationer",
      "Op til 5 virksomheder",
      "SMS + Email alerts",
      "Timevise opdateringer",
      "Prioriteret support",
      "Detaljerede rapporter"
    ]
  },
  enterprise: {
    name: "Enterprise",
    price_id: "price_1S7Gu0CiBj9ds2dSoohsv6Y5",
    product_id: "prod_T3NfsGoxTVXTL7",
    price: 499,
    originalPrice: 899,
    currency: "DKK",
    maxCompanies: 100,
    features: [
      "Ubegrænsede notifikationer",
      "Op til 100 virksomheder",
      "Alle alert typer",
      "Real-time opdateringer",
      "Dedikeret support",
      "API adgang",
      "Brugerdefinerede rapporter",
      "Bulk operationer"
    ]
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;