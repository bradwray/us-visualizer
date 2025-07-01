'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore, convertDatasetFormat } from '../../lib/store';
import TimelinePlayer from '../../components/TimelinePlayer';
import LegalMap from '../../components/LegalMap';

export default function HomePage() {
  const { 
    year, 
    dataset, 
    availableDatasets, 
    selectedDatasetId, 
    isLoading, 
    setYear, 
    setDataset, 
    setSelectedDatasetId, 
    setAvailableDatasets, 
    setLoading, 
    loadDatasetFile 
  } = useAppStore();

  // Get current dataset info
  const currentDatasetInfo = availableDatasets.find(d => d.id === selectedDatasetId);
  
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load available datasets on first mount
  useEffect(() => {
    async function loadDatasetIndex() {
      try {
        const response = await fetch('/datasets/index.json');
        if (!response.ok) {
          throw new Error('Failed to load dataset index');
        }
        const { datasets } = await response.json();
        setAvailableDatasets(datasets);
      } catch (err) {
        console.error('Error loading dataset index:', err);
        setError('Failed to load available datasets');
      }
    }

    loadDatasetIndex();
  }, [setAvailableDatasets]);

  // Load selected dataset when selectedDatasetId changes
  useEffect(() => {
    async function loadSelectedDataset() {
      if (!selectedDatasetId || availableDatasets.length === 0) return;
      
      const datasetInfo = availableDatasets.find(d => d.id === selectedDatasetId);
      if (!datasetInfo) return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/datasets/${datasetInfo.filename}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${datasetInfo.title} dataset`);
        }
        const rawData = await response.json();
        const datasetData = convertDatasetFormat(rawData);
        setDataset(datasetData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dataset';
        setError(errorMessage);
        console.error('Error loading dataset:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSelectedDataset();
  }, [selectedDatasetId, availableDatasets, setDataset, setLoading]);

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDatasetId(event.target.value);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      await loadDatasetFile(file);
      setSelectedDatasetId('custom'); // Mark as custom dataset
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dataset');
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading && !dataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dataset...</p>
        </div>
      </div>
    );
  }

  if (error && !dataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentDatasetInfo?.title || dataset.factor}
              </h1>
              <p className="text-gray-600">US Legal Status Timeline Visualizer</p>
            </div>
            
            {/* Dataset Selector and File Upload */}
            <div className="flex items-center space-x-4">
              {/* Dataset Dropdown */}
              <div className="flex items-center space-x-2">
                <label htmlFor="dataset-select" className="text-sm font-medium text-gray-700">
                  Dataset:
                </label>
                <select
                  id="dataset-select"
                  value={selectedDatasetId}
                  onChange={handleDatasetChange}
                  className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  {availableDatasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.title}
                    </option>
                  ))}
                  {selectedDatasetId === 'custom' && (
                    <option value="custom">Custom Dataset</option>
                  )}
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {/* File Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload JSON dataset file"
                />
                <button
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>{isLoading ? 'Loading...' : 'Upload Dataset'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Timeline Player */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline Control</h2>
            <TimelinePlayer
              value={year}
              onChange={setYear}
              minYear={1776}
              maxYear={2024}
            />
          </div>

          {/* Map Visualization */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {dataset.factor} - {year}
            </h2>
            <LegalMap
              year={year}
              dataset={dataset}
            />
          </div>

          {/* Dataset Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dataset Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Title</h3>
                <p className="text-gray-600">{currentDatasetInfo?.title || dataset.factor}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Factor</h3>
                <p className="text-gray-600">{dataset.factor}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">States with Data</h3>
                <p className="text-gray-600">{dataset.states ? Object.keys(dataset.states).length : 0} states</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
