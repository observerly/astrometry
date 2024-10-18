/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getHourAngle, getObliquityOfTheEcliptic } from './astrometry'

import { AU_IN_METERS } from './constants'

import {
  type EclipticCoordinate,
  type EquatorialCoordinate,
  type GeographicCoordinate
} from './common'

import { earth } from './earth'

import { getJulianDate } from './epoch'

import { getFOrbitalParameter } from './orbit'

import { getSolarEclipticLongitude, getSolarMeanAnomaly } from './sun'

import { convertRadiansToDegrees as degrees, convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 *
 * Lunation 1st as the first new moon of 1923 at approximately 02:41 UTC,
 * January 17, 1923 as per Ernest William Brown's lunar theory.
 *
 *
 */
export const LUNATION_BASE_JULIAN_DAY = 2423436.6115277777

/*****************************************************************************************************************/

/**
 *
 *
 * The time between two identical Lunar syzygies, equivalent of 29.53059
 * Earth days, which is based on Mean Synodic Month, 2000 AD mean solar days.
 *
 *
 */
export const LUNAR_SYNODIC_MONTH = 29.530588853

/*****************************************************************************************************************/

// I have named the full moons after the Native American names for the full moons in full knowledge that
// not all Native American tribes have the same names for the full moons (e.g., Moons of the Anishinaabeg).
// I have chosen to use the names from the Algonquin tribes as they are the most commonly known and used
// in modern culture, due to colonial "supremecy" and the fact that the Algonquin tribes were the first
// to be encountered by European settlers in the New World.
export type AlgonquinMoonNames =
  | 'Wolf Moon'
  | 'Snow Moon'
  | 'Worm Moon'
  | 'Pink Moon'
  | 'Flower Moon'
  | 'Strawberry Moon'
  | 'Buck Moon'
  | 'Sturgeon Moon'
  | 'Corn Moon'
  | "Hunter's Moon"
  | 'Beaver Moon'
  | 'Cold Moon'

/*****************************************************************************************************************/

export type AnishinaabegMoonNames =
  | 'Spirit Moon'
  | 'Bear Moon'
  | 'Snow Crust Moon'
  | 'Broken Snowshoe Moon'
  | 'Sucker Moon'
  | 'Blooming Moon'
  | 'Berry Moon'
  | 'Grain Moon'
  | 'Changing Leaves Moon'
  | 'Falling Leaves Moon'
  | 'Freezing Moon'
  | 'Little Spirit Moon'

/*****************************************************************************************************************/

export const Phases = {
  New: 'New',
  WaxingCrescent: 'Waxing Crescent',
  FirstQuarter: 'First Quarter',
  WaxingGibbous: 'Waxing Gibbous',
  Full: 'Full',
  WaningGibbous: 'Waning Gibbous',
  LastQuarter: 'Last Quarter',
  WaningCrescent: 'Waning Crescent',
  Invalid: 'Invalid'
} as const

export type Phase = (typeof Phases)[keyof typeof Phases]

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
 * getLunarArgumentOfLatitude()
 *
 * The Moon's argument of latitude is the angle between the Moon's current
 * position and the vernal equinox.
 *
 * @param datetime - The date to calculate the Moon's argument of latitude for.
 * @returns The Moon's argument of latitude at the given date.
 *
 */
export const getLunarArgumentOfLatitude = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  // Calculate the number of centuries since J2000.0:
  const T = (JD - 2451545.0) / 36525

  // k represents the number of new moons since the standard epoch J2000:
  const k = Math.round(T * 1236.85)

  // Get the Moon's argument of latitude at the current epoch relative to J2000:
  let F =
    (160.7108 +
      390.67050284 * k -
      0.0016118 * Math.pow(T, 2) -
      0.00000227 * Math.pow(T, 3) -
      0.000000011 * Math.pow(T, 4)) %
    360

  if (F < 0) {
    F += 360
  }

  return F
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

export const getLunarMeanAnomalyCorrection = (datetime: Date): number => {
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

/**
 *
 * getLunarElongation()
 *
 * The elongation of the Moon is the angle between the Sun and the Moon, as
 * seen from the reference observer Earth.
 *
 * @param date - The date to calculate the Moon's elongation for.
 * @returns The Moon's elongation in degrees.
 *
 */
export const getLunarElongation = (datetime: Date): number => {
  // Get the ecliptic coordinate:
  const { λ, β } = getLunarEclipticCoordinate(datetime)

  // Get the solar ecliptic longitude:
  const λS = getSolarEclipticLongitude(datetime)

  // Get the age of the Moon in degrees:
  let d = degrees(Math.acos(Math.cos(radians(λ - λS)) * Math.cos(radians(β)))) % 360

  if (d < 0) {
    d += 360
  }

  return d
}

/*****************************************************************************************************************/

/**
 *
 * getLunarAngularDiameter()
 *
 * The Moon's angular diameter is the distance between the Moon's centre and the Moon's limb.
 *
 * @param date - The date to calculate the Moon's angular diameter for.
 * @returns The Moon's angular diameter in degrees
 *
 */
export const getLunarAngularDiameter = (
  datetime: Date,
  observer?: GeographicCoordinate & { elevation: number }
): number => {
  if (!observer) {
    // Get the true anomaly:
    const ν = getLunarTrueAnomaly(datetime)

    // Get the F orbital paramater which applies corrections
    // due to the Moon's orbital eccentricity:
    const F = getFOrbitalParameter(ν, 0.0549)

    return 0.5181 * F
  }

  const k = 2 * 0.272481

  // Get the distance to the Moon, and convert to AU:
  const Δ = getLunarDistance(datetime) / AU_IN_METERS

  // Get the lunar equatorial coordinates:
  const { ra, dec } = getLunarEquatorialCoordinate(datetime)

  // Get the hour angle of the Moon:
  const ha = getHourAngle(datetime, observer.longitude, ra)

  const π = 8.794 / Δ // in units of arcseconds

  // Get the parallax constants from the distance to the Moon:
  const sπ = Math.sin(radians(π / 3600)) // Convert arcseconds to radians

  // Earth radius:
  const R = earth.r

  const { sin: sδ, cos: cδ } = { sin: Math.sin(radians(dec)), cos: Math.cos(radians(dec)) }
  const { sin: sH, cos: cH } = { sin: Math.sin(radians(ha)), cos: Math.cos(radians(ha)) }

  const u = Math.atan(0.99664719 * Math.tan(radians(observer.latitude)))

  const ρsφ =
    0.99664719 * Math.sin(u) + (observer.elevation * Math.sin(radians(observer.latitude))) / R

  const ρcφ = Math.cos(u) + (observer.elevation * Math.cos(radians(observer.latitude))) / R

  const A = cδ * sH
  const B = cδ * cH - ρcφ * sπ
  const C = sδ - ρsφ * sπ

  const q = Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2) + Math.pow(C, 2))

  return degrees((k / q) * sπ)
}

