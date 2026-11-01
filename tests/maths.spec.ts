/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/maths
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import type { CartesianCoordinate, Matrix3 } from '../src/common'

import { convertCartesianToEquatorial, convertEquatorialToCartesian } from '../src/coordinates'

import { getAngularSeparation } from '../src/astrometry'

import {
  doCrossProduct,
  doDeterminant,
  doDotProduct,
  doTranspose,
  getMatrixProduct,
  getRotatedCartesianCoordinate,
  getRotationMatrix
} from '../src/maths'

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
        expectMatrixToBeCloseTo(
          getRotationMatrix(axis, angle + 360),
          getRotationMatrix(axis, angle),
          1e-14
        )
        expectMatrixToBeCloseTo(
          getRotationMatrix(axis, angle - 720),
          getRotationMatrix(axis, angle),
          1e-14
        )
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
    expectMatrixToBeCloseTo(
      getMatrixProduct(getRotationMatrix('x', 90), getRotationMatrix('z', 90)),
      [
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 0]
      ]
    )
  })

  it('should return the literal product R3(90°) · R1(90°)', () => {
    expectMatrixToBeCloseTo(
      getMatrixProduct(getRotationMatrix('z', 90), getRotationMatrix('x', 90)),
      [
        [0, 0, 1],
        [-1, 0, 0],
        [0, -1, 0]
      ]
    )
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
      expectMatrixToBeCloseTo(
        getMatrixProduct(getMatrixProduct(R, R), getMatrixProduct(R, R)),
        identity
      )
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

describe('getRotatedCartesianCoordinate', () => {
  it('should be defined', () => {
    expect(getRotatedCartesianCoordinate).toBeDefined()
  })

  it('should return a Required<CartesianCoordinate>', () => {
    expectTypeOf(getRotatedCartesianCoordinate(identity, { x: 1, y: 0, z: 0 })).toEqualTypeOf<
      Required<CartesianCoordinate>
    >()
  })

  it('should return the vector unchanged for the identity', () => {
    expect(getRotatedCartesianCoordinate(identity, { x: 0.3, y: -1.2, z: 2.5 })).toEqual({
      x: 0.3,
      y: -1.2,
      z: 2.5
    })
  })

  it('should return the zero vector for the zero matrix', () => {
    const zero: Matrix3 = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]

    expect(getRotatedCartesianCoordinate(zero, { x: 0.3, y: -1.2, z: 2.5 })).toEqual({
      x: 0,
      y: 0,
      z: 0
    })
  })

  it('should return the literal product of an arbitrary matrix and a column vector', () => {
    const m: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    // Each component is the dot product of a row of the matrix and the column vector:
    expect(getRotatedCartesianCoordinate(m, { x: 1, y: -1, z: 2 })).toEqual({ x: 5, y: 11, z: 17 })
  })

  it('should return (0, −1, 0) for R3(90°) applied to (1, 0, 0)', () => {
    const { x, y, z } = getRotatedCartesianCoordinate(getRotationMatrix('z', 90), {
      x: 1,
      y: 0,
      z: 0
    })
    expect(x).toBeCloseTo(0, 15)
    expect(y).toBeCloseTo(-1, 15)
    expect(z).toBeCloseTo(0, 15)
  })

  it('should return the column of the matrix for each unit vector', () => {
    const R = getRotationMatrix('y', 40)

    expect(getRotatedCartesianCoordinate(R, { x: 1, y: 0, z: 0 })).toEqual({
      x: R[0][0],
      y: R[1][0],
      z: R[2][0]
    })
    expect(getRotatedCartesianCoordinate(R, { x: 0, y: 1, z: 0 })).toEqual({
      x: R[0][1],
      y: R[1][1],
      z: R[2][1]
    })
    expect(getRotatedCartesianCoordinate(R, { x: 0, y: 0, z: 1 })).toEqual({
      x: R[0][2],
      y: R[1][2],
      z: R[2][2]
    })
  })

  it('should keep the length of an arbitrary vector for a rotation about each axis', () => {
    const vector = { x: 0.3, y: -1.2, z: 2.5 }

    for (const axis of axes) {
      for (const angle of angles) {
        const { x, y, z } = getRotatedCartesianCoordinate(getRotationMatrix(axis, angle), vector)
        expect(Math.hypot(x, y, z)).toBeCloseTo(Math.hypot(vector.x, vector.y, vector.z), 14)
      }
    }
  })

  it('should keep the length of a vector for a rotation composed about all three axes', () => {
    const vector = { x: 6378137, y: -2.5e-3, z: 42 }

    const R = getMatrixProduct(
      getRotationMatrix('z', 137.25),
      getMatrixProduct(getRotationMatrix('y', -23.4392911), getRotationMatrix('x', 333.3))
    )

    const { x, y, z } = getRotatedCartesianCoordinate(R, vector)

    expect(Math.hypot(x, y, z) / Math.hypot(vector.x, vector.y, vector.z)).toBeCloseTo(1, 15)
  })

  it('should return the vector within rounding when rotated by R2(40°), and then by the transpose of R2(40°)', () => {
    const R = getRotationMatrix('y', 40)

    // The transpose of R2(40°), e.g., its rows written as columns:
    const T: Matrix3 = [
      [R[0][0], R[1][0], R[2][0]],
      [R[0][1], R[1][1], R[2][1]],
      [R[0][2], R[1][2], R[2][2]]
    ]

    const vector = { x: 0.3, y: -1.2, z: 2.5 }

    const { x, y, z } = getRotatedCartesianCoordinate(T, getRotatedCartesianCoordinate(R, vector))

    expect(x).toBeCloseTo(vector.x, 15)
    expect(y).toBeCloseTo(vector.y, 15)
    expect(z).toBeCloseTo(vector.z, 15)
  })

  it('should return the vector within rounding when rotated by R(θ), and then by R(−θ), about each axis', () => {
    // The transpose of an elementary rotation is the rotation by the negated angle:
    const vector = { x: 0.3, y: -1.2, z: 2.5 }

    for (const axis of axes) {
      for (const angle of angles) {
        const { x, y, z } = getRotatedCartesianCoordinate(
          getRotationMatrix(axis, -angle),
          getRotatedCartesianCoordinate(getRotationMatrix(axis, angle), vector)
        )
        expect(x).toBeCloseTo(vector.x, 14)
        expect(y).toBeCloseTo(vector.y, 14)
        expect(z).toBeCloseTo(vector.z, 14)
      }
    }
  })

  it('should agree with getMatrixProduct, e.g., (a · b) v = a (b v)', () => {
    const a = getRotationMatrix('x', 90)

    const b = getRotationMatrix('z', 90)

    const vector = { x: 0.3, y: -1.2, z: 2.5 }

    const composed = getRotatedCartesianCoordinate(getMatrixProduct(a, b), vector)

    const successive = getRotatedCartesianCoordinate(a, getRotatedCartesianCoordinate(b, vector))

    expect(composed.x).toBeCloseTo(successive.x, 15)
    expect(composed.y).toBeCloseTo(successive.y, 15)
    expect(composed.z).toBeCloseTo(successive.z, 15)
  })

  it('should be linear, e.g., rotating a scaled vector scales the rotated vector', () => {
    const R = getRotationMatrix('x', 23.4392911)

    const { x, y, z } = getRotatedCartesianCoordinate(R, { x: 0.3, y: -1.2, z: 2.5 })

    const scaled = getRotatedCartesianCoordinate(R, { x: 0.3 * 4, y: -1.2 * 4, z: 2.5 * 4 })

    expect(scaled.x).toBeCloseTo(x * 4, 14)
    expect(scaled.y).toBeCloseTo(y * 4, 14)
    expect(scaled.z).toBeCloseTo(z * 4, 14)
  })

  it('should return { ra: 0, dec: 20 } for R3(10°) applied to the direction of { ra: 10, dec: 20 }', () => {
    const vector = getRotatedCartesianCoordinate(
      getRotationMatrix('z', 10),
      convertEquatorialToCartesian({ ra: 10, dec: 20 })
    )

    const { ra, dec } = convertCartesianToEquatorial(vector)

    expect(ra).toBeCloseTo(0, 12)
    expect(dec).toBeCloseTo(20, 12)
  })

  it('should resolve the direction of an equatorial coordinate as R3(−α) · R2(δ) applied to (1, 0, 0)', () => {
    for (const ra of [0, 45, 137.25, 279.23473479]) {
      for (const dec of [-60, 0, 38.78368896, 89.9999]) {
        const R = getMatrixProduct(getRotationMatrix('z', -ra), getRotationMatrix('y', dec))

        const { x, y, z } = getRotatedCartesianCoordinate(R, { x: 1, y: 0, z: 0 })

        const expected = convertEquatorialToCartesian({ ra, dec })

        expect(x).toBeCloseTo(expected.x, 15)
        expect(y).toBeCloseTo(expected.y, 15)
        expect(z).toBeCloseTo(expected.z, 15)
      }
    }
  })

  it('should transform the ecliptic pole into equatorial coordinates by R1(−ε)', () => {
    // The mean obliquity of the ecliptic at J2000.0:
    const ε = 23.4392911

    // The north ecliptic pole lies at a right ascension of 18h (270°) and a declination of 90° − ε:
    const { ra, dec } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(getRotationMatrix('x', -ε), { x: 0, y: 0, z: 1 })
    )

    expect(ra).toBeCloseTo(270, 12)
    expect(dec).toBeCloseTo(90 - ε, 12)
  })

  it('should not mutate either the matrix or the vector', () => {
    const m: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    const vector = { x: 1, y: -1, z: 2 }

    getRotatedCartesianCoordinate(m, vector)

    expect(m).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ])

    expect(vector).toEqual({ x: 1, y: -1, z: 2 })
  })

  it('should return a new vector, and not the vector given', () => {
    const vector = { x: 1, y: -1, z: 2 }
    expect(getRotatedCartesianCoordinate(identity, vector)).not.toBe(vector)
  })

  it('should propagate a component that is NaN as NaN', () => {
    const { x, y, z } = getRotatedCartesianCoordinate(identity, { x: Number.NaN, y: 0, z: 1 })

    // Every component is a dot product with the whole vector, e.g., as NaN · 0 is NaN:
    expect(x).toBeNaN()
    expect(y).toBeNaN()
    expect(z).toBeNaN()
  })
})

