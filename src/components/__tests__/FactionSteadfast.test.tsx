import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import FactionSteadfast from '../FactionSteadfast'

describe('FactionSteadfast', () => {
  const mockSetSteadfastBonus = vi.fn()
  const mockGetStatGridColumns = vi.fn(() => 'repeat(4, 1fr)')

  const defaultSteadfastBonus = {
    str: 5,
    def: 3,
    spd: 7,
    dex: 2
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render faction steadfast section', () => {
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(screen.getByText('🏛️ Faction Steadfast')).toBeInTheDocument()
    expect(screen.getByText('STR Steadfast (%)')).toBeInTheDocument()
    expect(screen.getByText('DEF Steadfast (%)')).toBeInTheDocument()
    expect(screen.getByText('SPD Steadfast (%)')).toBeInTheDocument()
    expect(screen.getByText('DEX Steadfast (%)')).toBeInTheDocument()
  })

  it('should display current steadfast bonus values', () => {
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('7')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('should show explanation text', () => {
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(screen.getByText('These bonuses are applied separately and stack multiplicatively.')).toBeInTheDocument()
  })

  it('should call setSteadfastBonus when STR input changes', async () => {
    const user = userEvent.setup()
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const strInput = screen.getByDisplayValue('5')
    
    await user.clear(strInput)
    await user.type(strInput, '10')
    
    expect(mockSetSteadfastBonus).toHaveBeenCalled()
    expect(mockSetSteadfastBonus).toHaveBeenCalledWith(expect.objectContaining({
      str: expect.any(Number)
    }))
  })

  it('should handle decimal values', async () => {
    const user = userEvent.setup()
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const strInput = screen.getByDisplayValue('5')
    
    await user.clear(strInput)
    await user.type(strInput, '7.5')
    
    expect(mockSetSteadfastBonus).toHaveBeenCalled()
  })

  it('should handle empty input values', async () => {
    const user = userEvent.setup()
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const strInput = screen.getByDisplayValue('5')
    
    await user.clear(strInput)
    
    expect(mockSetSteadfastBonus).toHaveBeenCalledWith(expect.objectContaining({
      str: 0
    }))
  })

  it('should have proper input types', () => {
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'number')
    })
    expect(inputs).toHaveLength(4)
  })

  it('should use provided grid columns function', () => {
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    expect(mockGetStatGridColumns).toHaveBeenCalled()
  })

  it('should handle zero values correctly', () => {
    const zeroSteadfast = {
      str: 0,
      def: 0,
      spd: 0,
      dex: 0
    }

    render(
      <FactionSteadfast
        steadfastBonus={zeroSteadfast}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    // FactionSteadfast shows "0" for zero values (like PerksBonuses)
    const zeroInputs = screen.getAllByDisplayValue('0')
    expect(zeroInputs).toHaveLength(4)
  })

  it('should handle large steadfast values', async () => {
    const user = userEvent.setup()
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const strInput = screen.getByDisplayValue('5')
    
    await user.clear(strInput)
    await user.type(strInput, '50')
    
    expect(mockSetSteadfastBonus).toHaveBeenCalled()
  })

  it('should update individual stat bonuses correctly', async () => {
    const user = userEvent.setup()
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    // Test updating DEF (should be the second input with value "3")
    const defInput = screen.getByDisplayValue('3')
    
    await user.clear(defInput)
    await user.type(defInput, '8')
    
    expect(mockSetSteadfastBonus).toHaveBeenCalledWith(expect.objectContaining({
      def: expect.any(Number)
    }))
  })

  it('should maintain other stat values when one is changed', async () => {
    const user = userEvent.setup()
    render(
      <FactionSteadfast
        steadfastBonus={defaultSteadfastBonus}
        setSteadfastBonus={mockSetSteadfastBonus}
        getStatGridColumns={mockGetStatGridColumns}
      />
    )
    
    const strInput = screen.getByDisplayValue('5')
    
    await user.clear(strInput)
    await user.type(strInput, '10')
    
    // Should maintain other values while updating str
    expect(mockSetSteadfastBonus).toHaveBeenCalledWith(expect.objectContaining({
      def: defaultSteadfastBonus.def,
      spd: defaultSteadfastBonus.spd,
      dex: defaultSteadfastBonus.dex
    }))
  })
})
