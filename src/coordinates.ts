/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/coordinates
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getHourAngle, getLocalSiderealTime, getObliquityOfTheEcliptic } from './astrometry'

import type {
  EclipticCoordinate,
  EquatorialCoordinate,
  GalacticCoordinate,
  GeographicCoordinate,
  HorizontalCoordinate
} from './common'
import { EARTH_RADIUS } from './constants'

import { convertRadiansToDegrees as degrees, convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * convertEclipticToEquatorial()
 *
 * Performs the conversion from Ecliptic to Equatorial coordinates for a given
 * datetime and target (observer agnostic).
 *
 * @param date - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param target - The ecliptical coordinate of the observed object.
 * @returns The equatorial coordinates of the target
 *
 */
export const convertEclipticToEquatorial = (
  datetime: Date,
  target: EclipticCoordinate
): EquatorialCoordinate => {
  // Get the obliquity of the ecliptic for the given datetime:
  const ε = radians(getObliquityOfTheEcliptic(datetime))

  const λ = radians(target.λ)

  const β = radians(target.β)

  const α = Math.atan2(Math.sin(λ) * Math.cos(ε) - Math.tan(β) * Math.sin(ε), Math.cos(λ))

  const δ = Math.asin(Math.sin(β) * Math.cos(ε) + Math.cos(β) * Math.sin(ε) * Math.sin(λ))

  return {
    ra: degrees(α) < 0 ? degrees(α) + 360 : degrees(α),
    dec: degrees(δ)
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertGalacticToEquatorial()
 *
 * @param target - The galactic coordinate of the observed object.
 * @returns The equatorial coordinates of the target in J2000.0
 *
 */
export const convertGalacticToEquatorial = (target: GalacticCoordinate): EquatorialCoordinate => {
  let { ra, dec } = { ra: 0, dec: 0 }

  // Define the Right Ascenation equatorial coordinate of the galactic north pole, at J2000.0
  const α0 = radians(192.8598)

  // Define Declination the equatorial coordinate of the galactic north pole, at J2000.0
  const δ0 = radians(27.128027)

  // Define the galactic longitude of the ascending node of the galactic equator on the ecliptic, at J2000.0
  const N0 = radians(32.9319)

  // Convert the galactic coordinate, b,, to radians:
  const b = radians(target.b)

  // Convert the galactic coordinate, l, to radians:
  const l = radians(target.l)

  // Calculate the declination of the target:
  dec = degrees(
    Math.asin(Math.cos(b) * Math.cos(δ0) * Math.sin(l - N0) + Math.sin(b) * Math.sin(δ0))
  )

  // Calculate the denominator of the right ascension of the target:
  const y = Math.cos(b) * Math.cos(l - N0)

  // Calculate the numerator of the right ascension of the target:
  const x = Math.sin(b) * Math.cos(δ0) - Math.cos(b) * Math.sin(δ0) * Math.sin(l - N0)

  // Calculate the right ascension of the target, adjusting for the quadrant:
  ra = degrees(Math.atan2(y, x) + α0) % 360

  if (ra < 0) {
    ra += 360
  }

  return {
    ra,
    dec
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertEquatorialToHorizontal()
 *
 * Performs the conversion from Equatorial to Horizontal coordinates for a given
 * datetime, observer, and target.
 *
 * @param date - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate of the observed object.
 * @returns The horizontal coordinates of the target
 *
 */
export const convertEquatorialToHorizontal = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate & { distance?: number }
): HorizontalCoordinate => {
  const { latitude, longitude, elevation = 0 } = observer

  const declination = radians(target.dec)

  const R = EARTH_RADIUS

  // Divide-by-zero errors can occur when we have cos(90), and sin(0)/sin(180) etc
  // cosine: multiples of π/2
  // sine: 0, and multiples of π.
  if (Math.cos(radians(latitude)) === 0) {
    return {
      alt: -1,
      az: -1
    }
  }

  // Get the hour angle for the target:
  const ha = radians(getHourAngle(datetime, longitude, target.ra))

  // Calculate the altitude of the target, ensuring it is within the range -π/2 to π/2 for arcsin,
  // i.e., between [-1, 1]. This accounts for the observer's target being directly overhead, e.g., at the zenith,
  // or directly below the observer, e.g., at the nadir.
  const altitude = Math.asin(
    Math.max(
      -1,
      Math.min(
        1,
        Math.sin(declination) * Math.sin(radians(latitude)) +
          Math.cos(declination) * Math.cos(radians(latitude)) * Math.cos(ha)
      )
    )
  )

  const azimuth = Math.acos(
    Math.max(
      -1,
      Math.min(
        1,
        (Math.sin(declination) - Math.sin(radians(latitude)) * Math.sin(altitude)) /
          (Math.cos(radians(latitude)) * Math.cos(altitude))
      )
    )
  )

  let p = 0

  if (target.distance !== undefined && target.distance > 0) {
    // For nearby objects, horizontal parallax (p) is approximated as R/target.distance (in radians)
    p = R / target.distance
  }

  // Calculate the topocentric correction for the altitude of the target:
  const topocentricCorrection: HorizontalCoordinate = {
    alt: p * Math.cos(altitude) * Math.cos(azimuth),
    az: (-p * Math.sin(azimuth)) / Math.cos(altitude)
  }

  return {
    alt: degrees(altitude + Math.sqrt((2 * elevation) / R)) + topocentricCorrection.alt,
    az:
      Math.sin(ha) > 0
        ? 360 - degrees(azimuth + topocentricCorrection.az)
        : degrees(azimuth + topocentricCorrection.az)
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertHorizontalToEquatorial()
 *
 * Performs the conversion from Horizontal to Equatorial coordinates for a given
 * datetime, observer, and target.
 *
 * @param datetime - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param observer - The geographic coordinate of the observer.
 * @param target - The horizontal coordinate of the observed object.
 * @returns The equatorial coordinates of the target
 */
export const convertHorizontalToEquatorial = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: HorizontalCoordinate
): EquatorialCoordinate => {
  const { latitude, longitude } = observer

  const altitude = radians(target.alt)
  const azimuth = radians(target.az)

  // Calculate the declination (in radians) for the target:
  const dec = Math.asin(
    Math.sin(radians(latitude)) * Math.sin(altitude) +
      Math.cos(radians(latitude)) * Math.cos(altitude) * Math.cos(azimuth)
  )

  // Calculate the hour angle (in radians) for the target:
  let ha = Math.atan2(
    (-Math.sin(azimuth) * Math.cos(altitude)) / Math.cos(dec),
    (Math.sin(altitude) - Math.sin(radians(latitude)) * Math.sin(dec)) /
      (Math.cos(radians(latitude)) * Math.cos(dec))
  )

  // Adjust the hour angle for the observer's longitude:
  if (ha < 0) {
    ha += 2 * Math.PI
  }

  // Calculate the Local Sidereal Time (LST) for the observer:
  const LST = getLocalSiderealTime(datetime, longitude)

  // Calculate the Right Ascension (in degrees) for the target:
  let ra = LST * 15 - degrees(ha)

  // Adjust the angle to be within the range 0° to 360°:
  if (ra < 0) {
    ra += 360
  }

  return {
    ra: ra % 360,
    dec: degrees(dec)
  }
}

/*****************************************************************************************************************/
