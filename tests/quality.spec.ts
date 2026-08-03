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
  convertEquatorialToHorizontal,
  type EquatorialCoordinate,
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForNutation,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getCorrectionToHorizontalForRefraction,
  getNormalisedSphericalCoordinate,
  getObservationalQuality,
  getObservationalQualityRanking,
  getObservationalQualityWindows,
  TargetAltitudeConstraint
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

  constructor(value: ConstraintScore, required = false, weight = 1) {
    super(weight)
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
    const { quality, observable } = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1),
      new FixedConstraint(0),
      new FixedConstraint(-1)
    ])

    expect(quality).toBeCloseTo(0)
    expect(observable).toBe(true)
  })

  it('should return a quality of -1 when a required constraint fails', () => {
    const { quality, observable } = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1),
      new FixedConstraint(-1, true)
    ])

    expect(quality).toBe(-1)
    expect(observable).toBe(false)
  })

  it('should not gate on a failing constraint that is not required', () => {
    const { quality, observable } = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1),
      new FixedConstraint(-1, false)
    ])

    expect(quality).toBeCloseTo(0)
    expect(observable).toBe(true)
  })

  it('should identify the constraint that makes the observation unobservable', () => {
    const { scores } = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1),
      new FixedConstraint(-1, true)
    ])

    // The evaluations are returned in the order the constraints were given:
    expect(scores).toEqual([
      { name: 'fixed', score: 1, required: false, satisfied: true, weight: 1 },
      { name: 'fixed', score: -1, required: true, satisfied: false, weight: 1 }
    ])

    // The failing hard constraint is identifiable from the evaluations alone:
    const culprits = scores.filter(({ required, satisfied }) => required && !satisfied)
    expect(culprits).toHaveLength(1)
  })

  it('should return the weighted mean of the constraint scores', () => {
    // The score of 1, at three times the weight of the score of -1, e.g., (3 - 1) / 4:
    const { quality } = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1, false, 3),
      new FixedConstraint(-1, false, 1)
    ])

    expect(quality).toBeCloseTo(0.5)
  })

  it('should return the same quality as the unweighted mean for equal weights', () => {
    const constraints = [new FixedConstraint(0.75), new FixedConstraint(0.25), new FixedConstraint(-0.5)]

    const { quality } = getObservationalQuality(datetime, observer, betelgeuse, constraints)

    expect(quality).toBeCloseTo((0.75 + 0.25 - 0.5) / 3)
  })

  it('should gate on a failing required constraint whatever its weight', () => {
    // The weight of a constraint scales its contribution to the mean, and not its gating:
    const { quality, observable } = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(1, false, 1000),
      new FixedConstraint(-1, true, 0.001)
    ])

    expect(quality).toBe(-1)
    expect(observable).toBe(false)
  })

  it('should return an evaluation for every constraint even when the observation is unobservable', () => {
    const { scores } = getObservationalQuality(datetime, observer, betelgeuse, [
      new FixedConstraint(-1, true),
      new FixedConstraint(0.5),
      new FixedConstraint(0.25)
    ])

    expect(scores).toHaveLength(3)
    expect(scores[1].score).toBe(0.5)
    expect(scores[2].score).toBe(0.25)
  })

  it('should return an unobservable quality when no constraints are supplied', () => {
    const { quality, observable, scores } = getObservationalQuality(datetime, observer, betelgeuse, [])

    expect(quality).toBe(-1)
    expect(observable).toBe(false)
    expect(scores).toEqual([])
  })

  it('should return the resolved context the constraints were evaluated against', () => {
    const { context } = getObservationalQuality(datetime, observer, betelgeuse)

    // The context carries the horizontal coordinates of the target, the Sun and the Moon, the
    // Moon's illuminated fraction, and the Moon-target angular separation:
    for (const coordinate of [context.target, context.sun, context.moon]) {
      expect(coordinate.alt).toBeGreaterThanOrEqual(-90)
      expect(coordinate.alt).toBeLessThanOrEqual(90)
      expect(coordinate.az).toBeGreaterThanOrEqual(0)
      expect(coordinate.az).toBeLessThan(360)
    }

    expect(context.illumination).toBeGreaterThanOrEqual(0)
    expect(context.illumination).toBeLessThanOrEqual(100)

    expect(context.separation).toBeGreaterThanOrEqual(0)
    expect(context.separation).toBeLessThanOrEqual(180)
  })

  it('should never return a quality outside of [-1, 1] for the default constraints', () => {
    const { quality } = getObservationalQuality(datetime, observer, betelgeuse)
    expect(quality).toBeGreaterThanOrEqual(-1)
    expect(quality).toBeLessThanOrEqual(1)
  })

  it('should return a quality within [-1, 1] for an arbitrary observation', () => {
    const { quality } = getObservationalQuality(new Date(), { latitude: 0, longitude: 0 }, { ra: 0, dec: 0 })
    expect(quality).toBeGreaterThanOrEqual(-1)
    expect(quality).toBeLessThanOrEqual(1)
  })
})

