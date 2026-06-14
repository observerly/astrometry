/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constraints
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type ConstraintContext, TargetAltitudeConstraint } from '../src'

/*****************************************************************************************************************/

// A baseline context whose only relevant field for these tests is the target's altitude:
const context = (alt: number): ConstraintContext => ({
  target: { az: 0, alt },
  sun: { az: 0, alt: -90 },
  moon: { az: 0, alt: -90 },
  illumination: 0,
  separation: 180
})

/*****************************************************************************************************************/

describe('TargetAltitudeConstraint', () => {
  it('should be defined', () => {
    expect(TargetAltitudeConstraint).toBeDefined()
  })

  it('should be a required (hard) constraint by default', () => {
    expect(new TargetAltitudeConstraint().required).toBe(true)
  })

  it('should return -1 when the target is below the minimum altitude', () => {
    const constraint = new TargetAltitudeConstraint({ minimum: 6 })
    expect(constraint.score(context(5.99))).toBe(-1)
  })

  it('should return -1 at exactly the minimum altitude', () => {
    const constraint = new TargetAltitudeConstraint({ minimum: 6 })
    expect(constraint.score(context(6))).toBeCloseTo(-1)
  })

  it('should return 1 at the maximum altitude', () => {
    const constraint = new TargetAltitudeConstraint({ minimum: 6, maximum: 90 })
    expect(constraint.score(context(90))).toBeCloseTo(1)
  })

  it('should return 0 at the midpoint between the minimum and maximum altitude', () => {
    const constraint = new TargetAltitudeConstraint({ minimum: 6, maximum: 90 })
    expect(constraint.score(context(48))).toBeCloseTo(0)
  })

  it('should clamp the score to 1 for targets above the maximum altitude', () => {
    const constraint = new TargetAltitudeConstraint({ minimum: 6, maximum: 60 })
    expect(constraint.score(context(80))).toBe(1)
  })

  it('should honour a custom minimum altitude', () => {
    const constraint = new TargetAltitudeConstraint({ minimum: 30 })
    expect(constraint.score(context(29.99))).toBe(-1)
    expect(constraint.isSatisfiedBy(context(30.01))).toBe(true)
  })

  it('should report isSatisfiedBy as false below, and true above, the minimum altitude', () => {
    const constraint = new TargetAltitudeConstraint({ minimum: 20 })
    expect(constraint.isSatisfiedBy(context(10))).toBe(false)
    expect(constraint.isSatisfiedBy(context(45))).toBe(true)
  })

  it('should always return a value within [-1, 1]', () => {
    const constraint = new TargetAltitudeConstraint()
    for (let alt = -90; alt <= 90; alt += 1) {
      const score = constraint.score(context(alt))
      expect(score).toBeGreaterThanOrEqual(-1)
      expect(score).toBeLessThanOrEqual(1)
    }
  })
})

/*****************************************************************************************************************/
