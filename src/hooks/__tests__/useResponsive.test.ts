import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useResponsive } from '../useResponsive'

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

describe('useResponsive', () => {
  beforeEach(() => {
    // Reset window width
    window.innerWidth = 1024
    vi.clearAllMocks()
  })

  it('should return desktop screen size for large screens', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.screenSize).toBe('desktop')
  })

  it('should return tablet screen size for medium screens', () => {
    window.innerWidth = 600
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.screenSize).toBe('tablet')
  })

  it('should return mobile screen size for small screens', () => {
    window.innerWidth = 400
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.screenSize).toBe('mobile')
  })

  it('should update screen size on window resize', () => {
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.screenSize).toBe('desktop')
    
    // Simulate window resize
    act(() => {
      window.innerWidth = 400
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current.screenSize).toBe('mobile')
  })

  it('should return correct gym grid columns for different screen sizes', () => {
    // Desktop
    window.innerWidth = 1024
    const { result: desktopResult } = renderHook(() => useResponsive())
    expect(desktopResult.current.getGymGridColumns()).toBe('repeat(16, 1fr)')
    
    // Tablet
    window.innerWidth = 600
    const { result: tabletResult } = renderHook(() => useResponsive())
    expect(tabletResult.current.getGymGridColumns()).toBe('repeat(8, 1fr)')
    
    // Mobile
    window.innerWidth = 400
    const { result: mobileResult } = renderHook(() => useResponsive())
    expect(mobileResult.current.getGymGridColumns()).toBe('repeat(4, 1fr)')
  })

  it('should return correct stat grid columns for different screen sizes', () => {
    // Desktop
    window.innerWidth = 1024
    const { result: desktopResult } = renderHook(() => useResponsive())
    expect(desktopResult.current.getStatGridColumns()).toBe('repeat(4, 1fr)')
    
    // Mobile
    window.innerWidth = 400
    const { result: mobileResult } = renderHook(() => useResponsive())
    expect(mobileResult.current.getStatGridColumns()).toBe('repeat(2, 1fr)')
  })

  it('should return correct perks grid columns for different screen sizes', () => {
    // Desktop
    window.innerWidth = 1024
    const { result: desktopResult } = renderHook(() => useResponsive())
    expect(desktopResult.current.getPerksGridColumns()).toBe('repeat(5, 1fr)')
    
    // Tablet
    window.innerWidth = 600
    const { result: tabletResult } = renderHook(() => useResponsive())
    expect(tabletResult.current.getPerksGridColumns()).toBe('repeat(3, 1fr)')
    
    // Mobile
    window.innerWidth = 400
    const { result: mobileResult } = renderHook(() => useResponsive())
    expect(mobileResult.current.getPerksGridColumns()).toBe('repeat(2, 1fr)')
  })

  it('should return correct settings grid columns for different screen sizes', () => {
    // Desktop
    window.innerWidth = 1024
    const { result: desktopResult } = renderHook(() => useResponsive())
    expect(desktopResult.current.getSettingsGridColumns()).toBe('repeat(3, 1fr)')
    
    // Mobile
    window.innerWidth = 400
    const { result: mobileResult } = renderHook(() => useResponsive())
    expect(mobileResult.current.getSettingsGridColumns()).toBe('repeat(1, 1fr)')
  })

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    const { unmount } = renderHook(() => useResponsive())
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })
})
