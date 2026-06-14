/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/projection
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertHorizontalToPolar,
  convertHorizontalToStereo,
  convertPolarToHorizontal,
  convertStereoToHorizontal
} from '../src'

/*****************************************************************************************************************/

describe('convertHorizontalToStereo', () => {
  it('should be defined', () => {
    expect(convertHorizontalToStereo).toBeDefined()
  })

  it('should return the correct Cartesian Coordinate { x, y } conversion to the stereographic projection', () => {
    const { x, y } = convertHorizontalToStereo(
      {
        az: 180,
        alt: 61.52543906847783
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(x).toBeCloseTo(1000)
    expect(y).toBeCloseTo(1000)
  })
})

/*****************************************************************************************************************/

describe('convertStereoToHorizontal', () => {
  it('should be defined', () => {
    expect(convertStereoToHorizontal).toBeDefined()
  })

  it('should return the correct Horizontal Coordinate { az, alt } conversion from the stereographic projection', () => {
    const { az, alt } = convertStereoToHorizontal(
      {
        x: 1000,
        y: 1000
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(az).toBeCloseTo(180)
    expect(alt).toBeCloseTo(61.525439)
  })
})

/*****************************************************************************************************************/

describe('convertHorizontalToPolar', () => {
  it('should be defined', () => {
    expect(convertHorizontalToPolar).toBeDefined()
  })

  it('should map the zenith to the center of the projection', () => {
    const { x, y } = convertHorizontalToPolar(
      {
        az: 0,
        alt: 90
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(x).toBeCloseTo(1000)
    expect(y).toBeCloseTo(1000)
  })

  it('should return the correct Cartesian Coordinate { x, y } conversion to the polar projection', () => {
    const { x, y } = convertHorizontalToPolar(
      {
        az: 180,
        alt: 45
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(x).toBeCloseTo(1000)
    expect(y).toBeCloseTo(1420)
  })
})

/*****************************************************************************************************************/

describe('convertPolarToHorizontal', () => {
  it('should be defined', () => {
    expect(convertPolarToHorizontal).toBeDefined()
  })

  it('should return the correct Horizontal Coordinate { az, alt } conversion from the polar projection', () => {
    const { az, alt } = convertPolarToHorizontal(
      {
        x: 1000,
        y: 1420
      },
      {
        width: 2000,
        height: 2000
      },
      0.42
    )

    expect(az).toBeCloseTo(180)
    expect(alt).toBeCloseTo(45)
  })

  it('should invert convertHorizontalToPolar for an arbitrary horizontal coordinate', () => {
    const extent = { width: 2000, height: 2000 }

    const cartesian = convertHorizontalToPolar({ az: 245, alt: 30 }, extent, 0.42)

    const { az, alt } = convertPolarToHorizontal(cartesian, extent, 0.42)

    expect(az).toBeCloseTo(245)
    expect(alt).toBeCloseTo(30)
  })
})

/*****************************************************************************************************************/
