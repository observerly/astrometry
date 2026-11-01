/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/parallax
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { getBarycentricSolarVector, getGeometricSolarVector } from './sun'

import {
  convertRadiansToDegrees as degrees,
  getNormalizedAzimuthalDegree,
  convertDegreesToRadians as radians
} from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForAnnualParallax()
 *
 * Calculates the correction to the equatorial coordinate of a target for its annual parallax, e.g.,
 * the displacement of a nearby star as the Earth is carried about the Sun, which traces an ellipse
 * over the year whose semi-major axis is the parallax of the star.
 *
 * The position of the barycentre of the Solar System from the Earth is taken as it is, and not
 * negated: the observer is displaced from the barycentre by the negative of it, and a target by the
 * negative of that, and so the two cancel.
 *
 * @param datetime - The date and time of the observation.
 * @param target - The equatorial coordinate of the target, of a given parallax (in arcseconds).
 * @returns The correction to the equatorial coordinate of the target (in degrees).
 *
 */
export const getCorrectionToEquatorialForAnnualParallax = (
  datetime: Date,
  target: EquatorialCoordinate
): EquatorialCoordinate => {
  // A target of no parallax is at an infinite distance, and so it is not displaced at all by the
  // motion of the observer about the Sun:
  const π = ((target.parallax ?? 0) / 3600) * (Math.PI / 180)

  if (π === 0) {
    return {
      ra: 0,
      dec: 0
    }
  }

  const ra = radians(target.ra)

  const dec = radians(target.dec)

  const cosDec = Math.cos(dec)

  // The geometric position of the Sun from the Earth, referred to the mean equator and equinox of
  // J2000.0, as the target is (in astronomical units, e.g., in the same measure as the parallax):
  const sun = getGeometricSolarVector(datetime)

  // The position of the Sun about the barycentre of the Solar System, referred likewise (in
  // astronomical units):
  const barycentre = getBarycentricSolarVector(datetime)

  // The rectangular equatorial coordinate of the barycentre of the Solar System from the Earth, e.g.,
  // the negative of the barycentric position of the Earth, as eraPmpx of the IAU Standards of
  // Fundamental Astronomy (SOFA) displaces the target by the barycentric position of the observer,
  // and not by its heliocentric position, the two differing by up to ~0.01 astronomical units, or
  // ~1 % of the parallax (in astronomical units):
  const X = sun.x - barycentre.x

  const Y = sun.y - barycentre.y

  const Z = sun.z - barycentre.z

  // The unit vector of the target, in the equatorial frame:
  const n = {
    x: cosDec * Math.cos(ra),
    y: cosDec * Math.sin(ra),
    z: Math.sin(dec)
  }

  // The vector from the observer to the target, e.g., the unit vector of the target displaced by
  // the position of the barycentre from the observer, scaled by the parallax. Only its direction is wanted, and so it is
  // left unnormalised:
  const apparent = {
    x: n.x + π * X,
    y: n.y + π * Y,
    z: n.z + π * Z
  }

  // The coordinate is recovered from the displaced vector, and is not expanded about the target,
  // which would divide by cos δ and so be unbounded at the poles.
  //
  // N.B. The declination is taken against the distance from the axis of rotation, and not as the
  // arc sine of the polar component, which is ill-conditioned towards the poles:
  const Δdec = degrees(Math.atan2(apparent.z, Math.hypot(apparent.x, apparent.y))) - target.dec

  // The displacement in right ascension, taken the shorter of the two ways about the sphere:
  const Δra =
    getNormalizedAzimuthalDegree(degrees(Math.atan2(apparent.y, apparent.x)) - target.ra + 180) -
    180

  return {
    ra: Δra,
    dec: Δdec
  }
}

/*****************************************************************************************************************/
