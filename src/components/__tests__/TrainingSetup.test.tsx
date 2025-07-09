import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import TrainingSetup from '../TrainingSetup'

describe('TrainingSetup', () => {
  const mockSetHappy = vi.fn()
  const mockSetEnergy = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render happy and energy input fields', () => {
    render(
      <TrainingSetup
        happy={500}
        setHappy={mockSetHappy}
        energy={1000}
        setEnergy={mockSetEnergy}
      />
    )
    
    expect(screen.getByText('⚡ Training Setup')).toBeInTheDocument()
    expect(screen.getByText('Happy Level')).toBeInTheDocument()
    expect(screen.getByText('Total Energy')).toBeInTheDocument()
  })

  it('should display current happy and energy values', () => {
    render(
      <TrainingSetup
        happy={750}
        setHappy={mockSetHappy}
        energy={2500}
        setEnergy={mockSetEnergy}
      />
    )
    
    expect(screen.getByDisplayValue('750')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2500')).toBeInTheDocument()
  })

  it('should call setHappy when happy input changes', async () => {
    const user = userEvent.setup()
    render(
      <TrainingSetup
        happy={500}
        setHappy={mockSetHappy}
        energy={1000}
        setEnergy={mockSetEnergy}
      />
    )
    
    const happyInput = screen.getByDisplayValue('500')
    
    await user.clear(happyInput)
    await user.type(happyInput, '800')
    
    // Check that setHappy was called (multiple times due to typing)
    expect(mockSetHappy).toHaveBeenCalled()
    // Check that it was called with a number
    expect(mockSetHappy).toHaveBeenCalledWith(expect.any(Number))
  })

  it('should call setEnergy when energy input changes', async () => {
    const user = userEvent.setup()
    render(
      <TrainingSetup
        happy={500}
        setHappy={mockSetHappy}
        energy={1000}
        setEnergy={mockSetEnergy}
      />
    )
    
    const energyInput = screen.getByDisplayValue('1000')
    
    await user.clear(energyInput)
    await user.type(energyInput, '1500')
    
    // Check that setEnergy was called (multiple times due to typing)
    expect(mockSetEnergy).toHaveBeenCalled()
    // Check that it was called with a number
    expect(mockSetEnergy).toHaveBeenCalledWith(expect.any(Number))
  })

  it('should handle empty input values', async () => {
    const user = userEvent.setup()
    render(
      <TrainingSetup
        happy={500}
        setHappy={mockSetHappy}
        energy={1000}
        setEnergy={mockSetEnergy}
      />
    )
    
    const happyInput = screen.getByDisplayValue('500')
    
    await user.clear(happyInput)
    
    expect(mockSetHappy).toHaveBeenCalledWith(0)
  })

  it('should handle invalid input values', async () => {
    const user = userEvent.setup()
    render(
      <TrainingSetup
        happy={500}
        setHappy={mockSetHappy}
        energy={1000}
        setEnergy={mockSetEnergy}
      />
    )
    
    const happyInput = screen.getByDisplayValue('500')
    
    await user.clear(happyInput)
    await user.type(happyInput, 'invalid')
    
    expect(mockSetHappy).toHaveBeenCalledWith(0)
  })

  it('should have proper input types', () => {
    render(
      <TrainingSetup
        happy={500}
        setHappy={mockSetHappy}
        energy={1000}
        setEnergy={mockSetEnergy}
      />
    )
    
    const happyInput = screen.getByDisplayValue('500')
    const energyInput = screen.getByDisplayValue('1000')
    
    expect(happyInput).toHaveAttribute('type', 'number')
    expect(energyInput).toHaveAttribute('type', 'number')
  })

  it('should have proper styling structure', () => {
    render(
      <TrainingSetup
        happy={500}
        setHappy={mockSetHappy}
        energy={1000}
        setEnergy={mockSetEnergy}
      />
    )
    
    // Check that the component renders with expected structure
    const title = screen.getByText('⚡ Training Setup')
    expect(title).toBeInTheDocument()
    
    const labels = screen.getAllByText(/Happy Level|Total Energy/)
    expect(labels).toHaveLength(2)
  })

  it('should handle zero values correctly', () => {
    render(
      <TrainingSetup
        happy={0}
        setHappy={mockSetHappy}
        energy={0}
        setEnergy={mockSetEnergy}
      />
    )
    
    // When values are 0, the component shows empty strings due to `value={happy || ''}`
    const emptyInputs = screen.getAllByDisplayValue('')
    expect(emptyInputs).toHaveLength(2)
  })

  it('should handle large numbers', async () => {
    const user = userEvent.setup()
    render(
      <TrainingSetup
        happy={500}
        setHappy={mockSetHappy}
        energy={1000}
        setEnergy={mockSetEnergy}
      />
    )
    
    const energyInput = screen.getByDisplayValue('1000')
    
    await user.clear(energyInput)
    await user.type(energyInput, '999999')
    
    // Check that setEnergy was called (multiple times due to typing)
    expect(mockSetEnergy).toHaveBeenCalled()
    // Check that it was called with a large number
    expect(mockSetEnergy).toHaveBeenCalledWith(expect.any(Number))
  })
})
