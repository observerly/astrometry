/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/gravity
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import type { GravityModel } from '../src/gravity'

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
