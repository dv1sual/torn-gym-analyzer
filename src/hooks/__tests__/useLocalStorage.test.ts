import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should return default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    expect(result.current[0]).toBe('default')
  })

  it('should return stored value from localStorage', () => {
    // Mock localStorage.getItem to return the stored value
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    expect(result.current[0]).toBe('stored-value')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('updated-value')
    })
    
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('updated-value'))
    expect(result.current[0]).toBe('updated-value')
  })

  it('should handle JSON parsing errors gracefully', () => {
    // Mock localStorage.getItem to return invalid JSON
    localStorage.getItem = vi.fn().mockReturnValue('invalid-json')
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    expect(result.current[0]).toBe('default')
  })

  it('should work with complex objects', () => {
    const complexObject = { str: 100, def: 200, spd: 150, dex: 175 }
    
    const { result } = renderHook(() => useLocalStorage('stats', { str: 0, def: 0, spd: 0, dex: 0 }))
    
    act(() => {
      result.current[1](complexObject)
    })
    
    expect(localStorage.setItem).toHaveBeenCalledWith('stats', JSON.stringify(complexObject))
    expect(result.current[0]).toEqual(complexObject)
  })

  it('should handle localStorage setItem errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error saving to localStorage for key "test-key":',
      expect.any(Error)
    )
    
    consoleSpy.mockRestore()
  })
})
