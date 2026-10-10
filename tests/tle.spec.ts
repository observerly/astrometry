/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tle
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import type { TwoLineElement } from '../src/tle'

/*****************************************************************************************************************/

describe('TwoLineElement', () => {
  it('should type a literal element set, read back field by field', () => {
    // The element set of the International Space Station (ZARYA) of 2008-09-20:
    //
    // 1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927
    // 2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537
    const tle: TwoLineElement = {
      satellite: 25544,
      classification: 'U',
      designator: '98067A',
      epoch: 2454730.01782528,
      ndot: -0.00002182,
      nddot: 0,
      bstar: -0.11606e-4,
      ephemeris: 0,
      element: 292,
      i: 51.6416,
      Ω: 247.4627,
      e: 0.0006703,
      ω: 130.536,
      M: 325.0288,
      n: 15.72125391,
      revolution: 56353
    }

    expectTypeOf(tle).toEqualTypeOf<TwoLineElement>()
    expect(tle.satellite).toBe(25544)
    expect(tle.classification).toBe('U')
    expect(tle.designator).toBe('98067A')
    expect(tle.epoch).toBe(2454730.01782528)
    expect(tle.i).toBe(51.6416)
    expect(tle.Ω).toBe(247.4627)
    expect(tle.e).toBe(0.0006703)
    expect(tle.ω).toBe(130.536)
    expect(tle.M).toBe(325.0288)
    expect(tle.n).toBe(15.72125391)
  })

  it('should type the classification as one of the published classifications', () => {
    expectTypeOf<TwoLineElement['classification']>().toEqualTypeOf<'U' | 'C' | 'S'>()
  })
})

/*****************************************************************************************************************/
