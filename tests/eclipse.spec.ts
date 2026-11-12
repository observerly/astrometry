/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getLunarEclipse, getSolarEclipse, isLunarEclipse, isSolarEclipse } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-04-01T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
const longitude = -155.468094

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

  it('should resolve the lunar eclipse of 15th June 1973 at the Terrestrial Time of the given date', () => {
    // Give me a location in Naples, Italy:
    const observer = {
      latitude: 40.8518,
      longitude: 14.2681,
      elevation: 0
    }

    // 1973 June 15 20:50:41 UTC is 20:51:25.184 TT, e.g., TT − UTC = 12 s + 32.184 s, and so the number of Julian
    // centuries since J2000.0 is T = −0.2654519085152219, e.g., for k = −328.5,
    // Ω = 124.7746 − 1.56375588 k + 0.0020672 T² + 0.00000215 T³ (mod 360):
    const datetime = new Date('1973-06-15T20:50:41Z')

    const eclipse = getLunarEclipse(datetime, observer)

    if (!eclipse) {
      throw new Error('Expected a lunar eclipse')
    }

    expect(eclipse.k).toBe(-328.5)
    expect(eclipse.Ω).toBeCloseTo(278.4685522044447, 12)
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

  it.each([
    ['2022-11-08', '2022-11-08T10:59:03Z'],
    ['2025-03-14', '2025-03-14T06:58:43Z'],
    ['2029-12-20', '2029-12-20T22:42:08Z']
  ])('should return the maximum of the lunar eclipse of %s in UTC', (date, reference) => {
    // The maximum of Meeus is a Julian Ephemeris Day, referred to Terrestrial Time (TT), and so it is
    // carried onto UTC by TT − UTC, e.g., ~69 seconds. The reference is the closest approach of the
    // Moon to the anti-solar point, e.g., the axis of the Earth's shadow (ERFA moon98 and epv00):
    const observer = {
      latitude: 0,
      longitude: 0,
      elevation: 0
    }

    const eclipse = getLunarEclipse(new Date(`${date}T00:00:00Z`), observer)

    if (!eclipse) {
      throw new Error('Expected a lunar eclipse')
    }

    // The maximum is within the accuracy of the method, of up to ~1 minute, of the reference:
    expect(Math.abs(eclipse.maximum.getTime() - new Date(reference).getTime())).toBeLessThan(60000)
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

  it('should resolve the solar eclipse of 21st May 1993 at the Terrestrial Time of the given date', () => {
    // Give me a location in Vancouver Island, Canada:
    const observer = {
      latitude: 49.2827,
      longitude: -123.1207,
      elevation: 0
    }

    // 1993 May 21 14:16:00 UTC is 14:16:59.184 TT, e.g., TT − UTC = 27 s + 32.184 s, and so the number of Julian
    // centuries since J2000.0 is T = −0.066143870514873, e.g., for k = −82,
    // Ω = 124.7746 − 1.56375588 k + 0.0020672 T² + 0.00000215 T³ (mod 360):
    const datetime = new Date('1993-05-21T14:16:00Z')

    const eclipse = getSolarEclipse(datetime, observer)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.k).toBe(-82)
    expect(eclipse.Ω).toBeCloseTo(253.00259120340183, 13)
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
    expect(eclipse.magnitude).toBeCloseTo(1.029)
    expect(eclipse.γ).toBeCloseTo(0.5063)
  })

  it('should resolve the solar eclipse of 11th August 1999 over St Agnes at the Terrestrial Time of the given date', () => {
    // Give me an observer that is based in St Agnes, Cornwall, UK:
    const observer = {
      latitude: 50.312,
      longitude: -5.204,
      elevation: 0
    }

    // 1999 August 11 11:04:00 UTC is 11:05:04.184 TT, e.g., TT − UTC = 32 s + 32.184 s, and so the number of Julian
    // centuries since J2000.0 is T = −0.003916171006667113, e.g., for k = −5,
    // Ω = 124.7746 − 1.56375588 k + 0.0020672 T² + 0.00000215 T³ (mod 360):
    const datetime = new Date('1999-08-11T11:04:00Z')

    const eclipse = getSolarEclipse(datetime, observer)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.k).toBe(-5)
    expect(eclipse.type).toBe('total')
    expect(eclipse.isCentral).toBe(true)
    expect(eclipse.magnitude).toBeCloseTo(1.029)
    expect(eclipse.γ).toBeCloseTo(0.5063)
    expect(eclipse.alt).toBeGreaterThan(0)
    expect(eclipse.Ω).toBeCloseTo(132.59337943170326, 13)
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
    expect(eclipse.magnitude).toBeCloseTo(0.968)
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
    expect(eclipse.magnitude).toBeCloseTo(0.944)
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
    expect(eclipse.magnitude).toBeCloseTo(1.025)
    expect(eclipse.γ).toBeCloseTo(-0.2942)
  })

  it('should not return a solar eclipse on 1st April 2021', () => {
    const eclipse = getSolarEclipse(datetime, { latitude, longitude })
    expect(eclipse).toBe(false)
  })

  it.each([
    ['2017-08-21', 36.97, -87.67, '2017-08-21T18:25:31Z'],
    ['2024-04-08', 25.3, -104.1, '2024-04-08T18:17:24Z'],
    ['2026-08-12', 65.2, -25.2, '2026-08-12T17:45:50Z']
  ])(
    'should return the maximum of the solar eclipse of %s in UTC',
    (date, latitude, longitude, reference) => {
      // The maximum of Meeus is a Julian Ephemeris Day, referred to Terrestrial Time (TT), and so it is
      // carried onto UTC by TT − UTC, e.g., ~69 seconds. The reference is the least geocentric separation
      // of the Moon from the Sun, e.g., the greatest eclipse (ERFA moon98 and epv00):
      const eclipse = getSolarEclipse(new Date(`${date}T00:00:00Z`), {
        latitude,
        longitude,
        elevation: 0
      })

      if (!eclipse) {
        throw new Error('Expected a solar eclipse')
      }

      // The maximum is within the accuracy of the method, of up to ~1 minute, of the reference:
      expect(Math.abs(eclipse.maximum.getTime() - new Date(reference).getTime())).toBeLessThan(
        60000
      )
    }
  )
  it.each([
    ['1991-01-15', -178, 'annular', 0.929],
    ['1991-07-11', -107, 'total', 1.08],
    ['1992-01-04', -166, 'annular', 0.918],
    ['1992-06-30', -3, 'total', 1.059],
    ['1994-05-10', -78, 'annular', 0.943],
    ['1994-11-03', -25, 'total', 1.054],
    ['1995-04-29', -83, 'annular', 0.95],
    ['1995-10-24', 112, 'total', 1.021],
    ['1997-03-09', 159, 'total', 1.042],
    ['1998-02-26', -82, 'total', 1.044],
    ['1998-08-22', 148, 'annular', 0.973],
    ['1999-02-16', 82, 'annular', 0.993],
    ['1999-08-11', 14, 'total', 1.029],
    ['2001-06-21', -1, 'total', 1.05],
    ['2001-12-14', -133, 'annular', 0.968],
    ['2002-06-10', -176, 'annular', 0.996],
    ['2002-12-04', 67, 'total', 1.024],
    ['2003-05-31', 118, 'annular', 0.938],
    ['2003-11-23', -162, 'total', 1.038],
    ['2005-04-08', -129, 'annular-total', 1.007],
    ['2005-10-03', 22, 'annular', 0.958],
    ['2006-03-29', 27, 'total', 1.052],
    ['2006-09-22', 5, 'annular', 0.935],
    ['2008-02-07', 121, 'annular', 0.965],
    ['2008-08-01', 24, 'total', 1.039],
    ['2009-01-26', 60, 'annular', 0.928],
    ['2009-07-22', 141, 'total', 1.08],
    ['2010-01-15', 73, 'annular', 0.919],
    ['2010-07-11', -114, 'total', 1.058],
    ['2012-05-20', -178, 'annular', 0.944],
    ['2012-11-13', -153, 'total', 1.05],
    ['2013-05-10', 174, 'annular', 0.954],
    ['2013-11-03', -12, 'annular-total', 1.016],
    ['2015-03-20', 33, 'total', 1.045],
    ['2016-03-09', 150, 'total', 1.045],
    ['2016-09-01', 43, 'annular', 0.974],
    ['2017-02-26', -44, 'annular', 0.992],
    ['2017-08-21', -96, 'total', 1.031],
    ['2019-07-02', -111, 'total', 1.046],
    ['2019-12-26', 100, 'annular', 0.97],
    ['2020-06-21', 80, 'annular', 0.994],
    ['2020-12-14', -64, 'total', 1.025],
    ['2021-06-10', 19, 'annular', 0.943],
    ['2021-12-04', 66, 'total', 1.037],
    ['2023-04-20', 116, 'annular-total', 1.013],
    ['2023-10-14', -90, 'annular', 0.952],
    ['2024-04-08', -95, 'total', 1.057],
    ['2024-10-02', -101, 'annular', 0.933],
    ['2026-02-17', -3, 'annular', 0.963],
    ['2026-08-12', -87, 'total', 1.039],
    ['2027-02-06', -60, 'annular', 0.928],
    ['2027-08-02', 28, 'total', 1.079],
    ['2028-01-26', -47, 'annular', 0.921],
    ['2028-07-22', 136, 'total', 1.056],
    ['2030-06-01', 83, 'annular', 0.944],
    ['2030-11-25', 77, 'total', 1.047]
  ])(
    'should return the magnitude of the central solar eclipse of %s at the surface of the Earth',
    (date, longitude, type, reference) => {
      // The magnitude of a central eclipse is the ratio of the apparent diameter of the Moon to that of the
      // Sun at greatest eclipse, as seen from the surface of the Earth and not from the fundamental plane
      // through the centre of the Earth. The reference is the "Five Millennium Canon of Solar Eclipses" of
      // Espenak & Meeus (NASA), for every central eclipse with a central line between 1991 and 2030, and
      // the observer is on the equator near to the meridian of the Sun at greatest eclipse:
      const eclipse = getSolarEclipse(new Date(`${date}T12:00:00Z`), {
        latitude: 0,
        longitude,
        elevation: 0
      })

      if (!eclipse) {
        throw new Error('Expected a solar eclipse')
      }

      expect(eclipse.isCentral).toBe(true)
      expect(eclipse.type).toBe(type)

      if (eclipse.magnitude === undefined) {
        throw new Error('Expected a magnitude for the solar eclipse')
      }

      // The magnitude is within the accuracy of the method, of up to ~0.002, of the reference:
      expect(Math.abs(eclipse.magnitude - reference)).toBeLessThan(0.002)

      // The Moon covers the Sun at greatest eclipse for a total and for an annular-total (hybrid) eclipse,
      // and it does not for an annular eclipse:
      if (type === 'annular') {
        expect(eclipse.magnitude).toBeLessThan(1)
      } else {
        expect(eclipse.magnitude).toBeGreaterThan(1)
      }
    }
  )

  it('should not correct the magnitude of the partial solar eclipse of 29th April 2014 to the surface of the Earth', () => {
    // The annular eclipse of 2014 April 29 is not central, e.g., |γ| > 0.9972, and so the axis of the shadow
    // of the Moon does not meet the surface of the Earth, and the magnitude is that of a partial eclipse:
    const eclipse = getSolarEclipse(new Date('2014-04-29T12:00:00Z'), {
      latitude: 0,
      longitude: 89,
      elevation: 0
    })

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.isCentral).toBe(false)
    expect(eclipse.type).toBe('partial')
    expect(eclipse.magnitude).toBeCloseTo(0.9885, 4)
  })
})

