/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/astrometry
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type {
  EquatorialCoordinate,
  EquatorialProperMotion,
  GeographicCoordinate,
  SphericalCoordinate
} from './common'

import { AU_IN_METERS, J2000 } from './constants'

import { convertEclipticToEquatorial } from './coordinates'

/***************************************************************************************************************/

import { getObliquityOfTheEcliptic } from './ecliptic'

import { getJulianDate } from './epoch'

import { getNutation } from './nutation'

/***************************************************************************************************************/

import { getSolarEclipticCoordinate } from './sun'

import { utc } from './utc'

import {
  convertRadiansToDegrees as degrees,
  getNormalizedAzimuthalDegree,
  convertDegreesToRadians as radians
} from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getAngularSeparation()
 *
 * The angular separation between two objects is the angle in degrees between the two objects as seen by an observer on Earth.
 *
 * N.B. Per ISO 80000-2, the polar angle, θ, is the latitudinal angle of the coordinate, e.g., the
 * altitude or the declination of the object, and the azimuthal angle, φ, is its longitudinal
 * angle, e.g., the azimuth or the right ascension of the object.
 *
 * @param A - The spherical coordinate of the observed object.
 * @param B - The spherical coordinate of the observed object.
 * @returns The angular separation between the two objects in degrees.
 *
 */
export const getAngularSeparation = (A: SphericalCoordinate, B: SphericalCoordinate): number => {
  // Calculate the angular separation between A and B (in degrees):
  let θ =
    degrees(
      Math.acos(
        Math.sin(radians(A.θ)) * Math.sin(radians(B.θ)) +
          Math.cos(radians(A.θ)) * Math.cos(radians(B.θ)) * Math.cos(radians(A.φ - B.φ))
      )
    ) % 360

  // Correct for negative angles:
  if (θ < 0) {
    θ += 360
  }

  return θ
}

/*****************************************************************************************************************/

/**
 *
 * getAntipodeCoordinate()
 *
 * The antipode of an object is the point on the celestial sphere that is diametrically opposite to the observed object.
 *
 * @param A - The coordinate of the observed object, in Spherical coordinates (accepts Equatorial, Horizontal, and Ecliptic coordinates).
 * @returns The antipode of the observed object, in Spherical coordinates.
 */
export const getAntipodeCoordinate = (A: SphericalCoordinate): SphericalCoordinate => {
  return {
    θ: -A.θ,
    φ: getNormalizedAzimuthalDegree(A.φ + 180)
  }
}

/*****************************************************************************************************************/

/**
 *
 * getNormalisedSphericalCoordinate()
 *
 * Normalises a Spherical coordinate to a value between -90 and 90 degrees in the
 * polar angle and 0 to 360 degrees in the azimuthal angle.
 *
 * N.B. A polar angle beyond a pole is reflected back over that pole, and, as the point then lies
 * on the opposite side of the sphere, the azimuthal angle is rotated by 180°, e.g., a polar angle
 * of 92° is a polar angle of 88° at the antipodal azimuthal angle.
 *
 * @param A - The Spherical coordinate to normalise.
 * @returns The normalised Spherical coordinate.
 *
 */
export const getNormalisedSphericalCoordinate = (A: SphericalCoordinate): SphericalCoordinate => {
  const { θ, φ } = A

  // Wrap the polar angle onto the range [-90, 270), e.g., a single meridian of the sphere,
  // traversed from the south pole, over the north pole, and back down to the south pole:
  const meridian = getNormalizedAzimuthalDegree(θ + 90) - 90

  // A polar angle that lies beyond either pole is carried past 90° along that meridian by the wrap,
  // and so both are reflected: 120° lies beyond the north pole and is carried to 120°, and -120°
  // lies beyond the south pole and is carried to 240°.
  //
  // N.B. The reflection is decided from the meridian itself, and not by comparing the reflected
  // polar angle against it: the two are the same angle where none is reflected, but
  // 90 - |90 - meridian| does not reproduce the meridian to the last bit, and so comparing them
  // reflects a polar angle that is already resolved, and rotates its azimuthal angle to the
  // antipodal meridian:
  const reflected = meridian > 90

  // Reflect a polar angle that lies beyond a pole back over that pole, e.g., a polar angle of 120°
  // is a polar angle of 60°, and a polar angle of -120° is a polar angle of -60°:
  const polar = reflected ? 180 - meridian : meridian

  // A reflected polar angle lies on the opposite side of the sphere, and so its azimuthal angle is
  // rotated to the antipodal meridian:
  const azimuthal = φ + (reflected ? 180 : 0)

  return {
    θ: polar,
    φ: getNormalizedAzimuthalDegree(azimuthal)
  }
}

