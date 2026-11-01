/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getCoefficientOfEccentricity, getEccentricityOfOrbit } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getEccentricityOfOrbit', () => {
  it('should be defined', () => {
    expect(getEccentricityOfOrbit).toBeDefined()
  })

  it("should return the eccentricity of the Earth's orbit for the given datetime", () => {
    const e = getEccentricityOfOrbit(datetime)
    expect(e).toBe(0.016699647286984177)
  })

  it("should resolve the eccentricity of the Earth's orbit at the Terrestrial Time of the given datetime", () => {
    // 2021 May 14 0h UTC is JD 2459348.500800741 TT, e.g., TT − UTC = 37 s + 32.184 s, and so the number of Julian
    // centuries since J2000.0 is T = 0.2136482080969447, e.g., e = 0.0167086342 − 0.000042037 T − 0.0000001267 T²:
    const e = getEccentricityOfOrbit(datetime)
    expect(e).toBeCloseTo(0.016699647286984177, 15)
  })
})

/*****************************************************************************************************************/

describe('getCoefficientOfEccentricity', () => {
  it('should be defined', () => {
    expect(getCoefficientOfEccentricity).toBeDefined()
  })

  it('should return the coefficient of eccentricity for the given datetime', () => {
    const e = getEccentricityOfOrbit(datetime)
    const E = getCoefficientOfEccentricity(datetime)
    expect(E).toBeCloseTo(1 - e, 1)
  })
})

/*****************************************************************************************************************/
