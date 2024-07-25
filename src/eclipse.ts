/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/eclipse
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  type GeographicCoordinate,
  type HorizontalCoordinate,
  type Interval
} from './common'

import { convertEquatorialToHorizontal } from './coordinates'

import { getCoefficientOfEccentricity } from './earth'

import { getJulianDate } from './epoch'

import {
  getLunarCorrectedEclipticLongitudeOfTheAscendingNode,
  getLunarEquatorialCoordinate,
  getLunarTrueEclipticLongitude
} from './moon'

import { convertJulianDateToUTC } from './temporal'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 * The different types of lunar and solar eclipses.
 *
 * @readonly
 * @enum {string}
 *
 */
export enum EclipseType {
  /**
   *
   * @member {string} Penumbral
   *
   * A lunar eclipse in which only the Earth's penumbra falls on the Moon.
   *
   */
  Penumbral = 'penumbral',
  /**
   *
   * @member {string} Partial
   *
   * A partial lunar/solar eclipse.
   *
   */
  Partial = 'partial',
  /**
   *
   * @member {string} Annular
   *
   * A solar eclipse in which the entire Moon is visible against the Sun,
   * but the Sun appears as a ring around the Moon.
   *
   * N.B. Never used for a lunar eclipse.
   *
   */
  Annular = 'annular',
  /**
   *
   * @member {string} Total
   *
   * A total lunar/solar eclipse.
   *
   */
  Total = 'total',
  /**
   *
   * @member {string} AnnularTotal
   *
   *
   * N.B. Never used for a lunar eclipse.
   *
   */
  AnnularTotal = 'annular-total'
}

/*****************************************************************************************************************/

/**
 *
 * A representation of a lunar or solar eclipse.
 *
 */
export type Eclipse = {
  /**
   *
   * @member {enum} EclipseType
   *
   * The type of the eclipse, e.g., "total", "annular", "partial", or "penumbral".
   *
   */
  type: EclipseType
  /**
   *
   *
   * @member {Interval} interval
   *
   * When the eclipse begins and ends for a particular observer.
   *
   */
  interval?: Interval
  /**
   *
   * @member {Date} maximum
   *
   * When the maximum of the eclipse occurs.
   *
   */
  maximum: Date
  /**
   *
   * @member {number} magnitude
   *
   * The magnitude of the eclipse (the fraction of the Sun's diameter obscured by the Moon, or vice versa).
   *
   */
  magnitude?: number
  /**
   *
   *
   * There exists a line of central eclipse on the Earth's surface, and for
   * observers on this line, the center of the Moon's shadow will pass directly
   * over the center of the Sun. This is known as a central eclipse.
   *
   */
  isCentral: boolean
} & HorizontalCoordinate

/*****************************************************************************************************************/

// Snap returns k at specified quarter q nearest year y.
function snap(datetime: Date, q: number): number {
  // Get the decimal year to some precision:
  const y = datetime.getUTCFullYear() + datetime.getUTCMonth() / 12 + datetime.getUTCDate() / 365.25
  // Get the number of new moons since the standard epoch J
  const k = (y - 2000) * 12.3685
  // Snap it to either a new Moon or a full Moon:
  return Math.floor(k - q + 0.5) + q
}

/*****************************************************************************************************************/

/**
 *
 * getLunarEclipse()
 *
 * @param datetime - The date and time to calculate the lunar eclipse for.
 * @param observer - The geographic coordinates of the observer.
 * @returns - The lunar eclipse at the given date and time for the observer.
 */
