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
