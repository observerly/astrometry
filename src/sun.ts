/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sun
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type EclipticCoordinate, type EquatorialCoordinate } from './common'

import { AU_IN_METERS, c } from './constants'

import { convertEclipticToEquatorial } from './coordinates'

import { B, getEccentricityOfOrbit, L, R } from './earth'

import { getJulianDate } from './epoch'

import { getFOrbitalParameter } from './orbit'

import { convertDegreesToRadians as radians } from './utilities'

import { calculateB, calculateL, calculateR } from './vsop87'

/*****************************************************************************************************************/

export const SOLAR_TROPICAL_YEAR = 365.242189 as const

/*****************************************************************************************************************/

/**
 *
 * getSolarMeanAnomaly()
 *
 * The Sun's mean anomaly is the angle between perigee and the Sun's current position.
 *
 * @param date - The date to calculate the Sun's mean anomaly for.
 * @returns The Sun's mean anomaly at the given date.
 *
 */
export const getSolarMeanAnomaly = (datetime: Date): number => {
  // Get the Julian Date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the Sun's mean anomaly at the current epoch relative to J2000:
  let M = (357.52911 + 35999.05029 * T - 0.0001537 * Math.pow(T, 2)) % 360

  if (M < 0) {
    M += 360
  }

  return M
}

/*****************************************************************************************************************/

/**
 *
 * getSolarEquationOfCenter()
 *
 * The equation of center is the difference between the mean geometric longitude
 * and the mean anomaly.
 *
 * @param date - The date to calculate the Sun's equation of center for.
 * @returns The Sun's equation of center at the given date.
 */
export const getSolarEquationOfCenter = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the mean anomaly:
  const M = getSolarMeanAnomaly(datetime)

  // Calculate the equation of center:
  const C =
    (1.914602 - 0.004817 * Math.pow(T, 2) - 0.000014 * Math.pow(T, 3)) * Math.sin(radians(M)) +
    (0.019993 - 0.000101 * Math.pow(T, 2)) * Math.sin(radians(2 * M)) +
    0.000289 * Math.sin(radians(3 * M))

  return C
}

/*****************************************************************************************************************/

/**
 *
 * getSolarMeanGeometricLongitude()
 *
 * The mean geometric longitude for the Sun is the angle between the perihelion
 * and the current position of the Sun, as seen from the centre of the Earth.
 *
 * @param date - The date to calculate the Sun's true geometric longitude for.
 * @returns The Sun's true geometric longitude at the given date.
 *
 */
export const getSolarMeanGeometricLongitude = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Calculate the mean geometric longitude:
  let L = (280.46646 + 36000.76983 * T + 0.0003032 * Math.pow(T, 2)) % 360

  // Correct for negative angles
  if (L < 0) {
    L += 360
  }

  return L
}

/*****************************************************************************************************************/

/**
 *
 * getSolarTrueAnomaly()
 *
 * The true anomaly for the Sun is the angle between the perihelion and the
 * current position of the Sun, as seen from the centre of the Earth, corrected
 * for the equation of center.
 *
 * @param date - The date to calculate the Sun's true anomaly for.
 * @returns The Sun's true anomaly at the given date.
 *
 */
export const getSolarTrueAnomaly = (datetime: Date): number => {
  // Get the mean anomaly:
  const M = getSolarMeanAnomaly(datetime)

  // Get the equation of center:
  const C = getSolarEquationOfCenter(datetime)

  // Correct the mean anomaly for the equation of center:
  return (M + C) % 360
}

/*****************************************************************************************************************/

/**
 *
 * getSolarTrueGeometricLongitude()
 *
 * The true geometric longitude for the Sun is the angle between the perihelion
 * and the current position of the Sun, as seen from the centre of the Earth,
 * corrected for the equation of center.
 *
 * @param date - The date to calculate the Sun's true geometric longitude for.
 * @returns The Sun's true geometric longitude at the given date.
 *
 */
