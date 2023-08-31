/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getObliquityOfTheEcliptic } from './astrometry'

import { type EclipticCoordinate, type EquatorialCoordinate } from './common'

import { getJulianDate } from './epoch'

import { getSolarMeanAnomaly, getSolarEclipticLongitude } from './sun'

import { convertDegreesToRadians as radians, convertRadiansToDegrees as degrees } from './utilities'

/*****************************************************************************************************************/

export const getLunarAnnualEquationCorrection = (datetime: Date): number => {
  // Correct for the Sun's mean anomaly:
  const M = radians(getSolarMeanAnomaly(datetime))

  // Get the annual equation correction:
  return 0.1858 * Math.sin(M)
}

/*****************************************************************************************************************/

/**
 *
 * getLunarMeanAnomaly()
 *
 * The Moon's mean anomaly is the angle between perigee and the Moon's current position.
 *
 * @param date - The date to calculate the Moon's mean anomaly for.
 * @returns The Moon's mean anomaly at the given date.
 *
 */
export const getLunarMeanAnomaly = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // Get the Moon's mean anomaly at the current epoch relative to J2000:
  let M =
    (134.9634114 +
      477198.8676313 * T +
      0.008997 * Math.pow(T, 2) +
      Math.pow(T, 3) / 69699 -
      Math.pow(T, 4) / 14712000) %
    360

  // Correct for negative angles
  if (M < 0) {
    M += 360
  }

  return M
}

/*****************************************************************************************************************/

/**
 *
 * getLunarMeanGeometricLongitude()
 *
 * The Moon's mean geometric longitude is the angle between the Moon's current
 * position and the vernal equinox.
 *
 * @param date - The date to calculate the Moon's mean geometric longitude for.
 * @returns The Moon's mean geometric longitude at the given date.
 *
 */
export const getLunarMeanGeometricLongitude = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  let l =
    (218.3164477 +
      481267.88123421 * T -
      0.0015786 * Math.pow(T, 2) +
      Math.pow(T, 3) / 538841 -
      Math.pow(T, 4) / 65194000) %
    360

  // Correct for negative angles
  if (l < 0) {
    l += 360
  }

  return l
}

/*****************************************************************************************************************/

/**
 *
 * getLunarMeanEclipticLongitude()
 *
 * The mean lunar ecliptic longitude is the ecliptic longitude of the Moon
 * if the Moon's orbit where free of perturbations
 *
 * @param date - The date to calculate the Moon's mean ecliptic longitude for.
 * @returns The Moon's mean ecliptic longitude at the given date.
 *
 */
export const getLunarMeanEclipticLongitude = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Get the number of days since the standard epoch J2000:
  const De = JD - 2451545.0

  // Get the uncorrected mean eclptic longitude:
  let λ = (13.176339686 * De + 218.31643388) % 360

  // Correct for negative angles
  if (λ < 0) {
    λ += 360
  }

  return λ
}

/*****************************************************************************************************************/

export const getLunarEvectionCorrection = (datetime: Date): number => {
  // Get the Moon's mean anomaly at the current epoch relative to J2000:
  const M = radians(getLunarMeanAnomaly(datetime))

  // Get the Moon's mean ecliptic longitude:
  const λ = radians(getLunarMeanEclipticLongitude(datetime))

  // Get the Sun's mean ecliptic longitude:
  const l = radians(getSolarEclipticLongitude(datetime))

  // Get the avection correction:
  return 1.2739 * Math.sin(2 * (λ - l) - M)
}

/*****************************************************************************************************************/

/**
 *
 * getLunarMeanEclipticLongitudeOfTheAscendingNode()
 *
 * The mean lunar ecliptic longitude of the ascending node is the angle where
 * the Moon's orbit crosses the ecliptic at the current epoch relative to J2000.
 *
 * @param date - The date to calculate the Moon's mean ecliptic longitude of the ascending node for.
 * @returns The Moon's mean ecliptic longitude of the ascending node at the given date.
 *
 */
export const getLunarMeanEclipticLongitudeOfTheAscendingNode = (datetime: Date): number => {
  // Get the number of days since the standard epoch J2000:
  const d = getJulianDate(datetime) - 2451545.0

  // Get the Moon's ecliptic longitude of the ascending node at the current epoch relative to J2000:
  let Ω = (125.044522 - 0.0529539 * d) % 360

  // Correct for negative angles
  if (Ω < 0) {
    Ω += 360
  }

  // Correct for the Sun's mean anomaly:
  const M = radians(getSolarMeanAnomaly(datetime))

  return Ω - 0.16 * Math.sin(M)
}

