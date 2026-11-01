/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getObliquityOfTheEcliptic } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getObliquityOfTheEcliptic', () => {
  it('should be defined', () => {
    expect(getObliquityOfTheEcliptic).toBeDefined()
  })

  it('should return the Obliquity of the Ecliptic (e) of the given date', () => {
    const ε = getObliquityOfTheEcliptic(datetime)
    expect(ε).toBeCloseTo(23.436499838724593, 9)
  })
})

/*****************************************************************************************************************/
