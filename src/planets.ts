/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/planets
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type EclipticCoordinate } from './common'

import { J2000 } from './constants'

import { earth } from './earth'

import { getJulianDate } from './epoch'

import { convertDegreesToRadians as radians, convertRadiansToDegrees as degrees } from './utilities'

/*****************************************************************************************************************/

export type Planet = {
  /**
   *
   *
   * Some unique identifier for the planet.
   *
   */
  uid: string
  /**
   *
   *
   * The common, wsternised name of the planet.
   *
   */
  name: 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune'
  /**
   *
   *
   * The "astrological" symbol for the planet.
   *
   */
  symbol: '☿' | '♀' | '♁' | '♂' | '♃' | '♄' | '♅' | '♆'
  /**
   *
   *
   * The planet's orbital period in tropical years.
   *
   */
  T: number
  /**
   *
   *
   * The planet's mass relative to Earth.
   *
   */
  m: number
  /**
   *
   *
   * The planet's radius relative to Earth.
   *
   */
  r: number
  /**
   *
   *
   * The planet's eccentricity.
   *
   */
  e: number
  /**
   *
   *
   * The planet's semi-major axis in AU.
   *
   */
  a: number
  /**
   *
   *
   * The planet's inclination in degrees.
   *
   */
  i: number
  /**
   *
   *
   * The planet's ecliptical longitude at epoch in degrees.
   *
   */
  ε: number
  /**
   *
   *
   * The planet's ecliptical longitude at perihelion in degrees.
   *
   */
  ϖ: number
  /**
   *
   *
   * The planet's ecliptical longitude of ascending node at epoch in degrees.
   *
   */
  Ω: number | null
  /**
   *
   *
   * Whether the planet is inferior.
   *
   */
  isInferior?: boolean
}

/*****************************************************************************************************************/

export const mercury = {
  uid: '01HD49QMD7GA502WXEMY1ZAG15',
  name: 'Mercury',
  symbol: '☿',
  T: 0.2408467,
  m: 0.055274,
  r: 2439700,
  e: 0.205636,
  a: 0.3870993,
  i: 7.004979,
  ε: 252.250324,
  ϖ: 77.457796,
  Ω: 48.330766,
  isInferior: true
} as const satisfies Planet

/*****************************************************************************************************************/

export const venus = {
  uid: '01HD49R1NASDCYK3ZBYYCBJTBW',
  name: 'Venus',
  symbol: '♀',
  T: 0.615197,
  m: 0.8149984,
  r: 6051800,
  e: 0.0067767,
  a: 0.72333566,
  i: 3.39467605,
  ε: 181.9791,
  ϖ: 131.602467,
  Ω: 76.679843,
  isInferior: true
} as const satisfies Planet

/*****************************************************************************************************************/

export const mars = {
  uid: '01HD4ARM2X130B6M2Q74JFKRW4',
  name: 'Mars',
  symbol: '♂',
  T: 1.880848,
  m: 0.107447,
  r: 3389500,
  e: 0.093394,
  a: 1.52371,
  i: 1.849691,
  ε: -4.553432,
  ϖ: -23.943629,
  Ω: 49.559539,
  isInferior: false
} as const satisfies Planet

/*****************************************************************************************************************/

export const jupiter = {
  uid: '01HD4AYRMZP734M8FVQGXDB5BV',
  name: 'Jupiter',
  symbol: '♃',
  T: 11.862615,
  m: 317.828133,
  r: 69911000,
  e: 0.048393,
  a: 5.202887,
  i: 1.3043975,
  ε: 34.396441,
  ϖ: 14.728479,
  Ω: 100.473909,
  isInferior: false
} as const satisfies Planet

/*****************************************************************************************************************/

export const saturn = {
  uid: '01HD4AYZAHS15TJJMZDQWV1TET',
  name: 'Saturn',
  symbol: '♄',
  T: 29.447498,
  m: 95.160904,
  r: 58232000,
  e: 0.053862,
  a: 9.536676,
  i: 2.485992,
  ε: 49.954244,
  ϖ: 92.598878,
  Ω: 113.662424,
  isInferior: false
} as const satisfies Planet

/*****************************************************************************************************************/

