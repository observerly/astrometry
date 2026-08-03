/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { EARTH_RADIUS } from './constants'

import type { Observer } from './common'

import { convertRadiansToDegrees } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getLocalHorizon()
 *
 * Calculates the local horizon depression for a given observer (in degrees).
 *
 * @param h - The observer for which to calculate the local horizon depression., or a number representing
 * the observer's elevation above sea level (in SI metres).
 * @param k - The observer's atmospheric refraction (unitless)
 * @returns The local horizon depression (in degrees).
 */
export const getLocalHorizon = (h: number | Observer, k = 0.167): number => {
  let elevation = 0

  // If the observer is an object, extract the elevation:
  if (typeof h !== 'number' && h.elevation) {
    elevation = h.elevation
  }

  if (typeof h === 'number') {
    elevation = h
  }

  // An observer at or below sea level is taken to be at sea level, where the depression vanishes:
  if (elevation <= 0) {
    return 0
  }

  // Return the local horizon depression (in degrees) for the observer:
  // Takes into account refraction (k) if provided, otherwise defaults to 0.167.
  // N.B. The depression is the exact angle subtended, and not its small angle approximation,
  // which diverges for elevations that are an appreciable fraction of the radius of the Earth:
  return convertRadiansToDegrees(
    Math.acos(EARTH_RADIUS / (EARTH_RADIUS + (1 - k) * elevation))
  )
}

/*****************************************************************************************************************/
