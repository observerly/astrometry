/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  getInternationalAtomicTime,
  getJulianDate,
  getModifiedJulianDate,
  getNumberOfCenturiesSinceJ2000,
  getTerrestrialTime
} from '../src'

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

describe('getNumberOfCenturiesSinceJ2000', () => {
  it('should be defined', () => {
    expect(getNumberOfCenturiesSinceJ2000).toBeDefined()
  })

  it('should return the number of centuries since J2000.0', () => {
    const T = getNumberOfCenturiesSinceJ2000(datetime)
    expect(T).toBe(0.21364818617385353)
  })
})

/*****************************************************************************************************************/

describe('getInternationalAtomicTime', () => {
  it('should be defined', () => {
    expect(getInternationalAtomicTime).toBeDefined()
  })

  it('should be ahead of the civil time by the 37 leap seconds of the given date', () => {
    const TAI = getInternationalAtomicTime(datetime)
    expect(TAI.getTime() - datetime.getTime()).toBe(37000)
  })

  it('should be ahead of the civil time by the 23 leap seconds of a date in 1987', () => {
    const when = new Date('1987-04-10T00:00:00.000+00:00')
    const TAI = getInternationalAtomicTime(when)
    expect(TAI.getTime() - when.getTime()).toBe(23000)
  })

  it('should return a date before the first leap second as it is', () => {
    const when = new Date('1971-01-01T00:00:00.000+00:00')
    const TAI = getInternationalAtomicTime(when)
    expect(TAI.getTime()).toBe(when.getTime())
  })

  it('should not modify the datetime given by the caller', () => {
    const when = new Date('2021-05-14T00:00:00.000+00:00')
    getInternationalAtomicTime(when)
    expect(when).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
  })
})

/*****************************************************************************************************************/

describe('getTerrestrialTime', () => {
  it('should be defined', () => {
    expect(getTerrestrialTime).toBeDefined()
  })

  it('should be ahead of the International Atomic Time by a constant 32.184 seconds', () => {
    const TT = getTerrestrialTime(datetime)
    const TAI = getInternationalAtomicTime(datetime)
    expect(TT.getTime() - TAI.getTime()).toBe(32184)
  })

  it('should be ahead of the civil time by the 69.184 seconds of the given date', () => {
    const TT = getTerrestrialTime(datetime)
    expect(TT.getTime() - datetime.getTime()).toBe(69184)
  })

  it('should not modify the datetime given by the caller', () => {
    const when = new Date('2021-05-14T00:00:00.000+00:00')
    getTerrestrialTime(when)
    expect(when).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
  })
})

/*****************************************************************************************************************/
