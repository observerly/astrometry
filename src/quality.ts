/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/quality
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { getCorrectionToEquatorialForAnnualAberration } from './aberration'

import { getAngularSeparation } from './astrometry'

import type { EquatorialCoordinate, GeographicCoordinate } from './common'

import {
  type Constraint,
  type ConstraintContext,
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

import { getNormalizedAzimuthalDegree, getNormalizedInclinationDegree } from './utilities'

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

  const ra = getNormalizedAzimuthalDegree(target.ra + precession.ra + aberration.ra + nutation.ra)

  const dec = getNormalizedInclinationDegree(
    target.dec + precession.dec + aberration.dec + nutation.dec
  )

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
 * getObservationalQuality()
 *
 * @brief A measure of the observational quality of an observation, in the range [-1, 1], where 1 is
 * the best possible quality and -1 is the worst (or unobservable).
 *
 * The quality is the mean of the scores of a set of standardised { Constraint } instances, evaluated
 * against the observation's resolved context. Any failed required (hard) constraint makes the whole
 * observation unobservable, returning -1.
 *
 * @param datetime - The date and time of the observation.
 * @param observer - The geographic coordinates of the observer.
 * @param target - The equatorial coordinates of the target object (at J2000.0).
 * @param constraints - The constraints to evaluate (defaults to target altitude, Sun altitude and
 * Moon separation).
 * @returns The observational quality index, a value between -1 and 1.
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
): number => {
  // With no constraints there is nothing to assess, so the observation is treated as unobservable:
  if (constraints.length === 0) {
    return -1
  }

  // Resolve the context once for this datetime, then score every constraint against it exactly once:
  const context = getConstraintContext(datetime, observer, target)

  const scores = constraints.map(constraint => ({
    required: constraint.required,
    score: constraint.score(context)
  }))

  // Any failed required (hard) constraint makes the whole observation unobservable:
  if (scores.some(({ required, score }) => required && score <= -1)) {
    return -1
  }

  // Otherwise the quality is the mean of every constraint's score, in the range [-1, 1]:
  return scores.reduce((total, { score }) => total + score, 0) / scores.length
}

/*****************************************************************************************************************/
