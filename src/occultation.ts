/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/occultation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  type GeographicCoordinate,
  type HorizontalCoordinate,
  isEquatorialCoordinate,
  isHorizontalCoordinate
} from './common'

import { EARTH_RADIUS } from './constants'

import { convertEquatorialToHorizontal } from './coordinates'

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

/**
 *
 * isBodyOccultedByEarth()
 *
 * Determines whether a target is behind the Earth for an observer at the time of observation, e.g.,
 * whether it lies within the cone the Earth occults, centered on the nadir of the observer.
 *
 * The nadir of an observer is at an altitude of -90°, and so a target is within that cone when its
 * altitude is below the angular radius of the limb, less the 90° from the nadir to the horizontal.
 * An observer that must not look through the upper atmosphere occults a larger cone, e.g., the limb
 * is raised by the grazing height of the shell they are to clear.
 *
 * @param datetime - The date and time of the observation.
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial or horizontal coordinate of the observed object.
 * @param grazing - The height of the atmospheric shell to clear above the surface (in SI metres).
 * @param radius - The radius of the Earth (in SI metres).
 * @returns a boolean indicating whether the target is occulted by the Earth for the observer.
 *
 */
export const isBodyOccultedByEarth = (
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate | HorizontalCoordinate,
  grazing = 0,
  radius: number = EARTH_RADIUS
): boolean => {
  let alt = Number.NaN

  // Is the target an equatorial coordinate?
  if (isEquatorialCoordinate(target)) {
    // We only need to consider the altitude of the target object:
    alt = convertEquatorialToHorizontal(datetime, observer, target).alt
  }

  // Is the target a horizontal coordinate?
  if (isHorizontalCoordinate(target)) {
    // We only need to consider the altitude of the target object:
    alt = target.alt
  }

  // The angular radius of the cone the Earth occults, centered on the nadir of the observer:
  const limb = getEarthLimbAngularRadius(observer.elevation ?? 0, grazing, radius)

  // The angular separation of the target from the nadir of the observer, which lies at an altitude
  // of -90°, e.g., a target at the zenith is 180° from the nadir (in degrees):
  const nadir = 90 + alt

  // The target is occulted where it is nearer to the nadir than the limb of the Earth. The
  // comparison is not negated, and so a target whose altitude is not a number is not reported as
  // occulted, e.g., an unresolvable target is not reported as one the Earth is known to hide:
  return nadir < limb
}

/*****************************************************************************************************************/
