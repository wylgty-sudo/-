import { describe, it, expect } from 'vitest'
import { getItemsToRollover } from '@/lib/utils/rollover'

const today = new Date('2026-03-28')
const yesterday = '2026-03-27'
const twoDaysAgo = '2026-03-26'
const todayStr = '2026-03-28'

describe('getItemsToRollover', () => {
  it('returns items with display_date before today', () => {
    const items = [
      { id: '1', display_date: yesterday, created_at: `${twoDaysAgo}T00:00:00Z` },
      { id: '2', display_date: todayStr, created_at: `${todayStr}T00:00:00Z` },
    ]
    expect(getItemsToRollover(items, today)).toEqual(['1'])
  })

  it('falls back to created_at date when display_date is null', () => {
    const items = [
      { id: '3', display_date: null, created_at: `${yesterday}T10:00:00Z` },
      { id: '4', display_date: null, created_at: `${todayStr}T10:00:00Z` },
    ]
    expect(getItemsToRollover(items, today)).toEqual(['3'])
  })

  it('returns empty array when nothing needs rollover', () => {
    const items = [
      { id: '5', display_date: todayStr, created_at: `${todayStr}T00:00:00Z` },
    ]
    expect(getItemsToRollover(items, today)).toEqual([])
  })
})
