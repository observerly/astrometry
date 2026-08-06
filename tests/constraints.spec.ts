/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constraints
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  AirmassConstraint,
  Constraint,
  type ConstraintContext,
  IsMoonDown,
  IsNight,
  MoonAltitudeConstraint,
  MoonIlluminationConstraint,
  MoonSeparationConstraint,
  SunAltitudeConstraint,
  SunAvoidanceConstraint,
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

// A baseline context for the Moon separation tests, varying the Moon's altitude, illumination and
// the Moon-target angular separation:
const moonSeparationContext = (
  separation: number,
  illumination: number,
  alt = 45
): ConstraintContext => ({
  target: { az: 0, alt: 45 },
  sun: { az: 0, alt: -90 },
  moon: { az: 0, alt },
  illumination,
  separation
})

/*****************************************************************************************************************/

describe('MoonSeparationConstraint', () => {
  it('should be defined', () => {
    expect(MoonSeparationConstraint).toBeDefined()
  })

  it('should be a soft (not required) constraint by default', () => {
    expect(new MoonSeparationConstraint().required).toBe(false)
  })

  it('should return 1 when the Moon is below the horizon, regardless of separation', () => {
    const constraint = new MoonSeparationConstraint()
    expect(constraint.score(moonSeparationContext(0, 100, -1))).toBe(1)
  })

  it('should return -1 for a full Moon coincident with the target', () => {
    const constraint = new MoonSeparationConstraint()
    expect(constraint.score(moonSeparationContext(0, 100))).toBeCloseTo(-1)
  })

  it('should return 1 for a full Moon antipodal to the target', () => {
    const constraint = new MoonSeparationConstraint()
    expect(constraint.score(moonSeparationContext(180, 100))).toBeCloseTo(1)
  })

  it('should return 1 for a dark (new) Moon regardless of separation', () => {
    const constraint = new MoonSeparationConstraint()
    expect(constraint.score(moonSeparationContext(0, 0))).toBeCloseTo(1)
  })

  it('should return 0 for a full Moon at 90° separation', () => {
    const constraint = new MoonSeparationConstraint()
    expect(constraint.score(moonSeparationContext(90, 100))).toBeCloseTo(0)
  })

  it('should weight the interference by the Moon illumination', () => {
    const constraint = new MoonSeparationConstraint()
    // A coincident Moon at 50% illumination interferes half as much as a full Moon:
    expect(constraint.score(moonSeparationContext(0, 50))).toBeCloseTo(0)
  })

  it('should honour custom separation bounds', () => {
    const constraint = new MoonSeparationConstraint({ minimum: 30, maximum: 90 })
    // At or below the minimum, a full Moon is the worst case:
    expect(constraint.score(moonSeparationContext(30, 100))).toBeCloseTo(-1)
    // At or beyond the maximum, there is no interference:
    expect(constraint.score(moonSeparationContext(90, 100))).toBeCloseTo(1)
  })

  it('should throw when a separation bound is outside [0, 180]', () => {
    expect(() => new MoonSeparationConstraint({ maximum: 200 })).toThrow()
    expect(() => new MoonSeparationConstraint({ minimum: -10 })).toThrow()
  })

  it('should throw when the maximum is not greater than the minimum', () => {
    expect(() => new MoonSeparationConstraint({ minimum: 90, maximum: 90 })).toThrow()
    expect(() => new MoonSeparationConstraint({ minimum: 120, maximum: 60 })).toThrow()
  })

  it('should not throw for valid bounds', () => {
    expect(() => new MoonSeparationConstraint()).not.toThrow()
    expect(() => new MoonSeparationConstraint({ minimum: 30, maximum: 120 })).not.toThrow()
  })

  it('should always return a value within [-1, 1]', () => {
    const constraint = new MoonSeparationConstraint()
    for (let separation = 0; separation <= 180; separation += 1) {
      const score = constraint.score(moonSeparationContext(separation, 100))
      expect(score).toBeGreaterThanOrEqual(-1)
      expect(score).toBeLessThanOrEqual(1)
    }
  })
})

/*****************************************************************************************************************/

// A baseline context for the Moon illumination tests, varying the Moon's illuminated fraction and
// the Moon's altitude:
const moonIlluminationContext = (illumination: number, alt = 45): ConstraintContext => ({
  target: { az: 0, alt: 45 },
  sun: { az: 0, alt: -90 },
  moon: { az: 0, alt },
  illumination,
  separation: 0
})

/*****************************************************************************************************************/

