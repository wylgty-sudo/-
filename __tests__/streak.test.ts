import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateStreak } from '@/lib/utils/streak'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-28'))
})
afterEach(() => vi.useRealTimers())

describe('calculateStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('returns 1 when only today is checked', () => {
    expect(calculateStreak(['2026-03-28'])).toBe(1)
  })

  it('returns 3 for 3 consecutive days ending today', () => {
    expect(calculateStreak(['2026-03-26', '2026-03-27', '2026-03-28'])).toBe(3)
  })

  it('breaks streak on gap', () => {
    expect(calculateStreak(['2026-03-24', '2026-03-26', '2026-03-27', '2026-03-28'])).toBe(3)
  })

  it('counts streak ending yesterday', () => {
    expect(calculateStreak(['2026-03-26', '2026-03-27'])).toBe(2)
  })

  it('returns 0 when last check was 2 days ago', () => {
    expect(calculateStreak(['2026-03-26'])).toBe(0)
  })
})
