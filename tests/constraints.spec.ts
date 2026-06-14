/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constraints
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  Constraint,
  type ConstraintContext,
  IsNight,
  MoonAltitudeConstraint,
  SunAltitudeConstraint,
  TargetAltitudeConstraint
} from '../src'

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

  it('should throw when an altitude bound is outside [-90, 90]', () => {
    expect(() => new TargetAltitudeConstraint({ maximum: 120 })).toThrow()
    expect(() => new TargetAltitudeConstraint({ minimum: -100 })).toThrow()
  })

  it('should throw when the maximum is not greater than the minimum', () => {
    expect(() => new TargetAltitudeConstraint({ minimum: 50, maximum: 50 })).toThrow()
    expect(() => new TargetAltitudeConstraint({ minimum: 60, maximum: 30 })).toThrow()
  })

  it('should not throw for valid bounds', () => {
    expect(() => new TargetAltitudeConstraint()).not.toThrow()
    expect(() => new TargetAltitudeConstraint({ minimum: 20, maximum: 80 })).not.toThrow()
  })
})

/*****************************************************************************************************************/

// A baseline context whose only relevant field for these tests is the Sun's altitude:
const sunAt = (alt: number): ConstraintContext => ({
  target: { az: 0, alt: 45 },
  sun: { az: 0, alt },
  moon: { az: 0, alt: -90 },
  illumination: 0,
  separation: 180
})

/*****************************************************************************************************************/

describe('SunAltitudeConstraint', () => {
  it('should be defined', () => {
    expect(SunAltitudeConstraint).toBeDefined()
  })

  it('should be a required (hard) constraint by default', () => {
    expect(new SunAltitudeConstraint().required).toBe(true)
  })

  it('should return -1 when the Sun is above the maximum altitude', () => {
    const constraint = new SunAltitudeConstraint({ maximum: -18 })
    expect(constraint.score(sunAt(-17.99))).toBe(-1)
  })

  it('should return -1 at exactly the maximum altitude', () => {
    const constraint = new SunAltitudeConstraint({ maximum: -18 })
    expect(constraint.score(sunAt(-18))).toBeCloseTo(-1)
  })

  it('should return 1 at the minimum altitude', () => {
    const constraint = new SunAltitudeConstraint({ maximum: -18, minimum: -90 })
    expect(constraint.score(sunAt(-90))).toBeCloseTo(1)
  })

  it('should return 0 at the midpoint between the maximum and minimum altitude', () => {
    const constraint = new SunAltitudeConstraint({ maximum: -18, minimum: -90 })
    expect(constraint.score(sunAt(-54))).toBeCloseTo(0)
  })

  it('should clamp the score to 1 for a Sun below the minimum altitude', () => {
    const constraint = new SunAltitudeConstraint({ maximum: -18, minimum: -72 })
    expect(constraint.score(sunAt(-90))).toBe(1)
  })

  it('should honour a custom maximum altitude', () => {
    const constraint = new SunAltitudeConstraint({ maximum: -12 })
    expect(constraint.score(sunAt(-11.99))).toBe(-1)
    expect(constraint.isSatisfiedBy(sunAt(-13))).toBe(true)
  })

  it('should report isSatisfiedBy as false above, and true below, the maximum altitude', () => {
    const constraint = new SunAltitudeConstraint({ maximum: -18 })
    expect(constraint.isSatisfiedBy(sunAt(-10))).toBe(false)
    expect(constraint.isSatisfiedBy(sunAt(-45))).toBe(true)
  })

  it('should always return a value within [-1, 1]', () => {
    const constraint = new SunAltitudeConstraint()
    for (let alt = -90; alt <= 90; alt += 1) {
      const score = constraint.score(sunAt(alt))
      expect(score).toBeGreaterThanOrEqual(-1)
      expect(score).toBeLessThanOrEqual(1)
    }
  })

  it('should throw when an altitude bound is outside [-90, 90]', () => {
    expect(() => new SunAltitudeConstraint({ maximum: 120 })).toThrow()
    expect(() => new SunAltitudeConstraint({ minimum: -100 })).toThrow()
  })

  it('should throw when the maximum is not greater than the minimum', () => {
    expect(() => new SunAltitudeConstraint({ maximum: -18, minimum: -18 })).toThrow()
    expect(() => new SunAltitudeConstraint({ maximum: -90, minimum: -18 })).toThrow()
  })

  it('should not throw for valid bounds', () => {
    expect(() => new SunAltitudeConstraint()).not.toThrow()
    expect(() => new SunAltitudeConstraint({ maximum: -12, minimum: -90 })).not.toThrow()
  })
})

/*****************************************************************************************************************/