export const uranus = {
  uid: '01HD4AZ66TP0P2KY9A8XFMRQ4T',
  name: 'Uranus',
  symbol: '♅',
  T: 84.016846,
  m: 14.535757,
  r: 25362000,
  e: 0.0472574,
  a: 19.18916464,
  i: 0.772638,
  ε: 313.238104,
  ϖ: 170.954276,
  Ω: 74.016925,
  isInferior: false
} as const satisfies Planet

/*****************************************************************************************************************/

export const neptune = {
  uid: '01HD4AZGMADD008W4XT4HEV9ZC',
  name: 'Neptune',
  symbol: '♆',
  T: 164.79132,
  m: 17.147241,
  r: 24622000,
  e: 0.00867797,
  a: 30.069923,
  i: 1.77004347,
  ε: -55.120029,
  ϖ: 44.964762,
  Ω: 131.784226,
  isInferior: false
} as const satisfies Planet

/*****************************************************************************************************************/

/**
 *
 *
 * This snapshot of orbital data is taken from the The Astronomical Almanac 2000 and various NASA sources.
 *
 * All quoted values are for the epoch J2000.0.
 *
 */
export const planets: Planet[] = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune]

/*****************************************************************************************************************/

type PlanetOrbitalParameters = Omit<Planet, 'uid' | 'name' | 'symbol'>

/*****************************************************************************************************************/

/**
 *
 * getPlanetaryMeanAnomaly()
 *
 * A planet's mean anomaly is the angle between perigee and the Sun's current position.
 *
 * @param date - The date to calculate the Planet's mean anomaly for.
 * @param planet - The planet to calculate the mean anomaly for.
 * @returns a planet's mean anomaly at a given datetime
 */
export const getPlanetaryMeanAnomaly = (
  datetime: Date,
  planet: PlanetOrbitalParameters
): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the number of Julian days since the epoch:
  const De = JD - J2000

  // Calculate the mean anomaly:
  let M = ((360 / 365.242191) * (De / planet.T) + planet.ε - planet.ϖ) % 360

  if (M < 0) {
    M += 360
  }

  // Return the mean anomaly:
  return M
}

/*****************************************************************************************************************/

/**
 *
 * getPlanetaryEquationOfCenter()
 *
 * @param date - The date to calculate the Planet's equation of center for.
 * @param planet - The planet to calculate the equation of center for.
 * @returns a planet's equation of center at a given datetime
 *
 */
export const getPlanetaryEquationOfCenter = (
  datetime: Date,
  planet: PlanetOrbitalParameters
): number => {
  const M = getPlanetaryMeanAnomaly(datetime, planet)

  const E = (360 / Math.PI) * planet.e * Math.sin(radians(M))

  return E
}

/*****************************************************************************************************************/

/**
 *
 * getPlanetaryTrueAnomaly()
 *
 * A planet's true anomaly is the angle between perigee and the planet's
 * current position, corrected for the planet's eccentricity.
 *
 * @param date - The date to calculate the Planet's true anomaly for.
 * @param planet - The planet to calculate the true anomaly for.
 * @returns a planet's true anomaly at a given datetime
 *
 */
export const getPlanetaryTrueAnomaly = (
  datetime: Date,
  planet: PlanetOrbitalParameters
): number => {
  const M = getPlanetaryMeanAnomaly(datetime, planet)

  const E = getPlanetaryEquationOfCenter(datetime, planet)

  return (M + E) % 360
}

/*****************************************************************************************************************/

/**
 *
 * getPlanetaryHeliocentricEclipticLongitude()
 *
 * @param date - The date to calculate the Planet's heliocentric ecliptic longitude for.
 * @param planet - The planet to calculate the heliocentric ecliptic longitude for.
 * @returns a planet's heliocentric ecliptic longitude at a given datetime
 *
 */
export const getPlanetaryHeliocentricEclipticLongitude = (
  datetime: Date,
  planet: PlanetOrbitalParameters
): number => {
  const v = getPlanetaryTrueAnomaly(datetime, planet)

  return (v + planet.ϖ) % 360
}

/*****************************************************************************************************************/

