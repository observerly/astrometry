/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/wcs
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  type SIP2DParameters,
  WCS,
  convertPixelToWorldCoordinateSystem
} from '../src'

/*****************************************************************************************************************/

describe('convertPixelToWorldCoordinateSystem', () => {
  it('should be defined', () => {
    expect(convertPixelToWorldCoordinateSystem).toBeDefined()
  })

  it('should convert pixel coordinates to equatorial coordinates correctly without SIP transformations', () => {
    const wcs = {
      crpix: { x: 200, y: 200 },
      crval: { ra: 0, dec: 0 },
      cd11: 0.2,
      cd12: 30,
      cd21: 0.2,
      cd22: 0.2,
      E: 0,
      F: 0
    } satisfies WCS

    const pixel = { x: 100, y: 100 }

    const equatorial = convertPixelToWorldCoordinateSystem(wcs, pixel)

    expect(equatorial).toEqual({ ra: 220, dec: -40 })
  })

  it('should convert pixel coordinates to equatorial coordinates correctly with SIP transformations', () => {
    const sip = {
      AOrder: 2,
      BOrder: 2,
      APower: { A_1_0: 0, A_0_1: 0, A_1_1: 2.47110429124e-07, A_2_0: 6.71868472834e-07, A_0_2: 2.8223469986e-07 },
      BPower: { B_1_0: 0, B_0_1: 0, B_1_1: 2.47110429124e-07, B_2_0: 6.71868472834e-07, B_0_2: 2.8223469986e-07 }
    } satisfies SIP2DParameters

    const wcs = {
      crpix: { x: 200, y: 200 },
      crval: { ra: 0, dec: 0 },
      cd11: 0.2,
      cd12: 30,
      cd21: 0.2,
      cd22: 0.2,
      E: 0,
      F: 0,
      SIP: sip
    } satisfies WCS

    const pixel = { x: 100, y: 100 }

    const equatorial = convertPixelToWorldCoordinateSystem(wcs, pixel)

    expect(equatorial.ra).toBeCloseTo(220.36, 1)
    expect(equatorial.dec).toBeCloseTo(-39.99, 1)
  })
})

/*****************************************************************************************************************/