/*****************************************************************************************************************/

describe('isLunarEclipse', () => {
  it('should be defined', () => {
    expect(isLunarEclipse).toBeDefined()
  })

  it('should return the lunar eclipse of 15th June 1973', () => {
    // Give me a location in Naples, Italy:
    const observer = {
      latitude: 40.8518,
      longitude: 14.2681,
      elevation: 0
    }

    const datetime = new Date('1973-06-15T20:50:41Z')

    const eclipse = isLunarEclipse(datetime, observer)

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
    const eclipse = isLunarEclipse(datetime, observer)
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

    const eclipse = isLunarEclipse(datetime, observer)

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
    const eclipse = isLunarEclipse(datetime, observer)
    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a solar eclipse')
    }

    expect(eclipse.type).toBe('partial')
    expect(eclipse.magnitude).toBeLessThan(1)
    expect(eclipse.magnitude).toBeCloseTo(0.2464)
    expect(eclipse.γ).toBeCloseTo(0.8668)
  })

  it.each([
    ['2008-02-21T03:26:00Z', 'total'],
    ['2011-12-10T14:32:00Z', 'total'],
    ['2015-09-28T02:47:00Z', 'total'],
    ['2024-09-18T02:44:00Z', 'partial'],
    ['2026-03-03T11:33:00Z', 'total'],
    ['2029-12-20T22:42:00Z', 'total']
  ])('should return the lunar eclipse at its greatest eclipse at %s', (iso, type) => {
    // The Moon lies near one of the two nodes of its orbit at an eclipse, and the difference in longitude
    // between the Moon and the ascending node may fall anywhere in (-360°, 360°), e.g., -176° is 4° from
    // the descending node, and so the distance from the nearer node is resolved modulo 180°:
    const observer = {
      latitude: 0,
      longitude: 0,
      elevation: 0
    }

    const eclipse = isLunarEclipse(new Date(iso), observer)

    expect(eclipse).not.toBe(false)

    if (!eclipse) {
      throw new Error('Expected a lunar eclipse')
    }

    expect(eclipse.type).toBe(type)
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

  it.each([
    ['2006-09-22T11:41:00Z', 0, 0, 'annular'],
    ['2010-07-11T19:34:00Z', -27.1127, -109.3497, 'total'],
    ['2025-03-29T10:49:00Z', 0, 0, 'partial'],
    ['2028-07-22T02:57:00Z', -33.8688, 151.2093, 'total']
  ])(
    'should return the solar eclipse at its greatest eclipse at %s',
    (iso, latitude, longitude, type) => {
      // The Moon lies near one of the two nodes of its orbit at an eclipse, and the difference in longitude
      // between the Moon and the ascending node may fall anywhere in (-360°, 360°), e.g., -176° is 4° from
      // the descending node, and so the distance from the nearer node is resolved modulo 180°:
      const eclipse = isSolarEclipse(new Date(iso), { latitude, longitude, elevation: 0 })

      expect(eclipse).not.toBe(false)

      if (!eclipse) {
        throw new Error('Expected a solar eclipse')
      }

      expect(eclipse.type).toBe(type)
    }
  )
})

/*****************************************************************************************************************/
