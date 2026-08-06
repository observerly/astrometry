/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/quality
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getCorrectionToEquatorialForAnnualAberration } from './aberration'

import { getAngularSeparation, getNormalisedSphericalCoordinate } from './astrometry'

import type { EquatorialCoordinate, GeographicCoordinate, Interval } from './common'

import {
  type Constraint,
  type ConstraintContext,
  type ConstraintScore,
  MoonSeparationConstraint,
  SunAltitudeConstraint,
  TargetAltitudeConstraint
} from './constraints'

import { convertEquatorialToHorizontal } from './coordinates'

import { getLunarEquatorialCoordinate, getLunarIllumination } from './moon'

import { getCorrectionToEquatorialForNutation } from './nutation'

import { getCorrectionToEquatorialForPrecessionOfEquinoxes } from './precession'

import { getCorrectionToHorizontalForRefraction } from './refraction'

import { getSolarEquatorialCoordinate } from './sun'

/*****************************************************************************************************************/

/**
 *
 * getConstraintContext()
 *
 * Resolves the { ConstraintContext } for a given observation, working out the horizontal coordinates
 * of the target, the Sun and the Moon, the Moon's illuminated fraction, and the Moon-target angular
 * separation, for the given datetime.
 *
 * @param datetime - The date and time of the observation.
 * @param observer - The geographic coordinates of the observer.
 * @param target - The equatorial coordinates of the target object (at J2000.0).
 * @returns The resolved constraint context for the observation.
 */
const getConstraintContext = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate
): ConstraintContext => {
  // Correct the target's equatorial coordinates to the epoch of date:
  const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, target)

  const aberration = getCorrectionToEquatorialForAnnualAberration(datetime, target)

  const nutation = getCorrectionToEquatorialForNutation(datetime, target)

  // Normalise the corrected coordinate as a pair: a declination that crosses a pole is reflected
  // back over it, and its right ascension is rotated to the antipodal meridian, such that the
  // coordinate describes the same point on the celestial sphere:
  const { θ: dec, φ: ra } = getNormalisedSphericalCoordinate({
    θ: target.dec + precession.dec + aberration.dec + nutation.dec,
    φ: target.ra + precession.ra + aberration.ra + nutation.ra
  })

  // Resolve the refracted horizontal coordinates of the target, the Sun and the Moon:
  const t = getCorrectionToHorizontalForRefraction(
    convertEquatorialToHorizontal(datetime, observer, { ra, dec })
  )

  const sun = getCorrectionToHorizontalForRefraction(
    convertEquatorialToHorizontal(datetime, observer, getSolarEquatorialCoordinate(datetime))
  )

  const moon = getCorrectionToHorizontalForRefraction(
    convertEquatorialToHorizontal(datetime, observer, getLunarEquatorialCoordinate(datetime))
  )

  // The Moon's illuminated fraction, as a percentage in the range [0, 100]:
  const illumination = getLunarIllumination(datetime)

  // The Moon-target angular separation. Note getAngularSeparation expects θ = altitude and
  // φ = azimuth (as conjunction.ts uses it):
  const separation = getAngularSeparation({ θ: moon.alt, φ: moon.az }, { θ: t.alt, φ: t.az })

  return {
    target: t,
    sun,
    moon,
    illumination,
    separation
  }
}

/*****************************************************************************************************************/

/**
 *
 * The evaluation of a single { Constraint } against the resolved context of an observation.
 *
 */
export type ConstraintEvaluation = {
  /**
   *
   * The human-readable name of the constraint that was evaluated.
   *
   */
  name: string
  /**
   *
   * The score of the constraint, in the range [-1, 1].
   *
   */
  score: ConstraintScore
  /**
   *
   * Whether failing the constraint (a score of -1) makes the whole observation unobservable.
   *
   */
  required: boolean
  /**
   *
   * Whether the constraint is satisfied at all, e.g., its score is above the unobservable floor.
   *
   */
  satisfied: boolean
  /**
   *
   * The relative weight of the constraint in the weighted mean quality.
   *
   */
  weight: number
}

/*****************************************************************************************************************/

/**
 *
 * The observational quality of an observation, resolved from a set of { Constraint } instances.
 *
 */
