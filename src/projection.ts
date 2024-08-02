/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/projection
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import type { CartesianCoordinate, HorizontalCoordinate } from './common'

import { convertRadiansToDegrees as degrees, convertDegreesToRadians as radians } from './utilities'

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
  },
  focus = 0.42
): CartesianCoordinate => {
  const { az, alt } = target

  const { width, height } = extent

  const f = focus

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

/**
 *
 * convertStereoToHorizontal()
 *
 * @param cartesianCoordinate representing the { x, y } position of a particular point to transform.
 * @param width (of type number) representing the width of the projected "canvas"
 * @param height (of type number) representing the height of the projected "canvas"
 * @returns the Horizontal Coordinate { alt, az } conversion from the stereographic projection
 */
export const convertStereoToHorizontal = (
  cartesianCoordinate: CartesianCoordinate,
  extent: { width: number; height: number },
  focus = 0.2
): HorizontalCoordinate => {
  const { x, y } = cartesianCoordinate

  const sinalt1 = 0

  const cosalt1 = 1

  const h = extent.height

  const w = extent.width

  const X = (x - w / 2) / h

  const Y = (h - y) / h

  const P = Math.sqrt(X ** 2 + Y ** 2)

  const c = 2 * Math.atan2(P, 2 * focus)

  const alt = Math.asin(Math.cos(c) * sinalt1 + (Y * Math.sin(c) * cosalt1) / P)

  const az =
    Math.PI + Math.atan2(X * Math.sin(c), P * cosalt1 * Math.cos(c) - Y * sinalt1 * Math.sin(c))

  return {
    az: degrees(az),
    alt: degrees(alt)
  }
}

/*****************************************************************************************************************/