/*****************************************************************************************************************/

describe('doDotProduct', () => {
  it('should be defined', () => {
    expect(doDotProduct).toBeDefined()
  })

  it('should return a number', () => {
    expectTypeOf(doDotProduct({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toEqualTypeOf<number>()
  })

  it('should return the literal dot product of two arbitrary vectors', () => {
    // 1 · 4 + 2 · (−5) + 3 · 6 = 4 − 10 + 18 = 12:
    expect(doDotProduct({ x: 1, y: 2, z: 3 }, { x: 4, y: -5, z: 6 })).toBe(12)
  })

  it('should return 1 for each unit axis with itself', () => {
    expect(doDotProduct({ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 })).toBe(1)
    expect(doDotProduct({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 0 })).toBe(1)
    expect(doDotProduct({ x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 1 })).toBe(1)
  })

  it('should return 0 for each pair of distinct unit axes, e.g., as they are orthogonal', () => {
    expect(doDotProduct({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toBe(0)
    expect(doDotProduct({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 })).toBe(0)
    expect(doDotProduct({ x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 0 })).toBe(0)
  })

  it('should return 0 for an arbitrary pair of orthogonal vectors', () => {
    // 2 · 3 + (−1) · 4 + 1 · (−2) = 6 − 4 − 2 = 0:
    expect(doDotProduct({ x: 2, y: -1, z: 1 }, { x: 3, y: 4, z: -2 })).toBe(0)
  })

  it('should return 0 for the zero vector with any vector', () => {
    expect(doDotProduct({ x: 0, y: 0, z: 0 }, { x: 0.3, y: -1.2, z: 2.5 })).toBe(0)
    expect(doDotProduct({ x: 0.3, y: -1.2, z: 2.5 }, { x: 0, y: 0, z: 0 })).toBe(0)
  })

  it('should return the square of the length of a vector with itself', () => {
    const vector = { x: 0.3, y: -1.2, z: 2.5 }
    expect(doDotProduct(vector, vector)).toBeCloseTo(
      Math.hypot(vector.x, vector.y, vector.z) ** 2,
      14
    )
  })

  it('should return the negated square of the length of a vector with its opposite', () => {
    // 0.3² + 1.2² + 2.5² = 0.09 + 1.44 + 6.25 = 7.78:
    expect(doDotProduct({ x: 0.3, y: -1.2, z: 2.5 }, { x: -0.3, y: 1.2, z: -2.5 })).toBeCloseTo(
      -7.78,
      14
    )
  })

  it('should be positive for an acute angle, and negative for an obtuse angle, between two vectors', () => {
    expect(doDotProduct({ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 })).toBeGreaterThan(0)
    expect(doDotProduct({ x: 1, y: 0, z: 0 }, { x: -1, y: 1, z: 0 })).toBeLessThan(0)
  })

  it('should be commutative, e.g., a · b = b · a', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    expect(doDotProduct(a, b)).toBe(doDotProduct(b, a))
  })

  it('should be distributive over the sum of two vectors, e.g., a · (b + c) = a · b + a · c', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const c = { x: 1.5, y: 2.25, z: -0.75 }

    expect(doDotProduct(a, { x: b.x + c.x, y: b.y + c.y, z: b.z + c.z })).toBeCloseTo(
      doDotProduct(a, b) + doDotProduct(a, c),
      13
    )
  })

  it('should scale with a scalar multiple of either vector, e.g., (ka) · b = k (a · b)', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const k = -3.5

    expect(doDotProduct({ x: k * a.x, y: k * a.y, z: k * a.z }, b)).toBeCloseTo(
      k * doDotProduct(a, b),
      13
    )
    expect(doDotProduct(a, { x: k * b.x, y: k * b.y, z: k * b.z })).toBeCloseTo(
      k * doDotProduct(a, b),
      13
    )
  })

  it('should return the element of a matrix for its row and the unit axis of its column', () => {
    const R = getRotationMatrix('y', 40)

    // The i-th component of R e_j is R[i][j], e.g., the dot product of e_i with the j-th column:
    const column = getRotatedCartesianCoordinate(R, { x: 0, y: 0, z: 1 })

    expect(doDotProduct({ x: 1, y: 0, z: 0 }, column)).toBe(R[0][2])
    expect(doDotProduct({ x: 0, y: 1, z: 0 }, column)).toBe(R[1][2])
    expect(doDotProduct({ x: 0, y: 0, z: 1 }, column)).toBe(R[2][2])
  })

  it('should be unchanged when both vectors are rotated by the same rotation about each axis', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    for (const axis of axes) {
      for (const angle of angles) {
        const R = getRotationMatrix(axis, angle)

        expect(
          doDotProduct(getRotatedCartesianCoordinate(R, a), getRotatedCartesianCoordinate(R, b))
        ).toBeCloseTo(doDotProduct(a, b), 13)
      }
    }
  })

  it('should return the cosine of the angle between two unit directions on the celestial equator', () => {
    // Two directions on the celestial equator, 60° apart in right ascension, e.g., cos 60° = 0.5:
    expect(
      doDotProduct(
        convertEquatorialToCartesian({ ra: 0, dec: 0 }),
        convertEquatorialToCartesian({ ra: 60, dec: 0 })
      )
    ).toBeCloseTo(0.5, 15)
  })

  it('should return the cosine of the angular separation of Vega and Altair', () => {
    // The J2000.0 equatorial coordinates of Vega (α Lyrae) and Altair (α Aquilae):
    const vega = { ra: 279.23473479, dec: 38.78368896 }

    const altair = { ra: 297.6958273, dec: 8.8683212 }

    const separation = getAngularSeparation(
      { θ: vega.dec, φ: vega.ra },
      { θ: altair.dec, φ: altair.ra }
    )

    expect(
      doDotProduct(convertEquatorialToCartesian(vega), convertEquatorialToCartesian(altair))
    ).toBeCloseTo(Math.cos((separation * Math.PI) / 180), 14)
  })

  it('should return the square of the equatorial radius of the Earth for the geocentric vector to its equator', () => {
    // The equatorial radius of the Earth of WGS 84 (in metres), e.g., 6378137² = 40680631590769:
    const vector = { x: 6378137, y: 0, z: 0 }

    expect(doDotProduct(vector, vector)).toBe(40680631590769)
  })

  it('should not mutate either vector', () => {
    const a = { x: 1, y: 2, z: 3 }

    const b = { x: 4, y: -5, z: 6 }

    doDotProduct(a, b)

    expect(a).toEqual({ x: 1, y: 2, z: 3 })
    expect(b).toEqual({ x: 4, y: -5, z: 6 })
  })

  it('should propagate a component that is NaN as NaN', () => {
    expect(doDotProduct({ x: Number.NaN, y: 0, z: 1 }, { x: 1, y: 2, z: 3 })).toBeNaN()
    expect(doDotProduct({ x: 1, y: 2, z: 3 }, { x: 1, y: Number.NaN, z: 3 })).toBeNaN()
  })

  it('should return NaN for an infinite component against a zero component, e.g., as ∞ · 0 is NaN', () => {
    expect(
      doDotProduct({ x: Number.POSITIVE_INFINITY, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })
    ).toBeNaN()
  })

  it('should return ±∞ for an infinite component against a non-zero component', () => {
    expect(doDotProduct({ x: Number.POSITIVE_INFINITY, y: 0, z: 0 }, { x: 2, y: 0, z: 0 })).toBe(
      Number.POSITIVE_INFINITY
    )
    expect(doDotProduct({ x: Number.POSITIVE_INFINITY, y: 0, z: 0 }, { x: -2, y: 0, z: 0 })).toBe(
      Number.NEGATIVE_INFINITY
    )
  })
})

/*****************************************************************************************************************/

describe('doCrossProduct', () => {
  it('should be defined', () => {
    expect(doCrossProduct).toBeDefined()
  })

  it('should return a Required<CartesianCoordinate>', () => {
    expectTypeOf(doCrossProduct({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toEqualTypeOf<
      Required<CartesianCoordinate>
    >()
  })

  it('should return the literal cross product of two arbitrary vectors', () => {
    // (2 · 6 − 3 · (−5), 3 · 4 − 1 · 6, 1 · (−5) − 2 · 4) = (27, 6, −13):
    expect(doCrossProduct({ x: 1, y: 2, z: 3 }, { x: 4, y: -5, z: 6 })).toEqual({
      x: 27,
      y: 6,
      z: -13
    })
  })

  it('should be right-handed for the unit axes, e.g., x × y = z, y × z = x and z × x = y', () => {
    // The unit vector along the x-axis:
    const x = { x: 1, y: 0, z: 0 }

    // The unit vector along the y-axis:
    const y = { x: 0, y: 1, z: 0 }

    // The unit vector along the z-axis:
    const z = { x: 0, y: 0, z: 1 }

    expect(doCrossProduct(x, y)).toEqual(z)

    expect(doCrossProduct(y, z)).toEqual(x)

    expect(doCrossProduct(z, x)).toEqual(y)
  })

  it('should return the negated axis for the unit axes in the reverse order, e.g., y × x = −z', () => {
    const { x, y, z } = doCrossProduct({ x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 })
    expect(x).toBeCloseTo(0, 15)
    expect(y).toBeCloseTo(0, 15)
    expect(z).toBe(-1)
  })

  it('should be anticommutative, e.g., a × b = −(b × a)', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const ab = doCrossProduct(a, b)

    const ba = doCrossProduct(b, a)

    expect(ab.x).toBe(-ba.x)
    expect(ab.y).toBe(-ba.y)
    expect(ab.z).toBe(-ba.z)
  })

  it('should return the zero vector for a vector with itself', () => {
    expect(doCrossProduct({ x: 0.3, y: -1.2, z: 2.5 }, { x: 0.3, y: -1.2, z: 2.5 })).toEqual({
      x: 0,
      y: 0,
      z: 0
    })
  })

  it('should return the zero vector for two parallel vectors', () => {
    const { x, y, z } = doCrossProduct({ x: 1, y: 2, z: 3 }, { x: -2, y: -4, z: -6 })
    expect(x).toBeCloseTo(0, 15)
    expect(y).toBeCloseTo(0, 15)
    expect(z).toBeCloseTo(0, 15)
  })

  it('should return the zero vector for the zero vector with any vector', () => {
    const { x, y, z } = doCrossProduct({ x: 0, y: 0, z: 0 }, { x: 0.3, y: -1.2, z: 2.5 })
    expect(x).toBeCloseTo(0, 15)
    expect(y).toBeCloseTo(0, 15)
    expect(z).toBeCloseTo(0, 15)
  })

  it('should be orthogonal to both vectors', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const c = doCrossProduct(a, b)

    expect(doDotProduct(c, a)).toBeCloseTo(0, 13)
    expect(doDotProduct(c, b)).toBeCloseTo(0, 13)
  })

  it('should have the length |a| |b| sin θ, e.g., 0.5 for two unit vectors 30° apart', () => {
    const { x, y, z } = doCrossProduct(
      convertEquatorialToCartesian({ ra: 0, dec: 0 }),
      convertEquatorialToCartesian({ ra: 30, dec: 0 })
    )

    expect(Math.hypot(x, y, z)).toBeCloseTo(0.5, 15)
  })

  it("should satisfy Lagrange's identity, e.g., |a × b|² + (a · b)² = |a|² |b|²", () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const c = doCrossProduct(a, b)

    expect(doDotProduct(c, c) + doDotProduct(a, b) ** 2).toBeCloseTo(
      doDotProduct(a, a) * doDotProduct(b, b),
      12
    )
  })

  it('should be distributive over the sum of two vectors, e.g., a × (b + c) = a × b + a × c', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const c = { x: 1.5, y: 2.25, z: -0.75 }

    const sum = doCrossProduct(a, { x: b.x + c.x, y: b.y + c.y, z: b.z + c.z })

    const ab = doCrossProduct(a, b)

    const ac = doCrossProduct(a, c)

    expect(sum.x).toBeCloseTo(ab.x + ac.x, 13)
    expect(sum.y).toBeCloseTo(ab.y + ac.y, 13)
    expect(sum.z).toBeCloseTo(ab.z + ac.z, 13)
  })

  it('should scale with a scalar multiple of either vector, e.g., (ka) × b = k (a × b)', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const k = -3.5

    const ab = doCrossProduct(a, b)

    for (const scaled of [
      doCrossProduct({ x: k * a.x, y: k * a.y, z: k * a.z }, b),
      doCrossProduct(a, { x: k * b.x, y: k * b.y, z: k * b.z })
    ]) {
      expect(scaled.x).toBeCloseTo(k * ab.x, 13)
      expect(scaled.y).toBeCloseTo(k * ab.y, 13)
      expect(scaled.z).toBeCloseTo(k * ab.z, 13)
    }
  })

  it('should not be associative, e.g., (x × x) × y = 0 whereas x × (x × y) = −y', () => {
    const i = { x: 1, y: 0, z: 0 }

    const j = { x: 0, y: 1, z: 0 }

    const left = doCrossProduct(doCrossProduct(i, i), j)

    const right = doCrossProduct(i, doCrossProduct(i, j))

    expect(Math.hypot(left.x, left.y, left.z)).toBe(0)

    expect(right.x).toBeCloseTo(0, 15)
    expect(right.y).toBe(-1)
    expect(right.z).toBeCloseTo(0, 15)
  })

  it('should return the literal scalar triple product a · (b × c), e.g., the determinant of [a; b; c]', () => {
    const a = { x: 1, y: 2, z: 3 }

    const b = { x: 4, y: -5, z: 6 }

    const c = { x: 7, y: 8, z: 10 }

    // det [[1, 2, 3], [4, −5, 6], [7, 8, 10]] = 1 · (−98) − 2 · (−2) + 3 · 67 = 107:
    expect(doDotProduct(a, doCrossProduct(b, c))).toBe(107)
  })

  it('should keep the scalar triple product under a cyclic permutation, e.g., a · (b × c) = b · (c × a) = c · (a × b)', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const c = { x: 1.5, y: 2.25, z: -0.75 }

    const abc = doDotProduct(a, doCrossProduct(b, c))

    expect(doDotProduct(b, doCrossProduct(c, a))).toBeCloseTo(abc, 12)
    expect(doDotProduct(c, doCrossProduct(a, b))).toBeCloseTo(abc, 12)
  })

  it('should commute with a rotation about each axis, e.g., R (a × b) = (R a) × (R b)', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    for (const axis of axes) {
      for (const angle of angles) {
        const R = getRotationMatrix(axis, angle)

        const rotated = getRotatedCartesianCoordinate(R, doCrossProduct(a, b))

        const product = doCrossProduct(
          getRotatedCartesianCoordinate(R, a),
          getRotatedCartesianCoordinate(R, b)
        )

        expect(product.x).toBeCloseTo(rotated.x, 13)
        expect(product.y).toBeCloseTo(rotated.y, 13)
        expect(product.z).toBeCloseTo(rotated.z, 13)
      }
    }
  })

  it('should return the north celestial pole for two directions on the celestial equator 90° apart', () => {
    const { ra, dec } = convertCartesianToEquatorial(
      doCrossProduct(
        convertEquatorialToCartesian({ ra: 0, dec: 0 }),
        convertEquatorialToCartesian({ ra: 90, dec: 0 })
      )
    )

    expect(ra).toBe(0)
    expect(dec).toBeCloseTo(90, 13)
  })

  it('should return the north ecliptic pole for the vernal equinox crossed with the ecliptic at a longitude of 90°', () => {
    // The mean obliquity of the ecliptic at J2000.0:
    const ε = 23.4392911

    // The direction of the ecliptic at a longitude of 90°, e.g., the y-axis of the ecliptic frame in equatorial
    // coordinates:
    const solstice = getRotatedCartesianCoordinate(getRotationMatrix('x', -ε), { x: 0, y: 1, z: 0 })

    // The north ecliptic pole lies at a right ascension of 18h (270°) and a declination of 90° − ε:
    const { ra, dec } = convertCartesianToEquatorial(doCrossProduct({ x: 1, y: 0, z: 0 }, solstice))

    expect(ra).toBeCloseTo(270, 12)
    expect(dec).toBeCloseTo(90 - ε, 12)
  })

  it('should have the length of the sine of the angular separation of Vega and Altair', () => {
    // The J2000.0 equatorial coordinates of Vega (α Lyrae) and Altair (α Aquilae):
    const vega = { ra: 279.23473479, dec: 38.78368896 }

    const altair = { ra: 297.6958273, dec: 8.8683212 }

    const separation = getAngularSeparation(
      { θ: vega.dec, φ: vega.ra },
      { θ: altair.dec, φ: altair.ra }
    )

    const { x, y, z } = doCrossProduct(
      convertEquatorialToCartesian(vega),
      convertEquatorialToCartesian(altair)
    )

    expect(Math.hypot(x, y, z)).toBeCloseTo(Math.sin((separation * Math.PI) / 180), 14)
  })

  it('should not mutate either vector', () => {
    const a = { x: 1, y: 2, z: 3 }

    const b = { x: 4, y: -5, z: 6 }

    doCrossProduct(a, b)

    expect(a).toEqual({ x: 1, y: 2, z: 3 })
    expect(b).toEqual({ x: 4, y: -5, z: 6 })
  })

  it('should return a new vector, and not either vector given', () => {
    const a = { x: 1, y: 2, z: 3 }

    const b = { x: 4, y: -5, z: 6 }

    const c = doCrossProduct(a, b)

    expect(c).not.toBe(a)
    expect(c).not.toBe(b)
  })

  it('should propagate a component that is NaN as NaN to the other two components alone', () => {
    // The x-component, e.g., a.y · b.z − a.z · b.y, does not depend on a.x:
    const { x, y, z } = doCrossProduct({ x: Number.NaN, y: 2, z: 3 }, { x: 4, y: -5, z: 6 })

    expect(x).toBe(27)
    expect(y).toBeNaN()
    expect(z).toBeNaN()
  })

  it('should return NaN for an infinite component against a zero component, e.g., as ∞ · 0 is NaN', () => {
    const { x, y, z } = doCrossProduct(
      { x: Number.POSITIVE_INFINITY, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }
    )

    expect(x).toBe(0)
    expect(y).toBeNaN()
    expect(z).toBe(Number.POSITIVE_INFINITY)
  })
})

