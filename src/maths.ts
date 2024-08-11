/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/maths
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

/**
 *
 * Interpolates points between a start and end coordinate with a given precision.
 *
 * @param {number[]} start - The starting coordinate [x, y].
 * @param {number[]} end - The ending coordinate [x, y].
 * @param {number} precision - The precision of the interpolation.
 * @returns {number[][]} - The interpolated coordinates.
 *
 */
export const interpolate = (start: number[], end: number[], precision: number): number[][] => {
  const points: number[][] = []
  const [startX, startY] = start
  const [endX, endY] = end

  // Calculate the distance between start and end points
  const distance = Math.hypot(endX - startX, endY - startY)

  // Calculate the number of steps required based on the precision
  const steps = Math.ceil(distance / precision)

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = startX + t * (endX - startX)
    const y = startY + t * (endY - startY)
    points.push([x, y])
  }

  return points
}

/*****************************************************************************************************************/

/**
 *
 * Interpolates points between a start and end coordinate with a given precision on the geodesic.
 *
 * @param {number[]} start - The starting coordinate [x, y].
 * @param {number[]} end - The ending coordinate [x, y].
 * @param {number} precision - The precision of the interpolation.
 * @returns {number[][]} - The interpolated coordinates.
 *
 */
export const interpolateGeodesic = (
  start: number[],
  end: number[],
  precision: number
): number[][] => {
  const points: number[][] = []
  const [startX, startY] = start
  const [endX, endY] = end

  // Adjust endX to wrap around correctly if crossing the 0/360 boundary
  let adjustedEndX = endX
  if (Math.abs(endX - startX) > 180) {
    adjustedEndX = endX > startX ? endX - 360 : endX + 360
  }

  // Calculate the distance between start and end points
  const distance = Math.hypot(adjustedEndX - startX, endY - startY)

  // Calculate the number of steps required based on the precision
  const steps = Math.ceil(distance / precision)

  for (let i = 0; i <= steps; i++) {
    const t = i / steps

    // Interpolate X and Y
    let x = startX + t * (adjustedEndX - startX)
    let y = startY + t * (endY - startY)

    // Normalize X (longitude) to be within 0 and 360
    x = (x + 360) % 360

    // Ensure Y (latitude) stays within -90 and 90
    y = Math.max(-90, Math.min(90, y))

    points.push([x, y])
  }

  return points
}

/*****************************************************************************************************************/

/**
 *
 * Interpolates a rank 2D array of coordinates with a given precision.
 *
 * @param {number[][]} coordinates - The array of coordinates to interpolate.
 * @param {number} precision - The precision of the interpolation. Defaults to 1.
 * @returns {number[][]} - The interpolated coordinates.
 *
 */
export function interpolateRank2DArray(coordinates: number[][], precision: number = 1): number[][] {
  const interpolatedCoordinates: number[][] = []

  // Iterate through each pair of consecutive coordinates and interpolate:
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i]
    const end = coordinates[i + 1]
    interpolatedCoordinates.push(...interpolate(start, end, precision))
  }

  return interpolatedCoordinates
}

/*****************************************************************************************************************/