/*****************************************************************************************************************/

describe('getObservationalQuality for a target whose corrected declination crosses the pole', () => {
  it('should resolve the context from the same point on the celestial sphere', () => {
    // The summed corrections carry this target across the north celestial pole for the datetime:
    const target: EquatorialCoordinate = { ra: 0, dec: 89.91108342 }

    const when = new Date('2015-12-22T00:00:00.000+00:00')

    const { context } = getObservationalQuality(when, observer, target)

    // The corrected coordinate, normalised as a pair, resolved from the same corrections:
    const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(when, target)

    const aberration = getCorrectionToEquatorialForAnnualAberration(when, target)

    const nutation = getCorrectionToEquatorialForNutation(when, target)

    const { θ: dec, φ: ra } = getNormalisedSphericalCoordinate({
      θ: target.dec + precession.dec + aberration.dec + nutation.dec,
      φ: target.ra + precession.ra + aberration.ra + nutation.ra
    })

    const expected = getCorrectionToHorizontalForRefraction(
      convertEquatorialToHorizontal(when, observer, { ra, dec })
    )

    expect(context.target.alt).toBeCloseTo(expected.alt, 9)
    expect(context.target.az).toBeCloseTo(expected.az, 9)
  })
})

/*****************************************************************************************************************/

describe('getObservationalQualityWindows', () => {
  // A day-long interval, sampled coarsely to keep the resolution inexpensive:
  const interval = {
    from: new Date('2021-05-14T00:00:00.000+00:00'),
    to: new Date('2021-05-15T00:00:00.000+00:00')
  }

  it('should be defined', () => {
    expect(getObservationalQualityWindows).toBeDefined()
  })

  it('should return a single window spanning the interval when every sample is observable', () => {
    const windows = getObservationalQualityWindows(interval, observer, betelgeuse, [
      new FixedConstraint(0.5, true)
    ])

    expect(windows).toHaveLength(1)

    expect(windows[0].interval.from).toEqual(interval.from)
    expect(windows[0].interval.to).toEqual(interval.to)
    expect(windows[0].quality).toBeCloseTo(0.5)
  })

  it('should return no windows when no sample is observable', () => {
    const windows = getObservationalQualityWindows(interval, observer, betelgeuse, [
      new FixedConstraint(-1, true)
    ])

    expect(windows).toEqual([])
  })

  it('should return the windows over which the target is above the minimum altitude', () => {
    // Betelgeuse is above 30° at the start of the day for the observer, sets below it during the
    // day, and rises above it again towards the end of it:
    const windows = getObservationalQualityWindows(
      interval,
      observer,
      betelgeuse,
      [new TargetAltitudeConstraint({ minimum: 30 })],
      { stepSeconds: 300 }
    )

    expect(windows).toHaveLength(2)

    // The first window opens at the start of the interval, as the target is observable there:
    expect(windows[0].interval.from).toEqual(interval.from)

    // The last window is still open at the end of the interval, and so it closes at the end of it:
    expect(windows[1].interval.to).toEqual(interval.to)
  })

  it('should return windows that are chronological, non-overlapping and within the interval', () => {
    const windows = getObservationalQualityWindows(interval, observer, betelgeuse, undefined, {
      stepSeconds: 300
    })

    for (let i = 0; i < windows.length; i++) {
      const { interval: window, quality } = windows[i]

      expect(window.from.getTime()).toBeGreaterThanOrEqual(interval.from.getTime())
      expect(window.to.getTime()).toBeLessThanOrEqual(interval.to.getTime())
      expect(window.from.getTime()).toBeLessThan(window.to.getTime())

      expect(quality).toBeGreaterThanOrEqual(-1)
      expect(quality).toBeLessThanOrEqual(1)

      if (i > 0) {
        expect(window.from.getTime()).toBeGreaterThanOrEqual(windows[i - 1].interval.to.getTime())
      }
    }
  })

  it('should be observable at every sample within each window', () => {
    const stepSeconds = 300

    const windows = getObservationalQualityWindows(interval, observer, betelgeuse, undefined, {
      stepSeconds
    })

    for (const { interval: window } of windows) {
      for (let when = window.from.getTime(); when < window.to.getTime(); when += stepSeconds * 1000) {
        expect(getObservationalQuality(new Date(when), observer, betelgeuse).observable).toBe(true)
      }
    }
  })

  it('should not share a Date reference with the interval given', () => {
    const from = new Date('2021-05-14T00:00:00.000+00:00')

    const to = new Date('2021-05-15T00:00:00.000+00:00')

    const windows = getObservationalQualityWindows({ from, to }, observer, betelgeuse, [
      new FixedConstraint(1)
    ])

    expect(windows).toHaveLength(1)

    // Mutating the returned window must not mutate the interval given by the caller:
    windows[0].interval.to.setUTCFullYear(1999)
    windows[0].interval.from.setUTCFullYear(1999)

    expect(from).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
    expect(to).toEqual(new Date('2021-05-15T00:00:00.000+00:00'))
  })

  it('should not modify the interval given', () => {
    getObservationalQualityWindows(interval, observer, betelgeuse, [new FixedConstraint(1)], {
      stepSeconds: 300
    })

    expect(interval.from).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
    expect(interval.to).toEqual(new Date('2021-05-15T00:00:00.000+00:00'))
  })

  it('should not sample the end of the interval, e.g., the windows are half-open', () => {
    // A constraint that counts its evaluations, e.g., one per sampled instant:
    class CountingConstraint extends FixedConstraint {
      public evaluations = 0

      public score(context: ConstraintContext): ConstraintScore {
        this.evaluations += 1
        return super.score(context)
      }
    }

    const constraint = new CountingConstraint(1)

    // An hour, sampled every ten minutes, e.g., at 00, 10, 20, 30, 40 and 50 minutes past:
    const windows = getObservationalQualityWindows(
      {
        from: new Date('2021-05-14T00:00:00.000+00:00'),
        to: new Date('2021-05-14T01:00:00.000+00:00')
      },
      observer,
      betelgeuse,
      [constraint],
      { stepSeconds: 600 }
    )

    expect(constraint.evaluations).toBe(6)

    // The window that is still open at the end of the interval closes at it:
    expect(windows).toHaveLength(1)
    expect(windows[0].interval.to).toEqual(new Date('2021-05-14T01:00:00.000+00:00'))
  })

  it('should return no windows for an interval of a single instant', () => {
    // An interval of no extent has no half-open sample within it, and so it has no windows:
    const instant = new Date('2021-05-14T00:00:00.000+00:00')

    expect(
      getObservationalQualityWindows({ from: instant, to: instant }, observer, betelgeuse, [
        new FixedConstraint(1)
      ])
    ).toEqual([])
  })

  it('should throw for a step that is not greater than zero', () => {
    for (const stepSeconds of [0, -60, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        getObservationalQualityWindows(interval, observer, betelgeuse, undefined, { stepSeconds })
      ).toThrow()
    }
  })
})

