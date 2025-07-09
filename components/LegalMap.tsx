import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { LegalDataset, getStatusForYear } from '../lib/timelineTypes'
import { getAdmissionYear } from '../lib/admissionYear'
import statesData from '../data/us-states-final.json'
import styles from './LegalMap.module.css'
import React, { useState } from 'react';

// Helper: state name to abbreviation
const stateNameToAbbr = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};
// Helper to get the most recent status entry for a state up to a given year
import type { MouseEvent } from 'react';

function getStatusEntryForYear(stateAbbr: string, year: number, dataset: LegalDataset) {
  // Try abbreviation first, then full name
  let stateData = dataset.states[stateAbbr];
  if (!stateData) {
    // Try to find the full name for this abbr
    const fullName = Object.keys(dataset.states).find(
      k => k.toLowerCase() === stateAbbr.toLowerCase() || k.toLowerCase() === (Object.entries(stateNameToAbbr).find(([name, abbr]) => abbr === stateAbbr)?.[0] || '').toLowerCase()
    );
    if (fullName) stateData = dataset.states[fullName];
  }
  if (!stateData) return null;
  // Sort by year ascending
  const sorted = [...stateData].sort((a, b) => a.year - b.year);
  let last = null;
  for (const entry of sorted) {
    if (entry.year <= year) last = entry;
    else break;
  }
  return last;
}

interface StateHoverCardProps {
  stateAbbr: string;
  year: number;
  dataset: LegalDataset;
  mouse: { x: number; y: number };
}
function StateInfoCard({ stateAbbr, year, dataset, onClose, mouse }: { stateAbbr: string; year: number; dataset: LegalDataset; onClose: () => void; mouse: { x: number; y: number } }) {
  const entry = getStatusEntryForYear(stateAbbr, year, dataset);
  let catName = entry && Object.keys(dataset.categories).find(
    (k) => dataset.categories[k] === entry.status
  );
  // Card style: fixed, positioned at click, black text, white bg, clickable links
  return (
    <div
      style={{
        position: 'absolute',
        left: mouse.x,
        top: mouse.y,
        transform: 'translate(-10px, 10px)',
        background: 'white',
        color: 'black',
        border: '1px solid #222',
        borderRadius: 10,
        padding: 18,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        zIndex: 2000,
        minWidth: 220,
        maxWidth: 320,
        fontSize: 16,
        fontWeight: 400,
        cursor: 'auto',
      }}
      tabIndex={0}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          background: 'transparent',
          border: 'none',
          fontSize: 22,
          fontWeight: 700,
          color: '#222',
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6, letterSpacing: 1 }}>{stateAbbr}</div>
      {entry && catName ? (
        <>
          <div style={{ marginBottom: 8 }}>Became <b>{catName}</b> {entry.year}</div>
          {entry.sources && entry.sources.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {entry.sources.map((src: string, i: number) => (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginRight: 10, color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}
                >
                  Source {i + 1}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ marginBottom: 8, color: '#b91c1c', fontWeight: 500 }}>
          {(() => {
            // Try to determine if not yet a state
            const admissionYear = getAdmissionYear(stateAbbr);
            if (admissionYear && year < admissionYear) {
              return `Not yet a state in ${year}`;
            }
            return 'No data for this year.';
          })()}
        </div>
      )}
    </div>
  );
}

interface LegalMapProps {
  dataset: LegalDataset
  year: number
}

// Color scale for status values
const colorScale = {
  0: '#DC2626', // red-600 - illegal/none
  1: '#F59E0B', // amber-500 - medical
  2: '#16A34A', // green-600 - fully legal
} as const

// Get color for a given status
const getStatusColor = (status: number): string => {
  return colorScale[status as keyof typeof colorScale] || colorScale[0]
}

// Get status label for tooltip
const getStatusLabel = (status: number, dataset: LegalDataset): string => {
  if (dataset.categories) {
    const entry = Object.entries(dataset.categories).find(([, value]) => value === status)
    if (entry) return entry[0]
  }
  
  // Fallback labels
  switch (status) {
    case 0: return 'None/Illegal'
    case 1: return 'Medical'
    case 2: return 'Fully Legal'
    default: return 'Unknown'
  }
}


