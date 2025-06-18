export interface ActivitiesSuggestionResponse {
  count: number;
  isValid: boolean;
  suggestions: ActivitySuggestion[];
}

export interface ActivitySuggestion {
  code: string | null;
  name: string | null;
  description: string | null;
}

export interface IObjectSeedActivity {
  actividad: string;
  descripcion: string;
}