/*****************************************************************************************************************/

/**
 *
 * getLunarDistance()
 *
 *
 * The distance to the Moon is the distance between the centre of the Earth
 * and the centre of the Moon, corrected for the equation of center and the
 * Moon's ecliptic longitude at perigee at the epoch.
 *
 * @param date - The date to calculate the distance to the Moon for.
 * @returns The distance to the Moon in metres.
 *
 */
export const getLunarDistance = (datetime: Date): number => {
  // Get the true anomaly:
  const ν = getLunarTrueAnomaly(datetime)

  // Get the F orbital paramater which applies corrections
  // due to the Moon's orbital eccentricity:
  const F = getFOrbitalParameter(ν, 0.0549)

  return 3.844e8 / F
}

/*****************************************************************************************************************/

/**
 *
 * getLunarAge()
 *
 * The age of the Moon is calculated by ascertaining the number of degrees
 * the Moon has traversed in it's orbit, given that it takes the Moon
 * 29.5306 days to traverse a full 360° in one orbit cycle.
 *
 * @param date - The date to calculate the Moon's age for.
 * @returns The Moon's age in both degrees and days.
 *
 */
export const getLunarAge = (date: Date): { A: number; age: number } => {
  // Get the true ecliptic longitude:
  const λt = getLunarTrueEclipticLongitude(date)

  // Get the solar ecliptic longitude:
  const λ = getSolarEclipticLongitude(date)

  // Get the Moon's age in degrees:
  let A = (λt - λ) % 360

  // Correct for negative angles:
  if (A < 0) {
    A += 360
  }

  // Get the Moon's age in days by multiplying the age, A,
  // by the number of degrees traversed per day given that
  // the Moon orbits the Earth every 29.5306 days:
  const age = A * (29.5306 / 360)

  return {
    A,
    age
  }
}

/*****************************************************************************************************************/

/**
 *
 * getLunarPhaseAngle()
 *
 * The phase angle of the Moon is the angle subtended by the incident
 * light from the Sun as seen from the Earth's line of sight.
 *
 * @param date - The date to calculate the Moon's phase angle for.
 * @returns The Moon's phase angle in degrees.
 *
 */
