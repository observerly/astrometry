/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/occultation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { EARTH_RADIUS } from './constants'

import { convertRadiansToDegrees } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getEarthLimbAngularRadius()
 *
 * Calculates the angular radius of the Earth (in degrees) as seen by an observer at a given
 * elevation, e.g., the half-angle of the cone, centered on the nadir of the observer, which the
 * Earth occults. A target within that cone of the nadir is behind the Earth, and so the angular
 * radius is to an observer above the atmosphere what the horizon is to an observer beneath it.
 *
 * An observer that must not look through the upper atmosphere avoids a larger cone, and so the
 * limb may be raised by a grazing height, e.g., the height of the atmospheric shell to clear.
 *
 * N.B. The Earth is modelled as a sphere of the radius given, and so an observer that resolves the
 * oblateness of the Earth passes the radius local to the point the limb is grazed.
 *
 * @param elevation - The elevation of the observer above the surface (in SI metres).
 * @param grazing - The height of the atmospheric shell to clear above the surface (in SI metres).
 * @param radius - The radius of the Earth (in SI metres).
 * @returns The angular radius of the Earth for the observer (in degrees).
 *
 */
export const getEarthLimbAngularRadius = (
  elevation: number,
  grazing = 0,
  radius: number = EARTH_RADIUS
): number => {
  // The distance of the observer from the center of the Earth, and the radius of the shell they
  // are to clear (in SI metres):
  const distance = radius + elevation

  const shell = radius + grazing

  // An observer at or within the shell they are to clear is enclosed by it, and so the limb spans
  // the whole of the sky beneath them, e.g., a hemisphere of angular radius 90°. The distances are
  // compared, and not their ratio, so that an observer at or beneath the center of the Earth, for
  // whom the ratio is negative rather than greater than one, is enclosed by it also:
  if (distance <= shell) {
    return 90
  }

  // The sine of the angular radius is the ratio of the radius of the shell the observer clears to
  // their distance from the center of the Earth, which is now bounded by one:
  return convertRadiansToDegrees(Math.asin(shell / distance))
}

/*****************************************************************************************************************/