describe('IsNight', () => {
  it('should be defined', () => {
    expect(IsNight).toBeDefined()
  })

  it('should be a Constraint', () => {
    expect(new IsNight()).toBeInstanceOf(Constraint)
  })

  it('should be named "is-night"', () => {
    expect(new IsNight().name).toBe('is-night')
  })

  it('should default to astronomical night (Sun at or below -18°)', () => {
    const constraint = new IsNight()
    expect(constraint.maximum).toBe(-18)
    expect(constraint.minimum).toBe(-90)
  })

  it('should be a required (hard) constraint by default', () => {
    expect(new IsNight().required).toBe(true)
  })

  it('should not be satisfied during twilight (Sun above -18°)', () => {
    const constraint = new IsNight()
    expect(constraint.score(sunAt(-17))).toBe(-1)
    expect(constraint.isSatisfiedBy(sunAt(-17))).toBe(false)
  })

  it('should be satisfied at astronomical night (Sun below -18°)', () => {
    const constraint = new IsNight()
    expect(constraint.isSatisfiedBy(sunAt(-19))).toBe(true)
    expect(constraint.score(sunAt(-90))).toBeCloseTo(1)
  })

  it('should accept an overridden darkness threshold', () => {
    const constraint = new IsNight({ maximum: -12 })
    expect(constraint.maximum).toBe(-12)
    expect(constraint.isSatisfiedBy(sunAt(-13))).toBe(true)
    expect(constraint.score(sunAt(-11))).toBe(-1)
  })
})

/*****************************************************************************************************************/

// A baseline context whose only relevant field for these tests is the Moon's altitude:
const moonAt = (alt: number): ConstraintContext => ({
  target: { az: 0, alt: 45 },
  sun: { az: 0, alt: -90 },
  moon: { az: 0, alt },
  illumination: 100,
  separation: 0
})

/*****************************************************************************************************************/

describe('MoonAltitudeConstraint', () => {
  it('should be defined', () => {
    expect(MoonAltitudeConstraint).toBeDefined()
  })

  it('should be a soft (not required) constraint by default', () => {
    expect(new MoonAltitudeConstraint().required).toBe(false)
  })

  it('should return 1 when the Moon is below the horizon', () => {
    const constraint = new MoonAltitudeConstraint()
    expect(constraint.score(moonAt(-10))).toBe(1)
  })

  it('should return 1 at exactly the minimum altitude (the horizon)', () => {
    const constraint = new MoonAltitudeConstraint()
    expect(constraint.score(moonAt(0))).toBe(1)
  })

  it('should return -1 at the maximum altitude (the zenith)', () => {
    const constraint = new MoonAltitudeConstraint()
    expect(constraint.score(moonAt(90))).toBeCloseTo(-1)
  })

  it('should return 0 at the midpoint between the minimum and maximum altitude', () => {
    const constraint = new MoonAltitudeConstraint()
    expect(constraint.score(moonAt(45))).toBeCloseTo(0)
  })

  it('should clamp the score to -1 for a Moon above the maximum altitude', () => {
    const constraint = new MoonAltitudeConstraint({ minimum: 0, maximum: 60 })
    expect(constraint.score(moonAt(80))).toBe(-1)
  })

  it('should honour a custom minimum altitude', () => {
    const constraint = new MoonAltitudeConstraint({ minimum: 10 })
    expect(constraint.score(moonAt(5))).toBe(1)
    expect(constraint.score(moonAt(10))).toBe(1)
  })

  it('should always return a value within [-1, 1]', () => {
    const constraint = new MoonAltitudeConstraint()
    for (let alt = -90; alt <= 90; alt += 1) {
      const score = constraint.score(moonAt(alt))
      expect(score).toBeGreaterThanOrEqual(-1)
      expect(score).toBeLessThanOrEqual(1)
    }
  })

  it('should throw when an altitude bound is outside [-90, 90]', () => {
    expect(() => new MoonAltitudeConstraint({ maximum: 120 })).toThrow()
    expect(() => new MoonAltitudeConstraint({ minimum: -100 })).toThrow()
  })

  it('should throw when the maximum is not greater than the minimum', () => {
    expect(() => new MoonAltitudeConstraint({ minimum: 45, maximum: 45 })).toThrow()
    expect(() => new MoonAltitudeConstraint({ minimum: 60, maximum: 30 })).toThrow()
  })

  it('should not throw for valid bounds', () => {
    expect(() => new MoonAltitudeConstraint()).not.toThrow()
    expect(() => new MoonAltitudeConstraint({ minimum: 0, maximum: 60 })).not.toThrow()
  })
})

/*****************************************************************************************************************/
