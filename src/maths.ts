/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/maths
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { CartesianCoordinate, Matrix3 } from './common'

import { convertDegreesToRadians as radians } from './utilities'

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
export function interpolateRank2DArray(coordinates: number[][], precision = 1): number[][] {
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

/**
 *
 * Interpolates a rank 2D array of coordinates with a given precision on the geodesic.
 *
 * @param {number[][]} coordinates - The array of coordinates to interpolate.
 * @param {number} precision - The precision of the interpolation. Defaults to 1.
 * @returns {number[][]} - The interpolated coordinates.
 *
 */
export function interpolateRank2DGeodesicCoordinateArray(
  coordinates: number[][],
  precision = 1
): number[][] {
  const interpolatedCoordinates: number[][] = []

  // Iterate through each pair of consecutive coordinates and interpolate:
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i]
    const end = coordinates[i + 1]
    interpolatedCoordinates.push(...interpolateGeodesic(start, end, precision))
  }

  return interpolatedCoordinates
}

/*****************************************************************************************************************/

/**
 *
 * getRotationMatrix()
 *
 * Resolves the elementary rotation matrix about the x, y or z axis by a given angle (in degrees),
 * e.g., R1, R2 or R3 respectively, as is defined by the iauRx, iauRy and iauRz routines of the IAU
 * SOFA library.
 *
 * N.B. The rotation is passive, e.g., it rotates the reference frame and not the vector, such that
 * a positive angle rotates the frame anticlockwise as seen from the positive axis looking towards
 * the origin, and so a vector that is fixed in space appears to rotate clockwise within it:
 *
 * R1(φ) = [[1, 0, 0], [0, cos φ, sin φ], [0, −sin φ, cos φ]]
 * R2(θ) = [[cos θ, 0, −sin θ], [0, 1, 0], [sin θ, 0, cos θ]]
 * R3(ψ) = [[cos ψ, sin ψ, 0], [−sin ψ, cos ψ, 0], [0, 0, 1]]
 *
 * @param axis - The axis of the rotation, e.g., "x", "y" or "z".
 * @param angle - The angle of the rotation (in degrees).
 * @returns The 3×3 rotation matrix, in row-major order.
 *
 */
export const getRotationMatrix = (axis: 'x' | 'y' | 'z', angle: number): Matrix3 => {
  const cos = Math.cos(radians(angle))

  const sin = Math.sin(radians(angle))

  switch (axis) {
    case 'x':
      return [
        [1, 0, 0],
        [0, cos, sin],
        [0, -sin, cos]
      ]
    case 'y':
      return [
        [cos, 0, -sin],
        [0, 1, 0],
        [sin, 0, cos]
      ]
    case 'z':
      return [
        [cos, sin, 0],
        [-sin, cos, 0],
        [0, 0, 1]
      ]
  }
}

/*****************************************************************************************************************/

/**
 *
 * getMatrixProduct()
 *
 * Resolves the product a · b of two 3×3 matrices, such that each element of the product is the dot
 * product of the i-th row of a and the j-th column of b.
 *
 * N.B. The order of the product matters, e.g., applying the product to a vector v applies b first,
 * and then a, such that (a · b) v = a (b v), and so a rotation by b followed by a rotation by a is
 * the product a · b, and not b · a.
 *
 * @param a - The left-hand 3×3 matrix, e.g., the matrix that is applied second.
 * @param b - The right-hand 3×3 matrix, e.g., the matrix that is applied first.
 * @returns The 3×3 matrix product a · b, in row-major order.
 *
 */
export const getMatrixProduct = (a: Matrix3, b: Matrix3): Matrix3 => {
  // The element of the i-th row and the j-th column of the product:
  const element = (i: number, j: number): number =>
    a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j]

  return [
    [element(0, 0), element(0, 1), element(0, 2)],
    [element(1, 0), element(1, 1), element(1, 2)],
    [element(2, 0), element(2, 1), element(2, 2)]
  ]
}

/*****************************************************************************************************************/

/**
 *
 * getRotatedCartesianCoordinate()
 *
 * Resolves the product of a 3×3 matrix and a column vector, e.g., the matrix applied to the
 * vector, such that each component of the result is the dot product of a row of the matrix and
 * the vector.
 *
 * N.B. The inverse of a rotation matrix is its transpose, e.g., R⁻¹ = Rᵀ, and so a rotation is
 * undone by applying the transpose of the matrix to the rotated vector, where the transpose of an
 * elementary rotation is the rotation by the negated angle, e.g., R3(ψ)ᵀ = R3(−ψ).
 *
 * @param matrix - The 3×3 matrix to apply, e.g., a rotation matrix, in row-major order.
 * @param vector - The cartesian coordinate to apply the matrix to, e.g., { x, y, z }.
 * @returns The cartesian coordinate of the matrix applied to the vector, e.g., { x, y, z }.
 *
 */
export const getRotatedCartesianCoordinate = (
  matrix: Matrix3,
  vector: Required<CartesianCoordinate>
): Required<CartesianCoordinate> => {
  const { x, y, z } = vector

  return {
    x: matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z,
    y: matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z,
    z: matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z
  }
}

/*****************************************************************************************************************/
