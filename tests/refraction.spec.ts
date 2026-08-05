/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  convertEquatorialToHorizontal,
  getAirRefractiveIndex,
  getAirmass,
  getCorrectionToHorizontalForRefraction,
  getRefraction
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

/*****************************************************************************************************************/

describe('getRefraction', () => {
  it('should be defined', () => {
    expect(getRefraction).toBeDefined()
  })

  it('should return the refraction correction to the observed object', () => {
    const target = convertEquatorialToHorizontal(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(target.az).toBe(134.44877920325155)
    expect(target.alt).toBe(72.78539444063765)

    const R = getRefraction(target, 283.15, 101325)
    expect(R).toBe(0.005224159687428409)
  })

  it('should return no correction for an object below the floor of the approximation', () => {
    // Below a true altitude of -1° the approximation is no longer physical, and an object there is
    // below the apparent horizon whatever the refraction:
    for (const alt of [-1.1, -18, -90]) {
      expect(getRefraction({ alt, az: 0 })).toBe(0)
    }
  })

  it('should refract an object below the horizon that is above the floor of the approximation', () => {
    // The Sun rises before it crosses the horizon geometrically, e.g., the refraction of an object
    // just below the horizon lifts it above it:
    for (const alt of [-0.1, -0.5, -0.9]) {
      expect(getRefraction({ alt, az: 0 })).toBeGreaterThan(0)
    }
  })

  it('should refract an object at a true altitude of -0.57 degrees to the horizon', () => {
    // The refraction at the horizon is ~34 arcminutes, e.g., the standard value, and so an object
    // at a true altitude of -0.57° is refracted to an apparent altitude of 0:
    const alt = -0.57

    const R = getRefraction({ alt, az: 0 })

    expect(R * 60).toBeCloseTo(34.4, 1)

    expect(alt + R).toBeCloseTo(0, 2)
  })

  it('should decrease monotonically with the altitude of the object', () => {
    // The refraction is greatest at the horizon, and vanishes at the zenith:
    let previous = Number.POSITIVE_INFINITY

    for (let alt = -1; alt <= 90; alt += 0.25) {
      const R = getRefraction({ alt, az: 0 })

      expect(R).toBeLessThanOrEqual(previous)

      previous = R
    }
  })

  it('should be the correction that getCorrectionToHorizontalForRefraction applies', () => {
    // The correction returned is the correction applied, at every altitude, e.g., the two functions
    // agree both above and below the horizon:
    for (let alt = -90; alt <= 90; alt += 0.5) {
      const target = { alt, az: 45 }

      expect(getCorrectionToHorizontalForRefraction(target).alt).toBeCloseTo(
        alt + getRefraction(target),
        9
      )
    }
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToHorizontalForRefractione', () => {
  it('should be defined', () => {
    expect(getCorrectionToHorizontalForRefraction).toBeDefined()
  })

  it('should return the correctly adjusted horizontal coordinate adjusted for atmospheric refraction', () => {
    const target = convertEquatorialToHorizontal(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(target.az).toBe(134.44877920325155)
    expect(target.alt).toBe(72.78539444063765)

    const { alt, az } = getCorrectionToHorizontalForRefraction(target)
    expect(az).toBe(target.az)
    expect(alt).toBeGreaterThanOrEqual(72.79061860032508)
    expect(alt).toBeLessThanOrEqual(73.0)
  })
})

/*****************************************************************************************************************/

describe('getAirmass', () => {
  it('should be defined', () => {
    expect(getAirmass).toBeDefined()
  })

  it('should return the airmass value for the observed object', () => {
    const target = convertEquatorialToHorizontal(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(target.az).toBe(134.44877920325155)
    expect(target.alt).toBe(72.78539444063765)

    const X = getAirmass(target)
    expect(X).toBe(1.0464619518429332)
  })

  it('should return the airmass value for the observed object', () => {
    const target = convertEquatorialToHorizontal(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(target.az).toBe(134.44877920325155)
    expect(target.alt).toBe(72.78539444063765)

    const X = getAirmass({ alt: 90, az: target.az })
    expect(X).toBeCloseTo(1)
  })

  it('should return the airmass value for the observed object at the horizon', () => {
    const target = convertEquatorialToHorizontal(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(target.az).toBe(134.44877920325155)
    expect(target.alt).toBe(72.78539444063765)

    const { alt, az } = getCorrectionToHorizontalForRefraction(target)
    expect(az).toBe(target.az)
    expect(alt).toBeGreaterThanOrEqual(72.79061860032508)
    expect(alt).toBeLessThanOrEqual(73.0)

    // At the horizon the airmass is at a maximum of ~38:
    const X = getAirmass({ alt: 0, az })
    expect(X).toBeCloseTo(37.9196, 3)
  })

  it('should return an infinite airmass for an object below the horizon', () => {
    expect(getAirmass({ alt: -1, az: 0 })).toBe(Number.POSITIVE_INFINITY)
  })

  it('should increase monotonically as the altitude of the observed object decreases', () => {
    // The airmass at 30° is ~2, and at 10° is ~5.6, e.g., the airmass must increase
    // as the observed object approaches the horizon:
    expect(getAirmass({ alt: 30, az: 0 })).toBeCloseTo(1.9943, 3)
    expect(getAirmass({ alt: 10, az: 0 })).toBeCloseTo(5.586, 3)

    for (let alt = 1; alt <= 90; alt += 1) {
      expect(getAirmass({ alt: alt - 1, az: 0 })).toBeGreaterThan(getAirmass({ alt, az: 0 }))
    }
  })
})

/*****************************************************************************************************************/

describe('getAirRefractiveIndex', () => {
  it('should be defined', () => {
    expect(getAirRefractiveIndex).toBeDefined()
  })

  it('should return the refractive index of standard air for the He-Ne laser wavelength', () => {
    // Birch & Downs (1994) give a refractive index of 1.00027180 for dry air at 20°C and
    // 101325 Pascals, observed at the 633nm He-Ne laser wavelength:
    const n = getAirRefractiveIndex(633, 293.15, 101325, 0)
    expect(n).toBeCloseTo(1.0002718, 7)
  })

  it('should return the refractive index of air for the default parameters', () => {
    const n = getAirRefractiveIndex()
    expect(n).toBe(1.0002827555732396)
  })

  it('should return unity for a vacuum, e.g., at zero pressure', () => {
    expect(getAirRefractiveIndex(550, 293.15, 0, 0)).toBe(1)
  })

  it('should decrease as the wavelength of the observed light increases', () => {
    // The dispersion of air is such that blue light is refracted more than red light:
    const blue = getAirRefractiveIndex(400, 293.15, 101325, 0)
    const red = getAirRefractiveIndex(700, 293.15, 101325, 0)
    expect(blue).toBeGreaterThan(red)
  })

  it('should decrease as the temperature of the air increases', () => {
    const cold = getAirRefractiveIndex(550, 273.15, 101325, 0)
    const warm = getAirRefractiveIndex(550, 303.15, 101325, 0)
    expect(cold).toBeGreaterThan(warm)
  })

  it('should increase as the pressure of the air increases', () => {
    const low = getAirRefractiveIndex(550, 293.15, 50000, 0)
    const high = getAirRefractiveIndex(550, 293.15, 101325, 0)
    expect(high).toBeGreaterThan(low)
  })

  it('should decrease as the partial pressure of water vapour increases', () => {
    const dry = getAirRefractiveIndex(633, 293.15, 101325, 0)
    const humid = getAirRefractiveIndex(633, 293.15, 101325, 1333)
    expect(humid).toBeLessThan(dry)
    expect(humid).toBeCloseTo(1.0002713, 7)
  })

  it('should throw for a wavelength outside of the bounds of the equation', () => {
    expect(() => getAirRefractiveIndex(299)).toThrow()
    expect(() => getAirRefractiveIndex(1701)).toThrow()
    // The dispersion terms are singular at ~88nm and ~160nm:
    expect(() => getAirRefractiveIndex(1000 / Math.sqrt(130))).toThrow()
    expect(() => getAirRefractiveIndex(1000 / Math.sqrt(38.9))).toThrow()
  })

  it('should throw for a non-finite wavelength', () => {
    expect(() => getAirRefractiveIndex(Number.NaN)).toThrow()
    expect(() => getAirRefractiveIndex(Number.POSITIVE_INFINITY)).toThrow()
  })

  it('should throw for a temperature at or below zero Kelvin', () => {
    expect(() => getAirRefractiveIndex(550, 0)).toThrow()
    expect(() => getAirRefractiveIndex(550, -1)).toThrow()
    expect(() => getAirRefractiveIndex(550, Number.NaN)).toThrow()
  })

  it('should throw for a negative or non-finite pressure', () => {
    expect(() => getAirRefractiveIndex(550, 293.15, -1)).toThrow()
    expect(() => getAirRefractiveIndex(550, 293.15, Number.NaN)).toThrow()
    expect(() => getAirRefractiveIndex(550, 293.15, Number.POSITIVE_INFINITY)).toThrow()
  })

  it('should throw for a humidity greater than the pressure of the air', () => {
    expect(() => getAirRefractiveIndex(550, 293.15, 101325, 101326)).toThrow()
    expect(() => getAirRefractiveIndex(550, 293.15, 101325, -1)).toThrow()
    expect(() => getAirRefractiveIndex(550, 293.15, 101325, Number.NaN)).toThrow()
  })

  it('should not throw for valid parameters', () => {
    expect(() => getAirRefractiveIndex()).not.toThrow()
    expect(() => getAirRefractiveIndex(300, 293.15, 101325, 0)).not.toThrow()
    expect(() => getAirRefractiveIndex(1700, 293.15, 101325, 1333)).not.toThrow()
    expect(() => getAirRefractiveIndex(550, 293.15, 0, 0)).not.toThrow()
  })
})

/*****************************************************************************************************************/
