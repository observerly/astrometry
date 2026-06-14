/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/projection
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import type { CartesianCoordinate, HorizontalCoordinate } from './common'

import {
  convertRadiansToDegrees as degrees,
  getNormalizedAzimuthalDegree,
  convertDegreesToRadians as radians
} from './utilities'

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

/**
 *
 * convertHorizontalToPolar()
 *
 * Performs an azimuthal equidistant ("polar") projection of a horizontal
 * coordinate onto a flat "canvas", centered on the observer's zenith. The
 * radial distance from the center is directly proportional to the zenith
 * distance (90° - alt), such that the zenith maps to the center and the
 * horizon maps to the outermost circle.
 *
 * @param target the Horizontal Coordinate { alt, az } of the point to transform.
 * @param extent the width and height of the projected "canvas".
 * @param focus a scaling factor for the radial extent of the projection.
 * @returns the Cartesian Coordinate { x, y } conversion to the polar projection
 */
export const convertHorizontalToPolar = (
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

  // The zenith distance (the angular distance from the zenith) forms the radial
  // component of the azimuthal equidistant projection:
  const z = radians(90 - alt)

  // The azimuth forms the angular component. We subtract π so that the
  // projection shares the same central meridian (due south, az = 180°)
  // orientation as the stereographic projection:
  const azimuth = radians(az) - Math.PI

  // For an azimuthal equidistant projection the radial distance is directly
  // proportional to the zenith distance, scaled such that the horizon (z = π/2)
  // maps to a radius of f * height from the center:
  const r = (2 * f * height * z) / Math.PI

  const x = width / 2 + r * Math.sin(azimuth)

  const y = height / 2 + r * Math.cos(azimuth)

  return {
    x: x,
    y: y
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertPolarToHorizontal()
 *
 * Performs the inverse of the azimuthal equidistant ("polar") projection,
 * converting a Cartesian Coordinate { x, y } on the projected "canvas" back to
 * the Horizontal Coordinate { alt, az } it represents.
 *
 * @param cartesianCoordinate the { x, y } position of a particular point to transform.
 * @param extent the width and height of the projected "canvas".
 * @param focus a scaling factor for the radial extent of the projection.
 * @returns the Horizontal Coordinate { alt, az } conversion from the polar projection
 */
export const convertPolarToHorizontal = (
  cartesianCoordinate: CartesianCoordinate,
  extent: { width: number; height: number },
  focus = 0.42
): HorizontalCoordinate => {
  const { x, y } = cartesianCoordinate

  const { width, height } = extent

  const f = focus

  // The offset from the center of the projection, where the zenith resides:
  const X = x - width / 2

  const Y = y - height / 2

  // The radial distance from the center of the projection:
  const r = Math.sqrt(X ** 2 + Y ** 2)

  // Invert the radial distance to recover the zenith distance (in radians):
  const z = (r * Math.PI) / (2 * f * height)

  // The altitude is the complement of the zenith distance:
  const alt = 90 - degrees(z)

  // Recover the azimuth from the angular component, undoing the π offset applied
  // in the forward projection, and normalize it to a value between 0 and 360:
  const az = getNormalizedAzimuthalDegree(degrees(Math.atan2(X, Y)) + 180)

  return {
    az: az,
    alt: alt
  }
}

/*****************************************************************************************************************/
