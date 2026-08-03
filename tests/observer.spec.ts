/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observer
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getLocalHorizon, type Observer } from '../src'

/*****************************************************************************************************************/

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

// For testing we will fix the elevant to be at Sea Level:
export const elevation = 0

/*****************************************************************************************************************/

describe('getLocalHorizon', () => {
  it('should be defined', () => {
    expect(getLocalHorizon).toBeDefined
  })

  it('should return 0 when the observer is at sea level', () => {
    expect(getLocalHorizon(elevation)).toBe(0)
  })

  it('should return a sensible value for an observer at altitude, h, 1000m (with no refraction correction)', () => {
    expect(getLocalHorizon(elevation + 1000, 0)).toBeCloseTo(1.0146012026926674)
  })

  it('should return a sensible value for an observer at 1000m (with no refraction correction)', () => {
    const observer: Observer = {
      datetime: new Date('2021-05-14T00:00:00.000+00:00'),
      latitude,
      longitude,
      elevation: 1000
    }

    expect(getLocalHorizon(observer, 0)).toBeCloseTo(1.0146012026926674)
  })

  it('should return a sensible value for an observer at altitude, h, 1000m', () => {
    expect(getLocalHorizon(elevation + 1000)).toBeCloseTo(0.0293 * Math.sqrt(1000))
  })

  it('should return a sensible value for an observer at 1000m', () => {
    const observer: Observer = {
      datetime: new Date('2021-05-14T00:00:00.000+00:00'),
      latitude,
      longitude,
      elevation: 1000
    }

    expect(getLocalHorizon(observer)).toBeCloseTo(0.0293 * Math.sqrt(1000))
  })
})

/*****************************************************************************************************************/

describe('getLocalHorizon edge cases', () => {
  it('should return no depression for an observer below sea level', () => {
    // An observer below sea level is taken to be at sea level, where the depression vanishes:
    expect(getLocalHorizon(-430)).toBe(0)
    expect(getLocalHorizon(-430, 0)).toBe(0)
  })

  it('should return a depression bounded by the pole for a very large elevation', () => {
    // The small angle approximation of the depression diverges for elevations that are an
    // appreciable fraction of the radius of the Earth, e.g., for an observer at a geostationary
    // altitude, where the exact depression is ~81.3°:
    expect(getLocalHorizon(35786000, 0)).toBeCloseTo(81.3, 1)
    expect(getLocalHorizon(35786000, 0)).toBeLessThan(90)
  })

  it('should increase monotonically with the elevation of the observer', () => {
    let previous = 0

    for (const elevation of [0, 10, 100, 1000, 4207, 8849, 400000]) {
      const depression = getLocalHorizon(elevation)

      expect(depression).toBeGreaterThanOrEqual(previous)

      previous = depression
    }
  })
})

/*****************************************************************************************************************/
