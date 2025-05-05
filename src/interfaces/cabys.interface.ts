export interface CabysSuggestionResponse {
  count: number;
  isValid: boolean;
  suggestions: CabysSuggestion[];
}

export interface CabysSuggestion {
  code: string | null;
  description: string | null;
  tax: number | null;
}
