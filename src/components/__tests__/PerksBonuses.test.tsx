import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import PerksBonuses from '../PerksBonuses'

describe('PerksBonuses', () => {
  const mockSetPropertyPerks = vi.fn()
  const mockSetEducationStatSpecific = vi.fn()
  const mockSetEducationGeneral = vi.fn()
  const mockSetJobPerks = vi.fn()
  const mockSetBookPerks = vi.fn()
  const mockGetPerksGridColumns = vi.fn(() => 'repeat(5, 1fr)')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render perks bonuses section', () => {
    render(
      <PerksBonuses
        propertyPerks={10}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={5}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={7}
        setJobPerks={mockSetJobPerks}
        bookPerks={2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    expect(screen.getByText('📈 Perks Bonuses')).toBeInTheDocument()
    expect(screen.getByText('Property Perks (%)')).toBeInTheDocument()
    expect(screen.getByText('Education (Stat) (%)')).toBeInTheDocument()
    expect(screen.getByText('Education (General) (%)')).toBeInTheDocument()
    expect(screen.getByText('Job Perks (%)')).toBeInTheDocument()
    expect(screen.getByText('Book Perks (%)')).toBeInTheDocument()
  })

  it('should display current perk values', () => {
    render(
      <PerksBonuses
        propertyPerks={10}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={5}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={7}
        setJobPerks={mockSetJobPerks}
        bookPerks={2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('7')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('should show total bonus calculation', () => {
    render(
      <PerksBonuses
        propertyPerks={10}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={5}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={7}
        setJobPerks={mockSetJobPerks}
        bookPerks={2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    // Total should be 10 + 5 + 3 + 7 + 2 = 27%
    expect(screen.getByText('Total Bonus: 27% applied to all stats')).toBeInTheDocument()
  })

  it('should call setPropertyPerks when property input changes', async () => {
    const user = userEvent.setup()
    render(
      <PerksBonuses
        propertyPerks={10}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={5}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={7}
        setJobPerks={mockSetJobPerks}
        bookPerks={2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    const propertyInput = screen.getByDisplayValue('10')
    
    await user.clear(propertyInput)
    await user.type(propertyInput, '15')
    
    expect(mockSetPropertyPerks).toHaveBeenCalled()
  })

  it('should handle decimal values', async () => {
    const user = userEvent.setup()
    render(
      <PerksBonuses
        propertyPerks={10}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={5}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={7}
        setJobPerks={mockSetJobPerks}
        bookPerks={2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    const propertyInput = screen.getByDisplayValue('10')
    
    await user.clear(propertyInput)
    await user.type(propertyInput, '12.5')
    
    expect(mockSetPropertyPerks).toHaveBeenCalled()
  })

  it('should handle empty input values', async () => {
    const user = userEvent.setup()
    render(
      <PerksBonuses
        propertyPerks={10}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={5}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={7}
        setJobPerks={mockSetJobPerks}
        bookPerks={2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    const propertyInput = screen.getByDisplayValue('10')
    
    await user.clear(propertyInput)
    
    expect(mockSetPropertyPerks).toHaveBeenCalledWith(0)
  })

  it('should have proper input types', () => {
    render(
      <PerksBonuses
        propertyPerks={10}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={5}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={7}
        setJobPerks={mockSetJobPerks}
        bookPerks={2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'number')
    })
  })

  it('should use provided grid columns function', () => {
    render(
      <PerksBonuses
        propertyPerks={10}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={5}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={7}
        setJobPerks={mockSetJobPerks}
        bookPerks={2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    expect(mockGetPerksGridColumns).toHaveBeenCalled()
  })

  it('should handle zero values correctly', () => {
    render(
      <PerksBonuses
        propertyPerks={0}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={0}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={0}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={0}
        setJobPerks={mockSetJobPerks}
        bookPerks={0}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    // PerksBonuses shows "0" for zero values (different from other components)
    const zeroInputs = screen.getAllByDisplayValue('0')
    expect(zeroInputs).toHaveLength(5)
    expect(screen.getByText('Total Bonus: 0% applied to all stats')).toBeInTheDocument()
  })

  it('should calculate total bonus correctly with mixed values', () => {
    render(
      <PerksBonuses
        propertyPerks={12.5}
        setPropertyPerks={mockSetPropertyPerks}
        educationStatSpecific={0}
        setEducationStatSpecific={mockSetEducationStatSpecific}
        educationGeneral={8.3}
        setEducationGeneral={mockSetEducationGeneral}
        jobPerks={0}
        setJobPerks={mockSetJobPerks}
        bookPerks={4.2}
        setBookPerks={mockSetBookPerks}
        getPerksGridColumns={mockGetPerksGridColumns}
      />
    )
    
    // Total should be 12.5 + 0 + 8.3 + 0 + 4.2 = 25%
    expect(screen.getByText('Total Bonus: 25% applied to all stats')).toBeInTheDocument()
  })
})
