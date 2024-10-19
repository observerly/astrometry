/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/seeing
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import type { HorizontalCoordinate } from './common'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * getAirmassPickering()
 *
 * Airmass is a measure of the amount of air along the line of sight when observing a star
 * or other celestial source from below Earth's atmosphere. It is formulated
 * as the integral of air density along the light ray.
 *
 * @see Pickering, K. A. (2002). "The Southern Limits of the Ancient Star Catalog" (PDF). DIO. 12 (1): 20-39.
 * @param target - The horizontal coordinate of the observed object.
 * @returns The airmass of the object.
 *
 */
export const getAirmassPickering = (target: HorizontalCoordinate): number => {
  const { alt } = target

  // Apply Pickering's formula to the altitude of the object:
  return 1 / Math.sin(radians(alt + 244 / (165 + 47 * alt ** 1.1)))
}

/*****************************************************************************************************************/
