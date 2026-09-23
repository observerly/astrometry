/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/maths
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import type { Matrix3 } from '../src/common'

import { getMatrixProduct, getRotationMatrix } from '../src/maths'

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

describe('getMatrixProduct', () => {
  it('should be defined', () => {
    expect(getMatrixProduct).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const P = getMatrixProduct(identity, identity)
    expectTypeOf(P).toEqualTypeOf<Matrix3>()
    expect(P).toHaveLength(3)
    for (const row of P) {
      expect(row).toHaveLength(3)
    }
  })

  it('should return the other matrix for a product with the identity', () => {
    const m: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    expect(getMatrixProduct(identity, m)).toEqual(m)
    expect(getMatrixProduct(m, identity)).toEqual(m)
    expect(getMatrixProduct(identity, identity)).toEqual(identity)

    for (const axis of axes) {
      for (const angle of angles) {
        const R = getRotationMatrix(axis, angle)
        expectMatrixToBeCloseTo(getMatrixProduct(identity, R), R, 0)
        expectMatrixToBeCloseTo(getMatrixProduct(R, identity), R, 0)
      }
    }
  })

  it('should return the zero matrix for a product with the zero matrix', () => {
    const zero: Matrix3 = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]

    const m: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    expect(getMatrixProduct(zero, m)).toEqual(zero)
    expect(getMatrixProduct(m, zero)).toEqual(zero)
  })

  it('should return the literal product of two arbitrary matrices', () => {
    const a: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    const b: Matrix3 = [
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1]
    ]

    expect(getMatrixProduct(a, b)).toEqual([
      [30, 24, 18],
      [84, 69, 54],
      [138, 114, 90]
    ])

    expect(getMatrixProduct(b, a)).toEqual([
      [90, 114, 138],
      [54, 69, 84],
      [18, 24, 30]
    ])
  })

  it('should return R3(90°) for the product R3(30°) · R3(60°) within rounding', () => {
    expectMatrixToBeCloseTo(
      getMatrixProduct(getRotationMatrix('z', 30), getRotationMatrix('z', 60)),
      getRotationMatrix('z', 90)
    )
  })

  it('should compose rotations additively about the same axis, e.g., R(a) · R(b) = R(a + b)', () => {
    for (const axis of axes) {
      for (const a of angles) {
        for (const b of [-67.5, 12.25, 90]) {
          expectMatrixToBeCloseTo(
            getMatrixProduct(getRotationMatrix(axis, a), getRotationMatrix(axis, b)),
            getRotationMatrix(axis, a + b),
            1e-14
          )
        }
      }
    }
  })

  it('should return the identity for the product of a rotation and its inverse, e.g., R(θ) · R(−θ)', () => {
    for (const axis of axes) {
      for (const angle of angles) {
        expectMatrixToBeCloseTo(
          getMatrixProduct(getRotationMatrix(axis, angle), getRotationMatrix(axis, -angle)),
          identity
        )
        expectMatrixToBeCloseTo(
          getMatrixProduct(getRotationMatrix(axis, -angle), getRotationMatrix(axis, angle)),
          identity
        )
      }
    }
  })

  it('should return the literal product R1(90°) · R3(90°)', () => {
    expectMatrixToBeCloseTo(getMatrixProduct(getRotationMatrix('x', 90), getRotationMatrix('z', 90)), [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0]
    ])
  })

  it('should return the literal product R3(90°) · R1(90°)', () => {
    expectMatrixToBeCloseTo(getMatrixProduct(getRotationMatrix('z', 90), getRotationMatrix('x', 90)), [
      [0, 0, 1],
      [-1, 0, 0],
      [0, -1, 0]
    ])
  })

  it('should not be commutative, e.g., the order of the product matters', () => {
    const R1 = getRotationMatrix('x', 90)

    const R3 = getRotationMatrix('z', 90)

    const ab = getMatrixProduct(R1, R3)

    const ba = getMatrixProduct(R3, R1)

    // The two products differ in, e.g., the first element of the first column:
    expect(ab[0][0]).toBeCloseTo(0, 15)
    expect(ab[2][0]).toBeCloseTo(1, 15)
    expect(ba[2][0]).toBeCloseTo(0, 15)
    expect(ba[1][0]).toBeCloseTo(-1, 15)
  })

  it('should apply b first, and then a, to a vector', () => {
    // The unit vector along the x-axis, held as the first column of an otherwise zero matrix:
    const x: Matrix3 = [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]

    const R1 = getRotationMatrix('x', 90)

    const R3 = getRotationMatrix('z', 90)

    // R3(90°) carries the fixed x-axis onto the new −y-axis:
    const first = getMatrixProduct(R3, x)

    expectMatrixToBeCloseTo(first, [
      [0, 0, 0],
      [-1, 0, 0],
      [0, 0, 0]
    ])

    // R1(90°) then carries the −y-axis onto the new +z-axis:
    const second = getMatrixProduct(R1, first)

    expectMatrixToBeCloseTo(second, [
      [0, 0, 0],
      [0, 0, 0],
      [1, 0, 0]
    ])

    // The product R1 · R3 applies R3 first, and then R1, and so it resolves the same vector:
    expectMatrixToBeCloseTo(getMatrixProduct(getMatrixProduct(R1, R3), x), second)
  })

  it('should be associative, e.g., (a · b) · c = a · (b · c)', () => {
    for (const angle of angles) {
      const a = getRotationMatrix('x', angle)

      const b = getRotationMatrix('y', angle / 2)

      const c = getRotationMatrix('z', -angle)

      expectMatrixToBeCloseTo(
        getMatrixProduct(getMatrixProduct(a, b), c),
        getMatrixProduct(a, getMatrixProduct(b, c))
      )
    }
  })

  it('should return the identity for four successive rotations of 90° about each axis', () => {
    for (const axis of axes) {
      const R = getRotationMatrix(axis, 90)
      expectMatrixToBeCloseTo(getMatrixProduct(getMatrixProduct(R, R), getMatrixProduct(R, R)), identity)
    }
  })

  it('should not mutate either matrix', () => {
    const a: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    const b: Matrix3 = [
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1]
    ]

    getMatrixProduct(a, b)

    expect(a).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ])

    expect(b).toEqual([
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1]
    ])
  })

  it('should return a new matrix, and not either of its inputs', () => {
    const P = getMatrixProduct(identity, identity)
    expect(P).not.toBe(identity)
    expect(P[0]).not.toBe(identity[0])
  })

  it('should propagate an element that is not finite as NaN along its row of the product', () => {
    const a: Matrix3 = [
      [Number.NaN, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]

    const P = getMatrixProduct(a, identity)

    // The NaN is carried into every element of the first row, e.g., as NaN · 0 is NaN:
    expect(P[0].every(element => Number.isNaN(element))).toBe(true)

    // The other rows do not depend on the first row of a, and so they are unaffected:
    expect(P[1]).toEqual([0, 1, 0])
    expect(P[2]).toEqual([0, 0, 1])
  })
})

/*****************************************************************************************************************/