export const getLunarPhaseAngle = (datetime: Date): number => {
  // Get the mean anomaly:
  const M = radians(getLunarMeanAnomaly(datetime))

  // Get the age of the Moon in degrees (elongation):
  const d = getLunarElongation(datetime)

  // Get the phase angle of the Moon in degrees:
  const PA =
    180 -
    d -
    0.1468 * ((1 - 0.0549 * Math.sin(M)) / (1 - 0.0167 * Math.sin(M))) * Math.sin(radians(d))

  return PA
}

/*****************************************************************************************************************/

/**
 *
 * getLunarIllimination()
 *
 * The total percentage illumination of the Moon as seen from Earth
 * (i.e., the visible portion of the Moon), not to be confused with
 * the total illumination of the Moon by the Sun which is always 50%.
 *
 * @param date - The date to calculate the Moon's phase angle for.
 * @returns The Moon's illumination as a percentage of the visible portion of the Moon as seen from Earth.
 *
 */
export const getLunarIllumination = (datetime: Date): number => {
  // Get the phase angle:
  const PA = getLunarPhaseAngle(datetime)

  // Get the total illuminated % fraction:
  return 50 * (1 + Math.cos(radians(PA)))
}

/*****************************************************************************************************************/

/**
 *
 * getLunarPhase()
 *
 * The phase of the Moon is the shape of the Moon's illuminated portion
 * as seen from the Earth.
 *
 * @param date - The date to calculate the Moon's phase for.
 * @returns The phase of the Moon.
 *
 */
export const getLunarPhase = (datetime: Date): Phase => {
  // Get the age of the Moon:
  const { age } = getLunarAge(datetime)

  // Get the illuniated fraction of the Moon (as a percentage):
  const illumination = getLunarIllumination(datetime)

  // Determine the phase of the Moon based off of the age and the illumination:
  if (age < 5.53699) {
    return Phases.WaxingCrescent
  }

  if (age < 9.22831) {
    return Phases.FirstQuarter
  }

  if (age < 14.71963) {
    return Phases.WaxingGibbous
  }

  // If the illumination is +/- 1% of 100% illumination then the Moon is full:
  if (age < 15.02096 && Math.abs(illumination - 100) < 1) {
    return Phases.Full
  }

  if (age < 20.30228) {
    return Phases.WaningGibbous
  }

  if (age < 23.99361) {
    return Phases.LastQuarter
  }

  if (age < 29.08493) {
    return Phases.WaningCrescent
  }

  return Phases.New
}

/*****************************************************************************************************************/

/**
 *
 * getBrownLunationNumber()
 *
 * The Brown Lunation Number (BLN), per Ernest William Brown's lunar theory introduced
 * in the American Ephemeris and Nautical Almanac., defining Lunation 1st as the first
 * new moon of 1923 at approximately 02:41 UTC, January 17, 1923.
 *
 * Represents the number of Lunar synodic months since Lunation 1st.
 *
 */
export const getLunarBrownLunationNumber = (datetime: Date): number => {
  // Get the Julian date:
  const JD = getJulianDate(datetime)

  return Math.round((JD - LUNATION_BASE_JULIAN_DAY) / LUNAR_SYNODIC_MONTH) + 1
}

/*****************************************************************************************************************/

// This is an exported helper function for determining if the Moon is new, this is
// useful for determining if a solar eclipse is possible, as a solar eclipse can
// only occur during a new Moon:

/**
 *
 * isNewMoon()
 *
 * @param datetime - The date to determine if the Moon is new for.
 * @returns true if the Moon is new, false otherwise.
 *
 */
export const isNewMoon = (datetime: Date): boolean => getLunarPhase(datetime) === 'New'

/*****************************************************************************************************************/

/**
 *
 * getNextNewMoon()
 *
 * @param datetime - The date to determine the next new Moon for.
 * @returns The date of the next new Moon.
 */
export const getNextNewMoon = (datetime: Date): Date => {
  // Amend the date to midnight on the given date:
  let date = new Date(new Date(datetime).setHours(0, 0, 0, 0))

  // The maximum number of days in a synodic month is 29, so if we increment the
  // date by 1 hour until we reach a new Moon, we will eventually reach
  // a new Moon within 29 days (~696 iterations):
  while (!isNewMoon(date)) {
    // Increment the date by 1 hour:
    date = new Date(date.getTime() + 60 * 60 * 1000)
  }

  let current = date.getTime() - 12 * 60 * 60 * 1000

  const end = date.getTime() + 12 * 60 * 60 * 1000

  // Initialize variables to keep track of the minimum illumination and date:
  let minimum = Infinity

  // Initialize the date of the new Moon:
  let newMoon: Date = date

  // Counter to track how many consecutive times the illumination has not decreased
  let counter = 0

  // Loop between lower and upper to get a more precise time for the new Moon:
  // Taking into consideration that the date is incremented in 10000ms intervals.
  while (current <= end) {
    // Get the illumination of the Moon at the current date:
    const illumination = getLunarIllumination(new Date(current))

    // Check if the current illumination is less than the minimum found so far:
    if (illumination < minimum) {
      minimum = illumination
      newMoon = new Date(current)
      counter = 0 // Reset the counter if the illumination decreases
    } else {
      counter++
    }

    // Increment by 10000 milliseconds (10 seconds)
    current += 10000

    // If illumination hasn't decreased for a certain number of iterations, break the loop
    if (counter > 100) {
      // The threshold can be adjusted based on specific needs
      break
    }
  }

  return newMoon
}

