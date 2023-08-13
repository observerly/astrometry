/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getJulianDate, getModifiedJulianDate } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getJulianDate', () => {
  it('should be defined', () => {
    expect(getJulianDate).toBeDefined()
  })

  it('should return the Julian Date (JD) of the given date', () => {
    const JD = getJulianDate(datetime)
    expect(JD).toBe(2459348.5)
  })
})

/*****************************************************************************************************************/

describe('Modified Julian Date', () => {
  it('should be defined', () => {
    expect(getModifiedJulianDate).toBeDefined()
  })

  it('should return the Modified Julian Date (MJD) of the given date', () => {
    const MJD = getModifiedJulianDate(datetime)
    expect(MJD).toBe(59348)
  })
})

/*****************************************************************************************************************/
