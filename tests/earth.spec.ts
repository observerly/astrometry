/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getEccentricityOfOrbit, getObliquityOfEcliptic } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getEccentricityOfOrbit', () => {
  it('should be defined', () => {
    expect(getEccentricityOfOrbit).toBeDefined()
  })

  it("should return the eccentricity of the Earth's orbit for the given datetime", () => {
    const e = getEccentricityOfOrbit(datetime)
    expect(e).toBe(0.016699647287906946)
  })
})

/*****************************************************************************************************************/

describe('getObliquityOfEcliptic', () => {
  it('should be defined', () => {
    expect(getObliquityOfEcliptic).toBeDefined()
  })

  it('should return the obliquity of the ecliptic for the given datetime', () => {
    const ε = getObliquityOfEcliptic(datetime)
    expect(ε).toBeCloseTo(23.437313)
  })
})

/*****************************************************************************************************************/