/*****************************************************************************************************************/

describe('doTranspose', () => {
  it('should be defined', () => {
    expect(doTranspose).toBeDefined()
  })

  it('should return a Matrix3', () => {
    const T = doTranspose(identity)
    expectTypeOf(T).toEqualTypeOf<Matrix3>()
    expect(T).toHaveLength(3)
    for (const row of T) {
      expect(row).toHaveLength(3)
    }
  })

  it('should return the literal transpose of an arbitrary matrix, e.g., its rows written as columns', () => {
    expect(
      doTranspose([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
    ).toEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9]
    ])
  })

  it('should return the element of the j-th row and the i-th column of the matrix for each element', () => {
    const m: Matrix3 = [
      [0.3, -1.2, 2.5],
      [-4.1, 0.07, 9.9],
      [1.5, 2.25, -0.75]
    ]

    const T = doTranspose(m)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(T[i][j]).toBe(m[j][i])
      }
    }
  })

  it('should return the identity for the identity', () => {
    expect(doTranspose(identity)).toEqual(identity)
  })

  it('should return the zero matrix for the zero matrix', () => {
    expect(
      doTranspose([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ])
    ).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ])
  })

  it('should return a diagonal matrix unchanged', () => {
    const m: Matrix3 = [
      [2, 0, 0],
      [0, -3, 0],
      [0, 0, 0.5]
    ]

    expect(doTranspose(m)).toEqual(m)
  })

  it('should return a symmetric matrix unchanged', () => {
    const m: Matrix3 = [
      [1, 7, -2],
      [7, 4, 0.5],
      [-2, 0.5, 9]
    ]

    expect(doTranspose(m)).toEqual(m)
  })

  it('should return the negated matrix for a skew-symmetric matrix, e.g., Aᵀ = −A', () => {
    expect(
      doTranspose([
        [0, 1, -2],
        [-1, 0, 3],
        [2, -3, 0]
      ])
    ).toEqual([
      [0, -1, 2],
      [1, 0, -3],
      [-2, 3, 0]
    ])
  })

  it('should be an involution, e.g., (Mᵀ)ᵀ = M', () => {
    const m: Matrix3 = [
      [0.3, -1.2, 2.5],
      [-4.1, 0.07, 9.9],
      [1.5, 2.25, -0.75]
    ]

    expect(doTranspose(doTranspose(m))).toEqual(m)
  })

  it('should reverse the order of a product, e.g., (a · b)ᵀ = bᵀ · aᵀ', () => {
    const a: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    const b: Matrix3 = [
      [2, -1, 0],
      [3, 4, -5],
      [-6, 7, 8]
    ]

    expect(doTranspose(getMatrixProduct(a, b))).toEqual(
      getMatrixProduct(doTranspose(b), doTranspose(a))
    )
  })

  it('should return the rotation by the negated angle for an elementary rotation about each axis, e.g., R(θ)ᵀ = R(−θ)', () => {
    for (const axis of axes) {
      for (const angle of angles) {
        expectMatrixToBeCloseTo(
          doTranspose(getRotationMatrix(axis, angle)),
          getRotationMatrix(axis, -angle)
        )
      }
    }
  })

  it('should return the inverse of an elementary rotation about each axis, e.g., R · Rᵀ = Rᵀ · R = I', () => {
    for (const axis of axes) {
      for (const angle of angles) {
        const R = getRotationMatrix(axis, angle)

        expectMatrixToBeCloseTo(getMatrixProduct(R, doTranspose(R)), identity)

        expectMatrixToBeCloseTo(getMatrixProduct(doTranspose(R), R), identity)
      }
    }
  })

  it('should return the inverse of a rotation composed about all three axes', () => {
    const R = getMatrixProduct(
      getRotationMatrix('z', 137.25),
      getMatrixProduct(getRotationMatrix('y', -23.4392911), getRotationMatrix('x', 333.3))
    )

    expectMatrixToBeCloseTo(getMatrixProduct(R, doTranspose(R)), identity)

    expectMatrixToBeCloseTo(getMatrixProduct(doTranspose(R), R), identity)
  })

  it('should undo a rotation of an arbitrary vector, e.g., Rᵀ (R v) = v', () => {
    const vector = { x: 0.3, y: -1.2, z: 2.5 }

    for (const axis of axes) {
      for (const angle of angles) {
        const R = getRotationMatrix(axis, angle)

        const { x, y, z } = getRotatedCartesianCoordinate(
          doTranspose(R),
          getRotatedCartesianCoordinate(R, vector)
        )

        expect(x).toBeCloseTo(vector.x, 14)
        expect(y).toBeCloseTo(vector.y, 14)
        expect(z).toBeCloseTo(vector.z, 14)
      }
    }
  })

  it('should be the adjoint of the matrix under the dot product, e.g., (Mᵀ a) · b = a · (M b)', () => {
    const m: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    const a = { x: 1, y: -1, z: 2 }

    const b = { x: 3, y: 0, z: -2 }

    expect(doDotProduct(getRotatedCartesianCoordinate(doTranspose(m), a), b)).toBe(
      doDotProduct(a, getRotatedCartesianCoordinate(m, b))
    )
  })

  it('should transform the north ecliptic pole into equatorial coordinates by the transpose of R1(ε)', () => {
    // The mean obliquity of the ecliptic at J2000.0, e.g., R1(ε) rotates the equatorial frame into the ecliptic
    // frame, and so its transpose rotates the ecliptic frame back into the equatorial frame:
    const ε = 23.4392911

    // The north ecliptic pole lies at a right ascension of 18h (270°) and a declination of 90° − ε:
    const { ra, dec } = convertCartesianToEquatorial(
      getRotatedCartesianCoordinate(doTranspose(getRotationMatrix('x', ε)), { x: 0, y: 0, z: 1 })
    )

    expect(ra).toBeCloseTo(270, 12)
    expect(dec).toBeCloseTo(90 - ε, 12)
  })

  it('should not mutate the matrix', () => {
    const m: Matrix3 = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    doTranspose(m)

    expect(m).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ])
  })

  it('should return a new matrix, and not the matrix given, even where the matrix is symmetric', () => {
    expect(doTranspose(identity)).not.toBe(identity)
  })

  it('should move an element that is NaN to the transposed position alone', () => {
    const T = doTranspose([
      [1, Number.NaN, 3],
      [4, 5, 6],
      [7, 8, 9]
    ])

    expect(T[1][0]).toBeNaN()

    expect(T).toEqual([
      [1, 4, 7],
      [Number.NaN, 5, 8],
      [3, 6, 9]
    ])
  })

  it('should move an element that is infinite to the transposed position alone', () => {
    expect(
      doTranspose([
        [1, 2, 3],
        [4, 5, 6],
        [Number.NEGATIVE_INFINITY, 8, 9]
      ])
    ).toEqual([
      [1, 4, Number.NEGATIVE_INFINITY],
      [2, 5, 8],
      [3, 6, 9]
    ])
  })
})

