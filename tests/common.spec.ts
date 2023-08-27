/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/common
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  type HorizontalCoordinate,
  isEquatorialCoordinate,
  isHorizontalCoordinate
} from '../src/common'

/*****************************************************************************************************************/

describe('isEquatorialCoordinate', () => {
  it('should be defined', () => {
    expect(isEquatorialCoordinate).toBeDefined()
  })

  it('should return false for private unknown string', () => {
    const unknown = 'equatorial_coordinate'
    const result = isEquatorialCoordinate(unknown)
    expect(result).toBe(false)
    expectTypeOf(unknown).not.toEqualTypeOf<EquatorialCoordinate>()
  })

  it('should return false for private unknown number', () => {
    const unknown = 45
    const result = isEquatorialCoordinate(unknown)
    expect(result).toBe(false)
    expectTypeOf(unknown).not.toEqualTypeOf<EquatorialCoordinate>()
  })

  it('should return true for valid equatorial coordinates', () => {
    const eq = { ra: 0, dec: 0 }
    const result = isEquatorialCoordinate(eq)
    expect(result).toBe(true)
    expectTypeOf(eq).toEqualTypeOf<EquatorialCoordinate>()
  })

  it('should return false for invalid equatorial coordinates', () => {
    const eq = { alt: 0, az: 0 }
    const result = isEquatorialCoordinate(eq)
    expect(result).toBe(false)
    expectTypeOf(eq).not.toEqualTypeOf<EquatorialCoordinate>()
  })
})

/*****************************************************************************************************************/

describe('isHorizontalCoordinate', () => {
  it('should be defined', () => {
    expect(isHorizontalCoordinate).toBeDefined()
  })

  it('should return false for private unknown string', () => {
    const unknown = 'horizontal_coordinate'
    const result = isHorizontalCoordinate(unknown)
    expect(result).toBe(false)
    expectTypeOf(unknown).not.toEqualTypeOf<HorizontalCoordinate>()
  })

  it('should return false for private unknown number', () => {
    const unknown = 45
    const result = isHorizontalCoordinate(unknown)
    expect(result).toBe(false)
    expectTypeOf(unknown).not.toEqualTypeOf<HorizontalCoordinate>()
  })

  it('should return true for valid horizontal coordinates', () => {
    const eq = { alt: 0, az: 0 }
    const result = isHorizontalCoordinate(eq)
    expect(result).toBe(true)
    expectTypeOf(eq).toEqualTypeOf<HorizontalCoordinate>()
  })

  it('should return false for invalid horizontal coordinates', () => {
    const eq = { ra: 0, dec: 0 }
    const result = isHorizontalCoordinate(eq)
    expect(result).toBe(false)
    expectTypeOf(eq).not.toEqualTypeOf<HorizontalCoordinate>()
  })
})
