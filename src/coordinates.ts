/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getHourAngle } from './astrometry'

import {
  type EquatorialCoordinate,
  type GeographicCoordinate,
  type HorizontalCoordinate
} from './common'

import { convertDegreesToRadians as radians, convertRadiansToDegrees as degrees } from './utilities'

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