/*****************************************************************************************************************/

/**
 *
 * getGreenwichSiderealTime()
 *
 * The Greenwich Sidereal Time (GST) is the hour angle of the vernal
 * equinox, the ascending node of the ecliptic on the celestial equator.
 *
 * @param date - The date for which to calculate the Greenwich Sidereal Time (GST).
 * @returns Greenwich Sidereal Time as number - the Greenwich Sidereal Time (GST) of the given date normalised to UTC.
 *
 */
export const getGreenwichSiderealTime = (datetime: Date): number => {
  // Get the Julian Date of the given date:
  const JD = getJulianDate(datetime)

  // Get the Julian Date of the previous midnight:
  const JD_0 = Math.floor(JD - 0.5) + 0.5

  // Get the number of days since the previous midnight:
  const S = JD_0 - 2451545.0

  // Get the number of centuries since J2000.0:
  const T = S / 36525.0

  // Calculate the Greenwich Sidereal Time (GST) at 0h UT:
  let T_0 = (6.697374558 + 2400.051336 * T + 0.000025862 * T ** 2) % 24

  // Ensure that the Greenwich Sidereal Time (GST) is positive:
  if (T_0 < 0) {
    T_0 += 24
  }

  // Ensure that the date is in UTC
  const d = utc(datetime)

  // Convert the UTC time to a decimal fraction of hours:
  const UTC =
    d.getUTCHours() +
    d.getUTCMinutes() / 60 +
    d.getUTCSeconds() / 3600 +
    d.getUTCMilliseconds() / 3600000

  const A = UTC * 1.002737909

  T_0 += A

  const GST = T_0 % 24

  return GST < 0 ? GST + 24 : GST
}

/*****************************************************************************************************************/

/**
 *
 * @alias getGreenwichSiderealTime()
 *
 */
export const GST = getGreenwichSiderealTime

/*****************************************************************************************************************/

/**
 *
 * getGreenwichApparentSiderealTime()
 *
 * The Greenwich Apparent Sidereal Time (GAST) is the hour angle of the true vernal equinox,
 * that is, the mean sidereal time (GMST) corrected for the equation of the equinoxes, which
 * accounts for the nutation of the Earth's axis of rotation.
 *
 * @param datetime - The date for which to calculate the Greenwich Apparent Sidereal Time (GAST).
 * @returns Greenwich Apparent Sidereal Time as number - the Greenwich Apparent Sidereal Time (GAST) of the given date normalised to UTC.
 *
 */
export const getGreenwichApparentSiderealTime = (datetime: Date): number => {
  // Get the Greenwich Mean Sidereal Time (GMST) of the given date (in hours):
  const GMST = getGreenwichSiderealTime(datetime)

  // Get the nutation in longitude (Δψ) and obliquity (Δε) of the given date (in degrees):
  const { Δψ, Δε } = getNutation(datetime)

  // Get the true obliquity of the ecliptic, e.g., the mean obliquity corrected for nutation (in degrees):
  const ε = getObliquityOfTheEcliptic(datetime) + Δε

  // Calculate the equation of the equinoxes, converted from degrees to hours:
  const EQ = (Δψ * Math.cos(radians(ε))) / 15

  // Apply the equation of the equinoxes to the Greenwich Mean Sidereal Time (GMST):
  const GAST = (GMST + EQ) % 24

  return GAST < 0 ? GAST + 24 : GAST
}

/*****************************************************************************************************************/

/**
 *
 * @alias getGreenwichApparentSiderealTime()
 *
 */
export const GAST = getGreenwichApparentSiderealTime

/*****************************************************************************************************************/

/**
 *
 * getLocalSiderealTime()
 *
 * The Local Sidereal Time (LST) is the hour angle of the vernal
 * equinox, the ascending node of the ecliptic on the celestial equator.
 *
 * @param date - The date for which to calculate the Local Sidereal Time (LST).
 * @param longitude - The longitude of the observer in degrees.
 * @returs Local Sidereal Time as number - the Local Sidereal Time (LST) of the given date normalised to UTC.
 *
 */
export const getLocalSiderealTime = (datetime: Date, longitude: number): number => {
  // Get the Greenwich Sidereal Time (GST) of the given date:
  const GST = getGreenwichSiderealTime(datetime)

  let d = (GST + longitude / 15.0) / 24.0

  d = d - Math.floor(d)

  if (d < 0) {
    d += 1
  }

  return 24.0 * d
}

