/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/planets
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { J2000 } from './constants'

import { getJulianDate } from './epoch'

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

/**
 *
 *
 * This snapshot of orbital data is taken from the The Astronomical Almanac 2000 and various NASA sources.
 *
 * All quoted values are for the epoch J2000.0.
 *
 */
export const planets: Planet[] = [
  {
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
  },
  {
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
  },
  {
    uid: '01HD4AM60QS3SXKKJWY1A2Z3JF',
    name: 'Earth',
    symbol: '♁',
    T: 1.0000174,
    m: 1,
    r: 6378140,
    e: 0.01671123,
    a: 1.00000018,
    i: -0.00001531,
    ε: 100.464572,
    ϖ: 100.464572,
    Ω: null,
    isInferior: false
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  }
]

/*****************************************************************************************************************/

export const getPlanetaryMeanAnomaly = (datetime: Date, planet: Planet): number => {
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