export const getSolarTrueGeometricLongitude = (datetime: Date): number => {
  // Get the mean geometric longitude:
  const L = getSolarMeanGeometricLongitude(datetime)

  // Get the equation of center:
  const C = getSolarEquationOfCenter(datetime)

  // Correct the mean geometric longitude for the equation of center:
  return (L + C) % 360
}

/*****************************************************************************************************************/

/**
 *
 * getSolarEclipticLongitude()
 *
 * The ecliptic longitude for the Sun is the angle between the perihelion and
 * the current position of the Sun, as seen from the centre of the Earth,
 * corrected for the equation of center and the Sun's ecliptic longitude at
 * perigee at the epoch.
 *
 * @param date - The date to calculate the Sun's ecliptic longitude for.
 * @returns The Sun's ecliptic longitude at the given date.
 *
 */
export const getSolarEclipticLongitude = (datetime: Date): number => {
  // Get the true anomaly:
  const ν = getSolarTrueAnomaly(datetime)

  // Correct the true anomaly with the Sun's ecliptic longitude
  // at perigee at the epoch:
  let λ = ν + (282.938346 % 360)

  // Correct for negative angles
  if (λ < 0) {
    λ += 360
  }

  return λ
}

/*****************************************************************************************************************/

/**
 *
 * getSolarEclipticCoordinate()
 *
 * The ecliptic coordinates of the Sun are the Sun's position in the sky as seen
 * from the centre of the Earth, corrected for the equation of center and the Sun's
 * ecliptic longitude at perigee at the epoch.
 *
 * @param datetime - The date to calculate the Sun's ecliptic coordinates for.
 * @returns The Sun's ecliptic coordinates at the given date.
 */
export function getSolarEclipticCoordinate(datetime: Date): EclipticCoordinate & {
  R: number
} {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the Julian millenia since J2000.0:
  const τ = T / 10

  // Calculate the VSOP87 terms for the Earth's heliocentric ecliptic coordinates
  // (l and b in degrees, and r in metres):
  const [l, b, r] = [calculateL(τ, L) % 360, calculateB(τ, B) % 360, calculateR(τ, R)]

  // The Sun's ecliptic longitude is just the anti-podal angle of the mean longitude:
  let λ = l + 180

  // Radial distance of the Sun from the Earth (in AU):
  const RO = r / AU_IN_METERS

  // N.B. The Sun's longitude ⨀ and latitude β obtained thus far are referred to
  // the mean dynamical ecliptic and equinox of the date defined by the VSOP planetary
  // theory of P. Bretagnon. This reference frame differs slightly from the standard
  // FK5 system. The FK5 system is a dynamical system that is fixed with respect to
  // the mean equator and equinox of J2000.0. The FK5 system is the standard reference
  // frame for the equatorial coordinates of celestial objects.

  // FK5 correction to the latitude (in degrees):
  const λp = λ - 1.397 * T - 0.00031 * Math.pow(T, 2)
  const Δβ = 1.08778e-5 * (Math.cos(radians(λp)) - Math.sin(radians(λp)))

  // FK5 correction to the longitude (in degrees):
  λ -= 2.50833e-5

  if (λ < 0) {
    λ += 360
  }

  // Daily variation in the longitude (in arcseconds), for the geocentric
  // longitude of the Sun in a fixed reference frame:
  //
  const Δλ =
    3548.193 +
    118.568 * Math.sin(radians(87.5287 + 359993.7286 * τ)) +
    2.476 * Math.sin(radians(85.0561 + 719987.4571 * τ)) +
    1.376 * Math.sin(radians(27.8502 + 4452671.1152 * τ)) +
    0.119 * Math.sin(radians(73.1375 + 450368.8567 * τ)) +
    0.114 * Math.sin(radians(337.2264 + 329644.6719 * τ)) +
    0.086 * Math.sin(radians(222.54 + 659289.3436 * τ)) +
    0.078 * Math.sin(radians(162.8136 + 9224659.7915 * τ)) +
    0.054 * Math.sin(radians(82.5823 + 1079981.1857 * τ)) +
    0.052 * Math.sin(radians(171.5189 + 225184.4282 * τ)) +
    0.034 * Math.sin(radians(30.3214 + 4092677.3866 * τ)) +
    0.033 * Math.sin(radians(119.8105 + 337181.0415 * τ)) +
    0.023 * Math.sin(radians(247.5418 + 299295.6151 * τ)) +
    0.023 * Math.sin(radians(325.1526 + 315559.556 * τ)) +
    0.021 * Math.sin(radians(155.1241 + 675553.2846 * τ)) +
    7.311 * Math.sin(radians(333.4515 + 359993.7286 * τ)) +
    0.305 * Math.sin(radians(330.9814 + 719987.4571 * τ)) +
    0.0107 * Math.sin(radians(328.517 + 1079981.1857 * τ)) +
    0.309 * τ * Math.sin(radians(241.4518 + 359993.7286 * τ)) +
    0.021 * τ * Math.sin(radians(205.0482 + 719987.4571 * τ)) +
    0.004 * Math.pow(τ, 2) * Math.sin(radians(297.861 + 4452671.1152 * τ)) +
    0.01 * Math.pow(τ, 3) * Math.sin(radians(154.7066 + 359993.7286 * τ))

  // Correction for nutation:
  λ -= 20.4898 / 3600 / RO

  // Correction for aberration:
  λ -= (-0.005775518 * RO * Δλ) / 3600

  return {
    λ: λ % 360,
    β: Δβ - b,
    R: r
  }
}