export const getLunarEclipse = (
  datetime: Date,
  observer: GeographicCoordinate
):
  | (Eclipse &
      EquatorialCoordinate & {
        k: number
        JD: number
        F: number
        Ω: number
        γ: number
        u: number
        ρ: number
        σ: number
      })
  | false => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target
  // date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // k represents the number of new moons since the standard epoch J2000:
  const k = snap(datetime, 0.5)

  // Get the Julian Date of the last new moon:
  const JDE =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * Math.pow(T, 2) -
    0.00000015 * Math.pow(T, 3) +
    0.00000000073 * Math.pow(T, 4)

  // Obtain the Moon's argument of latitude (in degrees):
  let F =
    (160.7108 +
      390.67050284 * k -
      0.0016118 * Math.pow(T, 2) -
      0.00000227 * Math.pow(T, 3) +
      0.000000011 * Math.pow(T, 4)) %
    360

  if (F < 0) {
    F += 360
  }

  // There is no eclipse if the absolute value of the sine of the Moon's
  // argument of latitude is greater than 0.36:
  if (Math.abs(Math.sin(radians(F))) > 0.36) return false

  // Get the ecliptic longitude of the ascending node of the mode (in degrees):
  const Ω =
    (124.7746 - 1.56375588 * k + 0.0020672 * Math.pow(T, 2) + 0.00000215 * Math.pow(T, 3)) % 360

  const F1 = F - 0.02665 * Math.sin(radians(Ω))

  const A1 = 299.77 + 0.107408 * k - 0.009173 * Math.pow(T, 2)

  // Get the coefficient of eccentricity of the Earth's orbit (dimensionless):
  const E = getCoefficientOfEccentricity(datetime)

  // Get the solar mean anomaly (in degrees):
  const Ms =
    (2.5534 + 29.1053567 * k - 0.0000014 * Math.pow(T, 2) - 0.00000011 * Math.pow(T, 3)) % 360

  // Get the lunar mean anomaly (in degrees):
  const Ml =
    (201.5643 +
      385.81693528 * k +
      0.0107582 * Math.pow(T, 2) +
      0.00001238 * Math.pow(T, 3) -
      0.000000058 * Math.pow(T, 4)) %
    360

  const corr =
    -0.4065 * Math.sin(radians(Ml)) +
    0.1727 * E * Math.sin(radians(Ms)) +
    0.0161 * Math.sin(radians(2 * Ml)) -
    0.0097 * Math.sin(radians(2 * F1)) +
    0.0073 * E * Math.sin(radians(Ml - Ms)) -
    0.005 * E * Math.sin(radians(Ml + Ms)) -
    0.0023 * Math.sin(radians(Ml - 2 * F1)) +
    0.0021 * E * Math.sin(radians(2 * Ms)) +
    0.0012 * Math.sin(radians(Ml + 2 * F1)) +
    0.0006 * E * Math.sin(radians(2 * Ml + Ms)) -
    0.0004 * Math.sin(radians(3 * Ml)) -
    0.0003 * E * Math.sin(radians(Ms + 2 * F1)) +
    0.0003 * Math.sin(radians(A1)) -
    0.0002 * E * Math.sin(radians(Ms - 2 * F1)) -
    0.0002 * E * Math.sin(radians(2 * Ml - Ms)) -
    0.0002 * Math.sin(radians(Ω))

  // Get the Julian Date of the maximum of the eclipse:
  const maximum = convertJulianDateToUTC(JDE + corr)

  const W = Math.abs(Math.cos(radians(F1)))

  const P =
    0.207 * E * Math.sin(radians(Ms)) +
    0.0024 * E * Math.sin(radians(2 * Ms)) -
    0.0392 * Math.sin(radians(Ml)) +
    0.0116 * Math.sin(radians(2 * Ml)) -
    0.0073 * E * Math.sin(radians(Ml + Ms)) +
    0.0067 * E * Math.sin(radians(Ml - Ms)) +
    0.0118 * Math.sin(radians(2 * F1))

  const Q =
    5.2207 -
    0.0048 * E * Math.cos(radians(Ms)) +
    0.002 * E * Math.cos(radians(2 * Ms)) -
    0.3299 * Math.cos(radians(Ml)) -
    0.006 * E * Math.cos(radians(Ml + Ms)) -
    0.0041 * E * Math.cos(radians(Ml - Ms))

  const u =
    0.0059 +
    0.0046 * E * Math.cos(radians(Ms)) -
    0.0182 * Math.cos(radians(Ml)) +
    0.0004 * Math.cos(radians(2 * Ml)) -
    0.0005 * Math.cos(radians(Ms + Ml))

  // Gamma is the ratio of the distance of the Moon's shadow axis from the
  // center of the Earth to the radius of the Earth:
  const γ = (P * Math.cos(radians(F1)) + Q * Math.sin(radians(F1))) * (1 - 0.0048 * W)

  // Determine the type of eclipse, either a umbral or penumbral eclipse:
  const isCentral = Math.abs(γ) < 0.9972

  // The radii at the distance of the Moon, for the penumbral shadow:
  const ρ = 1.2848 + u

  // The radii at the distance of the Moon, for the umbral shadow:
  const σ = 0.7403 - u

  let magnitude = (1.0128 - u - Math.abs(γ)) / 0.545

  let eclipseType = EclipseType.Penumbral

  // If the magnitude is greater than 1, then the eclipse is total:
  if (magnitude > 1) {
    eclipseType = EclipseType.Total
  }

  // If the magnitude is less than 1, but greater than 0, then the eclipse is umbral:
  if (magnitude > 0 && magnitude < 1) {
    eclipseType = EclipseType.Partial
  }

  // If the magnitude is less than 0, then the eclipse is penumbral:
  if (magnitude < 0) {
    magnitude = (1.5573 + u - Math.abs(γ)) / 0.545
    if (magnitude < 0) return false
  }
  // Get the equatorial coordinates of the maximum of the eclipse for the Moon:
  const { ra, dec } = getLunarEquatorialCoordinate(maximum)

  // Convert the equatorial coordinates to horizontal coordinates:
  const { alt, az } = convertEquatorialToHorizontal(maximum, observer, { ra, dec })

  return {
    k,
    JD: JDE + corr,
    type: eclipseType,
    isCentral,
    maximum,
    magnitude,
    alt,
    az,
    ra: ra,
    dec: dec,
    F,
    Ω,
    γ,
    u,
    ρ,
    σ
  }
}

