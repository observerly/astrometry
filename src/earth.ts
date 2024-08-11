/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/earth
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getJulianDate } from './epoch'

import { type Planet } from './planets'

import { B0, B1, L0, L1, L2, L3, L4, L5, R0, R1, R2, R3, R4 } from './vsop87/earth'

/*****************************************************************************************************************/

export const earth: Planet = {
  uid: '01HD4AM60QS3SXKKJWY1A2Z3JF',
  name: 'Earth',
  symbol: '♁',
  T: 1.0000174,
  m: 1,
  r: 6378140,
  e: 0.01671123,
  a: 1.0000003,
  i: -0.00001531,
  ε: 100.464572,
  ϖ: 102.937682,
  Ω: null,
  isInferior: false
}

/*****************************************************************************************************************/

// VSOP87 l, b, r coefficients for Earth:

// Longitudinal terms:
export const L = [L0, L1, L2, L3, L4, L5]

// Latitudinal terms:
export const B = [B0, B1]

// Radial terms:
export const R = [R0, R1, R2, R3, R4]

/*****************************************************************************************************************/

/**
 *
 * getEccentricityOfOrbit()
 *
 * The eccentricity of the Earth's orbit is a measure of how elliptical the Earth's
 * orbit is. The eccentricity of the Earth's orbit is not constant, but varies over
 * time. This function returns the eccentricity of the Earth's orbit for a given date.
 *
 * @param date - The date to get the eccentricity of the Earth's orbit for
 * @returns The eccentricity of the Earth's orbit in degrees
 *
 */
export const getEccentricityOfOrbit = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // Get the eccentricity of the Earth's orbit
  return 0.0167086342 - 0.000042037 * T - ((0.0000001267 * Math.pow(T, 2)) % 360)
}

/*****************************************************************************************************************/

/**
 *
 * getObliquityOfEcliptic()
 *
 * @see EQ22.2 p.147 of Meeus, Jean. 1991. Astronomical algorithms. Richmond, Va: Willmann-Bell.
 *
 * @note This is adopted by the International Astronomical Union (IAU), however the accuracy
 * is NOT satisfactory over a long period of time, the error in ε0 reaches 1" over a period
 * of 2000 years and about 10" over a period of 4000 years.
 *
 * @param datetime - The date to get the obliquity of the ecliptic for
 * @returns The obliquity of the ecliptic in degrees
 *
 */
export const getObliquityOfEcliptic = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // Get the obliquity of the ecliptic
  return (
    23.4392911111 -
    0.0130041667 * T -
    0.0000001639 * Math.pow(T, 2) +
    0.0000005036 * Math.pow(T, 3) -
    0.0000000006 * Math.pow(T, 4) -
    0.000000000018 * T * T * T * T * T
  )
}

/*****************************************************************************************************************/

/**
 *
 * getCoefficientOfEccentricity()
 *
 * The coefficient of eccentricity of the Earth's orbit is a measure of how elliptical the Earth's
 * orbit is. The coefficient of eccentricity of the Earth's orbit is not constant, but varies over
 * time. This function returns the coefficient of eccentricity of the Earth's orbit for a given date.
 *
 * @param datetime - The date to get the coefficient of eccentricity for
 * @returns The coefficient of eccentricity of the Earth's orbit
 */
export const getCoefficientOfEccentricity = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // Get the coefficient of the eccentricity of the Earth's orbit:
  return 1 - 0.002516 * T - 0.0000074 * Math.pow(T, 2)
}

/*****************************************************************************************************************/