describe('MoonIlluminationConstraint', () => {
  it('should be defined', () => {
    expect(MoonIlluminationConstraint).toBeDefined()
  })

  it('should be a soft (not required) constraint by default', () => {
    expect(new MoonIlluminationConstraint().required).toBe(false)
  })

  it('should return 1 when the Moon is below the horizon, regardless of illumination', () => {
    const constraint = new MoonIlluminationConstraint()
    expect(constraint.score(moonIlluminationContext(100, -1))).toBe(1)
  })

  it('should return 1 for a new (dark) Moon', () => {
    const constraint = new MoonIlluminationConstraint()
    expect(constraint.score(moonIlluminationContext(0))).toBeCloseTo(1)
  })

  it('should return -1 for a full Moon', () => {
    const constraint = new MoonIlluminationConstraint()
    expect(constraint.score(moonIlluminationContext(100))).toBeCloseTo(-1)
  })

  it('should return 0 for a half-illuminated Moon', () => {
    const constraint = new MoonIlluminationConstraint()
    expect(constraint.score(moonIlluminationContext(50))).toBeCloseTo(0)
  })

  it('should honour custom illumination bounds', () => {
    const constraint = new MoonIlluminationConstraint({ minimum: 20, maximum: 80 })
    expect(constraint.score(moonIlluminationContext(20))).toBeCloseTo(1)
    expect(constraint.score(moonIlluminationContext(80))).toBeCloseTo(-1)
    expect(constraint.score(moonIlluminationContext(10))).toBeCloseTo(1)
  })

  it('should throw when an illumination bound is outside [0, 100]', () => {
    expect(() => new MoonIlluminationConstraint({ maximum: 120 })).toThrow()
    expect(() => new MoonIlluminationConstraint({ minimum: -10 })).toThrow()
  })

  it('should throw when the maximum is not greater than the minimum', () => {
    expect(() => new MoonIlluminationConstraint({ minimum: 50, maximum: 50 })).toThrow()
    expect(() => new MoonIlluminationConstraint({ minimum: 80, maximum: 20 })).toThrow()
  })

  it('should not throw for valid bounds', () => {
    expect(() => new MoonIlluminationConstraint()).not.toThrow()
    expect(() => new MoonIlluminationConstraint({ minimum: 20, maximum: 80 })).not.toThrow()
  })

  it('should always return a value within [-1, 1]', () => {
    const constraint = new MoonIlluminationConstraint()
    for (let illumination = 0; illumination <= 100; illumination += 1) {
      const score = constraint.score(moonIlluminationContext(illumination))
      expect(score).toBeGreaterThanOrEqual(-1)
      expect(score).toBeLessThanOrEqual(1)
    }
  })
})

/*****************************************************************************************************************/

describe('IsMoonDown', () => {
  it('should be defined', () => {
    expect(IsMoonDown).toBeDefined()
  })

  it('should be a Constraint', () => {
    expect(new IsMoonDown()).toBeInstanceOf(Constraint)
  })

  it('should be named "is-moon-down"', () => {
    expect(new IsMoonDown().name).toBe('is-moon-down')
  })

  it('should be a required (hard) constraint by default', () => {
    expect(new IsMoonDown().required).toBe(true)
  })

  it('should default to the horizon (0°)', () => {
    expect(new IsMoonDown().maximum).toBe(0)
  })

  it('should be satisfied when the Moon is below the horizon', () => {
    const constraint = new IsMoonDown()
    expect(constraint.score(moonAt(-1))).toBe(1)
    expect(constraint.isSatisfiedBy(moonAt(-1))).toBe(true)
  })

  it('should be satisfied at exactly the horizon', () => {
    const constraint = new IsMoonDown()
    expect(constraint.score(moonAt(0))).toBe(1)
  })

  it('should not be satisfied when the Moon is above the horizon', () => {
    const constraint = new IsMoonDown()
    expect(constraint.score(moonAt(10))).toBe(-1)
    expect(constraint.isSatisfiedBy(moonAt(10))).toBe(false)
  })

  it('should honour a custom maximum altitude', () => {
    const constraint = new IsMoonDown({ maximum: -6 })
    expect(constraint.isSatisfiedBy(moonAt(-10))).toBe(true)
    expect(constraint.isSatisfiedBy(moonAt(-3))).toBe(false)
  })

  it('should throw when the maximum is outside [-90, 90]', () => {
    expect(() => new IsMoonDown({ maximum: 120 })).toThrow()
    expect(() => new IsMoonDown({ maximum: -120 })).toThrow()
  })

  it('should throw for a non-finite maximum', () => {
    expect(() => new IsMoonDown({ maximum: Number.NaN })).toThrow()
    expect(() => new IsMoonDown({ maximum: Number.POSITIVE_INFINITY })).toThrow()
    expect(() => new IsMoonDown({ maximum: Number.NEGATIVE_INFINITY })).toThrow()
  })

  it('should not throw for valid bounds', () => {
    expect(() => new IsMoonDown()).not.toThrow()
    expect(() => new IsMoonDown({ maximum: -6 })).not.toThrow()
  })
})