export type ObservationalQuality = {
  /**
   *
   * The observational quality index, in the range [-1, 1], where 1 is the best possible quality
   * and -1 is the worst (or unobservable).
   *
   */
  quality: number
  /**
   *
   * Whether the observation is observable at all, e.g., every required (hard) constraint is
   * satisfied.
   *
   */
  observable: boolean
  /**
   *
   * The evaluation of each constraint, in the order the constraints were given, such that the
   * constraint that makes an observation unobservable may be identified.
   *
   */
  scores: ConstraintEvaluation[]
  /**
   *
   * The resolved context the constraints were evaluated against, e.g., the horizontal coordinates
   * of the target, the Sun and the Moon, the Moon's illuminated fraction, and the Moon-target
   * angular separation, for the given datetime.
   *
   */
  context: ConstraintContext
}

/*****************************************************************************************************************/

/**
 *
 * getObservationalQuality()
 *
 * @brief A measure of the observational quality of an observation, in the range [-1, 1], where 1 is
 * the best possible quality and -1 is the worst (or unobservable).
 *
 * The quality is the weighted mean of the scores of a set of standardised { Constraint } instances,
 * evaluated against the observation's resolved context, e.g., each score contributes in proportion
 * to the weight of its constraint. Any failed required (hard) constraint makes the whole
 * observation unobservable, with a quality of -1, and the evaluation of every constraint is
 * returned such that the failing constraint may be identified.
 *
 * @param datetime - The date and time of the observation.
 * @param observer - The geographic coordinates of the observer.
 * @param target - The equatorial coordinates of the target object (at J2000.0).
 * @param constraints - The constraints to evaluate (defaults to target altitude, Sun altitude and
 * Moon separation).
 * @returns The observational quality of the observation, e.g., the quality index, whether the
 * observation is observable, the evaluation of each constraint, and the resolved context.
 */
export const getObservationalQuality = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  constraints: Constraint[] = [
    new TargetAltitudeConstraint(),
    new SunAltitudeConstraint(),
    new MoonSeparationConstraint()
  ]
): ObservationalQuality => {
  // Resolve the context once for this datetime, then score every constraint against it exactly once:
  const context = getConstraintContext(datetime, observer, target)

  const scores = constraints.map(constraint => {
    const score = constraint.score(context)

    return {
      name: constraint.name,
      score,
      required: constraint.required,
      satisfied: score > -1,
      weight: constraint.weight
    }
  })

  // With no constraints there is nothing to assess, so the observation is treated as unobservable:
  if (constraints.length === 0) {
    return {
      quality: -1,
      observable: false,
      scores,
      context
    }
  }

  // Any failed required (hard) constraint makes the whole observation unobservable:
  if (scores.some(({ required, satisfied }) => required && !satisfied)) {
    return {
      quality: -1,
      observable: false,
      scores,
      context
    }
  }

  // Otherwise the quality is the weighted mean of every constraint's score, in the range [-1, 1]:
  return {
    quality:
      scores.reduce((total, { score, weight }) => total + score * weight, 0) /
      scores.reduce((total, { weight }) => total + weight, 0),
    observable: true,
    scores,
    context
  }
}

/*****************************************************************************************************************/

/**
 *
 * An interval over which an observation is observable, together with the mean quality of the
 * observation over the interval.
 *
 * N.B. The interval is half-open, e.g., [from, to): every sampled instant from the start of the
 * window, up to but not including the end of it, satisfies every required (hard) constraint. The
 * end of the window is the first sampled instant at which the observation is not observable, or
 * the end of the interval that was resolved, at which it may still be observable.
 *
 */
export type ObservationalQualityWindow = {
  /**
   *
   * The interval over which the observation is observable.
   *
   */
  interval: Interval
  /**
   *
   * The mean observational quality index over the interval, in the range [-1, 1].
   *
   */
  quality: number
}

/*****************************************************************************************************************/

/**
 *
 * getObservationalQualityWindows()
 *
 * @brief Resolves the intervals within the given interval over which an observation is observable,
 * e.g., every required (hard) constraint is satisfied at every sampled instant, together with the
 * mean quality of the observation over each interval.
 *
 * The interval is sampled at the given step, and each maximal contiguous run of observable samples
 * forms a window. Each window is half-open, e.g., [from, to): it closes at the first sampled
 * instant at which the observation is not observable, or at the end of the interval given. The
 * windows are returned in chronological order; a caller that wants the best window may sort them
 * by their quality.
 *
 * @param interval - The interval over which to resolve the windows, e.g., the coming night.
 * @param observer - The geographic coordinates of the observer.
 * @param target - The equatorial coordinates of the target object (at J2000.0).
 * @param constraints - The constraints to evaluate (defaults to target altitude, Sun altitude and
 * Moon separation).
 * @param params - The parameters for the resolution, e.g., the step (in seconds) at which the
 * interval is sampled.
 * @returns The observable windows within the interval, in chronological order.
 */
