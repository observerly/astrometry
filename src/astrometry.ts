/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/astrometry
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  type GeographicCoordinate,
  type SphericalCoordinate
} from './common'

import { getJulianDate } from './epoch'

import { utc } from './utc'

import { convertRadiansToDegrees as degrees, convertDegreesToRadians as radians } from './utilities'

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
        Math.sin(radians(A['θ'])) * Math.sin(radians(B['θ'])) +
          Math.cos(radians(A['θ'])) * Math.cos(radians(B['θ'])) * Math.cos(radians(A['φ'] - B['φ']))
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
 * getGreenwhichSiderealTime()
 *
 * The Greenwich Sidereal Time (GST) is the hour angle of the vernal
 * equinox, the ascending node of the ecliptic on the celestial equator.
 *
 * @param date - The date for which to calculate the Greenwich Sidereal Time (GST).
 * @returns Greenwich Sidereal Time as number - the Greenwich Sidereal Time (GST) of the given date normalised to UTC.
 *
 */
export const getGreenwhichSiderealTime = (datetime: Date): number => {
  // Get the Julian Date of the given date:
  const JD = getJulianDate(datetime)

  // Get the Julian Date of the previous midnight:
  const JD_0 = Math.floor(JD - 0.5) + 0.5

  // Get the number of days since the previous midnight:
  const S = JD_0 - 2451545.0

  // Get the number of centuries since J2000.0:
  const T = S / 36525.0

  // Calculate the Greenwich Sidereal Time (GST) at 0h UT:
  let T_0 = (6.697374558 + 2400.051336 * T + 0.000025862 * Math.pow(T, 2)) % 24

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
 * @alias getGreenwhichSiderealTime()
 *
 */
export const GST = getGreenwhichSiderealTime

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
  const GST = getGreenwhichSiderealTime(datetime)

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
 * getObliquityOfTheEcliptic()
 *
 * The obliquity of the ecliptic is the angle between the ecliptic and the celestial
 * equator, and is used to convert between ecliptic and equatorial coordinates.
 *
 * @param date - The date for which to calculate the obliquity of the ecliptic for.
 * @returns The obliquity of the ecliptic in degrees.
 *
 */
export const getObliquityOfTheEcliptic = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Calculate the obliquity of the ecliptic:
  return 23.439292 - (46.845 * T + 0.00059 * Math.pow(T, 2) + 0.001813 * Math.pow(T, 3)) / 3600
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
  return degrees(
    Math.atan2(
      Math.sin(ha),
      Math.tan(radians(latitude)) * Math.cos(radians(dec)) - Math.sin(radians(dec)) * Math.cos(ha)
    )
  )
}

/*****************************************************************************************************************/