/*****************************************************************************************************************/

/**
 *
 * getSolarEclipse()
 *
 * @param datetime - The date and time to calculate the solar eclipse for.
 * @param observer - The geographic coordinates of the observer.
 * @returns The solar eclipse at the given date and time for the observer.
 */
export const getSolarEclipse = (
  datetime: Date,
  observer: GeographicCoordinate
):
  | (Eclipse &
      EquatorialCoordinate & { k: number; JD: number; F: number; Ω: number; γ: number; u: number })
  | false => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the difference in fractional Julian centuries between the target
  // date and J2000.0
  const T = (JD - 2451545.0) / 36525

  // k represents the number of new moons since the standard epoch J2000:
  const k = snap(datetime, 0)

  // Get the Julian Date of the last new moon:
  const JDE =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * Math.pow(T, 2) -
    0.00000015 * Math.pow(T, 3) +
    0.00000000073 * Math.pow(T, 4)

  // Obtain the Moon's argument of latitude (in degrees):
  let F =
    (160.7108 +
      390.67050284 * k -
      0.0016118 * Math.pow(T, 2) -
      0.00000227 * Math.pow(T, 3) +
      0.000000011 * Math.pow(T, 4)) %
    360

  if (F < 0) {
    F += 360
  }

  // There is no eclipse if the absolute value of the sine of the Moon's
  // argument of latitude is greater than 0.36:
  if (Math.abs(Math.sin(radians(F))) > 0.36) return false

  // Get the ecliptic longitude of the ascending node of the mode (in degrees):
  const Ω =
    (124.7746 - 1.56375588 * k + 0.0020672 * Math.pow(T, 2) + 0.00000215 * Math.pow(T, 3)) % 360

  const F1 = F - 0.02665 * Math.sin(radians(Ω))

  const A1 = 299.77 + 0.107408 * k - 0.009173 * Math.pow(T, 2)

  // Get the coefficient of eccentricity of the Earth's orbit (dimensionless):
  const E = getCoefficientOfEccentricity(datetime)

  // Get the solar mean anomaly (in degrees):
  const Ms =
    (2.5534 + 29.1053567 * k - 0.0000014 * Math.pow(T, 2) - 0.00000011 * Math.pow(T, 3)) % 360

  // Get the lunar mean anomaly (in degrees):
  const Ml =
    (201.5643 +
      385.81693528 * k +
      0.0107582 * Math.pow(T, 2) +
      0.00001238 * Math.pow(T, 3) -
      0.000000058 * Math.pow(T, 4)) %
    360

  const corr =
    -0.4075 * Math.sin(radians(Ml)) +
    0.1721 * E * Math.sin(radians(Ms)) +
    0.0161 * Math.sin(radians(2 * Ml)) -
    0.0097 * Math.sin(radians(2 * F1)) +
    0.0073 * E * Math.sin(radians(Ml - Ms)) -
    0.005 * E * Math.sin(radians(Ml + Ms)) -
    0.0023 * Math.sin(radians(Ml - 2 * F1)) +
    0.0021 * E * Math.sin(radians(2 * Ms)) +
    0.0012 * Math.sin(radians(Ml + 2 * F1)) +
    0.0006 * E * Math.sin(radians(2 * Ml + Ms)) -
    0.0004 * Math.sin(radians(3 * Ml)) -
    0.0003 * E * Math.sin(radians(Ms + 2 * F1)) +
    0.0003 * Math.sin(radians(A1)) -
    0.0002 * E * Math.sin(radians(Ms - 2 * F1)) -
    0.0002 * E * Math.sin(radians(2 * Ml - Ms)) -
    0.0002 * Math.sin(radians(Ω))

  // Get the Julian Date of the maximum of the eclipse:
  const maximum = convertJulianDateToUTC(JDE + corr)

  const W = Math.abs(Math.cos(radians(F1)))

  const P =
    0.207 * E * Math.sin(radians(Ms)) +
    0.0024 * E * Math.sin(radians(2 * Ms)) -
    0.0392 * Math.sin(radians(Ml)) +
    0.0116 * Math.sin(radians(2 * Ml)) -
    0.0073 * E * Math.sin(radians(Ml + Ms)) +
    0.0067 * E * Math.sin(radians(Ml - Ms)) +
    0.0118 * Math.sin(radians(2 * F1))

  const Q =
    5.2207 -
    0.0048 * E * Math.cos(radians(Ms)) +
    0.002 * E * Math.cos(radians(2 * Ms)) -
    0.3299 * Math.cos(radians(Ml)) -
    0.006 * E * Math.cos(radians(Ml + Ms)) -
    0.0041 * E * Math.cos(radians(Ml - Ms))

  const u =
    0.0059 +
    0.0046 * E * Math.cos(radians(Ms)) -
    0.0182 * Math.cos(radians(Ml)) +
    0.0004 * Math.cos(radians(2 * Ml)) -
    0.0005 * Math.cos(radians(Ms + Ml))

  // Gamma is the ratio of the distance of the Moon's shadow axis from the
  // center of the Earth to the radius of the Earth:
  const γ = (P * Math.cos(radians(F1)) + Q * Math.sin(radians(F1))) * (1 - 0.0048 * W)

  // Determine the type of eclipse.

  // If the gamma value is greater than 1.5433 + u, then the eclipse is not
  // visible from the Earth's surface:
  if (Math.abs(γ) > 1.5433 + u) return false

  // Assume the eclipse is total to begin with:
  let eclipseType = EclipseType.Total

  const isCentral = Math.abs(γ) < 0.9972

  if (!isCentral) {
    eclipseType = EclipseType.Partial
  }

  if (isCentral && u > 0.0047) {
    eclipseType = EclipseType.Annular
  }

  if (isCentral && u > 0 && u < 0.0047) {
    eclipseType =
      u < 0.00464 * Math.sqrt(1 - Math.pow(γ, 2)) ? EclipseType.AnnularTotal : EclipseType.Annular
  }

  let magnitude = undefined

  if (eclipseType === EclipseType.Partial) {
    magnitude = (1.5433 + u - Math.abs(γ)) / (0.5461 + 2 * u)
  }

  if (
    eclipseType === EclipseType.Total ||
    eclipseType === EclipseType.Annular ||
    eclipseType === EclipseType.AnnularTotal
  ) {
    magnitude = 1 - u / (0.27305 + u)
  }

  // Get the equatorial coordinates of the maximum of the eclipse for the Moon:
  const { ra, dec } = getLunarEquatorialCoordinate(maximum)

  // Convert the equatorial coordinates to horizontal coordinates:
  const { alt, az } = convertEquatorialToHorizontal(maximum, observer, { ra, dec })

  // If the altitude of the Moon is less than 0 degrees, then the eclipse is
  // not visible from the observer's location:
  if (alt < 0) return false

  // [TBI]: Calculate the approximate time when the eclipse begins and ends using
  // the Moon's angular diameter and the observer's location.
  // Search +/- 0.5 degrees around the maximum of the eclipse to find the time
  // when the eclipse begins and ends:
  // let interval = undefined

  return {
    k,
    JD: JDE + corr,
    type: eclipseType,
    isCentral,
    maximum,
    magnitude,
    alt,
    az,
    ra: ra,
    dec: dec,
    F,
    Ω,
    γ,
    u
  }
}

