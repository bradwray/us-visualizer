'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface TimelinePlayerProps {
  minYear?: number
  maxYear?: number
  value: number
  onChange: (year: number) => void
}

export default function TimelinePlayer({
  minYear = 1776,
  maxYear = new Date().getFullYear(),
  value,
  onChange,
}: TimelinePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const sliderRef = useRef<HTMLInputElement>(null)
  const currentYearRef = useRef(value)

  // Update current year ref when value changes
  useEffect(() => {
    currentYearRef.current = value
  }, [value])

  // Handle play/pause functionality
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsPlaying(false)
    } else {
      // Play
      setIsPlaying(true)
      intervalRef.current = setInterval(() => {
        const currentYear = currentYearRef.current
        const nextYear = currentYear + 1
        if (nextYear > maxYear) {
          setIsPlaying(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          onChange(maxYear)
        } else {
          onChange(nextYear)
        }
      }, 1000 / speed)
    }
  }, [isPlaying, maxYear, onChange, speed])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // If speed changes while playing, restart interval
  useEffect(() => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(() => {
        const currentYear = currentYearRef.current
        const nextYear = currentYear + 1
        if (nextYear > maxYear) {
          setIsPlaying(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          onChange(maxYear)
        } else {
          onChange(nextYear)
        }
      }, 1000 / speed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed])

  // Stop playing when max year is reached
  useEffect(() => {
    if (value >= maxYear && isPlaying) {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [value, maxYear, isPlaying])

  // Handle slider change
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(event.target.value, 10)
    onChange(newYear)
  }

  // Calculate percentage for styling
  const percentage = ((value - minYear) / (maxYear - minYear)) * 100

  return (
    <div className="w-full max-w-3xl mx-auto" data-testid="timeline-player">
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={value >= maxYear}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 text-base
            ${
              value >= maxYear
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }
          `}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          aria-pressed={isPlaying ? 'true' : 'false'}
          data-testid="play-pause-button"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Year Display */}
        <div className="font-mono font-bold text-blue-600 text-lg w-16 text-center select-none" data-testid="year-display">
          {value}
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 ml-2">
          {[1, 2, 4, 6, 10].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1 py-0.5 rounded text-xs font-semibold border transition-colors duration-150 ${
                speed === s
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'
              }`}
              aria-pressed={speed === s}
              aria-label={`Set speed to ${s}x`}
              data-testid={`speed-${s}x`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Slider Container */}
        <div className="flex-1 relative ml-4">
          <div className="relative h-1 bg-gray-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${percentage}%` }}
            />
            <input
              ref={sliderRef}
              type="range"
              min={minYear}
              max={maxYear}
              value={value}
              onChange={handleSliderChange}
              className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
              aria-label={`Timeline slider, current year: ${value}`}
              data-testid="timeline-slider"
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow cursor-pointer transition-all duration-100 hover:scale-110"
              style={{ left: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-600">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        {isPlaying ? (
          <span className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Playing at <b>{speed}x</b>
          </span>
        ) : value >= maxYear ? (
          <span className="text-gray-400">Reached maximum year</span>
        ) : (
          <span>Play or drag to scrub</span>
        )}
      </div>
    </div>
  )
}
