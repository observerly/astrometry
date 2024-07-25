/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getLunarEclipse, getSolarEclipse, isSolarEclipse } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-04-01T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

/*****************************************************************************************************************/

describe('getLunarEclipse', () => {
  it('should be defined', () => {
    expect(getLunarEclipse).toBeDefined()
  })

  it('should return the lunar eclipse of 15th June 1973', () => {
    // Give me a location in Naples, Italy:
    const observer = {
      latitude: 40.8518,
      longitude: 14.2681,
      elevation: 0
    }

    const datetime = new Date('1973-06-15T20:50:41Z')

    const eclipse = getLunarEclipse(datetime, observer)

    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a lunar eclipse')
    }

    expect(eclipse.type).toBe('penumbral')
    expect(eclipse.magnitude).toBeLessThan(1)
    expect(eclipse.magnitude).toBeCloseTo(0.4685)
    expect(eclipse.γ).toBeCloseTo(-1.3216)
  })

  it('should return the lunar eclipse of 21st January 2000', () => {
    // Give me a location in New Mexico, USA:
    const observer = {
      latitude: 35.0844,
      longitude: -106.6506,
      elevation: 0
    }

    const datetime = new Date('2000-01-21T04:44:34Z')
    const eclipse = getLunarEclipse(datetime, observer)
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.type).toBe('total')
    expect(eclipse.magnitude).toBeGreaterThan(1)
    expect(eclipse.magnitude).toBeCloseTo(1.3246)
    expect(eclipse.γ).toBeCloseTo(-0.2995)
  })

  it('should return the lunar eclipse of 7th Huly 2009', () => {
    // Give me a location in New York, USA:
    const observer = {
      latitude: 40.7128,
      longitude: -74.006,
      elevation: 0
    }

    const datetime = new Date('2009-07-07T07:22:00Z')

    const eclipse = getLunarEclipse(datetime, observer)

    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a lunar eclipse')
    }

    expect(eclipse.type).toBe('penumbral')
    expect(eclipse.magnitude).toBeLessThan(1)
    expect(eclipse.magnitude).toBeCloseTo(0.1562)
    expect(eclipse.γ).toBeCloseTo(-1.4915)
  })

  it('should return the lunar eclipse of 7th August 2017', () => {
    // Give me a location in New Dehli, India:
    const observer = {
      latitude: 28.6139,
      longitude: 77.209,
      elevation: 0
    }

    const datetime = new Date('2017-08-07T18:20:00Z')
    const eclipse = getLunarEclipse(datetime, observer)
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.type).toBe('partial')
    expect(eclipse.magnitude).toBeLessThan(1)
    expect(eclipse.magnitude).toBeCloseTo(0.2464)
    expect(eclipse.γ).toBeCloseTo(0.8668)
  })
})

/*****************************************************************************************************************/

describe('getSolarEclipse', () => {
  it('should be defined', () => {
    expect(getSolarEclipse).toBeDefined()
  })

  it('should return the solar eclipse of 21st May 1993', () => {
    // Give me a location in Vancouver Island, Canada:
    const observer = {
      latitude: 49.2827,
      longitude: -123.1207,
      elevation: 0
    }

    const datetime = new Date('1993-05-21T14:16:00Z')
    const eclipse = getSolarEclipse(datetime, observer)
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.type).toBe('partial')
    expect(eclipse.magnitude).toBeLessThan(1)
    expect(eclipse.magnitude).toBeCloseTo(0.7353)
    expect(eclipse.γ).toBeCloseTo(1.1371)
  })

  it('should return the solar eclipse of 11th August 1999', () => {
    // Give me an observer that is based in Truro, Cornwall, UK
    const observer = {
      latitude: 50.2632,
      longitude: -5.051,
      elevation: 0
    }

    const datetime = new Date('1999-08-11T11:04:00Z')
    const eclipse = getSolarEclipse(datetime, observer)
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    console.log('11th August 1999', eclipse)

    expect(eclipse.type).toBe('total')
    expect(eclipse.magnitude).toBeGreaterThan(1)
    expect(eclipse.magnitude).toBeCloseTo(1.0139)
    expect(eclipse.γ).toBeCloseTo(0.5063)
  })

  it('should return the solar eclipse of 14th December 2001', () => {
    const datetime = new Date('2001-12-14T20:53:00Z')
    const eclipse = getSolarEclipse(datetime, { latitude, longitude })
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.type).toBe('annular')
    expect(eclipse.magnitude).toBeLessThan(1)
    expect(eclipse.magnitude).toBeCloseTo(0.95342)
    expect(eclipse.γ).toBeCloseTo(0.4088)
  })

  it('should return the solar eclipse of 25th November 2011', () => {
    // Give me a location in Christchurch, New Zealand:
    const observer = {
      latitude: -43.5321,
      longitude: 172.6362,
      elevation: 0
    }

    const datetime = new Date('2011-11-25T06:20:00Z')
    const eclipse = getSolarEclipse(datetime, observer)
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.type).toBe('partial')
    expect(eclipse.magnitude).toBeLessThan(1)
    expect(eclipse.magnitude).toBeCloseTo(0.9059)
    expect(eclipse.γ).toBeCloseTo(-1.053)
  })

  it('should return the solar eclipse of 20th May 2012', () => {
    const datetime = new Date('2012-05-20T23:52:00Z')
    const eclipse = getSolarEclipse(datetime, { latitude, longitude })
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.type).toBe('annular')
    expect(eclipse.magnitude).toBeLessThan(1)
    expect(eclipse.magnitude).toBeCloseTo(0.9305)
    expect(eclipse.γ).toBeCloseTo(0.4827)
  })

  it('should return the solar eclipse of 14th December 2020', () => {
    // Give me a location in Buenos Aires, Argentina:
    const observer = {
      latitude: -34.6037,
      longitude: -58.3816,
      elevation: 0
    }

    const datetime = new Date('2020-12-14T16:14:00Z')
    const eclipse = getSolarEclipse(datetime, observer)
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.type).toBe('total')
    expect(eclipse.magnitude).toBeGreaterThan(1)
    expect(eclipse.magnitude).toBeCloseTo(1.0119)
    expect(eclipse.γ).toBeCloseTo(-0.2942)
  })

  it('should not return a solar eclipse on 1st April 2021', () => {
    const eclipse = getSolarEclipse(datetime, { latitude, longitude })
    expect(eclipse).toBe(false)
  })
})

/*****************************************************************************************************************/

describe('isSolarEclipse', () => {
  it('should be defined', () => {
    expect(isSolarEclipse).toBeDefined()
  })

  it('should return the solar eclipse of 11th August 1999', () => {
    const datetime = new Date('1999-08-11T11:04:00Z')

    // Give me an observer that is based in Truro, Cornwall, UK
    const eclipse = isSolarEclipse(datetime, {
      latitude: 50.2632,
      longitude: -5.051
    })
    expect(eclipse).not.toBe(false)
  })

  it('should not return a solar eclipse on 1st April 2021', () => {
    const eclipse = isSolarEclipse(datetime, { latitude, longitude })
    expect(eclipse).toBe(false)
  })

  it('should not return a solar eclipse on 14th May 2022', () => {
    const eclipse = isSolarEclipse(datetime, { latitude, longitude })
    expect(eclipse).toBe(false)
  })
})

/*****************************************************************************************************************/
