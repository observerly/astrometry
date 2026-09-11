/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/parallax
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { EquatorialCoordinate } from './common'

import { AU_IN_METERS } from './constants'

import { convertEquatorialToCartesian } from './coordinates'

import { getJulianDate, getTerrestrialTime } from './epoch'

import { getRotatedCartesianCoordinate, getRotationMatrix } from './maths'

import { getNutation } from './nutation'

import { getSolarEclipticCoordinate } from './sun'

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
 * The position of the Sun is taken as it is, and not negated: the observer is displaced from the
 * Sun by the negative of it, and a target by the negative of that, and so the two cancel.
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

  // The geocentric ecliptic coordinate of the Sun, which resolves the direction to it and the
  // distance to it from the one model, and from the one evaluation of it:
  const ecliptic = getSolarEclipticCoordinate(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0, at the
  // Terrestrial Time of the given date, which the general precession in longitude is referred to:
  const T = (getJulianDate(getTerrestrialTime(datetime)) - 2451545.0) / 36525

  // The general precession in longitude of IAU 2006 accumulated since J2000.0, e.g., the
  // displacement of the mean equinox of the date from the mean equinox of J2000.0 along the
  // ecliptic (in degrees):
  const pA =
    (5028.796195 * T +
      1.1054348 * T ** 2 +
      0.00007964 * T ** 3 -
      0.000023857 * T ** 4 -
      0.0000000383 * T ** 5) /
    3600

  // The nutation in longitude, which the longitude of the Sun carries (in degrees):
  const { Δψ } = getNutation(datetime)

  // The longitude of the Sun referred to the equinox of J2000.0, e.g., the apparent longitude
  // referred to the true equinox of the date, carried back to the mean equinox of the date by the
  // nutation in longitude, and to the mean equinox of J2000.0 by the general precession, so that
  // the direction to the Sun is referred to the equatorial frame of J2000.0, as the target is.
  //
  // N.B. The aberration of the Sun of ~20 arcseconds is left in the longitude, which displaces the
  // direction to the Sun by ~1e-4 of itself, e.g., by a tenth of a milliarcsecond of the parallax
  // of the nearest star, and the ecliptic of the date is taken as the ecliptic of J2000.0, the
  // precession of the ecliptic itself being ~47 arcseconds per century:
  const λ = ecliptic.λ - Δψ - pA

  // The unit vector of the Sun in the ecliptic frame, e.g., the spherical to cartesian conversion
  // of the ecliptic coordinate, which is that of the equatorial coordinate with the longitude and
  // latitude in place of the right ascension and declination:
  const unit = convertEquatorialToCartesian({ ra: λ, dec: ecliptic.β })

  // The mean obliquity of the ecliptic at J2000.0 of IAU 2006 (in degrees):
  const ε = 84381.406 / 3600

  // The unit vector of the Sun, rotated from the ecliptic frame into the equatorial frame of
  // J2000.0, e.g., by the passive rotation of the frame about the x axis by the negative of the
  // obliquity of the ecliptic:
  const sun = getRotatedCartesianCoordinate(getRotationMatrix('x', -ε), unit)

  // The distance to the Sun, in astronomical units, e.g., in the same measure as the parallax:
  const R = ecliptic.R / AU_IN_METERS

  // The rectangular geocentric equatorial coordinate of the Sun (in astronomical units):
  const X = R * sun.x

  const Y = R * sun.y

  const Z = R * sun.z

  // The unit vector of the target, in the equatorial frame:
  const n = {
    x: cosDec * Math.cos(ra),
    y: cosDec * Math.sin(ra),
    z: Math.sin(dec)
  }

  // The vector from the observer to the target, e.g., the unit vector of the target displaced by
  // the position of the Sun, scaled by the parallax. Only its direction is wanted, and so it is
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
