export type Year = number; // 1776–present

export interface StatusChange {
  year: Year;
  status: number;
}

export interface StateTimeline {
  [stateFipsOrCode: string]: StatusChange[];
}

export interface LegalDataset {
  factor: string;
  categories: Record<string, number>; // label -> int
  states: StateTimeline;
}

/**
 * Get the legal status for a given state and year from a dataset.
 * If no entry exists, returns 0.
 * Otherwise returns the status from the last change ≤ year.
 */
export function getStatusForYear(
  state: string,
  year: Year,
  ds: LegalDataset
): number {
  const stateChanges = ds.states[state];
  
  // If no changes recorded for this state, return 0
  if (!stateChanges || stateChanges.length === 0) {
    return 0;
  }
  
  // Find the most recent change that occurred on or before the given year
  let mostRecentStatus = 0;
  
  for (const change of stateChanges) {
    if (change.year <= year) {
      mostRecentStatus = change.status;
    } else {
      // Since we've passed the target year, stop searching
      break;
    }
  }
  
  return mostRecentStatus;
}

// Alternative format for timeline data (used in demo files)
export interface TimelineEvent {
  year: number;
  status: string;
}

export interface TimelineState {
  state: string;
  events: TimelineEvent[];
}

export interface TimelineDataset {
  title: string;
  factor: string;
  data: TimelineState[];
}
