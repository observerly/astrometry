/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getGreenwhichSiderealTime } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getGreenwhichSiderealTime', () => {
  it('should be defined', () => {
    expect(getGreenwhichSiderealTime).toBeDefined()
  })

  it('should return the Julian Date (JD) of the given date', () => {
    const GST = getGreenwhichSiderealTime(datetime)
    expect(GST).toBe(15.463990399019053)
  })
})

/*****************************************************************************************************************/
