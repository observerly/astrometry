/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/quality
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  Constraint,
  type ConstraintContext,
  type ConstraintScore,
  type EquatorialCoordinate,
  getObservationalQuality
} from '../src'

/*****************************************************************************************************************/

// For testing we fix the datetime, and the observer's location to Mauna Kea, Hawaii, US:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

const observer = { latitude: 19.820611, longitude: -155.468094 }

const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

/*****************************************************************************************************************/

// A constraint that ignores the context and always returns a fixed score, used to test aggregation
// and gating deterministically (independent of any ephemeris):
class FixedConstraint extends Constraint {
  public readonly name = 'fixed'

  public value: ConstraintScore

  constructor(value: ConstraintScore, required = false) {
    super()
    this.value = value
    this.required = required
  }

  public score(_context: ConstraintContext): ConstraintScore {
    return this.value
  }
}

/*****************************************************************************************************************/

describe('getObservationalQuality', () => {
  it('should be defined', () => {
    expect(getObservationalQuality).toBeDefined()
  })

  it('should return the mean of the constraint scores', () => {
    const quality = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1),
      new FixedConstraint(0),
      new FixedConstraint(-1)
    ])

    expect(quality).toBeCloseTo(0)
  })

  it('should return -1 when a required constraint fails', () => {
    const quality = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1),
      new FixedConstraint(-1, true)
    ])

    expect(quality).toBe(-1)
  })

  it('should not gate on a failing constraint that is not required', () => {
    const quality = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1),
      new FixedConstraint(-1, false)
    ])

    expect(quality).toBeCloseTo(0)
  })

  it('should return -1 when no constraints are supplied', () => {
    expect(getObservationalQuality(datetime, observer, betelgeuse, [])).toBe(-1)
  })

  it('should never return a value outside of [-1, 1] for the default constraints', () => {
    const quality = getObservationalQuality(datetime, observer, betelgeuse)
    expect(quality).toBeGreaterThanOrEqual(-1)
    expect(quality).toBeLessThanOrEqual(1)
  })

  it('should return a value within [-1, 1] for an arbitrary observation', () => {
    const quality = getObservationalQuality(new Date(), { latitude: 0, longitude: 0 }, { ra: 0, dec: 0 })
    expect(quality).toBeGreaterThanOrEqual(-1)
    expect(quality).toBeLessThanOrEqual(1)
  })
})

/*****************************************************************************************************************/
