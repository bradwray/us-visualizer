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
          // Stop at max year
          setIsPlaying(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          onChange(maxYear)
        } else {
          onChange(nextYear)
        }
      }, 1000) // 1 second interval
    }
  }, [isPlaying, maxYear, onChange])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6" data-testid="timeline-player">
      {/* Title and Current Year */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Timeline Player</h2>
        <div className="text-3xl font-mono font-bold text-blue-600" data-testid="year-display">
          {value}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={value >= maxYear}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
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
            // Pause icon
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            // Play icon
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Slider Container */}
        <div className="flex-1 relative">
          {/* Slider Track */}
          <div className="relative h-2 bg-gray-200 rounded-full">
            {/* Progress Track */}
            <div
              className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${percentage}%` }}
            />
            
            {/* Slider Input */}
            <input
              ref={sliderRef}
              type="range"
              min={minYear}
              max={maxYear}
              value={value}
              onChange={handleSliderChange}
              className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
              aria-label={`Timeline slider, current year: ${value}`}
              data-testid="timeline-slider"
            />
            
            {/* Slider Thumb */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg cursor-pointer transition-all duration-100 hover:scale-110"
              style={{ left: `${percentage}%` }}
            />
          </div>

          {/* Year Labels */}
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center text-sm text-gray-600">
        {isPlaying ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Playing - Auto-advancing every second
          </span>
        ) : value >= maxYear ? (
          <span className="text-gray-500">Reached maximum year</span>
        ) : (
          <span>Click play to auto-advance, or drag the slider to scrub</span>
        )}
      </div>
    </div>
  )
}
