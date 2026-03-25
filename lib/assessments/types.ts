// Shared types for all assessment schedule files.
// Each schedule imports from here instead of re-declaring identical interfaces.

export type ResponseFieldType =
  | "correct_incorrect"   // ✓ / ✗ toggle
  | "fluency_scale"       // Fluent / Hesitant / Error
  | "number_reached"      // What number did the student reach?
  | "number_entry"        // Teacher types a number
  | "strategy_observed"   // Which strategy was observed?
  | "strategy_select"     // Single-select strategy buttons (3D style)
  | "text_input"          // Free text box
  | "strategy"            // Single-select strategy toggle (AV-SN style)
  | "multi_strategy";     // Multi-select strategy toggles (AV-AS style)

export interface ResponseField {
  label: string;
  type: ResponseFieldType;
  options?: string[];
  placeholder?: string;
}

export interface AssessmentItem {
  id: string;
  /** Sub-group key — used by groupBySubLevel() for section headers */
  number: string;
  prompt: string;
  displayText?: string;
  responseFields: ResponseField[];
  targetLevel: number;
  notes?: string;
  // LFIN 2A — clickable number grids
  numberRangeStart?: number;
  numberRangeEnd?: number;
  // LFIN 2B — dice dot pattern display
  diceValue?: number;
  // AV-NWN — counting / identify sequences
  countingSequence?: number[];
  identifySequence?: number[];
}

export interface TaskGroup {
  id: string;
  number: number;
  name: string;
  shortName: string;
  model: string;
  color: string;
  instructions: string;
  teacherScript?: string;
  materials?: string;
  items: AssessmentItem[];
  branchingNote?: string;
  startAtItem?: string;
  startNote?: string;
  /** Flash-card presentation mode (2B) */
  flashCard?: boolean;
  /** Allow early exit before the group is fully answered */
  allowEarlyExit?: boolean;
  earlyExitNote?: string;
  /** Skip target (3C / 3D) */
  skipToId?: string;
  skipLabel?: string;
}

/** Field types that require an answer before advancing */
export const REQUIRED_FIELD_TYPES: ResponseFieldType[] = [
  "correct_incorrect",
  "fluency_scale",
];
