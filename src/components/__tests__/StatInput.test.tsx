import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import StatInput from '../StatInput'

describe('StatInput', () => {
  const mockStats = { str: 1000, def: 2000, spd: 1500, dex: 1750 }
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all stat input fields', () => {
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    expect(screen.getByText('STRENGTH')).toBeInTheDocument()
    expect(screen.getByText('DEFENSE')).toBeInTheDocument()
    expect(screen.getByText('SPEED')).toBeInTheDocument()
    expect(screen.getByText('DEXTERITY')).toBeInTheDocument()
  })

  it('should display current stat values with proper formatting', () => {
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    expect(screen.getByText('1,000')).toBeInTheDocument()
    expect(screen.getByText('2,000')).toBeInTheDocument()
    expect(screen.getByText('1,500')).toBeInTheDocument()
    expect(screen.getByText('1,750')).toBeInTheDocument()
  })

  it('should display stat icons', () => {
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    expect(screen.getByText('💪')).toBeInTheDocument() // Strength
    expect(screen.getByText('🛡️')).toBeInTheDocument() // Defense
    expect(screen.getByText('⚡')).toBeInTheDocument() // Speed
    expect(screen.getByText('🎯')).toBeInTheDocument() // Dexterity
  })

  it('should call onChange when input value changes', async () => {
    const user = userEvent.setup()
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    const strInput = screen.getByDisplayValue('1000')
    
    await user.clear(strInput)
    await user.type(strInput, '5000')
    
    // Trigger blur to save the value
    fireEvent.blur(strInput)
    
    expect(mockOnChange).toHaveBeenCalledWith({
      str: 5000,
      def: 2000,
      spd: 1500,
      dex: 1750
    })
  })

  it('should handle comma-separated input values', async () => {
    const user = userEvent.setup()
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    const strInput = screen.getByDisplayValue('1000')
    
    await user.clear(strInput)
    await user.type(strInput, '1,000,000')
    
    fireEvent.blur(strInput)
    
    expect(mockOnChange).toHaveBeenCalledWith({
      str: 1000000,
      def: 2000,
      spd: 1500,
      dex: 1750
    })
  })

  it('should handle invalid input gracefully', async () => {
    const user = userEvent.setup()
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    const strInput = screen.getByDisplayValue('1000')
    
    await user.clear(strInput)
    await user.type(strInput, 'invalid')
    
    fireEvent.blur(strInput)
    
    expect(mockOnChange).toHaveBeenCalledWith({
      str: 0,
      def: 2000,
      spd: 1500,
      dex: 1750
    })
  })

  it('should clear input when focused if value is 0', async () => {
    const user = userEvent.setup()
    const zeroStats = { str: 0, def: 0, spd: 0, dex: 0 }
    render(<StatInput stats={zeroStats} onChange={mockOnChange} />)
    
    const strInput = screen.getAllByDisplayValue('0')[0] // Get the first input (strength)
    
    await user.click(strInput)
    
    expect(strInput).toHaveValue('')
  })

  it('should maintain focus while typing', async () => {
    const user = userEvent.setup()
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    const strInput = screen.getByDisplayValue('1000')
    
    await user.click(strInput)
    await user.clear(strInput)
    await user.type(strInput, '12345')
    
    // Input should still be focused and contain the typed value
    expect(strInput).toHaveFocus()
    expect(strInput).toHaveValue('12345')
  })

  it('should show placeholder text', () => {
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    const inputs = screen.getAllByPlaceholderText('e.g. 1,000,000')
    expect(inputs).toHaveLength(4)
  })

  it('should have proper styling classes and structure', () => {
    render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    // Check for "Current Level" labels
    const currentLevelLabels = screen.getAllByText('Current Level')
    expect(currentLevelLabels).toHaveLength(4)
  })

  it('should update display value when props change', () => {
    const { rerender } = render(<StatInput stats={mockStats} onChange={mockOnChange} />)
    
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument()
    
    // Update props
    const newStats = { ...mockStats, str: 9999 }
    rerender(<StatInput stats={newStats} onChange={mockOnChange} />)
    
    // Should show the new prop value
    expect(screen.getByDisplayValue('9999')).toBeInTheDocument()
  })
})
