/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/maths
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import type { Matrix3 } from '../src/common'

import { getRotationMatrix } from '../src/maths'

/*****************************************************************************************************************/

// The axes of the elementary rotations, e.g., "x" for R1, "y" for R2 and "z" for R3:
const axes = ['x', 'y', 'z'] as const

/*****************************************************************************************************************/

// The 3×3 identity matrix, e.g., the rotation of 0° about any axis:
const identity: Matrix3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]
]

/*****************************************************************************************************************/

// The arbitrary angles (in degrees) the rotation is assessed at, across all four quadrants, e.g.,
// including the mean obliquity of the ecliptic at J2000.0 of ~23.4392911°:
const angles = [1, 23.4392911, 45, 90, 137.25, 180, 212.5, 270, 333.3]

/*****************************************************************************************************************/

// Asserts that every element of a matrix is within a given tolerance of the expected matrix, where
// a tolerance of zero asserts that the two are numerically equal, e.g., where 0 and -0 are equal:
const expectMatrixToBeCloseTo = (actual: Matrix3, expected: Matrix3, tolerance = 1e-15) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      expect(Math.abs(actual[i][j] - expected[i][j])).toBeLessThanOrEqual(tolerance)
    }
  }
}

/*****************************************************************************************************************/

describe('getRotationMatrix', () => {
  it('should be defined', () => {
    expect(getRotationMatrix).toBeDefined()
  })

  it('should return a Matrix3', () => {
    for (const axis of axes) {
      const R = getRotationMatrix(axis, 45)
      expectTypeOf(R).toEqualTypeOf<Matrix3>()
      expect(R).toHaveLength(3)
      for (const row of R) {
        expect(row).toHaveLength(3)
        for (const element of row) {
          expect(Number.isFinite(element)).toBe(true)
        }
      }
    }
  })

  it('should return the identity for a rotation of 0° about each axis', () => {
    for (const axis of axes) {
      expectMatrixToBeCloseTo(getRotationMatrix(axis, 0), identity, 0)
    }
  })

  it('should return the literal R1 matrix for a rotation of 90° about the x-axis', () => {
    expectMatrixToBeCloseTo(getRotationMatrix('x', 90), [
      [1, 0, 0],
      [0, 0, 1],
      [0, -1, 0]
    ])
  })

  it('should return the literal R2 matrix for a rotation of 90° about the y-axis', () => {
    expectMatrixToBeCloseTo(getRotationMatrix('y', 90), [
      [0, 0, -1],
      [0, 1, 0],
      [1, 0, 0]
    ])
  })

  it('should return the literal R3 matrix for a rotation of 90° about the z-axis', () => {
    expectMatrixToBeCloseTo(getRotationMatrix('z', 90), [
      [0, 1, 0],
      [-1, 0, 0],
      [0, 0, 1]
    ])
  })

  it('should return the literal matrices for an arbitrary angle about each axis', () => {
    // The mean obliquity of the ecliptic at J2000.0, e.g., the angle of R1 that relates the
    // ecliptic and equatorial frames:
    const ε = 23.4392911

    const cos = Math.cos((ε * Math.PI) / 180)

    const sin = Math.sin((ε * Math.PI) / 180)

    expectMatrixToBeCloseTo(getRotationMatrix('x', ε), [
      [1, 0, 0],
      [0, cos, sin],
      [0, -sin, cos]
    ])

    expectMatrixToBeCloseTo(getRotationMatrix('y', ε), [
      [cos, 0, -sin],
      [0, 1, 0],
      [sin, 0, cos]
    ])

    expectMatrixToBeCloseTo(getRotationMatrix('z', ε), [
      [cos, sin, 0],
      [-sin, cos, 0],
      [0, 0, 1]
    ])
  })

  it('should return a diagonal matrix for a rotation of 180° about each axis', () => {
    expectMatrixToBeCloseTo(getRotationMatrix('x', 180), [
      [1, 0, 0],
      [0, -1, 0],
      [0, 0, -1]
    ])

    expectMatrixToBeCloseTo(getRotationMatrix('y', 180), [
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, -1]
    ])

    expectMatrixToBeCloseTo(getRotationMatrix('z', 180), [
      [-1, 0, 0],
      [0, -1, 0],
      [0, 0, 1]
    ])
  })

  it('should return the transpose of the positive angle for a negative angle about each axis', () => {
    for (const axis of axes) {
      for (const angle of angles) {
        const R = getRotationMatrix(axis, angle)
        const T = getRotationMatrix(axis, -angle)
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            expect(Math.abs(T[i][j] - R[j][i])).toBeLessThanOrEqual(1e-15)
          }
        }
      }
    }
  })

  it('should return the identity within rounding for a rotation of 360° about each axis', () => {
    for (const axis of axes) {
      expectMatrixToBeCloseTo(getRotationMatrix(axis, 360), identity)
      expectMatrixToBeCloseTo(getRotationMatrix(axis, -360), identity)
    }
  })

  it('should be periodic in 360° about each axis', () => {
    for (const axis of axes) {
      for (const angle of angles) {
        expectMatrixToBeCloseTo(getRotationMatrix(axis, angle + 360), getRotationMatrix(axis, angle), 1e-14)
        expectMatrixToBeCloseTo(getRotationMatrix(axis, angle - 720), getRotationMatrix(axis, angle), 1e-14)
      }
    }
  })

  it('should have rows and columns of unit length about each axis', () => {
    for (const axis of axes) {
      for (const angle of angles) {
        const R = getRotationMatrix(axis, angle)
        for (let i = 0; i < 3; i++) {
          expect(Math.hypot(R[i][0], R[i][1], R[i][2])).toBeCloseTo(1, 15)
          expect(Math.hypot(R[0][i], R[1][i], R[2][i])).toBeCloseTo(1, 15)
        }
      }
    }
  })

  it('should leave its own axis invariant', () => {
    for (const angle of angles) {
      const Rx = getRotationMatrix('x', angle)
      expect(Rx[0]).toEqual([1, 0, 0])
      expect([Rx[0][0], Rx[1][0], Rx[2][0]]).toEqual([1, 0, 0])

      const Ry = getRotationMatrix('y', angle)
      expect(Ry[1]).toEqual([0, 1, 0])
      expect([Ry[0][1], Ry[1][1], Ry[2][1]]).toEqual([0, 1, 0])

      const Rz = getRotationMatrix('z', angle)
      expect(Rz[2]).toEqual([0, 0, 1])
      expect([Rz[0][2], Rz[1][2], Rz[2][2]]).toEqual([0, 0, 1])
    }
  })

  it('should rotate the frame and not the vector, e.g., the passive convention', () => {
    // For a small positive angle, the passive rotation carries +sin ψ above the diagonal, where the
    // active rotation of the vector would carry −sin ψ, and so the sign of the element resolves
    // the convention:
    expect(getRotationMatrix('x', 10)[1][2]).toBeGreaterThan(0)
    expect(getRotationMatrix('x', 10)[2][1]).toBeLessThan(0)

    // R2 is the exception, as the cyclic order of its axes is z → x, and so the sign is below the
    // diagonal:
    expect(getRotationMatrix('y', 10)[2][0]).toBeGreaterThan(0)
    expect(getRotationMatrix('y', 10)[0][2]).toBeLessThan(0)

    expect(getRotationMatrix('z', 10)[0][1]).toBeGreaterThan(0)
    expect(getRotationMatrix('z', 10)[1][0]).toBeLessThan(0)
  })

  it('should transform the ecliptic pole into equatorial coordinates by R1(−ε)', () => {
    // The mean obliquity of the ecliptic at J2000.0:
    const ε = 23.4392911

    // The north ecliptic pole lies at a right ascension of 18h (270°) and a declination of 90° − ε:
    const α = (270 * Math.PI) / 180

    const δ = ((90 - ε) * Math.PI) / 180

    // The ecliptic pole is the z-axis of the ecliptic frame, e.g., (0, 0, 1), and so its equatorial
    // coordinate is the third column of R1(−ε):
    const R = getRotationMatrix('x', -ε)

    expect(R[0][2]).toBeCloseTo(Math.cos(δ) * Math.cos(α), 15)
    expect(R[1][2]).toBeCloseTo(Math.cos(δ) * Math.sin(α), 15)
    expect(R[2][2]).toBeCloseTo(Math.sin(δ), 15)
  })

  it('should return a new matrix on every call', () => {
    expect(getRotationMatrix('z', 30)).not.toBe(getRotationMatrix('z', 30))
    expect(getRotationMatrix('z', 30)).toEqual(getRotationMatrix('z', 30))
  })

  it('should propagate an angle that is not finite as NaN, rather than a valid rotation', () => {
    for (const axis of axes) {
      for (const angle of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
        const R = getRotationMatrix(axis, angle)
        expect(R.flat().some(element => Number.isNaN(element))).toBe(true)
      }
    }
  })
})

/*****************************************************************************************************************/