/**
 *
 * getPlanetaryHeliocentricEclipticLatitude()
 *
 * @param date - The date to calculate the Planet's heliocentric ecliptic latitude for.
 * @param planet - The planet to calculate the heliocentric ecliptic latitude for.
 * @returns a planet's heliocentric ecliptic latitude at a given datetime
 *
 */
export const getPlanetaryHeliocentricEclipticLatitude = (
  datetime: Date,
  planet: PlanetOrbitalParameters
): number => {
  const L = getPlanetaryHeliocentricEclipticLongitude(datetime, planet)

  const Ω = planet.Ω || 0

  return degrees(Math.asin(Math.sin(radians(L - Ω)) * Math.sin(radians(planet.i)))) % 360
}

/*****************************************************************************************************************/

/**
 *
 * getPlanetaryHeliocentricDistance()
 *
 * @param date - The date to calculate the Planet's heliocentric distance for.
 * @param planet - The planet to calculate the heliocentric distance for.
 * @returns a planet's heliocentric distance at a given datetime (in AUs)
 *
 */
export const getPlanetaryHeliocentricDistance = (
  datetime: Date,
  planet: PlanetOrbitalParameters
): number => {
  const v = getPlanetaryTrueAnomaly(datetime, planet)

  return (planet.a * (1 - planet.e ** 2)) / (1 + planet.e * Math.cos(radians(v)))
}

/*****************************************************************************************************************/

/**
 *
 * getPlanetaryGeocentricEclipticCoordinate()
 *
 * @param datetime - The date to calculate the Planet's geocentric ecliptic coordinates for.
 * @param planet - The planet to calculate the geocentric ecliptic coordinates for.
 * @returns a planet's geocentric ecliptic coordinates at a given datetime
 *
 */
export const getPlanetaryGeocentricEclipticCoordinate = (
  datetime: Date,
  planet: PlanetOrbitalParameters
): EclipticCoordinate => {
  // Get the geocentric ecliptic longitude for the planet:
  const Lp = getPlanetaryHeliocentricEclipticLongitude(datetime, planet)

  // Get the geocentric ecliptic latitude for the planet:
  const Λp = getPlanetaryHeliocentricEclipticLatitude(datetime, planet)

  // Get the geocentric ecliptic longitude for the planet:
  const Rp = getPlanetaryHeliocentricDistance(datetime, planet)

  const Ω = planet.Ω || 0

  // Caluclate the correction to apply to the planet's ecliptic longiutde:
  const Lp_corr =
    Ω +
    degrees(
      Math.atan2(Math.sin(radians(Lp - Ω)) * Math.cos(radians(planet.i)), Math.cos(radians(Lp - Ω)))
    )

  // Get the geocentric ecliptic longitude for Earth:
  const Le = getPlanetaryHeliocentricEclipticLongitude(datetime, earth)

  // Get the geocentric ecliptic latitude for Earth:
  // N.B. The following calculation isn't used in the final calculation of the
  // planet's ecliptic longitude, but is included here for completeness.
  // const Λe = getPlanetaryHeliocentricEclipticLatitude(datetime, earth)

  // Get the geocentric distance for Earth:
  const Re = getPlanetaryHeliocentricDistance(datetime, earth)

  let λp = -Infinity

  if (planet.isInferior) {
    λp =
      180 +
      Le +
      degrees(
        Math.atan2(
          Rp * Math.cos(radians(Λp)) * Math.sin(radians(Le - Lp_corr)),
          Re - Rp * Math.cos(radians(Λp)) * Math.cos(radians(Le - Lp_corr))
        )
      )
  } else {
    λp =
      Lp_corr +
      degrees(
        Math.atan2(
          Re * Math.sin(radians(Lp_corr - Le)),
          Rp * Math.cos(radians(Λp)) - Re * Math.sin(radians(Le - Lp_corr))
        )
      )
  }

  const βp = degrees(
    Math.atan(
      (Rp * Math.cos(radians(Λp)) * Math.tan(radians(Λp)) * Math.sin(radians(λp - Lp_corr))) /
        (Re * Math.sin(radians(Lp_corr - Le)))
    )
  )

  return {
    λ: λp % 360,
    β: βp
  }
}

/*****************************************************************************************************************/
