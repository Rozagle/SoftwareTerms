export interface TermEntry {
  term: string;
  fullForm: string;
  category: string;
  definition: string;
}

export interface GroupedTerms {
  [category: string]: TermEntry[];
}

export interface User {
  username: string;
  email: string;
}

export interface DictionaryState {
  entries: TermEntry[];
  grouped: GroupedTerms;
}

export interface GenerationResult {
  validTerms: TermEntry[];
  rejectedTerms: string[];
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type AuthView = 'LOGIN' | 'SIGNUP' | 'VERIFY_EMAIL' | 'FORGOT_PASSWORD' | 'VERIFY_RESET' | 'NEW_PASSWORD';
