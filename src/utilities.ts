/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/utilities
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

/**
 *
 * convertDegreesToRadians()
 *
 * Converts an angle in degrees to radians.
 *
 * @param degrees - The angle in degrees to convert to radians.
 * @returns The angle in radians.
 *
 */
export const convertDegreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180
}

/*****************************************************************************************************************/
