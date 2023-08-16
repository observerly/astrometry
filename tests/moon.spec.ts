/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getMeanAnomaly } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getMeanAnomaly).toBeDefined()
  })

  it('should return the Julian Date (JD) of the given date', () => {
    const M = getMeanAnomaly(datetime)
    expect(M).toBe(207.63633585681964)
  })
})

/*****************************************************************************************************************/
