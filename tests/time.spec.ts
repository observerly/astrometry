/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/iers
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { DateTime } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('DateTime', () => {
  it('should be well defined', () => {
    expect(DateTime).toBeDefined()
    expect(DateTime).toBeInstanceOf(Function)
  })

  it('should be a subclass of the Date object', () => {
    expect(new DateTime()).toBeInstanceOf(Date)
  })
})

/*****************************************************************************************************************/

describe('DateTime Julian Dates', () => {
  it('should have a getJulianDate method', () => {
    expect(new DateTime().getJulianDate).toBeDefined()
    expect(new DateTime().getJulianDate).toBeInstanceOf(Function)
  })

  it('should have a getJD method', () => {
    expect(new DateTime().getJD).toBeDefined()
    expect(new DateTime().getJD).toBeInstanceOf(Function)
  })

  it('should return the Julian Date (JD) of the given date', () => {
    const JD = new DateTime(datetime).getJulianDate()
    expect(JD).toBe(2459348.5)
  })
})

/*****************************************************************************************************************/

describe('DateTime Modified Julian Dates', () => {
  it('should have a getModifiedJulianDate method', () => {
    expect(new DateTime().getModifiedJulianDate).toBeDefined()
    expect(new DateTime().getModifiedJulianDate).toBeInstanceOf(Function)
  })

  it('should have a getMJD method', () => {
    expect(new DateTime().getMJD).toBeDefined()
    expect(new DateTime().getMJD).toBeInstanceOf(Function)
  })

  it('should return the Modified Julian Date (MJD) of the given date', () => {
    const MJD = new DateTime(datetime).getModifiedJulianDate()
    expect(MJD).toBe(59348)
  })
})

/*****************************************************************************************************************/

describe('DateTime International Atomic Time', () => {
  it('should have a getInternationalAtomicTime method', () => {
    expect(new DateTime().getInternationalAtomicTime).toBeDefined()
    expect(new DateTime().getInternationalAtomicTime).toBeInstanceOf(Function)
  })

  it('should have a getTAI method', () => {
    expect(new DateTime().getTAI).toBeDefined()
    expect(new DateTime().getTAI).toBeInstanceOf(Function)
  })

  it('should return a correction of 37 seconds for the given date', () => {
    const TAI = new DateTime(datetime).getInternationalAtomicTime()
    expect(TAI).toBe(new Date(datetime).getTime() + 37 * 1000)
  })

  it('should return a correction of 35 seconds for timestamp 1341100800000', () => {
    const datetime = new Date(1341100800000)
    const TAI = new DateTime(datetime).getInternationalAtomicTime()
    expect(TAI).toBe(new Date('2012-07-01T00:00:00.000+00:00').getTime() + 35 * 1000)
  })

  it('should return a correction of 30 seconds for timestamp 820454400000', () => {
    const datetime = new Date(820454400000)
    const TAI = new DateTime(datetime).getInternationalAtomicTime()
    expect(TAI).toBe(new Date('1996-01-01T00:00:00.000Z').getTime() + 30 * 1000)
  })

  it('should return a correction of 15 seconds for timestamp 189302400000', () => {
    const datetime = new Date(189302400000)
    const TAI = new DateTime(datetime).getInternationalAtomicTime()
    expect(TAI).toBe(new Date('1976-01-01T00:00:00.000Z').getTime() + 15 * 1000)
  })
})

/*****************************************************************************************************************/

describe('DateTime Terrestrial Time', () => {
  it('should have a getTerrestrialTime method', () => {
    expect(new DateTime().getTerrestrialTime).toBeDefined()
    expect(new DateTime().getTerrestrialTime).toBeInstanceOf(Function)
  })

  it('should have a getTT method', () => {
    expect(new DateTime().getTT).toBeDefined()
    expect(new DateTime().getTT).toBeInstanceOf(Function)
  })

  it('should return a correction of 69.184 seconds for the given date', () => {
    const TT = new DateTime(datetime).getTerrestrialTime()
    expect(TT).toBe(new Date(datetime).getTime() + 69.184 * 1000)
  })

  it('should return a correction of 67.184 seconds for timestamp 1341100800000', () => {
    const datetime = new Date(1341100800000)
    const TT = new DateTime(datetime).getTerrestrialTime()
    expect(TT).toBe(new Date('2012-07-01T00:00:00.000+00:00').getTime() + 67.184 * 1000)
  })
})

/*****************************************************************************************************************/

describe('DateTime Global Positioning System Time', () => {
  it('should have a getGlobalPositioningSystemTime method', () => {
    expect(new DateTime().getGlobalPositioningSystemTime).toBeDefined()
    expect(new DateTime().getGlobalPositioningSystemTime).toBeInstanceOf(Function)
  })

  it('should have a getGPS method', () => {
    expect(new DateTime().getGPS).toBeDefined()
    expect(new DateTime().getGPS).toBeInstanceOf(Function)
  })

  it('should return a correction of 18 seconds for the for the given date', () => {
    const GPS = new DateTime(datetime).getGlobalPositioningSystemTime()
    expect(GPS).toBe(new Date(datetime).getTime() + 18 * 1000)
  })

  it('should return a correction of 35 seconds for timestamp 1341100800000', () => {
    const datetime = new Date(1341100800000)
    const GPS = new DateTime(datetime).getGlobalPositioningSystemTime()
    expect(GPS).toBe(new Date('2012-07-01T00:00:00.000+00:00').getTime() + 16 * 1000)
  })

  it('should return a correction of 11 seconds for timestamp 820454400000', () => {
    const datetime = new Date(820454400000)
    const GPS = new DateTime(datetime).getGlobalPositioningSystemTime()
    expect(GPS).toBe(new Date('1996-01-01T00:00:00.000Z').getTime() + 11 * 1000)
  })

  it('should return a correction of 15 seconds for timestamp 189302400000', () => {
    const datetime = new Date(189302400000)
    const GPS = new DateTime(datetime).getGlobalPositioningSystemTime()
    expect(GPS).toBe(new Date('1976-01-01T00:00:00.000Z').getTime())
  })
})

/*****************************************************************************************************************/