/*****************************************************************************************************************/

export const getLunarMeanAnomalyCorrection = (datetime: Date) => {
  // Get the annual equation correction:
  const Ae = getLunarAnnualEquationCorrection(datetime)

  // Get the evection correction:
  const Ev = getLunarEvectionCorrection(datetime)

  // Get the mean anomaly for the Moon:
  const M = getLunarMeanAnomaly(datetime)

  // Correct for the Sun's mean anomaly:
  const S = radians(getSolarMeanAnomaly(datetime))

  // Get the mean anomaly correction:
  let Ca = (M + Ev - Ae - 0.37 * Math.sin(S)) % 360

  // Correct for negative angles
  if (Ca < 0) {
    Ca += 360
  }

  return Ca
}

/*****************************************************************************************************************/

/**
 *
 * getLunarTrueAnomaly()
 *
 * The true anomaly of the Moon is the angle between the perihelion and the
 * current position of the Moon, as seen from the Earth.
 *
 * @param date - The date to calculate the Moon's true anomaly for.
 * @returns The Moon's true anomaly in degrees.
 */
export const getLunarTrueAnomaly = (datetime: Date): number => {
  // Get the mean anomaly correction:
  const Ca = getLunarMeanAnomalyCorrection(datetime)

  // Get the true anomaly:
  let ν = 6.2886 * Math.sin(radians(Ca)) + ((0.214 * Math.sin(radians(2 * Ca))) % 360)

  // Correct for negative angles
  if (ν < 0) {
    ν += 360
  }

  return ν
}

/*****************************************************************************************************************/

/**
 *
 * getLunarTrueEclipticLongitude()
 *
 * The corrected lunar ecliptic longitude is the ecliptic longitude of the Moon
 * if the Moon's orbit where free of perturbations.
 *
 * @param date - The date to calculate the Moon's true ecliptic longitude for.
 * @returns The Moon's true ecliptic longitude in degrees.
 *
 */
export const getLunarTrueEclipticLongitude = (datetime: Date): number => {
  // Get the mean ecliptic longitude:
  let λ = getLunarMeanEclipticLongitude(datetime)

  // Get the annual equation correction:
  const Ae = getLunarAnnualEquationCorrection(datetime)

  // Get the evection correction:
  const Ev = getLunarEvectionCorrection(datetime)

  // Get the true anomaly:
  const ν = getLunarTrueAnomaly(datetime)

  // Get the corrected ecliptic longitude:
  λ = (λ + Ev + ν - Ae) % 360

  // Correct for negative angles
  if (λ < 0) {
    λ += 360
  }

  // Get the solar ecliptic longitude:
  const L = getSolarEclipticLongitude(datetime)

  // Get the correction of variation:
  const V = 0.6583 * Math.sin(2 * radians(λ - L))

  let λt = (λ + V) % 360

  // Correct for negative angles
  if (λt < 0) {
    λt += 360
  }

  return λt
}

/*****************************************************************************************************************/

/**
 *
 * getLunarCorrectedEclipticLongitudeOfTheAscendingNode()
 *
 * The corrected lunar ecliptic longitude of the ascending node is the angle where
 * the Moon's orbit crosses the ecliptic corrected for perturbations in the
 * Moon's orbit due to the Sun.
 *
 * @param date - The date to calculate the Moon's corrected ecliptic latitude for.
 * @returns The Moon's corrected ecliptic latitude in degrees.
 *
 */
export const getLunarCorrectedEclipticLongitudeOfTheAscendingNode = (datetime: Date): number => {
  // Get the ecliptic longitude of the ascending node:
  const Ω = getLunarMeanEclipticLongitudeOfTheAscendingNode(datetime)

  // Get the solar mean anomaly:
  const M = getSolarMeanAnomaly(datetime)

  return Ω - 0.16 * Math.sin(radians(M))
}

/*****************************************************************************************************************/

/**
 *
 * getLunarEclipticLongitude()
 *
 * The ecliptic longitude for the Moon is the angle between the perihelion and
 * the current position of the Moon, as seen from the centre of the Earth,
 * corrected for the equation of center and the Moon's ecliptic longitude at
 * perigee at the epoch.
 *
 * @param date - The date to calculate the Moon's ecliptic longitude for.
 * @returns The Moon's ecliptic longitude in degrees.
 *
 */
