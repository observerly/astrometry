/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/astrometry
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type {
  EquatorialCoordinate,
  GeographicCoordinate,
  SphericalCoordinate
} from './common'

import { getObliquityOfTheEcliptic } from './ecliptic'

import { getJulianDate } from './epoch'

import { getNutation } from './nutation'

import { utc } from './utc'

import {
  convertRadiansToDegrees as degrees,
  getNormalizedAzimuthalDegree,
  getNormalizedInclinationDegree,
  convertDegreesToRadians as radians
} from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getAngularSeparation()
 *
 * The angular separation between two objects is the angle in degrees between the two objects as seen by an observer on Earth.
 *
 * @param A - The equatorial coordinate of the observed object.
 * @param B - The equatorial coordinate of the observed object.
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
    θ: (A.θ + 180) % 360,
    φ: -A.φ
  }
}

/*****************************************************************************************************************/

/**
 *
 * getNormalisedSphericalCoordinate()
 *
 * Normalises a Spherical coordinate to a value between 0 and 360 degrees in the
 * longitude and -90 to 90 degrees in the latitude.
 *
 * @param A - The Spherical coordinate to normalise.
 * @returns The normalised Spherical coordinate.
 *
 */
export const getNormalisedSphericalCoordinate = (A: SphericalCoordinate): SphericalCoordinate => {
  const { θ, φ } = A

  return {
    θ: getNormalizedAzimuthalDegree(θ),
    φ: getNormalizedInclinationDegree(φ)
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