/*****************************************************************************************************************/

/**
 *
 * getSolarEquatorialCoordinate()
 *
 * The equatorial coordinate of the Sun is the standard equatorial coordinate
 * of the Sun, as seen from the centre of the Earth, corrected for the equation
 * of center and the Sun's ecliptic longitude at perigee at the epoch.
 *
 * @param date - The date to calculate the Sun's equatorial coordinate for.
 * @returns The Sun's equatorial coordinate at the given date.
 *
 */
export const getSolarEquatorialCoordinate = (datetime: Date): EquatorialCoordinate => {
  // Get the ecliptic coordinates of the Sun:
  // The latitude, β, term is close to zero for the Sun, so we can largely ignore it by refactoring
  // the standard equations for the conversion between ecliptic and equatorial
  // coordinates.
  return convertEclipticToEquatorial(datetime, getSolarEclipticCoordinate(datetime))
}

/*****************************************************************************************************************/

/**
 *
 * getSolarAngularDiameter()
 *
 * The Sun's angular diameter is the distance between the Sun's centre and the Sun's limb.
 *
 * @param date - The date to calculate the Sun's angular diameter for.
 * @returns The Sun's angular diameter in degrees
 *
 */
export const getSolarAngularDiameter = (datetime: Date): number => {
  // Get the true anomaly:
  const ν = getSolarTrueAnomaly(datetime)

  // Get the F orbital paramater which applies corrections
  // due to the Sun's orbital eccentricity:
  const F = getFOrbitalParameter(ν, 0.016708)

  return 0.533128 * F
}

/*****************************************************************************************************************/

/**
 *
 * getSolarDistance()
 *
 * @param datetime - The date to calculate the distance to the Sun for.
 * @returns The distance to the Sun in metres forthe given date.
 */
export const getSolarDistance = (datetime: Date): number => {
  // Get the eccentricity of the Earth's orbit:
  const e = getEccentricityOfOrbit(datetime)

  // Get the solar true anomaly:
  const ν = getSolarTrueAnomaly(datetime)

  // Calculate the distance to the Sun (in metres) from the Earth:
  return ((1.000001018 * (1 - Math.pow(e, 2))) / (1 + e * Math.cos(radians(ν)))) * AU_IN_METERS
}

/*****************************************************************************************************************/

export const getHeliocentricJulianDate = (datetime: Date): number => {
  const JD = getJulianDate(datetime)

  // Get the eccentricity of the Earth's orbit:
  const R = getSolarDistance(datetime)

  // Determine the distance between the Earth and the Sun and compute the light travel time
  // to correct the Julian Date to the time of the observation (in seconds):
  const HJD = JD - R / c / 86400

  // Return the Heliocentric Julian Date:
  return HJD
}

/*****************************************************************************************************************/