export const getLunarEclipticLongitude = (datetime: Date): number => {
  // Get the true ecliptic longitude:
  const λt = getLunarTrueEclipticLongitude(datetime)

  // Get the corrected ecliptic longitude of the ascending node:
  const Ωcorr = getLunarCorrectedEclipticLongitudeOfTheAscendingNode(datetime)

  // Get the Moon's orbital inclination:
  const ι = radians(5.1453964)

  // Calculate the ecliptic longitude of the Moon (in degrees):
  let λ =
    (Ωcorr +
      degrees(
        Math.atan2(Math.sin(radians(λt - Ωcorr)) * Math.cos(ι), Math.cos(radians(λt - Ωcorr)))
      )) %
    360

  // Correct for negative angles
  if (λ < 0) {
    λ += 360
  }

  return λ
}

/*****************************************************************************************************************/

/**
 *
 * getLunarEclipticLatitude()
 *
 * The ecliptic latitude for the Moon is the angle between the ecliptic and
 * the current position of the Moon, as seen from the centre of the Earth,
 * corrected for the equation of center and the Moon's ecliptic longitude at
 * perigee at the epoch.
 *
 * @param date - The date to calculate the Moon's ecliptic latitude for.
 * @returns The Moon's ecliptic latitude in degrees.
 *
 */
export const getLunarEclipticLatitude = (datetime: Date): number => {
  // Get the true ecliptic longitude:
  const λt = getLunarTrueEclipticLongitude(datetime)

  // Get the corrected ecliptic longitude of the ascending node:
  const Ωcorr = getLunarCorrectedEclipticLongitudeOfTheAscendingNode(datetime)

  // Get the Moon's orbital inclination:
  const ι = radians(5.1453964)

  // Calculate the ecliptic latitude of the Moon (in degrees):
  const β = degrees(Math.asin(Math.sin(radians(λt - Ωcorr)) * Math.sin(ι)))

  return β
}

/*****************************************************************************************************************/

/**
 *
 * getLunarEclipticCoordinate()
 *
 * The ecliptic coordinates for the Moon are the angles between the ecliptic and
 * the current position of the Moon, as seen from the centre of the Earth,
 * corrected for the equation of center and the Moon's ecliptic longitude at
 * perigee at the epoch.
 *
 * @param date - The date to calculate the Moon's ecliptic coordinates for.
 * @returns The Moon's ecliptic coordinates in degrees.
 *
 */
export const getLunarEclipticCoordinate = (datetime: Date): EclipticCoordinate => {
  // Get the true ecliptic longitude:
  const λt = getLunarTrueEclipticLongitude(datetime)

  // Get the corrected ecliptic longitude of the ascending node:
  const Ωcorr = getLunarCorrectedEclipticLongitudeOfTheAscendingNode(datetime)

  // Get the Moon's orbital inclination:
  const ι = radians(5.1453964)

  // Calculate the ecliptic longitude of the Moon (in degrees):
  let λ =
    (Ωcorr +
      degrees(
        Math.atan2(Math.sin(radians(λt - Ωcorr)) * Math.cos(ι), Math.cos(radians(λt - Ωcorr)))
      )) %
    360

  // Correct for negative angles
  if (λ < 0) {
    λ += 360
  }

  // Calculate the ecliptic latitude of the Moon (in degrees):
  const β = degrees(Math.asin(Math.sin(radians(λt - Ωcorr)) * Math.sin(ι)))

  return { λ, β }
}

/*****************************************************************************************************************/

/**
 *
 * getLunarEquatorialCoordinate()
 *
 * The equatorial coordinates for the Moon are the angles between the equator and
 * the current position of the Moon, as seen from the centre of the Earth,
 * corrected for the equation of center and the Moon's ecliptic longitude at
 * perigee at the epoch.
 *
 * @param date - The date to calculate the Moon's equatorial coordinates for.
 * @returns The Moon's equatorial coordinates in degrees.
 *
 */
export const getLunarEquatorialCoordinate = (datetime: Date): EquatorialCoordinate => {
  // Get the ecliptic coordinates for the Moon:
  const { λ, β } = getLunarEclipticCoordinate(datetime)

  // Get the ecliptic obliquity:
  const ε = radians(getObliquityOfTheEcliptic(datetime))

  // Calculate the right ascension of the Moon:
  const ra = degrees(
    Math.atan2(
      Math.sin(radians(λ)) * Math.cos(ε) - Math.tan(radians(β)) * Math.sin(ε),
      Math.cos(radians(λ))
    )
  )

  // Calculate the declination of the Moon:
  const dec = degrees(
    Math.asin(
      Math.sin(radians(β)) * Math.cos(ε) + Math.cos(radians(β)) * Math.sin(ε) * Math.sin(radians(λ))
    )
  )

  return {
    ra,
    dec
  }
}

/*****************************************************************************************************************/
