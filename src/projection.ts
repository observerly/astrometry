/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/projection
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { type CartesianCoordinate, type HorizontalCoordinate } from './common'

import { convertDegreesToRadians as radians } from './utilities'

/*****************************************************************************************************************/

/**
 *
 * convertHorizontalToStereo()
 *
 * @param horizontalCoordinate
 * @param width
 * @param height
 * @returns the Cartesian Coordinate { x, y } conversion to the stereographic projection
 */
export const convertHorizontalToStereo = (
  target: HorizontalCoordinate,
  extent: {
    width: number
    height: number
  }
): CartesianCoordinate => {
  const { az, alt } = target

  const { width, height } = extent

  const f = 0.42

  const sinalt1 = 0

  const cosalt1 = 1

  const cosaz = Math.cos(radians(az) - Math.PI)

  const sinaz = Math.sin(radians(az) - Math.PI)

  const sinalt = Math.sin(radians(alt))

  const cosalt = Math.cos(radians(alt))

  const k = 2 / (1 + sinalt1 * sinalt + cosalt1 * cosalt * cosaz)

  const x = width / 2 + f * k * height * cosalt * sinaz

  const y = height - f * k * height * (cosalt1 * sinalt - sinalt1 * cosalt * cosaz)

  return {
    x: x,
    y: y
  }
}

/*****************************************************************************************************************/
