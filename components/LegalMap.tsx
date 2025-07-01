import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { LegalDataset, getStatusForYear } from '../lib/timelineTypes'
import statesData from '../data/us-states-final.json'
import styles from './LegalMap.module.css'

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

export default function LegalMap({ dataset, year }: LegalMapProps) {
  return (
    <div className="w-full max-w-4xl mx-auto" data-testid="legal-map">
      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <ComposableMap
          projection="geoAlbersUsa"
          width={800}
          height={500}
          className="w-full h-auto"
        >
          <Geographies geography={statesData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Get state name from the geography properties
                const stateName = geo.properties.name
                const status = getStatusForYear(stateName, year, dataset)
                const fillColor = getStatusColor(status)

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
                  >
                    <title>{`${stateName}: ${getStatusLabel(status, dataset)}`}</title>
                  </Geography>
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Legend */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {dataset.factor} - {year}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
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