/*****************************************************************************************************************/

// This is an exported helper function for determining if the Moon is full, this is
// useful for determining if a lunar eclipse is possible, as a lunar eclipse can
// only occur during a full Moon:

/**
 *
 * isFullMoon()
 *
 * @param datetime - The date to determine if the Moon is full for.
 * @returns true if the Moon is full, false otherwise.
 *
 */
export const isFullMoon = (datetime: Date): boolean => getLunarPhase(datetime) === 'Full'

/*****************************************************************************************************************/

/**
 *
 * getNextFullMoon()
 *
 * @param datetime - The date to determine the next full Moon for.
 * @returns The date of the next full Moon.
 */
export const getNextFullMoon = (datetime: Date): Date => {
  // Amend the date to midnight on the given date:
  let date = new Date(new Date(datetime).setHours(0, 0, 0, 0))

  // The maximum number of days in a synodic month is 29, so if we increment the
  // date by 1 hour until we reach a full Moon, we will eventually reach
  // a full Moon within 29 days (~696 iterations):
  while (!isFullMoon(date)) {
    // Increment the date by 1 hour:
    date = new Date(date.getTime() + 60 * 60 * 1000)
  }

  let current = date.getTime() - 12 * 60 * 60 * 1000

  const end = date.getTime() + 12 * 60 * 60 * 1000

  // Initialize variables to keep track of the maximum illumination and date:
  let maximum = -Infinity

  // Initialize the date of the full Moon:
  let fullMoon: Date = date

  // Counter to track how many consecutive times the illumination has not increased
  let counter = 0

  // Loop between lower and upper to get a more precise time for the full Moon:
  // Taking into consideration that the date is incremented in 10000ms intervals.
  while (current <= end) {
    // Get the illumination of the Moon at the current date:
    const illumination = getLunarIllumination(new Date(current))

    // Check if the current illumination is greater than the maximum found so far:
    if (illumination > maximum) {
      maximum = illumination
      fullMoon = new Date(current)
      counter = 0 // Reset the counter if the illumination increases
    } else {
      counter++
    }

    // Increment by 10000 milliseconds (10 seconds)
    current += 10000

    // If illumination hasn't increased for a certain number of iterations, break the loop
    if (counter > 100) {
      // The threshold can be adjusted based on specific needs
      break
    }
  }

  return fullMoon
}

/*****************************************************************************************************************/

/**
 *
 * isBlueMoon()
 *
 * A Blue Moon is a full Moon that occurs twice in a single calendar month.
 *
 * I appreciate that the term "Blue Moon" is a colloquial term and that it
 * is not an astronomical term, but it is a term that is widely used and
 * understood by the general public. The term "Blue Moon" is also used to
 * describe the third full Moon in a season that has four full Moons.
 *
 * @param datetime - The date to determine if the Moon is a Blue Moon for.
 * @returns true if the Moon is a Blue Moon, false otherwise.
 */
export const isBlueMoon = (datetime: Date): boolean => {
  // If the Moon is full and it is the second full Moon in a calendar month,
  // then it is considered a Blue Moon. However, it is impossible to have a
  // Blue Moon on any other days except the 29th, 30th, or 31st of a given month,
  // as the synodic month is 29.530588853 days long.
  const today = datetime.getDate()

  // Calculate the fraction of the current day, in milliseconds, of the synodic month:
  const f = (LUNAR_SYNODIC_MONTH - 29) * 24 * 60 * 60 * 1000

  const ms =
    datetime.getHours() * 60 * 60 * 1000 +
    datetime.getMinutes() * 60 * 1000 +
    datetime.getSeconds() * 1000 +
    datetime.getMilliseconds()

  // If the time on the current day is less than the fraction of the day of the synodic month,
  // then the Moon is not a Blue Moon or if the day is not the 29th, 30th, or 31st:
  if ((today !== 29 && today !== 30 && today !== 31) || (today === 29 && ms < f)) {
    return false
  }

  // Is the Moon full?
  return isFullMoon(datetime)
}

/*****************************************************************************************************************/