/*****************************************************************************************************************/

/**
 *
 * isLunarEclipse()
 *
 * @param datetime - The date and time to calculate the lunar eclipse for.
 * @param observer - The geographic coordinates of the observer.
 * @returns The lunar eclipse at the given date and time for the observer or false if no eclipse occurs.
 *
 */
export const isLunarEclipse = (
  datetime: Date,
  observer: GeographicCoordinate
):
  | (Eclipse &
      EquatorialCoordinate & {
        k: number
        F: number
        Ω: number
        γ: number
        u: number
      })
  | false => {
  // The threshold for a lunar eclipse to occur:
  // Anything greater than this value means that the Moon is not within the
  // threshold of the ascending node and a lunar eclipse cannot occur.
  const threshold = 18.25 // in degrees (18°15' in decimal degrees)

  // Get the Moon's true orbital longitude:
  const λt = getLunarTrueEclipticLongitude(datetime)

  // Get the corrected ecliptic longitude of the ascending node:
  const Ωcorr = getLunarCorrectedEclipticLongitudeOfTheAscendingNode(datetime)

  // Get the difference in longitude between the Moon and the ascending node,
  // and take the absolute value of the difference:
  const d = λt - Ωcorr

  // Check if the Moon is within the threshold of the ascending node, if not
  // we cannot have a lunar eclipse.
  // If the Moon is within the threshold of the ascending node, then we can
  // have a lunar eclipse. We can return the parameters of the eclipse:
  return Math.abs(d) % 360 > threshold && Math.abs(d - 180) % 360 > threshold
    ? false
    : getLunarEclipse(datetime, observer)
}

