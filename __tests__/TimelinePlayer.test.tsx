import { render } from '@testing-library/react'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import TimelinePlayer from '../components/TimelinePlayer'

// Mock timers for testing intervals
jest.useFakeTimers()

describe('TimelinePlayer', () => {
  const defaultProps = {
    value: 2000,
    onChange: jest.fn(),
    minYear: 1900,
    maxYear: 2023,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      render(<TimelinePlayer {...defaultProps} />)
      
      expect(screen.getByText('Timeline Player')).toBeInTheDocument()
      expect(screen.getByText('2000')).toBeInTheDocument()
      expect(screen.getByLabelText(/Timeline slider/)).toBeInTheDocument()
      expect(screen.getByLabelText('Play')).toBeInTheDocument()
    })

    it('renders with custom year range', () => {
      render(<TimelinePlayer {...defaultProps} minYear={1950} maxYear={2020} />)
      
      expect(screen.getByText('1950')).toBeInTheDocument()
      expect(screen.getByText('2020')).toBeInTheDocument()
    })

    it('uses default year range when not provided', () => {
      const { value, onChange } = defaultProps
      render(<TimelinePlayer value={value} onChange={onChange} />)
      
      expect(screen.getByText('1776')).toBeInTheDocument()
      expect(screen.getByText(new Date().getFullYear().toString())).toBeInTheDocument()
    })
  })

  describe('Slider Interaction', () => {
    it('calls onChange when user drags slider', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<TimelinePlayer {...defaultProps} />)
      
      const slider = screen.getByLabelText(/Timeline slider/)
      
      // Simulate dragging the slider to a new value
      await user.click(slider)
      fireEvent.change(slider, { target: { value: '2010' } })
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(2010)
    })

    it('updates slider value when value prop changes', () => {
      const { rerender } = render(<TimelinePlayer {...defaultProps} value={2000} />)
      
      const slider = screen.getByLabelText(/Timeline slider/) as HTMLInputElement
      expect(slider.value).toBe('2000')
      
      rerender(<TimelinePlayer {...defaultProps} value={2015} />)
      expect(slider.value).toBe('2015')
    })

    it('respects min and max year constraints', () => {
      render(<TimelinePlayer {...defaultProps} />)
      
      const slider = screen.getByLabelText(/Timeline slider/) as HTMLInputElement
      expect(slider.min).toBe('1900')
      expect(slider.max).toBe('2023')
    })
  })

  describe('Play/Pause Functionality', () => {
    it('starts playing when play button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<TimelinePlayer {...defaultProps} />)
      
      const playButton = screen.getByLabelText('Play')
      await user.click(playButton)
      
      // Button should change to pause
      expect(screen.getByLabelText('Pause')).toBeInTheDocument()
      expect(screen.getByText(/Playing - Auto-advancing/)).toBeInTheDocument()
    })

    it('auto-advances year every second when playing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const { rerender } = render(<TimelinePlayer {...defaultProps} value={2000} />)
      
      const playButton = screen.getByLabelText('Play')
      await user.click(playButton)
      
      // Advance time by 1 second
      jest.advanceTimersByTime(1000)
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(2001)
      
      // Simulate the parent component updating the value (as would happen in real app)
      rerender(<TimelinePlayer {...defaultProps} value={2001} />)
      
      // Advance time by another second
      jest.advanceTimersByTime(1000)
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(2002)
    })

    it('pauses when pause button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<TimelinePlayer {...defaultProps} />)
      
      // Start playing
      const playButton = screen.getByLabelText('Play')
      await user.click(playButton)
      
      // Click pause
      const pauseButton = screen.getByLabelText('Pause')
      await user.click(pauseButton)
      
      // Button should change back to play
      expect(screen.getByLabelText('Play')).toBeInTheDocument()
      expect(screen.queryByText(/Playing - Auto-advancing/)).not.toBeInTheDocument()
    })

    it('stops auto-advancing when paused', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<TimelinePlayer {...defaultProps} value={2000} />)
      
      // Start playing
      const playButton = screen.getByLabelText('Play')
      await user.click(playButton)
      
      // Pause
      const pauseButton = screen.getByLabelText('Pause')
      await user.click(pauseButton)
      
      // Clear previous calls
      defaultProps.onChange.mockClear()
      
      // Advance time - should not call onChange
      jest.advanceTimersByTime(2000)
      
      expect(defaultProps.onChange).not.toHaveBeenCalled()
    })
  })

  describe('End of Timeline Behavior', () => {
    it('stops playing when maximum year is reached', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const { rerender } = render(<TimelinePlayer {...defaultProps} value={2022} maxYear={2023} />)
      
      const playButton = screen.getByLabelText('Play')
      await user.click(playButton)
      
      // Advance to trigger the year change
      jest.advanceTimersByTime(1000)
      
      // Should call onChange with 2023
      expect(defaultProps.onChange).toHaveBeenCalledWith(2023)
      
      // Simulate the parent component updating to max year
      rerender(<TimelinePlayer {...defaultProps} value={2023} maxYear={2023} />)
      
      // Wait a bit for state to settle
      jest.advanceTimersByTime(100)
      
      // Should show play button again (not playing) and be disabled
      await waitFor(() => {
        const playButtonAgain = screen.getByLabelText('Play')
        expect(playButtonAgain).toBeInTheDocument()
        expect(playButtonAgain).toBeDisabled()
      })
    })

    it('disables play button when at maximum year', () => {
      render(<TimelinePlayer {...defaultProps} value={2023} maxYear={2023} />)
      
      const playButton = screen.getByLabelText('Play')
      expect(playButton).toBeDisabled()
      expect(screen.getByText('Reached maximum year')).toBeInTheDocument()
    })

    it('re-enables play button when year is reduced below maximum', () => {
      const { rerender } = render(<TimelinePlayer {...defaultProps} value={2023} maxYear={2023} />)
      
      const playButton = screen.getByLabelText('Play')
      expect(playButton).toBeDisabled()
      
      rerender(<TimelinePlayer {...defaultProps} value={2020} maxYear={2023} />)
      
      expect(playButton).not.toBeDisabled()
    })
  })

  describe('Visual Progress Indicator', () => {
    it('shows current year prominently', () => {
      render(<TimelinePlayer {...defaultProps} value={2010} />)
      
      // Current year should be displayed prominently
      const currentYear = screen.getByText('2010')
      expect(currentYear).toBeInTheDocument()
      expect(currentYear).toHaveClass('text-3xl')
    })

    it('shows year range labels', () => {
      render(<TimelinePlayer {...defaultProps} minYear={1950} maxYear={2020} />)
      
      expect(screen.getByText('1950')).toBeInTheDocument()
      expect(screen.getByText('2020')).toBeInTheDocument()
    })

    it('displays appropriate status messages', () => {
      render(<TimelinePlayer {...defaultProps} />)
      
      expect(screen.getByText(/Click play to auto-advance/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<TimelinePlayer {...defaultProps} value={2005} />)
      
      const slider = screen.getByLabelText('Timeline slider, current year: 2005')
      expect(slider).toBeInTheDocument()
      
      const playButton = screen.getByLabelText('Play')
      expect(playButton).toBeInTheDocument()
    })

    it('updates ARIA label when year changes', () => {
      const { rerender } = render(<TimelinePlayer {...defaultProps} value={2000} />)
      
      expect(screen.getByLabelText('Timeline slider, current year: 2000')).toBeInTheDocument()
      
      rerender(<TimelinePlayer {...defaultProps} value={2010} />)
      
      expect(screen.getByLabelText('Timeline slider, current year: 2010')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles year at minimum boundary', () => {
      render(<TimelinePlayer {...defaultProps} value={1900} minYear={1900} />)
      
      const slider = screen.getByLabelText(/Timeline slider/) as HTMLInputElement
      expect(slider.value).toBe('1900')
    })

    it('handles rapid play/pause toggling', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<TimelinePlayer {...defaultProps} />)
      
      const playButton = screen.getByLabelText('Play')
      
      // Rapidly toggle play/pause
      await user.click(playButton)
      const pauseButton = screen.getByLabelText('Pause')
      await user.click(pauseButton)
      
      const playButtonAgain = screen.getByLabelText('Play')
      await user.click(playButtonAgain)
      
      // Should be playing
      expect(screen.getByLabelText('Pause')).toBeInTheDocument()
    })

    it('cleans up interval on unmount', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const { unmount } = render(<TimelinePlayer {...defaultProps} />)
      
      const playButton = screen.getByLabelText('Play')
      await user.click(playButton)
      
      // Unmount component
      unmount()
      
      // Advance time - should not cause any issues
      jest.advanceTimersByTime(1000)
      
      // No assertions needed - test passes if no errors are thrown
    })
  })
})