/*****************************************************************************************************************/

describe('getObservationalQualityRanking', () => {
  // Targets of differing altitude for the observer at the datetime under test:
  const targets = [
    { name: 'Spica', ra: 201.2983, dec: -11.1614 },
    { name: 'Betelgeuse', ra: 88.7929583, dec: 7.4070639 },
    { name: 'Arcturus', ra: 213.9153, dec: 19.182409 }
  ]

  it('should be defined', () => {
    expect(getObservationalQualityRanking).toBeDefined()
  })

  it('should return a rank for every target given', () => {
    const ranking = getObservationalQualityRanking(datetime, observer, targets, [
      new TargetAltitudeConstraint({ minimum: 6 })
    ])

    expect(ranking).toHaveLength(targets.length)
  })

  it('should order the ranking by quality, from the best to the worst', () => {
    const ranking = getObservationalQualityRanking(datetime, observer, targets, [
      new TargetAltitudeConstraint({ minimum: 6 })
    ])

    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i].quality).toBeLessThanOrEqual(ranking[i - 1].quality)
    }
  })

  it('should resolve the same quality for each target as getObservationalQuality', () => {
    const ranking = getObservationalQualityRanking(datetime, observer, targets, [
      new TargetAltitudeConstraint({ minimum: 6 })
    ])

    for (const rank of ranking) {
      const { quality, observable } = getObservationalQuality(datetime, observer, rank.target, [
        new TargetAltitudeConstraint({ minimum: 6 })
      ])

      expect(rank.quality).toBe(quality)
      expect(rank.observable).toBe(observable)
    }
  })

  it('should rank an unobservable target below every observable target', () => {
    const ranking = getObservationalQualityRanking(datetime, observer, targets, [
      new TargetAltitudeConstraint({ minimum: 6 })
    ])

    const unobservable = ranking.findIndex(({ observable }) => !observable)

    if (unobservable !== -1) {
      for (const rank of ranking.slice(unobservable)) {
        expect(rank.observable).toBe(false)
      }
    }
  })

  it('should rank an observable target above an unobservable target of equal quality', () => {
    // A required constraint that is satisfied only when the target is above the horizon:
    class RequiredAboveHorizon extends Constraint {
      public readonly name = 'required-above-horizon'

      public required = true

      public score(context: ConstraintContext): ConstraintScore {
        return context.target.alt > 0 ? 1 : -1
      }
    }

    // Betelgeuse is above the horizon for the observer at the datetime, and the southern target
    // is below it. The soft constraint, at a weight that swamps the required one, resolves a
    // quality of exactly -1 for the observable target, e.g., it ties the unobservable target:
    const above = { name: 'above', ra: 88.7929583, dec: 7.4070639 }

    const below = { name: 'below', ra: 88.7929583, dec: -80 }

    const ranking = getObservationalQualityRanking(datetime, observer, [below, above], [
      new FixedConstraint(-1, false, 1e16),
      new RequiredAboveHorizon()
    ])

    expect(ranking[0].quality).toBe(-1)
    expect(ranking[1].quality).toBe(-1)

    // The observable target ranks first, whatever the order the targets were given in:
    expect(ranking[0].target.name).toBe('above')
    expect(ranking[0].observable).toBe(true)

    expect(ranking[1].target.name).toBe('below')
    expect(ranking[1].observable).toBe(false)
  })

  it('should retain the order given for targets of equal quality', () => {
    const equal = [targets[0], targets[1], targets[2]]

    const ranking = getObservationalQualityRanking(datetime, observer, equal, [
      new FixedConstraint(0.5)
    ])

    // Every target scores the same, and so the ranking is the order they were given in:
    expect(ranking.map(({ target }) => target)).toEqual(equal)
  })

  it('should return the target as it was given, e.g., with any additional properties', () => {
    const ranking = getObservationalQualityRanking(datetime, observer, targets, [
      new FixedConstraint(1)
    ])

    for (const rank of ranking) {
      expect(targets).toContain(rank.target)
      expect(typeof rank.target.name).toBe('string')
    }
  })

  it('should return no ranking for no targets', () => {
    expect(getObservationalQualityRanking(datetime, observer, [])).toEqual([])
  })
})

/*****************************************************************************************************************/
