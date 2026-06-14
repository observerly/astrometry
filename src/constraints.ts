/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constraints
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { HorizontalCoordinate } from './common'

/*****************************************************************************************************************/

/**
 *
 * A normalized score in the range [-1, 1], where 1 is the ideal observing condition and -1 is
 * completely unobservable.
 *
 */
export type ConstraintScore = number

/*****************************************************************************************************************/

/**
 *
 * The context against which a constraint is evaluated for a single observation at a given datetime.
 *
 */
export type ConstraintContext = {
  /**
   *
   * The target's horizontal coordinate { az, alt }.
   *
   */
  target: HorizontalCoordinate
  /**
   *
   * The Sun's horizontal coordinate { az, alt }.
   *
   */
  sun: HorizontalCoordinate
  /**
   *
   * The Moon's horizontal coordinate { az, alt }.
   *
   */
  moon: HorizontalCoordinate
  /**
   *
   * The Moon's illuminated fraction, as a percentage in the range [0, 100].
   *
   */
  illumination: number
  /**
   *
   * The angular separation between the Moon and the target, in degrees in the range [0, 180].
   *
   */
  separation: number
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class Constraint
 *
 * @description The abstract base for a standardised observational constraint. A constraint scores a
 * { ConstraintContext } on the range [-1, 1], where 1 is the ideal observing condition and -1 is
 * completely unobservable.
 *
 *
 */
export abstract class Constraint {
  // A human-readable name for the constraint:
  public abstract readonly name: string

  // Whether failing this constraint (a score of -1) makes the whole observation unobservable:
  public required = false

  // Score the given context on the range [-1, 1] (implemented by each concrete constraint):
  public abstract score(context: ConstraintContext): ConstraintScore

  // Whether the constraint is satisfied at all (i.e. above the unobservable floor):
  public isSatisfiedBy(context: ConstraintContext): boolean {
    return this.score(context) > -1
  }
}

/*****************************************************************************************************************/

/**
 *
 * The parameters model for a { TargetAltitudeConstraint }.
 *
 */
export type TargetAltitudeConstraintParameters = {
  /**
   *
   * The minimum altitude (in degrees) at which the target is considered observable.
   *
   */
  minimum?: number
  /**
   *
   * The maximum altitude (in degrees) at which the target's score is maximal.
   *
   */
  maximum?: number
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class TargetAltitudeConstraint
 *
 * @description A constraint on the altitude of the target above the observer's horizon. The target
 * must be at or above a minimum altitude to be observable; the score then increases linearly with
 * altitude up to a maximum altitude (the zenith by default), where it reaches 1.
 *
 *
 */
export class TargetAltitudeConstraint extends Constraint {
  public readonly name = 'target-altitude'

  // A target below the minimum altitude is unobservable, so this is a hard constraint:
  public required = true

  // The minimum altitude (in degrees) at which the target is considered observable:
  public minimum = 6

  // The maximum altitude (in degrees) at which the target's score is maximal:
  public maximum = 90

  constructor({ minimum = 6, maximum = 90 }: TargetAltitudeConstraintParameters = {}) {
    super()

    if (minimum < -90 || minimum > 90 || maximum < -90 || maximum > 90) {
      throw new Error(
        'Invalid altitude bounds: minimum and maximum must be within [-90, 90] degrees'
      )
    }

    if (maximum <= minimum) {
      throw new Error('Invalid altitude bounds: maximum must be greater than minimum')
    }

    this.minimum = minimum
    this.maximum = maximum
  }

  public score({ target }: ConstraintContext): ConstraintScore {
    // Below the minimum altitude the target is unobservable:
    if (target.alt < this.minimum) {
      return -1
    }

    // Otherwise the score increases linearly from -1 at the minimum altitude to 1 at the maximum
    // altitude, clamped to 1 for targets above the maximum:
    const score = (2 * (target.alt - this.minimum)) / (this.maximum - this.minimum) - 1

    return Math.min(1, score)
  }
}

/*****************************************************************************************************************/

/**
 *
 * The parameters model for a { SunAltitudeConstraint }.
 *
 */
export type SunAltitudeConstraintParameters = {
  /**
   *
   * The maximum altitude (in degrees) of the Sun for the observation to be dark enough. The Sun must
   * be at or below this altitude (e.g. -18° for astronomical darkness) for the observation to begin.
   *
   */
  maximum?: number
  /**
   *
   * The minimum altitude (in degrees) of the Sun at which the score is maximal (the Sun at its
   * deepest below the horizon).
   *
   */
  minimum?: number
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class SunAltitudeConstraint
 *
 * @description A constraint on the altitude of the Sun below the observer's horizon. The Sun must be
 * at or below a maximum altitude (e.g. -18° for astronomical darkness) for the observation to be
 * possible; the score then increases the deeper the Sun sinks, reaching 1 at the minimum altitude.
 *
 * Note that, unlike the target, a lower Sun altitude scores higher.
 *
 *
 */
export class SunAltitudeConstraint extends Constraint {
  public readonly name = 'sun-altitude'

  // A Sun above the maximum altitude (i.e. not dark enough) is unobservable, so this is a hard
  // constraint:
  public required = true

  // The maximum altitude (in degrees) of the Sun for the observation to be dark enough:
  public maximum = -18

  // The minimum altitude (in degrees) of the Sun at which the score is maximal:
  public minimum = -90

  constructor({ maximum = -18, minimum = -90 }: SunAltitudeConstraintParameters = {}) {
    super()

    if (minimum < -90 || minimum > 90 || maximum < -90 || maximum > 90) {
      throw new Error(
        'Invalid altitude bounds: minimum and maximum must be within [-90, 90] degrees'
      )
    }

    if (maximum <= minimum) {
      throw new Error('Invalid altitude bounds: maximum must be greater than minimum')
    }

    this.maximum = maximum
    this.minimum = minimum
  }

  public score({ sun }: ConstraintContext): ConstraintScore {
    // Above the maximum altitude it is not dark enough to observe:
    if (sun.alt > this.maximum) {
      return -1
    }

    // Otherwise the score increases linearly from -1 at the maximum altitude to 1 at the minimum
    // altitude, clamped to 1 for a Sun below the minimum:
    const score = (2 * (this.maximum - sun.alt)) / (this.maximum - this.minimum) - 1

    return Math.min(1, score)
  }
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class IsNight
 *
 * @description A convenience constraint that is satisfied when it is astronomical night, i.e. the
 * Sun is at or below -18° below the horizon (Twilight.Night). It wraps a { SunAltitudeConstraint }
 * pre-configured with sensible night defaults, and accepts the same parameters should a different
 * darkness threshold be required.
 *
 *
 */
export class IsNight extends Constraint {
  public readonly name = 'is-night'

  // It is not night (and so unobservable) when the Sun is above the threshold, so this is a hard
  // constraint:
  public required = true

  // The underlying Sun altitude constraint, pre-configured for astronomical night:
  private readonly constraint: SunAltitudeConstraint

  constructor(parameters: SunAltitudeConstraintParameters = {}) {
    super()
    // Astronomical night is the Sun at or below -18° (Twilight.Night) by default:
    this.constraint = new SunAltitudeConstraint({ maximum: -18, minimum: -90, ...parameters })
  }

  // The maximum altitude (in degrees) of the Sun for it to be considered night:
  public get maximum(): number {
    return this.constraint.maximum
  }

  // The minimum altitude (in degrees) of the Sun at which the score is maximal:
  public get minimum(): number {
    return this.constraint.minimum
  }

  public score(context: ConstraintContext): ConstraintScore {
    return this.constraint.score(context)
  }
}

/*****************************************************************************************************************/

/**
 *
 * The parameters model for a { MoonAltitudeConstraint }.
 *
 */
export type MoonAltitudeConstraintParameters = {
  /**
   *
   * The altitude (in degrees) at or below which the Moon causes no interference (the score is
   * maximal). Defaults to the horizon (0°).
   *
   */
  minimum?: number
  /**
   *
   * The altitude (in degrees) at which the Moon causes the most interference (the score is minimal).
   * Defaults to the zenith (90°).
   *
   */
  maximum?: number
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class MoonAltitudeConstraint
 *
 * @description A constraint on the altitude of the Moon above the observer's horizon. The Moon
 * interferes with an observation in proportion to how high it sits: the score is maximal (1) when the
 * Moon is at or below the horizon and decreases linearly to its minimum (-1) at the zenith.
 *
 * This is a soft constraint by default (a Moon above the horizon degrades, but does not preclude, an
 * observation).
 *
 *
 */
export class MoonAltitudeConstraint extends Constraint {
  public readonly name = 'moon-altitude'

  // The altitude (in degrees) at or below which the Moon causes no interference:
  public minimum = 0

  // The altitude (in degrees) at which the Moon causes the most interference:
  public maximum = 90

  constructor({ minimum = 0, maximum = 90 }: MoonAltitudeConstraintParameters = {}) {
    super()

    if (minimum < -90 || minimum > 90 || maximum < -90 || maximum > 90) {
      throw new Error(
        'Invalid altitude bounds: minimum and maximum must be within [-90, 90] degrees'
      )
    }

    if (maximum <= minimum) {
      throw new Error('Invalid altitude bounds: maximum must be greater than minimum')
    }

    this.minimum = minimum
    this.maximum = maximum
  }

  public score({ moon }: ConstraintContext): ConstraintScore {
    // At or below the minimum altitude the Moon causes no interference:
    if (moon.alt <= this.minimum) {
      return 1
    }

    // Otherwise the score decreases linearly from 1 at the minimum altitude to -1 at the maximum
    // altitude, clamped to -1 for a Moon above the maximum:
    const score = 1 - (2 * (moon.alt - this.minimum)) / (this.maximum - this.minimum)

    return Math.max(-1, score)
  }
}

/*****************************************************************************************************************/
