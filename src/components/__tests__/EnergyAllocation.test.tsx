import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import EnergyAllocation from '../EnergyAllocation'

describe('EnergyAllocation', () => {
  const mockSetEnergyAllocation = vi.fn()
  const mockGetStatGridColumns = vi.fn(() => 'repeat(4, 1fr)')

  const defaultEnergyAllocation = {
    str: 25,
    def: 25,
    spd: 25,
    dex: 25
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render energy allocation section', () => {
    render(
      <EnergyAllocation
        energyAllocation={defaultEnergyAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(screen.getByText('⚖️ Energy Allocation')).toBeInTheDocument()
    expect(screen.getByText('STR Energy (%)')).toBeInTheDocument()
    expect(screen.getByText('DEF Energy (%)')).toBeInTheDocument()
    expect(screen.getByText('SPD Energy (%)')).toBeInTheDocument()
    expect(screen.getByText('DEX Energy (%)')).toBeInTheDocument()
  })

  it('should display current energy allocation values', () => {
    render(
      <EnergyAllocation
        energyAllocation={defaultEnergyAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(screen.getAllByDisplayValue('25')).toHaveLength(4)
  })

  it('should show total allocation percentage', () => {
    render(
      <EnergyAllocation
        energyAllocation={defaultEnergyAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(screen.getByText('Total Allocation: 100%')).toBeInTheDocument()
  })

  it('should warn when total allocation is not 100%', () => {
    const unbalancedAllocation = {
      str: 30,
      def: 30,
      spd: 30,
      dex: 30
    }

    render(
      <EnergyAllocation
        energyAllocation={unbalancedAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(screen.getByText('Total Allocation: 120%')).toBeInTheDocument()
    expect(screen.getByText('(Should total 100%)')).toBeInTheDocument()
  })

  it('should call setEnergyAllocation when STR input changes', async () => {
    const user = userEvent.setup()
    render(
      <EnergyAllocation
        energyAllocation={defaultEnergyAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const strInput = screen.getAllByDisplayValue('25')[0] // Get the first input (STR)
    
    await user.clear(strInput)
    await user.type(strInput, '40')
    
    expect(mockSetEnergyAllocation).toHaveBeenCalled()
    expect(mockSetEnergyAllocation).toHaveBeenCalledWith(expect.objectContaining({
      str: expect.any(Number)
    }))
  })

  it('should handle empty input values', async () => {
    const user = userEvent.setup()
    render(
      <EnergyAllocation
        energyAllocation={defaultEnergyAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const strInput = screen.getAllByDisplayValue('25')[0]
    
    await user.clear(strInput)
    
    expect(mockSetEnergyAllocation).toHaveBeenCalledWith(expect.objectContaining({
      str: 0
    }))
  })

  it('should have proper input types', () => {
    render(
      <EnergyAllocation
        energyAllocation={defaultEnergyAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const inputs = screen.getAllByDisplayValue('25')
    inputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'number')
    })
  })

  it('should use provided grid columns function', () => {
    render(
      <EnergyAllocation
        energyAllocation={defaultEnergyAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(mockGetStatGridColumns).toHaveBeenCalled()
  })

  it('should handle zero values correctly', () => {
    const zeroAllocation = {
      str: 0,
      def: 0,
      spd: 0,
      dex: 0
    }

    render(
      <EnergyAllocation
        energyAllocation={zeroAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    // Should show empty strings for 0 values (same behavior as TrainingSetup)
    const emptyInputs = screen.getAllByDisplayValue('')
    expect(emptyInputs).toHaveLength(4)
    expect(screen.getByText('Total Allocation: 0%')).toBeInTheDocument()
  })

  it('should handle large allocation values', async () => {
    const user = userEvent.setup()
    render(
      <EnergyAllocation
        energyAllocation={defaultEnergyAllocation}
        setEnergyAllocation={mockSetEnergyAllocation}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const strInput = screen.getAllByDisplayValue('25')[0]
    
    await user.clear(strInput)
    await user.type(strInput, '999')
    
    expect(mockSetEnergyAllocation).toHaveBeenCalled()
  })
})
