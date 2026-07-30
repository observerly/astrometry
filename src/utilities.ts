/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/utilities
// @license        Copyright © 2021-2026 observerly

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

/**
 *
 * convertRadiansToDegrees()
 *
 * Converts an angle in radians to degrees.
 *
 * @param degrees - The angle in radians to convert to degrees.
 * @returns The angle in degrees.
 *
 */
export const convertRadiansToDegrees = (degrees: number): number => {
  return (degrees * 180) / Math.PI
}

/*****************************************************************************************************************/

/**
 *
 * getNormalizedAzimuthalDegree()
 *
 * Normalizes an azimuthal angle it to a value between 0 and 360.
 *
 * @param degrees - The angle in degrees to convert.
 * @returns The normalized angle in degrees.
 *
 */
export const getNormalizedAzimuthalDegree = (degrees: number): number => {
  // Correct for large angles (+ive or -ive):
  let d = degrees % 360

  // Correct for negative angles
  if (d < 0) {
    d += 360
  }

  return Math.abs(d)
}

/*****************************************************************************************************************/

/**
 *
 * getNormalizedInclinationDegree()
 *
 * Normalizes an inclination angle to a value between -90 and 90.
 *
 * @param degrees - The angle in degrees to convert.
 * @returns The normalized angle in degrees.
 *
 */
export const getNormalizedInclinationDegree = (degrees: number): number => {
  // Correct for angles greater than 90° or less than -90°, e.g., reflect the angle back over the
  // pole that it lies beyond:
  return Math.abs(degrees) > 90 ? Math.sign(degrees) * 180 - degrees : degrees
}

/*****************************************************************************************************************/

/**
 *
 * convertDegreeToDMS()
 *
 * @param degree - The degree value to convert to degrees, minutes and seconds.
 * @returns the degrees, minutes and seconds components of a degree value.
 *
 */
export const convertDegreeToDMS = (degree: number): { deg: number; min: number; sec: number } => {
  // Round the angle to the nearest milliarcsecond before resolving its components, so that a
  // rounded value carries into the minutes and the degrees, and does not resolve as 60 seconds:
  const arcseconds = Math.round(Math.abs(degree) * 3600 * 1000) / 1000

  const deg = Math.floor(arcseconds / 3600)

  const min = Math.floor((arcseconds - deg * 3600) / 60)

  const sec = Math.round((arcseconds - deg * 3600 - min * 60) * 1000) / 1000

  return {
    deg: degree < 0 ? -deg : deg,
    min: min,
    sec: sec
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertDegreeToHMS()
 *
 * @param degree - The degree value to convert to hours, minutes and seconds.
 * @returns the hours, minutes and seconds components of a degree value.
 *
 */
export const convertDegreeToHMS = (degree: number): { hrs: number; min: number; sec: number } => {
  degree = degree % 360

  if (degree < 0) {
    degree += 360
  }

  // Round the angle to the nearest millisecond of time before resolving its components, so that a
  // rounded value carries into the minutes and the hours, and does not resolve as 60 seconds. A
  // value that carries into a whole rotation is the zeroth hour:
  const seconds = (Math.round((degree / 15) * 3600 * 1000) / 1000) % 86400

  const hrs = Math.floor(seconds / 3600)

  const min = Math.floor((seconds - hrs * 3600) / 60)

  const sec = Math.round((seconds - hrs * 3600 - min * 60) * 1000) / 1000

  return {
    hrs: hrs,
    min: min,
    sec: sec
  }
}

/*****************************************************************************************************************/
