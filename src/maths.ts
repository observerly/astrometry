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

  // Calculate the step size based on the precision and direction:
  const step = Math.sign(endY - startY) * precision

  for (let y = startY; Math.abs(y - startY) < Math.abs(endY - startY); y += step) {
    // Calculate the corresponding x value using linear interpolation:
    const x = startX + ((y - startY) * (endX - startX)) / (endY - startY)
    // Add the interpolated point to the array:
    points.push([x, y])
  }

  points.push([endX, endY])

  // Return the array of interpolated points:
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
