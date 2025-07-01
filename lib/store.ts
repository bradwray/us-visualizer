import { create } from 'zustand';
import { LegalDataset } from './timelineTypes';

interface DatasetInfo {
  id: string;
  title: string;
  description: string;
  filename: string;
  years: string;
}

// Utility function to convert old dataset format to new format
export function convertDatasetFormat(dataset: unknown): LegalDataset {
  const data = dataset as Record<string, unknown>;
  
  // If already in new format, return as-is
  if (data.states && !data.data) {
    return data as unknown as LegalDataset;
  }
  
  // Convert old format to new format
  if (data.data && !data.states) {
    const states: Record<string, { year: number; status: number; sources?: string[] }[]> = {};
    const dataArray = data.data as Array<{ state: string; events: Array<{ year: number; status: string | number; sources?: string[] }> }>;
    
    for (const stateData of dataArray) {
      const stateName = stateData.state;
      const events = stateData.events.map((event) => ({
        year: event.year,
        status: typeof event.status === 'string' ? 
          (event.status === 'legal' ? 2 : event.status === 'medical' ? 1 : 0) : 
          event.status,
        ...(event.sources && { sources: event.sources })
      }));
      states[stateName] = events;
    }
    
    return {
      factor: (data.factor || data.title || 'Legal Status') as string,
      categories: (data.categories || { 'Illegal': 0, 'Medical': 1, 'Legal': 2 }) as Record<string, number>,
      states
    };
  }
  
  throw new Error('Invalid dataset format - missing both data and states');
}

interface AppStore {
  year: number;
  dataset: LegalDataset | null;
  availableDatasets: DatasetInfo[];
  selectedDatasetId: string;
  isLoading: boolean;
  setYear: (year: number) => void;
  setDataset: (dataset: LegalDataset) => void;
  setSelectedDatasetId: (id: string) => void;
  setAvailableDatasets: (datasets: DatasetInfo[]) => void;
  setLoading: (loading: boolean) => void;
  loadDatasetFile: (file: File) => Promise<void>;
}

export const useAppStore = create<AppStore>((set) => ({
  year: 2020,
  dataset: null,
  availableDatasets: [],
  selectedDatasetId: 'cannabis',
  isLoading: false,
  setYear: (year: number) => set({ year }),
  setDataset: (dataset: LegalDataset) => set({ dataset }),
  setSelectedDatasetId: (id: string) => set({ selectedDatasetId: id }),
  setAvailableDatasets: (datasets: DatasetInfo[]) => set({ availableDatasets: datasets }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  loadDatasetFile: async (file: File) => {
    try {
      const text = await file.text();
      let dataset = JSON.parse(text);
      
      // Convert old format to new format if needed
      dataset = convertDatasetFormat(dataset);
      
      // Basic validation for the new format
      if (!dataset.factor || !dataset.states) {
        throw new Error('Invalid dataset format - missing factor or states');
      }
      
      // Validate states data
      for (const [stateName, events] of Object.entries(dataset.states)) {
        if (!Array.isArray(events)) {
          throw new Error(`Invalid events data for state: ${stateName}`);
        }
        
        for (const event of events) {
          if (typeof event.year !== 'number' || typeof event.status !== 'number') {
            throw new Error(`Invalid event data for state: ${stateName}`);
          }
        }
      }
      
      set({ dataset, year: 2020 });
    } catch (error) {
      console.error('Error loading dataset:', error);
      throw error;
    }
  },
}));