/*****************************************************************************************************************/

describe('AirmassConstraint', () => {
  it('should be defined', () => {
    expect(AirmassConstraint).toBeDefined()
  })

  it('should be named "airmass"', () => {
    expect(new AirmassConstraint().name).toBe('airmass')
  })

  it('should be a required (hard) constraint by default', () => {
    expect(new AirmassConstraint().required).toBe(true)
  })

  it('should default to a minimum of 1 and a maximum of 2', () => {
    const constraint = new AirmassConstraint()
    expect(constraint.minimum).toBe(1)
    expect(constraint.maximum).toBe(2)
  })

  it('should return -1 when the target is below the horizon', () => {
    const constraint = new AirmassConstraint()
    expect(constraint.score(context(-10))).toBe(-1)
  })

  it('should return ~1 at the zenith (airmass ~1)', () => {
    const constraint = new AirmassConstraint()
    expect(constraint.score(context(90))).toBeCloseTo(1)
  })

  it('should return -1 when the airmass exceeds the maximum', () => {
    // At an altitude of 20° the airmass is ~2.9, above the default maximum of 2:
    const constraint = new AirmassConstraint()
    expect(constraint.score(context(20))).toBe(-1)
  })

  it('should increase monotonically with altitude (lower airmass scores higher)', () => {
    const constraint = new AirmassConstraint({ maximum: 5 })
    expect(constraint.score(context(80))).toBeGreaterThan(constraint.score(context(40)))
  })

  it('should honour a custom maximum airmass', () => {
    // At 20° the airmass (~2.9) is below a maximum of 3, so it is observable (not gated):
    const constraint = new AirmassConstraint({ maximum: 3 })
    expect(constraint.score(context(20))).toBeGreaterThan(-1)
  })

  it('should throw when a bound is below 1', () => {
    expect(() => new AirmassConstraint({ minimum: 0.5 })).toThrow()
    expect(() => new AirmassConstraint({ maximum: 0 })).toThrow()
  })

  it('should throw for a non-finite bound', () => {
    expect(() => new AirmassConstraint({ maximum: Number.NaN })).toThrow()
    expect(() => new AirmassConstraint({ maximum: Number.POSITIVE_INFINITY })).toThrow()
  })

  it('should throw when the maximum is not greater than the minimum', () => {
    expect(() => new AirmassConstraint({ minimum: 2, maximum: 2 })).toThrow()
    expect(() => new AirmassConstraint({ minimum: 3, maximum: 2 })).toThrow()
  })

  it('should not throw for valid bounds', () => {
    expect(() => new AirmassConstraint()).not.toThrow()
    expect(() => new AirmassConstraint({ minimum: 1, maximum: 3 })).not.toThrow()
  })

  it('should always return a value within [-1, 1]', () => {
    const constraint = new AirmassConstraint()
    for (let alt = 1; alt <= 90; alt += 1) {
      const score = constraint.score(context(alt))
      expect(score).toBeGreaterThanOrEqual(-1)
      expect(score).toBeLessThanOrEqual(1)
    }
  })
})

/*****************************************************************************************************************/

describe('Constraint weight', () => {
  it('should default to a weight of 1', () => {
    expect(new TargetAltitudeConstraint().weight).toBe(1)
    expect(new MoonSeparationConstraint().weight).toBe(1)
  })

  it('should carry the weight given', () => {
    expect(new TargetAltitudeConstraint({ weight: 2.5 }).weight).toBe(2.5)
    expect(new IsNight({ weight: 0.5 }).weight).toBe(0.5)
    expect(new AirmassConstraint({ weight: 3 }).weight).toBe(3)
  })

  it('should throw for a weight that is not finite and greater than zero', () => {
    for (const weight of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => new TargetAltitudeConstraint({ weight })).toThrow()
    }
  })
})

/*****************************************************************************************************************/

// A context in which the target and the Sun share an azimuth, so that the angular separation
// between them is the difference of their altitudes:
const sunAvoidanceContext = (separation: number): ConstraintContext => ({
  target: { az: 0, alt: separation },
  sun: { az: 0, alt: 0 },
  moon: { az: 180, alt: -90 },
  illumination: 0,
  separation: 180
})

