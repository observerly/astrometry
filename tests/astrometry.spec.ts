/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { getGreenwhichSiderealTime, getLocalSiderealTime } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

/*****************************************************************************************************************/

describe('getGreenwhichSiderealTime', () => {
  it('should be defined', () => {
    expect(getGreenwhichSiderealTime).toBeDefined()
  })

  it('should return the Greenwhich Sidereal Time (GST) of the given date', () => {
    const GST = getGreenwhichSiderealTime(datetime)
    expect(GST).toBe(15.463990399019053)
  })
})

/*****************************************************************************************************************/

describe('getLocalSiderealTime', () => {
  it('should be defined', () => {
    expect(getLocalSiderealTime).toBeDefined()
  })

  it('should return the Local Sidereal Time (LST) of the given date at longitude 0 at Greenwhich', () => {
    const LST = getLocalSiderealTime(datetime, 0)
    const GST = getGreenwhichSiderealTime(datetime)
    expect(LST).toBe(GST)
  })

  it('should return the Local Sidereal Time (LST) of the given date', () => {
    const LST = getLocalSiderealTime(datetime, longitude)
    expect(LST).toBe(5.099450799019053)
  })
})
