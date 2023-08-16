/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getAirmassPickering } from '../src'

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
})

/*****************************************************************************************************************/
