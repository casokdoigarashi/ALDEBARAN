
export type AppState =
  | 'DASHBOARD'
  | 'FORM_INPUT'
  | 'MATCHING_RESULTS'
  | 'PROPOSAL_VIEW'
  | 'MATERIAL_DB'
  | 'PROPOSALS_LIST'
  | 'PROPOSAL_DETAIL'
  | 'REPORTS';

export interface FormFieldData<T> {
  value: T;
  confidence?: number;
}

export interface ClientResearch {
  companyName: string;
  websiteUrl: string;
  summary: string;
  recentTopics: string[];
  brandVibe: string;
  extractedUrls?: string[]; // Source URLs from Google Search
}

export interface InquiryData {
  source: 'form' | 'file';
  // New field for client research
  clientResearch?: ClientResearch;
  
  product_type: FormFieldData<string>;
  purpose_goals: FormFieldData<string[]>;
  target_audience: FormFieldData<string>;
  hero_ingredients_preference: FormFieldData<string>;
  claims_must: FormFieldData<string>;
  certifications: FormFieldData<string[]>;
  allergens_restrictions: FormFieldData<string>;
  sensory: FormFieldData<string>;
  markets: FormFieldData<string>;
  lot_size: FormFieldData<string>;
  budget_band: FormFieldData<string>;
  lead_time_expectation: FormFieldData<string>;
  package_preferences: FormFieldData<string>;
  sustainability: FormFieldData<string>;
  brand_story_tone: FormFieldData<string>;
  references: FormFieldData<string>;
  contact_info_internal: FormFieldData<string>;
}

export interface Material {
  id: string;
  tradeName: string;
  inciName: string;
  manufacturer: string;
  description: string;
  benefits: string[];
  category: string; // e.g., "Emollient", "Active", "Preservative"
  recommendedConcentration: string;
  costLevel: 'High' | 'Medium' | 'Low';
  price: string; // Added: Specific price info
  origin: string; // Added: Production area/region
  country: string; // Added: Country of origin
  sustainability: string;
}

export interface ScoredProposal {
  id: string;
  rank: number;
  score: number;
  productNameSuggestion: string;
  conceptSummary: string;
  keyFeatures: string[];
  scoringReasons: {
    feature: string;
    reason: string;
    scoreEffect: number;
  }[];
}

export interface ProposalContent {
  executiveSummary: string; // New: Executive Summary for the proposal
  clientResearch?: ClientResearch; // New: Attached client research data
  productNameSuggestions: string[];
  tagline: string;
  conceptSummary: string;
  mainIngredients: {
    inci: string;
    commonName: string;
    percentageRange: string;
    isInternalMaterial?: boolean; // Highlight if it comes from internal DB
  }[];
  expectedFunctions: {
    func: string;
    evidence: string;
  }[];
  packageProposals: {
    name: string;
    capacity: string;
    material: string;
    moq: string;
    leadTime: string;
    decoration: string;
    costRange: string;
    }[];
  manufacturingEstimate: {
    lotSize: string;
    leadTime: string;
    schedule: string;
  };
  costRange: {
    materials: string;
    filling: string;
    container: string;
    printing: string;
    total: string;
  };
  regulatoryNotes: string;
  risksAndUncertainties: string;
  nextActions: string[];
  emailDrafts: { // New: Multiple email variations
    standard: string;
    formal: string;
    casual: string;
  };
  emailDraft: string; // Keep for backward compatibility, mapped to standard
}

export interface FullProposal {
  id: string;
  jp: ProposalContent;
  en: ProposalContent;
}