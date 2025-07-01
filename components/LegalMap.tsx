import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { LegalDataset, getStatusForYear } from '../lib/timelineTypes'
import statesData from '../data/states-albers-10m.json'
import styles from './LegalMap.module.css'

interface LegalMapProps {
  dataset: LegalDataset
  year: number
}

// Color scale for status values
const colorScale = {
  0: '#DC2626', // red-500 - illegal/no data
  1: '#16A34A', // green-600 - legal
} as const

// Get color for a given status
const getStatusColor = (status: number): string => {
  return colorScale[status as keyof typeof colorScale] || colorScale[0]
}

export default function LegalMap({ dataset, year }: LegalMapProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
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
                // Get FIPS code from the geography properties
                const fipsCode = geo.id || geo.properties.FIPS || geo.properties.fips
                const status = getStatusForYear(fipsCode, year, dataset)
                const fillColor = getStatusColor(status)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"

                  />
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
              {/* Status 0 - Illegal/No Data */}
              <div className="flex items-center gap-2">
                <div
                  className={`${styles.legendItem} ${styles.legendItemIllegal}`}
                />
                <span className="text-sm text-gray-700">
                  {dataset.categories && Object.keys(dataset.categories).find(
                    key => dataset.categories[key] === 0
                  ) || 'Illegal/No Data'}
                </span>
              </div>

              {/* Status 1 - Legal */}
              <div className="flex items-center gap-2">
                <div
                  className={`${styles.legendItem} ${styles.legendItemLegal}`}
                />
                <span className="text-sm text-gray-700">
                  {dataset.categories && Object.keys(dataset.categories).find(
                    key => dataset.categories[key] === 1
                  ) || 'Legal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