function LegalMap({ dataset, year }: LegalMapProps) {
  const [popup, setPopup] = useState<null | { abbr: string; mouse: { x: number; y: number } }>(null);
  // Gray color for pre-admission states
  const preAdmissionColor = '#D1D5DB'; // Tailwind gray-300
  // Helper to get map container offset for click positioning
  const mapRef = React.useRef<HTMLDivElement>(null);
  return (
    <div className="w-full max-w-4xl mx-auto" data-testid="legal-map">
      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg p-4" style={{ position: 'relative' }} ref={mapRef}>
        {/* Year overlay inside map container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', // Responsive: 2.2rem on mobile, up to 3.5rem on desktop
            fontWeight: 800,
            color: '#1d4ed8', // blue-700
            letterSpacing: '0.04em',
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1.08,
            whiteSpace: 'nowrap',
          }}
          data-testid="year-display-main"
        >
          {year}
        </div>
        <ComposableMap
          projection="geoAlbersUsa"
          width={800}
          height={500}
          className="w-full h-auto"
        >
          <Geographies geography={statesData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name;
                const abbr = stateNameToAbbr[stateName as keyof typeof stateNameToAbbr];
                const admissionYear = abbr ? getAdmissionYear(abbr) : undefined;
                let fillColor;
                if (admissionYear !== undefined && year < admissionYear) {
                  fillColor = preAdmissionColor;
                } else {
                  const status = getStatusForYear(stateName, year, dataset);
                  fillColor = getStatusColor(status);
                }
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth={0.8}
                    className="cursor-pointer"
                    style={{
                      default: { 
                        outline: 'none',
                        stroke: "#FFFFFF",
                        strokeWidth: 0.8
                      },
                      hover: { 
                        outline: 'none',
                        stroke: "#333333",
                        strokeWidth: 1.5
                      },
                      pressed: { 
                        outline: 'none'
                      }
                    }}
                    onClick={(evt: React.MouseEvent) => {
                      if (!abbr) return;
                      // Get click position relative to map container
                      const container = mapRef.current;
                      let x = evt.clientX, y = evt.clientY;
                      if (container) {
                        const rect = container.getBoundingClientRect();
                        x = evt.clientX - rect.left;
                        y = evt.clientY - rect.top;
                      }
                      setPopup({ abbr, mouse: { x, y } });
                    }}
                    onMouseEnter={() => {
                      // Close any open popup when hovering over any state
                      setPopup(null);
                    }}
                  >
                    <title>{`${stateName}: ${admissionYear !== undefined && year < admissionYear ? 'Not yet a state' : getStatusLabel(getStatusForYear(stateName, year, dataset), dataset)}`}</title>
                  </Geography>
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Info Card (click-to-show, positioned at click, closes on close button) */}
        {popup && (
          <StateInfoCard
            stateAbbr={popup.abbr}
            year={year}
            dataset={dataset}
            onClose={() => setPopup(null)}
            mouse={popup.mouse}
          />
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {dataset.factor} - {year}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Pre-admission gray */}
              <div className="flex items-center gap-2">
                <div className={`${styles.legendItem} ${styles.legendItemPreAdmission}`} />
                <span className="text-sm text-gray-700">Not yet a state</span>
              </div>
              {/* Status 0 - None/Illegal */}
              <div className="flex items-center gap-2">
                <div className={`${styles.legendItem} ${styles.legendItemNone}`} />
                <span className="text-sm text-gray-700">
                  {dataset.categories && Object.keys(dataset.categories).find(
                    key => dataset.categories[key] === 0
                  ) || 'None/Illegal'}
                </span>
              </div>

              {/* Status 1 - Medical */}
              <div className="flex items-center gap-2">
                <div className={`${styles.legendItem} ${styles.legendItemMedical}`} />
                <span className="text-sm text-gray-700">
                  {dataset.categories && Object.keys(dataset.categories).find(
                    key => dataset.categories[key] === 1
                  ) || 'Medical'}
                </span>
              </div>

              {/* Status 2 - Legal */}
              <div className="flex items-center gap-2">
                <div className={`${styles.legendItem} ${styles.legendItemLegal}`} />
                <span className="text-sm text-gray-700">
                  {dataset.categories && Object.keys(dataset.categories).find(
                    key => dataset.categories[key] === 2
                  ) || 'Fully Legal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalMap;
