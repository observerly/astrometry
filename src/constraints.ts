/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constraints
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { HorizontalCoordinate } from './common'

/*****************************************************************************************************************/

import { getAirmass } from './refraction'

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

/**
 *
 * The parameters model for a { MoonSeparationConstraint }.
 *
 */
export type MoonSeparationConstraintParameters = {
  /**
   *
   * The angular separation (in degrees) at or below which the Moon causes the most interference (the
   * score is minimal). Defaults to a coincident Moon (0°).
   *
   */
  minimum?: number
  /**
   *
   * The angular separation (in degrees) at or above which the Moon causes no interference (the score
   * is maximal). Defaults to an antipodal Moon (180°).
   *
   */
  maximum?: number
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class MoonSeparationConstraint
 *
 * @description A constraint on the angular separation between the Moon and the target, weighted by
 * the Moon's illuminated fraction. The Moon interferes most when it is bright and close to the
 * target; the interference falls to zero as the separation grows, as the Moon darkens, or when the
 * Moon is below the horizon.
 *
 * This is a soft constraint by default (a nearby Moon degrades, but does not preclude, an
 * observation).
 *
 *
 */
export class MoonSeparationConstraint extends Constraint {
  public readonly name = 'moon-separation'

  // The separation (in degrees) at or below which the Moon causes the most interference:
  public minimum = 0

  // The separation (in degrees) at or above which the Moon causes no interference:
  public maximum = 180

  constructor({ minimum = 0, maximum = 180 }: MoonSeparationConstraintParameters = {}) {
    super()

    if (minimum < 0 || minimum > 180 || maximum < 0 || maximum > 180) {
      throw new Error(
        'Invalid separation bounds: minimum and maximum must be within [0, 180] degrees'
      )
    }

    if (maximum <= minimum) {
      throw new Error('Invalid separation bounds: maximum must be greater than minimum')
    }

    this.minimum = minimum
    this.maximum = maximum
  }

  public score({ moon, illumination, separation }: ConstraintContext): ConstraintScore {
    // The Moon causes no interference when it is below the horizon:
    if (moon.alt <= 0) {
      return 1
    }

    // The proximity of the Moon to the target, as a fraction in [0, 1]: 1 at (or within) the minimum
    // separation, falling to 0 at (or beyond) the maximum separation:
    const proximity =
      1 - Math.min(1, Math.max(0, (separation - this.minimum) / (this.maximum - this.minimum)))

    // The interference scales with both the Moon's illuminated fraction and its proximity, in [0, 1]:
    const interference = Math.min(1, Math.max(0, illumination / 100) * proximity)

    // The score decreases from 1 (no interference) to -1 (maximum interference):
    return 1 - 2 * interference
  }
}

/*****************************************************************************************************************/

/**
 *
 * The parameters model for a { MoonIlluminationConstraint }.
 *
 */
export type MoonIlluminationConstraintParameters = {
  /**
   *
   * The illuminated fraction (as a percentage) at or below which the Moon causes no interference (the
   * score is maximal). Defaults to a new Moon (0%).
   *
   */
  minimum?: number
  /**
   *
   * The illuminated fraction (as a percentage) at or above which the Moon causes the most
   * interference (the score is minimal). Defaults to a full Moon (100%).
   *
   */
  maximum?: number
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class MoonIlluminationConstraint
 *
 * @description A constraint on the Moon's illuminated fraction. The Moon interferes most when it is
 * full and falls to zero as it darkens towards a new Moon, or when the Moon is below the horizon.
 *
 * This is a soft constraint by default (a bright Moon degrades, but does not preclude, an
 * observation).
 *
 *
 */
export class MoonIlluminationConstraint extends Constraint {
  public readonly name = 'moon-illumination'

  // The illuminated fraction (as a percentage) at or below which the Moon causes no interference:
  public minimum = 0

  // The illuminated fraction (as a percentage) at or above which the Moon causes the most interference:
  public maximum = 100

  constructor({ minimum = 0, maximum = 100 }: MoonIlluminationConstraintParameters = {}) {
    super()

    if (minimum < 0 || minimum > 100 || maximum < 0 || maximum > 100) {
      throw new Error(
        'Invalid illumination bounds: minimum and maximum must be within [0, 100] percent'
      )
    }

    if (maximum <= minimum) {
      throw new Error('Invalid illumination bounds: maximum must be greater than minimum')
    }

    this.minimum = minimum
    this.maximum = maximum
  }

  public score({ moon, illumination }: ConstraintContext): ConstraintScore {
    // The Moon causes no interference when it is below the horizon:
    if (moon.alt <= 0) {
      return 1
    }

    // The fraction of the illumination range that has been traversed, clamped to [0, 1]: 0 at (or
    // below) the minimum illumination, rising to 1 at (or above) the maximum:
    const fraction = Math.min(
      1,
      Math.max(0, (illumination - this.minimum) / (this.maximum - this.minimum))
    )

    // The score decreases linearly from 1 (no interference) to -1 (maximum interference):
    return 1 - 2 * fraction
  }
}

/*****************************************************************************************************************/

/**
 *
 * The parameters model for an { IsMoonDown } constraint.
 *
 */
export type IsMoonDownParameters = {
  /**
   *
   * The altitude (in degrees) at or below which the Moon is considered to be "down". Defaults to the
   * horizon (0°).
   *
   */
  maximum?: number
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class IsMoonDown
 *
 * @description A convenience constraint that is satisfied only when the Moon is at or below the
 * horizon (or, more generally, at or below a maximum altitude). It is a hard gate: when the Moon is
 * above the threshold the observation is unobservable (-1), otherwise it is ideal (1).
 *
 * Unlike { IsNight }, which wraps the gating { SunAltitudeConstraint }, the Moon's altitude
 * constraint is a soft (graded) one, so this constraint gates on the Moon's altitude directly.
 *
 *
 */
export class IsMoonDown extends Constraint {
  public readonly name = 'is-moon-down'

  // The Moon being above the threshold makes the observation unobservable, so this is a hard
  // constraint:
  public required = true

  // The altitude (in degrees) at or below which the Moon is considered to be down:
  public maximum = 0

  constructor({ maximum = 0 }: IsMoonDownParameters = {}) {
    super()

    if (!Number.isFinite(maximum) || maximum < -90 || maximum > 90) {
      throw new Error('Invalid altitude bounds: maximum must be within [-90, 90] degrees')
    }

    this.maximum = maximum
  }

  public score({ moon }: ConstraintContext): ConstraintScore {
    // The constraint is satisfied (1) only when the Moon is at or below the maximum altitude;
    // otherwise the Moon is up and the observation is unobservable (-1):
    return moon.alt <= this.maximum ? 1 : -1
  }
}

/*****************************************************************************************************************/

/**
 *
 * The parameters model for an { AirmassConstraint }.
 *
 */
export type AirmassConstraintParameters = {
  /**
   *
   * The airmass at which the score is maximal (the best case). Defaults to 1 (the zenith), which is
   * the minimum possible airmass.
   *
   */
  minimum?: number
  /**
   *
   * The airmass at or above which the target is unobservable. Defaults to 2 (an altitude of roughly
   * 30°).
   *
   */
  maximum?: number
}

/*****************************************************************************************************************/

/**
 *
 *
 * @class AirmassConstraint
 *
 * @description A constraint on the airmass of the target — the path length of light through the
 * atmosphere, which is minimal (1) at the zenith and rises towards the horizon. The target is
 * observable only when its airmass is strictly below the maximum (and it is above the horizon). The
 * score is maximal (1) at the minimum airmass and decreases linearly towards -1 as the airmass
 * approaches the maximum; at or above the maximum airmass (or below the horizon) the target is
 * unobservable (-1).
 *
 *
 */
export class AirmassConstraint extends Constraint {
  public readonly name = 'airmass'

  // A target above the maximum airmass is unobservable, so this is a hard constraint:
  public required = true

  // The airmass at which the score is maximal (the zenith by default):
  public minimum = 1

  // The airmass at or above which the target is unobservable:
  public maximum = 2

  constructor({ minimum = 1, maximum = 2 }: AirmassConstraintParameters = {}) {
    super()

    if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum < 1 || maximum < 1) {
      throw new Error('Invalid airmass bounds: minimum and maximum must be finite and at least 1')
    }

    if (maximum <= minimum) {
      throw new Error('Invalid airmass bounds: maximum must be greater than minimum')
    }

    this.minimum = minimum
    this.maximum = maximum
  }

  public score({ target }: ConstraintContext): ConstraintScore {
    // Below the horizon the target cannot be observed:
    if (target.alt <= 0) {
      return -1
    }

    const airmass = getAirmass(target)

    // At or above the maximum airmass the target is unobservable:
    if (airmass >= this.maximum) {
      return -1
    }

    // Otherwise (airmass strictly below the maximum) the score decreases linearly from 1 at the
    // minimum airmass towards -1 as it approaches the maximum, clamped to [-1, 1]:
    const score = 1 - (2 * (airmass - this.minimum)) / (this.maximum - this.minimum)

    return Math.max(-1, Math.min(1, score))
  }
}

/*****************************************************************************************************************/
