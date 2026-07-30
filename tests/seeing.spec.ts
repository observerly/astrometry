/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getAirmass, getAirmassPickering } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getAirmassPickering', () => {
  it('should be defined', () => {
    expect(getAirmassPickering).toBeDefined()
  })

  it('should return the correct airmass value for an object both at the horizon and near the zenith', () => {
    let X = getAirmassPickering({ alt: 0, az: 0 })
    expect(X).toBeCloseTo(38.75)
    X = getAirmassPickering({ alt: 72.78539444063767, az: 0 })
    expect(X).toBe(1.0466433379575284)
  })

  it('should return an infinite airmass for an object below the horizon', () => {
    // N.B. Pickering's formula raises the altitude to a fractional power, which is not defined for
    // a negative altitude, and so the airmass below the horizon must be resolved separately:
    for (const alt of [-0.1, -18, -90]) {
      expect(getAirmassPickering({ alt, az: 0 })).toBe(Number.POSITIVE_INFINITY)
    }
  })

  it('should return the same airmass below the horizon as the Kasten & Young approximation', () => {
    // Both approximations are of the same quantity, and so they agree that the light path of an
    // object below the horizon is not defined:
    expect(getAirmassPickering({ alt: -10, az: 0 })).toBe(getAirmass({ alt: -10, az: 0 }))
  })
})

/*****************************************************************************************************************/
