/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/coordinates
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getHourAngle, getObliquityOfTheEcliptic } from './astrometry'

import {
  type EclipticCoordinate,
  type EquatorialCoordinate,
  type GeographicCoordinate,
  type HorizontalCoordinate
} from './common'

import { convertDegreesToRadians as radians, convertRadiansToDegrees as degrees } from './utilities'

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
  target: EquatorialCoordinate
): HorizontalCoordinate => {
  const { latitude, longitude } = observer

  const declination = radians(target.dec)

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

  const altitude = Math.asin(
    Math.sin(declination) * Math.sin(radians(latitude)) +
      Math.cos(declination) * Math.cos(radians(latitude)) * Math.cos(ha)
  )

  const azimuth = Math.acos(
    (Math.sin(declination) - Math.sin(altitude) * Math.sin(radians(latitude))) /
      (Math.cos(altitude) * Math.cos(radians(latitude)))
  )

  return {
    alt: degrees(altitude),
    az: Math.sin(ha) > 0 ? 360 - degrees(azimuth) : degrees(azimuth)
  }
}

/*****************************************************************************************************************/