export const getObservationalQualityWindows = (
  interval: Interval,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate,
  constraints: Constraint[] = [
    new TargetAltitudeConstraint(),
    new SunAltitudeConstraint(),
    new MoonSeparationConstraint()
  ],
  params: { stepSeconds?: number } = {
    stepSeconds: 60
  }
): ObservationalQualityWindow[] => {
  const { stepSeconds = 60 } = params

  // A step that is not a positive number of seconds does not advance the sampling:
  if (!Number.isFinite(stepSeconds) || stepSeconds <= 0) {
    throw new Error('Invalid step: stepSeconds must be finite and greater than zero')
  }

  const windows: ObservationalQualityWindow[] = []

  // The start of the window under construction, and a running total and count of the qualities
  // sampled within it, such that the mean is resolved in constant space over any interval:
  let start: Date | null = null

  let total = 0

  let samples = 0

  // Close the window under construction at the given datetime, resolving its mean quality:
  const close = (to: Date) => {
    if (start === null) {
      return
    }

    // The dates are cloned, e.g., a Date is mutable, and so a window must not share a reference
    // with the interval given by the caller, nor with any other window:
    windows.push({
      interval: {
        from: new Date(start.getTime()),
        to: new Date(to.getTime())
      },
      quality: total / samples
    })

    start = null

    total = 0

    samples = 0
  }

  // Sample the interval at the given step, taking a copy of the from date so as to not modify the
  // interval given by the caller. N.B. The end of the interval is not sampled, as the windows are
  // half-open, e.g., [from, to), and a window that is still open there closes at it either way:
  for (
    let when = new Date(interval.from.getTime());
    when < interval.to;
    when = new Date(when.getTime() + stepSeconds * 1000)
  ) {
    const { quality, observable } = getObservationalQuality(when, observer, target, constraints)

    if (observable) {
      // Open a window at the first observable sample of a contiguous run:
      start ??= when

      total += quality

      samples += 1
    } else {
      close(when)
    }
  }

  // A window that is still open at the end of the interval closes at the end of it:
  close(interval.to)

  return windows
}

/*****************************************************************************************************************/

/**
 *
 * The observational quality of a single target within a ranking, e.g., the target given together
 * with the quality resolved for it.
 *
 */
export type ObservationalQualityRank<T extends EquatorialCoordinate> = ObservationalQuality & {
  /**
   *
   * The target the quality was resolved for, as it was given.
   *
   */
  target: T
}

/*****************************************************************************************************************/

/**
 *
 * getObservationalQualityRanking()
 *
 * @brief Ranks a set of targets by their observational quality for a given datetime and observer,
 * e.g., the best target to observe first.
 *
 * Every target is scored with the same set of constraints, and the ranking is ordered by quality,
 * from the best to the worst. A target that is not observable, e.g., a required (hard) constraint
 * fails for it, ranks below every observable target, and the targets of equal quality retain the
 * order they were given in.
 *
 * @param datetime - The date and time of the observation.
 * @param observer - The geographic coordinates of the observer.
 * @param targets - The equatorial coordinates of the target objects (at J2000.0).
 * @param constraints - The constraints to evaluate (defaults to target altitude, Sun altitude and
 * Moon separation).
 * @returns The targets, each together with its observational quality, ordered from the best to
 * the worst.
 */
export const getObservationalQualityRanking = <T extends EquatorialCoordinate>(
  datetime: Date,
  observer: GeographicCoordinate,
  targets: T[],
  constraints: Constraint[] = [
    new TargetAltitudeConstraint(),
    new SunAltitudeConstraint(),
    new MoonSeparationConstraint()
  ]
): ObservationalQualityRank<T>[] => {
  // Score every target with the same set of constraints:
  const ranks = targets.map(target => ({
    target,
    ...getObservationalQuality(datetime, observer, target, constraints)
  }))

  // Order the ranking by observability first, e.g., every observable target ranks above every
  // unobservable target, whatever their qualities, and by quality within each, from the best to
  // the worst. N.B. sort() is stable, and so the targets of equal order retain the order they
  // were given in:
  return ranks.sort((a, b) => Number(b.observable) - Number(a.observable) || b.quality - a.quality)
}

/*****************************************************************************************************************/
