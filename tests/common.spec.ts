/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/common
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  type EquatorialProperMotion,
  isEquatorialProperMotion,
  type HorizontalCoordinate,
  isEquatorialCoordinate,
  isHorizontalCoordinate
} from '../src/common'

import { J2000 } from '../src/constants'

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
    const eq: EquatorialCoordinate = { ra: 0, dec: 0 }
    const result = isEquatorialCoordinate(eq)
    expect(result).toBe(true)
    expectTypeOf(eq).toEqualTypeOf<EquatorialCoordinate>()
  })

  it('should return true for valid equatorial coordinates of a given epoch', () => {
    const eq: EquatorialCoordinate = { ra: 0, dec: 0, epoch: J2000 }
    const result = isEquatorialCoordinate(eq)
    expect(result).toBe(true)
    expectTypeOf(eq).toEqualTypeOf<EquatorialCoordinate>()
  })

  it('should return true for valid equatorial coordinates of a catalogue epoch', () => {
    // The Gaia DR3 catalogue resolves its coordinates at the J2016.0 epoch:
    const eq: EquatorialCoordinate = { ra: 0, dec: 0, epoch: 2457388.5 }
    expect(isEquatorialCoordinate(eq)).toBe(true)
  })

  it('should return false for equatorial coordinates whose epoch is not a Julian date', () => {
    // The epoch is optional, but it is a Julian date where it is given, and so a coordinate that
    // carries an epoch of another type is not an equatorial coordinate:
    expect(isEquatorialCoordinate({ ra: 0, dec: 0, epoch: 'J2000' })).toBe(false)
    expect(isEquatorialCoordinate({ ra: 0, dec: 0, epoch: new Date() })).toBe(false)
    expect(isEquatorialCoordinate({ ra: 0, dec: 0, epoch: null })).toBe(false)
  })

  it('should return false for equatorial coordinates whose epoch is not finite', () => {
    // A Julian date is a finite number, and so an epoch that is not finite would propagate
    // silently into whatever interval was resolved from it:
    for (const epoch of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(isEquatorialCoordinate({ ra: 0, dec: 0, epoch })).toBe(false)
    }
  })

  it('should return false for equatorial coordinates that are not finite', () => {
    // A right ascension and a declination are likewise finite, e.g., the NaN that a failed
    // conversion resolves is not an equatorial coordinate:
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(isEquatorialCoordinate({ ra: value, dec: 0 })).toBe(false)
      expect(isEquatorialCoordinate({ ra: 0, dec: value })).toBe(false)
    }
  })

  it('should return false for invalid equatorial coordinates', () => {
    const eq = { alt: 0, az: 0 }
    const result = isEquatorialCoordinate(eq)
    expect(result).toBe(false)
    expectTypeOf(eq).not.toEqualTypeOf<EquatorialCoordinate>()
  })
})

/*****************************************************************************************************************/

describe('isEquatorialProperMotion', () => {
  it('should be defined', () => {
    expect(isEquatorialProperMotion).toBeDefined()
  })

  it('should return true for a valid equatorial proper motion', () => {
    // The proper motion of Barnard's Star, in arcseconds per Julian year:
    const pm: EquatorialProperMotion = { ra: -0.79858, dec: 10.32812 }
    expect(isEquatorialProperMotion(pm)).toBe(true)
    expectTypeOf(pm).toEqualTypeOf<EquatorialProperMotion>()
  })

  it('should return false for a proper motion that is not finite', () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(isEquatorialProperMotion({ ra: value, dec: 0 })).toBe(false)
      expect(isEquatorialProperMotion({ ra: 0, dec: value })).toBe(false)
    }
  })

  it('should return false for an unknown value', () => {
    expect(isEquatorialProperMotion('proper_motion')).toBe(false)
    expect(isEquatorialProperMotion(45)).toBe(false)
    expect(isEquatorialProperMotion(null)).toBe(false)
    expect(isEquatorialProperMotion({ alt: 0, az: 0 })).toBe(false)
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

  it('should return false for horizontal coordinates that are not finite', () => {
    // An altitude and an azimuth are finite angles, e.g., the NaN that a failed conversion
    // resolves is not a horizontal coordinate:
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(isHorizontalCoordinate({ alt: value, az: 0 })).toBe(false)
      expect(isHorizontalCoordinate({ alt: 0, az: value })).toBe(false)
    }
  })

  it('should return false for invalid horizontal coordinates', () => {
    const eq = { ra: 0, dec: 0 }
    const result = isHorizontalCoordinate(eq)
    expect(result).toBe(false)
    expectTypeOf(eq).not.toEqualTypeOf<HorizontalCoordinate>()
  })
})