/*****************************************************************************************************************/

describe('SunAvoidanceConstraint', () => {
  it('should be defined', () => {
    expect(SunAvoidanceConstraint).toBeDefined()
  })

  it('should be a required (hard) constraint by default', () => {
    expect(new SunAvoidanceConstraint().required).toBe(true)
  })

  it('should return -1 for a target coincident with the Sun', () => {
    expect(new SunAvoidanceConstraint().score(sunAvoidanceContext(0))).toBe(-1)
  })

  it('should return -1 at exactly the exclusion cone', () => {
    expect(new SunAvoidanceConstraint({ minimum: 45 }).score(sunAvoidanceContext(45))).toBe(-1)
  })

  it('should return 1 at and beyond the separation at which the Sun causes no interference', () => {
    const constraint = new SunAvoidanceConstraint({ minimum: 45, maximum: 90 })

    expect(constraint.score(sunAvoidanceContext(90))).toBeCloseTo(1)
    expect(constraint.score(sunAvoidanceContext(120))).toBeCloseTo(1)
    expect(constraint.score(sunAvoidanceContext(180))).toBeCloseTo(1)
  })

  it('should return 0 midway between the exclusion cone and the maximum separation', () => {
    const constraint = new SunAvoidanceConstraint({ minimum: 45, maximum: 90 })

    expect(constraint.score(sunAvoidanceContext(67.5))).toBeCloseTo(0)
  })

  it('should not be satisfied within the exclusion cone, and satisfied beyond it', () => {
    const constraint = new SunAvoidanceConstraint({ minimum: 45 })

    expect(constraint.isSatisfiedBy(sunAvoidanceContext(44.9))).toBe(false)
    expect(constraint.isSatisfiedBy(sunAvoidanceContext(45.1))).toBe(true)
  })

  it('should increase monotonically with separation, and stay within [-1, 1]', () => {
    const constraint = new SunAvoidanceConstraint()

    let previous = Number.NEGATIVE_INFINITY

    for (let separation = 0; separation <= 180; separation += 0.5) {
      const score = constraint.score(sunAvoidanceContext(separation))

      expect(score).toBeGreaterThanOrEqual(previous - 1e-12)
      expect(score).toBeGreaterThanOrEqual(-1)
      expect(score).toBeLessThanOrEqual(1)

      previous = score
    }
  })

  it('should resolve the separation in azimuth as well as in altitude', () => {
    // The target and the Sun are both on the horizon, and so their separation is the difference of
    // their azimuths, e.g., the constraint is not a comparison of altitudes:
    const constraint = new SunAvoidanceConstraint({ minimum: 45, maximum: 90 })

    expect(
      constraint.score({
        target: { az: 30, alt: 0 },
        sun: { az: 0, alt: 0 },
        moon: { az: 180, alt: -90 },
        illumination: 0,
        separation: 180
      })
    ).toBe(-1)

    expect(
      constraint.score({
        target: { az: 90, alt: 0 },
        sun: { az: 0, alt: 0 },
        moon: { az: 180, alt: -90 },
        illumination: 0,
        separation: 180
      })
    ).toBeCloseTo(1)
  })

  it('should apply the exclusion cone irrespective of the altitude of the Sun', () => {
    // An observer in space has no horizon behind which the Sun is hidden, and so a Sun below the
    // horizon of a geographic observer still excludes the target:
    const constraint = new SunAvoidanceConstraint({ minimum: 45, maximum: 90 })

    expect(
      constraint.score({
        target: { az: 0, alt: -70 },
        sun: { az: 0, alt: -90 },
        moon: { az: 180, alt: -90 },
        illumination: 0,
        separation: 180
      })
    ).toBe(-1)
  })

  it('should accept a custom exclusion cone and weight', () => {
    const constraint = new SunAvoidanceConstraint({ minimum: 85, maximum: 135, weight: 3 })

    expect(constraint.weight).toBe(3)
    expect(constraint.score(sunAvoidanceContext(84))).toBe(-1)
    expect(constraint.score(sunAvoidanceContext(135))).toBeCloseTo(1)
  })

  it('should throw for separation bounds that are out of range or inverted', () => {
    expect(() => new SunAvoidanceConstraint({ minimum: -1 })).toThrow()
    expect(() => new SunAvoidanceConstraint({ maximum: 181 })).toThrow()
    expect(() => new SunAvoidanceConstraint({ minimum: 90, maximum: 45 })).toThrow()
    expect(() => new SunAvoidanceConstraint({ weight: 0 })).toThrow()
  })
})

/*****************************************************************************************************************/