/*****************************************************************************************************************/

/**
 *
 * @alias getLocalSiderealTime()
 *
 */
export const LST = getLocalSiderealTime

/*****************************************************************************************************************/

/**
 *
 * getLocalApparentSiderealTime()
 *
 * The Local Apparent Sidereal Time (LAST) is the hour angle of the true vernal equinox for
 * the observer's meridian, that is, the Greenwich Apparent Sidereal Time (GAST) corrected
 * for the longitude of the observer.
 *
 * @param date - The date for which to calculate the Local Apparent Sidereal Time (LAST).
 * @param longitude - The longitude of the observer in degrees.
 * @returns Local Apparent Sidereal Time as number - the Local Apparent Sidereal Time (LAST) of the given date normalised to UTC.
 *
 */
export const getLocalApparentSiderealTime = (datetime: Date, longitude: number): number => {
  // Get the Greenwich Apparent Sidereal Time (GAST) of the given date (in hours):
  const GAST = getGreenwichApparentSiderealTime(datetime)

  // Apply the longitude of the observer, converted from degrees to hours:
  let d = (GAST + longitude / 15.0) / 24.0

  d = d - Math.floor(d)

  if (d < 0) {
    d += 1
  }

  return 24.0 * d
}

/*****************************************************************************************************************/

/**
 *
 * @alias getLocalApparentSiderealTime()
 *
 */
export const LAST = getLocalApparentSiderealTime

/*****************************************************************************************************************/

/**
 *
 * getHourAngle()
 *
 * The Hour Angle (HA) is the angular distance along the celestial equator
 * from the observer's meridian to the hour circle of a celestial body.
 *
 * @param date - The date for which to calculate the hour angle.
 * @param ra - Right Ascension of the target in degrees.
 * @param longitude - The longitude of the observer in degrees.
 * @returns The Hour Angle (HA) of the given date.
 *
 */
export const getHourAngle = (datetime: Date, longitude: number, ra: number): number => {
  // Get the Local Sidereal Time (LST) of the given date:
  const LST = getLocalSiderealTime(datetime, longitude)

  let ha = LST * 15 - ra

  // If the hour angle is less than zero, ensure we rotate by 2π radians (360 degrees)
  if (ha < 0) {
    ha += 360
  }

  return ha
}

/*****************************************************************************************************************/

/**
 *
 * getParallacticAngle()
 *
 * The parallactic angle is the angle between the great circle that passes through
 * the celestial object and the zenith, and the great circle that passes through
 * the celestial object and the celestial pole.
 *
 * @param date - The date for which to calculate the parallactic angle for.
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @return The parallactic angle of the observed object in degrees.
 *
 */
