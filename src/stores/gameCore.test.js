import { describe, expect, it } from 'vitest'
import {
  getCategorySpend,
  getComparisonFacts,
  getFeaturedMission,
  getMilestoneState,
  getSpendingTitle,
  getSurpriseEvent,
  getUnlockedAchievements,
} from './gameCore'

const products = [
  { id: 'phone', name: '旗舰手机', category: '电子产品', price: 1_000 },
  { id: 'jet', name: '私人飞机', category: '私人飞机', price: 70_000_000 },
  { id: 'club', name: 'NBA 球队', category: '体育俱乐部', price: 3_500_000_000 },
  { id: 'rocket', name: '火箭项目', category: '火箭航天', price: 30_000_000_000 },
]

const state = {
  products,
  initialBalance: 1_100_000_000_000,
  quantities: {
    phone: 12,
    jet: 2,
    club: 1,
    rocket: 1,
  },
}

describe('game core', () => {
  it('unlocks achievements from spending behavior', () => {
    const achievements = getUnlockedAchievements(state)

    expect(achievements.map((item) => item.id)).toEqual(
      expect.arrayContaining(['first-buy', 'bulk-buyer', 'aviation-baron', 'club-owner']),
    )
  })

  it('tracks missions, milestones, titles, comparisons, categories, and surprise events', () => {
    expect(getFeaturedMission(state).title).toContain('美术馆')
    expect(getMilestoneState(state).next.label).toContain('1000 亿')
    expect(getSpendingTitle(state).label).toBe('轨道级玩家')
    expect(getComparisonFacts(state)[0].value).toBeGreaterThan(0)
    expect(getCategorySpend(state)[0]).toMatchObject({ category: '火箭航天' })
    expect(getSurpriseEvent(7)?.title).toContain('购物热度')
  })
})
