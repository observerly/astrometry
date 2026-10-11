/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/gravity
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import { type GravityModel, WGS72, WGS72OLD, WGS84 } from '../src/gravity'

/*****************************************************************************************************************/

describe('GravityModel', () => {
  it('should type a literal gravity model, read back constant by constant', () => {
    // The constants of WGS 72, as the SGP4 theory adopts them:
    const model: GravityModel = {
      μ: 398600.8,
      radius: 6378.135,
      xke: 60 / Math.sqrt((6378.135 * 6378.135 * 6378.135) / 398600.8),
      J2: 0.001082616,
      J3: -0.00000253881,
      J4: -0.00000165597
    }

    expectTypeOf(model).toEqualTypeOf<GravityModel>()
    expect(model.μ).toBe(398600.8)
    expect(model.radius).toBe(6378.135)
    expect(model.xke).toBeCloseTo(0.0743669161, 10)
    expect(model.J2).toBe(0.001082616)
    expect(model.J3).toBe(-0.00000253881)
    expect(model.J4).toBe(-0.00000165597)
  })

  it('should type every constant of the model as a number', () => {
    expectTypeOf<GravityModel['μ']>().toEqualTypeOf<number>()
    expectTypeOf<GravityModel['radius']>().toEqualTypeOf<number>()
    expectTypeOf<GravityModel['xke']>().toEqualTypeOf<number>()
    expectTypeOf<GravityModel['J2']>().toEqualTypeOf<number>()
    expectTypeOf<GravityModel['J3']>().toEqualTypeOf<number>()
    expectTypeOf<GravityModel['J4']>().toEqualTypeOf<number>()
  })

  it('should type every constant of the model as read-only', () => {
    const model: GravityModel = {
      μ: 398600.8,
      radius: 6378.135,
      xke: 0.0743669161,
      J2: 0.001082616,
      J3: -0.00000253881,
      J4: -0.00000165597
    }

    // @ts-expect-error: a constant of a gravity model is not to be reassigned:
    model.J2 = 0

    // @ts-expect-error: a constant of a gravity model is not to be reassigned:
    model.μ = 0
  })
})

/*****************************************************************************************************************/

describe('WGS72', () => {
  it('should be defined', () => {
    expect(WGS72).toBeDefined()
    expectTypeOf(WGS72).toEqualTypeOf<GravityModel>()
  })

  it('should carry the gravitational parameter and equatorial radius of WGS 72', () => {
    expect(WGS72.μ).toBe(398600.8)
    expect(WGS72.radius).toBe(6378.135)
  })

  it('should carry the zonal harmonics of WGS 72', () => {
    expect(WGS72.J2).toBe(0.001082616)
    expect(WGS72.J3).toBe(-0.00000253881)
    expect(WGS72.J4).toBe(-0.00000165597)
  })

  it('should resolve xke as the reference implementation resolves it, to the last bit', () => {
    // The value of the reference implementation, e.g., getgravconst("wgs72") of the sgp4 package:
    expect(WGS72.xke).toBe(0.07436691613317342)
  })

  it('should resolve xke as the square root of the gravitational parameter in canonical units', () => {
    // The mean motion of an orbit of a semi-major axis of one Earth radius, in radians per minute:
    expect(WGS72.xke).toBeCloseTo(60 * Math.sqrt(WGS72.μ / WGS72.radius ** 3), 15)
  })

  it('should be frozen, such that no constant of it may be reassigned at runtime', () => {
    expect(Object.isFrozen(WGS72)).toBe(true)

    expect(() => {
      ;(WGS72 as { J2: number }).J2 = 0
    }).toThrowError(TypeError)

    expect(WGS72.J2).toBe(0.001082616)
  })
})

/*****************************************************************************************************************/

describe('WGS72OLD', () => {
  it('should be defined', () => {
    expect(WGS72OLD).toBeDefined()
    expectTypeOf(WGS72OLD).toEqualTypeOf<GravityModel>()
  })

  it('should carry the gravitational parameter and equatorial radius of the original WGS 72', () => {
    expect(WGS72OLD.μ).toBe(398600.79964)
    expect(WGS72OLD.radius).toBe(6378.135)
  })

  it('should carry xke as the original implementation gave it, to ten decimal places', () => {
    // The value of the reference implementation, e.g., getgravconst("wgs72old") of the sgp4 package:
    expect(WGS72OLD.xke).toBe(0.0743669161)
  })

  it('should carry the same zonal harmonics as WGS72', () => {
    expect(WGS72OLD.J2).toBe(WGS72.J2)
    expect(WGS72OLD.J3).toBe(WGS72.J3)
    expect(WGS72OLD.J4).toBe(WGS72.J4)
  })

  it('should differ from the xke of WGS72 by no more than ~4.5 parts in 10¹⁰', () => {
    expect(Math.abs(WGS72OLD.xke - WGS72.xke) / WGS72.xke).toBeLessThan(5e-10)
  })

  it('should be frozen, such that no constant of it may be reassigned at runtime', () => {
    expect(Object.isFrozen(WGS72OLD)).toBe(true)

    expect(() => {
      ;(WGS72OLD as { xke: number }).xke = 0
    }).toThrowError(TypeError)

    expect(WGS72OLD.xke).toBe(0.0743669161)
  })
})

/*****************************************************************************************************************/

describe('WGS84', () => {
  it('should be defined', () => {
    expect(WGS84).toBeDefined()
    expectTypeOf(WGS84).toEqualTypeOf<GravityModel>()
  })

  it('should carry the gravitational parameter and equatorial radius of WGS 84', () => {
    expect(WGS84.μ).toBe(398600.5)
    expect(WGS84.radius).toBe(6378.137)
  })

  it('should carry the zonal harmonics of WGS 84', () => {
    expect(WGS84.J2).toBe(0.00108262998905)
    expect(WGS84.J3).toBe(-0.00000253215306)
    expect(WGS84.J4).toBe(-0.00000161098761)
  })

  it('should carry the second zonal harmonic of WGS 84 itself, from its normalised coefficient', () => {
    // J2 = -√5 C̄20, where C̄20 is the fully normalised coefficient of WGS 84:
    expect(WGS84.J2).toBeCloseTo(-Math.sqrt(5) * -0.48416685e-3, 14)
  })

  it('should resolve xke as the reference implementation resolves it, to the last bit', () => {
    // The value of the reference implementation, e.g., getgravconst("wgs84") of the sgp4 package:
    expect(WGS84.xke).toBe(0.07436685316871385)
  })

  it('should resolve xke as the square root of the gravitational parameter in canonical units', () => {
    expect(WGS84.xke).toBeCloseTo(60 * Math.sqrt(WGS84.μ / WGS84.radius ** 3), 15)
  })

  it('should be frozen, such that no constant of it may be reassigned at runtime', () => {
    expect(Object.isFrozen(WGS84)).toBe(true)

    expect(() => {
      ;(WGS84 as { μ: number }).μ = 0
    }).toThrowError(TypeError)

    expect(WGS84.μ).toBe(398600.5)
  })
})

/*****************************************************************************************************************/