export const getParallacticAngle = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate
): number => {
  const { latitude, longitude } = observer

  const { ra, dec } = target

  // Get the hour angle for the target:
  const ha = radians(getHourAngle(datetime, longitude, ra))

  // Calculate the parallactic angle and return in degrees:
  let q = degrees(
    Math.atan2(
      Math.sin(ha),
      Math.tan(radians(latitude)) * Math.cos(radians(dec)) - Math.sin(radians(dec)) * Math.cos(ha)
    )
  )

  // Correct for negative angles
  if (q < 0) {
    q += 360
  }

  return q % 360
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForProperMotion()
 *
 * Calculates the correction terms (Δra, Δdec) to the equatorial coordinate of a target for the
 * proper motion of the target, e.g., the apparent motion of the target across the celestial
 * sphere, relative to the barycenter of the solar system, over the interval between the epoch of
 * the coordinate and the datetime given. The correction terms should be added to the target's
 * coordinate by the caller.
 *
 * N.B. The proper motion in right ascension is the great-circle rate, as published, and so it is
 * divided through by the cosine of the declination to obtain the rate of change of the right
 * ascension itself.
 *
 * N.B. The motion is treated as linear over the interval, which is accurate for the intervals of
 * decades that separate the epoch of a catalogue from the present day. A rigorous treatment
 * resolves the space motion of the target, for which its parallax and its radial velocity are
 * also required.
 *
 * @param datetime - The date to calculate the equatorial correction for.
 * @param target - The equatorial coordinate of the target, of its epoch, or of J2000.
 * @param properMotion - The proper motion of the target (in arcseconds per Julian year).
 * @returns The correction to the equatorial coordinate (in degrees) to add to the target's coordinate.
 *
 */
export const getCorrectionToEquatorialForProperMotion = (
  datetime: Date,
  target: EquatorialCoordinate,
  properMotion: EquatorialProperMotion
): EquatorialCoordinate => {
  // The number of Julian years between the epoch of the coordinate and the datetime given:
  const years = (getJulianDate(datetime) - (target.epoch ?? J2000)) / 365.25

  // The proper motion in declination is the rate of change of the declination itself, converted
  // from arcseconds to degrees:
  const Δdec = (properMotion.dec * years) / 3600

  // The right ascension of a target at either celestial pole is degenerate, and its proper motion
  // in right ascension is therefore not resolvable. N.B. The cosine of the declination is tested
  // for through the declination itself, as the cosine of ±90° is not exactly zero:
  if (Math.abs(target.dec) >= 90) {
    return {
      ra: 0,
      dec: Δdec
    }
  }

  // The proper motion in right ascension is the great-circle rate, and so it is divided through by
  // the cosine of the declination to obtain the rate of change of the right ascension itself:
  const Δra = (properMotion.ra * years) / Math.cos(radians(target.dec)) / 3600

  return {
    ra: Δra,
    dec: Δdec
  }
}

/*****************************************************************************************************************/

/**
 *
 * getCorrectionToEquatorialForAnnualParallax()
 *
 * Calculates the correction to the equatorial coordinate of a target for its annual parallax, e.g.,
 * the displacement of a nearby star as the Earth is carried about the Sun, which traces an ellipse
 * over the year whose semi-major axis is the parallax of the star.
 *
 * The correction is resolved from the geocentric position of the Sun, taken as it is, and not
 * negated: the observer is displaced from the Sun by the negative of that position, and a target is
 * displaced by the negative of the displacement of the observer, and so the two cancel. It is
 * otherwise the same geometry as the aberration for the velocity of an observer, with the position
 * of the Sun in the place of that velocity, and the parallax of the target in the place of the
 * speed of light.
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

  // The cosine of the declination, e.g., the radius of the parallel of the target as a fraction of
  // the celestial sphere, which is resolved once and used for both of the displacements:
  const cosDec = Math.cos(dec)

  // The geocentric ecliptic coordinate of the Sun, from which both the direction to it and the
  // distance to it are resolved, so that the two are of the one model and the one evaluation of it:
  // the equatorial coordinate and the distance are otherwise resolved from a VSOP87 series and from
  // a Keplerian orbit respectively, which disagree by ~5e-5 astronomical units:
  const ecliptic = getSolarEclipticCoordinate(datetime)

  const sun = convertEclipticToEquatorial(datetime, ecliptic)

  // The distance to the Sun, in astronomical units, e.g., in the same measure as the parallax:
  const R = ecliptic.R / AU_IN_METERS

  // The rectangular geocentric equatorial coordinate of the Sun (in astronomical units):
  const X = R * Math.cos(radians(sun.dec)) * Math.cos(radians(sun.ra))

  const Y = R * Math.cos(radians(sun.dec)) * Math.sin(radians(sun.ra))

  const Z = R * Math.sin(radians(sun.dec))

  // The position of the Sun resolved along the east of the target, e.g., along the unit vector
  // (-sin α, cos α, 0), which is the direction of increasing right ascension:
  const east = -X * Math.sin(ra) + Y * Math.cos(ra)

  // The position of the Sun resolved along the north of the target, e.g., along the unit vector
  // (-sin δ cos α, -sin δ sin α, cos δ), which is the direction of increasing declination:
  const north = -X * Math.sin(dec) * Math.cos(ra) - Y * Math.sin(dec) * Math.sin(ra) + Z * cosDec

  // The displacement in declination is the northward component, scaled by the parallax:
  const Δdec = π * north

  // The parallel of the target shortens as cos δ towards the poles, and where it is shorter than
  // the displacement along it the right ascension is degenerate, e.g., the displacement carries the
  // target about the pole, and so it is displaced in declination alone.
  //
  // N.B. The parallel is compared against the displacement itself, and not against a fixed
  // tolerance, as it is for the aberration of the velocity of an observer: a fixed tolerance bounds
  // the declination at which the target is taken to be at a pole, but not the displacement in right
  // ascension that would be resolved just outside of it, whereas this bounds that to a radian:
  if (Math.abs(cosDec) <= Math.abs(π * east)) {
    return {
      ra: 0,
      dec: degrees(Δdec)
    }
  }

  // The displacement in right ascension is the eastward component, scaled by the parallax, taken
  // along the parallel of the target:
  const Δra = (π * east) / cosDec

  return {
    ra: degrees(Δra),
    dec: degrees(Δdec)
  }
}

/*****************************************************************************************************************/
