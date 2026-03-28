import { describe, it, expect } from 'vitest'
import { dueDateStatus } from '@/lib/utils/dates'

describe('dueDateStatus', () => {
  it('returns normal for null', () => {
    expect(dueDateStatus(null)).toBe('normal')
  })

  it('returns near for today', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(dueDateStatus(today)).toBe('near')
  })

  it('returns overdue for yesterday', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    expect(dueDateStatus(d.toISOString().slice(0, 10))).toBe('overdue')
  })

  it('returns normal for future date', () => {
    const d = new Date()
    d.setDate(d.getDate() + 5)
    expect(dueDateStatus(d.toISOString().slice(0, 10))).toBe('normal')
  })
})
