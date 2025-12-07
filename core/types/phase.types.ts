export type StepAction =
  | 'displayNumber'    // show a number to fill (data: { number: number })
  | 'waitClicks'       // wait for N clicks (data: { count: number, columnIndex?: number, eventType?: 'add'|'subtract'|'both' })
  | 'showBubble'       // show explanatory bubble (data: { text: string })
  | 'validate'         // trigger validation (data?: {})
  | 'freePractice'     // allow free practice until user quits (data?: {})
  | 'feedback'         // show feedback message (data: { text: string })
  | 'end';             // end the phase flow

export interface PhaseStep {
  id: string;
  action: StepAction;
  data?: Record<string, any>;
  next?: string | null; // id of next step, null to stop
}

export interface Phase {
  id: string;
  title?: string;
  description?: string;
  steps: PhaseStep[];
}

export interface PhaseConfig {
  phases: Phase[];
}
