/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/humanize
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { convertDegreeToDMS } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * formatDegreeToDMSHumanized()
 *
 * convert coordinate (in decimal degrees) to degrees (°), minutes ('), seconds ('').
 *
 * @param degree - The coordinate in decimal degrees to convert.
 * @returns e.g., a humanized degree in format string '0º 0' 00"'
 *
 */
export const formatDegreeToDMSHumanized = (degree: number): string => {
  const { deg, min, sec } = convertDegreeToDMS(degree)

  // Add a plus sign if positive, minus if negative:
  const sign = deg >= 0 ? '+' : '-'

  // Parse the result ensuring that the values are padded with a leading zero (for both negative and positive values) if necessary:
  const leadingZero = deg > -10 && deg < 10 ? '0' : ''

  return `${sign}${leadingZero}${Math.abs(deg)}° ${
    min < 10 ? '0' + Math.abs(min) : Math.abs(min)
  }' ${sec < 10 ? '0' + Math.abs(sec) : Math.abs(sec)}"`
}

/*****************************************************************************************************************/