/*****************************************************************************************************************/

describe('doDeterminant', () => {
  it('should be defined', () => {
    expect(doDeterminant).toBeDefined()
  })

  it('should return a number', () => {
    expectTypeOf(doDeterminant(identity)).toEqualTypeOf<number>()
  })

  it('should return the literal determinant of an arbitrary matrix', () => {
    // 1 · (−5 · 10 − 6 · 8) − 2 · (4 · 10 − 6 · 7) + 3 · (4 · 8 − (−5) · 7) = −98 + 4 + 201 = 107:
    expect(
      doDeterminant([
        [1, 2, 3],
        [4, -5, 6],
        [7, 8, 10]
      ])
    ).toBe(107)
  })

  it('should return 1 for the identity', () => {
    expect(doDeterminant(identity)).toBe(1)
  })

  it('should return 0 for the zero matrix', () => {
    expect(
      doDeterminant([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ])
    ).toBe(0)
  })

  it('should return 0 for a singular matrix, e.g., where one row is a linear combination of the others', () => {
    // The middle row is the mean of the first and the last:
    expect(
      doDeterminant([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
    ).toBe(0)
  })

  it('should return 0 within rounding for a matrix with a repeated row', () => {
    // N.B. The cofactors of non-integral elements do not cancel exactly in floating point, e.g., the
    // determinant resolves to the order of 1e-15, and not to 0:
    expect(
      doDeterminant([
        [0.3, -1.2, 2.5],
        [-4.1, 0.07, 9.9],
        [0.3, -1.2, 2.5]
      ])
    ).toBeCloseTo(0, 14)
  })

  it('should return the product of the leading diagonal for a diagonal matrix', () => {
    // 2 · (−3) · 0.5 = −3:
    expect(
      doDeterminant([
        [2, 0, 0],
        [0, -3, 0],
        [0, 0, 0.5]
      ])
    ).toBe(-3)
  })

  it('should return the product of the leading diagonal for a triangular matrix', () => {
    // 2 · 3 · 4 = 24:
    expect(
      doDeterminant([
        [2, 5, 7],
        [0, 3, -1],
        [0, 0, 4]
      ])
    ).toBe(24)

    expect(
      doDeterminant([
        [2, 0, 0],
        [5, 3, 0],
        [7, -1, 4]
      ])
    ).toBe(24)
  })

  it('should negate the determinant when two rows are swapped', () => {
    expect(
      doDeterminant([
        [4, -5, 6],
        [1, 2, 3],
        [7, 8, 10]
      ])
    ).toBe(-107)
  })

  it('should keep the determinant when a multiple of one row is added to another', () => {
    // The second row is (4, −5, 6) + 2 · (1, 2, 3) = (6, −1, 12):
    expect(
      doDeterminant([
        [1, 2, 3],
        [6, -1, 12],
        [7, 8, 10]
      ])
    ).toBe(107)
  })

  it('should scale by the cube of a scalar multiple of the matrix, e.g., det(kM) = k³ det(M)', () => {
    // 2³ · 107 = 856:
    expect(
      doDeterminant([
        [2, 4, 6],
        [8, -10, 12],
        [14, 16, 20]
      ])
    ).toBe(856)
  })

  it('should be unchanged by the transpose, e.g., det(Mᵀ) = det(M)', () => {
    const m: Matrix3 = [
      [1, 2, 3],
      [4, -5, 6],
      [7, 8, 10]
    ]

    expect(doDeterminant(doTranspose(m))).toBe(doDeterminant(m))
  })

  it('should be multiplicative over a product, e.g., det(a · b) = det(a) det(b)', () => {
    const a: Matrix3 = [
      [1, 2, 3],
      [4, -5, 6],
      [7, 8, 10]
    ]

    const b: Matrix3 = [
      [2, -1, 0],
      [3, 4, -5],
      [-6, 7, 8]
    ]

    // det(b) = 2 · (4 · 8 − (−5) · 7) − (−1) · (3 · 8 − (−5) · (−6)) + 0 = 134 − 6 = 128:
    expect(doDeterminant(b)).toBe(128)

    // det(a · b) = 107 · 128 = 13696:
    expect(doDeterminant(getMatrixProduct(a, b))).toBe(13696)
  })

  it('should return the scalar triple product of its rows, e.g., det [a; b; c] = a · (b × c)', () => {
    const a = { x: 0.3, y: -1.2, z: 2.5 }

    const b = { x: -4.1, y: 0.07, z: 9.9 }

    const c = { x: 1.5, y: 2.25, z: -0.75 }

    expect(
      doDeterminant([
        [a.x, a.y, a.z],
        [b.x, b.y, b.z],
        [c.x, c.y, c.z]
      ])
    ).toBeCloseTo(doDotProduct(a, doCrossProduct(b, c)), 12)
  })

  it('should return 1 for an elementary rotation about each axis, e.g., as it is a proper rotation', () => {
    for (const axis of axes) {
      for (const angle of angles) {
        expect(doDeterminant(getRotationMatrix(axis, angle))).toBeCloseTo(1, 15)
      }
    }
  })

  it('should return 1 for the transpose of an elementary rotation about each axis', () => {
    for (const axis of axes) {
      for (const angle of angles) {
        expect(doDeterminant(doTranspose(getRotationMatrix(axis, angle)))).toBeCloseTo(1, 15)
      }
    }
  })

  it('should return 1 for a rotation composed of the equatorial precession angles ζ, z and θ, e.g., R3(−z) · R2(θ) · R3(−ζ)', () => {
    // The precession angles of IAU 2006 one Julian century after J2000.0, e.g., T = 1 (in degrees):
    const ζ = 2306.083227 / 3600

    const z = 2306.077181 / 3600

    const θ = 2004.191903 / 3600

    const P = getMatrixProduct(
      getRotationMatrix('z', -z),
      getMatrixProduct(getRotationMatrix('y', θ), getRotationMatrix('z', -ζ))
    )

    expect(doDeterminant(P)).toBeCloseTo(1, 15)
  })

  it('should return −1 for a reflection, e.g., the flip of a single axis between a right- and a left-handed frame', () => {
    // The flip of the y-axis, e.g., as between the hour angle, measured westwards, and the right ascension,
    // measured eastwards:
    expect(
      doDeterminant([
        [1, 0, 0],
        [0, -1, 0],
        [0, 0, 1]
      ])
    ).toBe(-1)
  })

  it('should return −1 for the point reflection through the origin, e.g., the antipode of every direction', () => {
    expect(
      doDeterminant([
        [-1, 0, 0],
        [0, -1, 0],
        [0, 0, -1]
      ])
    ).toBe(-1)
  })

  it('should not mutate the matrix', () => {
    const m: Matrix3 = [
      [1, 2, 3],
      [4, -5, 6],
      [7, 8, 10]
    ]

    doDeterminant(m)

    expect(m).toEqual([
      [1, 2, 3],
      [4, -5, 6],
      [7, 8, 10]
    ])
  })

  it('should propagate an element that is NaN as NaN', () => {
    expect(
      doDeterminant([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, Number.NaN]
      ])
    ).toBeNaN()
  })

  it('should return ∞ for an infinite element at the head of the leading diagonal of the identity', () => {
    expect(
      doDeterminant([
        [Number.POSITIVE_INFINITY, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ])
    ).toBe(Number.POSITIVE_INFINITY)
  })
})

/*****************************************************************************************************************/
