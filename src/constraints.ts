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