/*****************************************************************************************************************/

/**
 *
 * isSolarEclipse()
 *
 * @param datetime - The date and time to calculate the solar eclipse for.
 * @param observer - The geographic coordinates of the observer.
 * @returns The solar eclipse at the given date and time for the observer or false if no eclipse occurs.
 *
 */
export const isSolarEclipse = (
  datetime: Date,
  observer: GeographicCoordinate
):
  | (Eclipse &
      EquatorialCoordinate & {
        k: number
        F: number
        Ω: number
        γ: number
        u: number
      })
  | false => {
  // The threshold for a solar eclipse to occur:
  // Anything greater than this value means that the Moon is not within the
  // threshold of the ascending node and a solar eclipse cannot occur.
  const threshold = 18.5166666666667 // in degrees (18°31' in decimal degrees)

  // Get the Moon's true orbital longitude:
  const λt = getLunarTrueEclipticLongitude(datetime)

  // Get the corrected ecliptic longitude of the ascending node:
  const Ωcorr = getLunarCorrectedEclipticLongitudeOfTheAscendingNode(datetime)

  // Get the difference in longitude between the Moon and the ascending node,
  // and take the absolute value of the difference:
  const d = λt - Ωcorr

  // Check if the Moon is within the threshold of the ascending node, if not
  // we cannot have a solar eclipse.
  // If the Moon is within the threshold of the ascending node, then we can
  // have a solar eclipse. We can return the parameters of the eclipse:
  return Math.abs(d % 360) > threshold && Math.abs(d - 180) % 360 > threshold
    ? false
    : getSolarEclipse(datetime, observer)
}

/*****************************************************************************************************************/
