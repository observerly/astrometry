/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  AU_IN_METERS,
  convertEclipticToEquatorial,
  getHeliocentricJulianDate,
  getJulianDate,
  getSolarAngularDiameter,
  getSolarDistance,
  getSolarEclipticCoordinate,
  getSolarEclipticLongitude,
  getSolarEquationOfCenter,
  getSolarEquatorialCoordinate,
  getSolarMeanAnomaly,
  getSolarMeanGeometricLongitude,
  getSolarTrueAnomaly,
  getSolarTrueGeometricLongitude
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getSolarMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getSolarMeanAnomaly).toBeDefined()
  })

  it('should return the correct Solar mean anomaly for the given date', () => {
    const M = getSolarMeanAnomaly(datetime)
    expect(M).toBe(128.66090142411576)
  })
})

/*****************************************************************************************************************/

describe('getSolarEquationOfCenter', () => {
  it('should be defined', () => {
    expect(getSolarEquationOfCenter).toBeDefined()
  })

  it('should return the correct Solar equation of center for the given date', () => {
    const C = getSolarEquationOfCenter(datetime)
    expect(C).toBe(1.475483942359445)
  })
})

/*****************************************************************************************************************/

describe('getSolarMeanGeometricLongitude', () => {
  it('should be defined', () => {
    expect(getSolarMeanGeometricLongitude).toBeDefined()
  })

  it('should return the correct Solar mean geometric longitude for the given date', () => {
    const L = getSolarMeanGeometricLongitude(datetime)
    expect(L).toBe(51.96564888161811)
  })
})

/*****************************************************************************************************************/

describe('getSolarTrueAnomaly', () => {
  it('should be defined', () => {
    expect(getSolarTrueAnomaly).toBeDefined()
  })

  it('should return the correct Solar true anomaly for the given date', () => {
    const ν = getSolarTrueAnomaly(datetime)
    expect(ν).toBe(130.1363853664752)
  })
})

/*****************************************************************************************************************/

describe('getSolarTrueGeometricLongitude', () => {
  it('should be defined', () => {
    expect(getSolarTrueGeometricLongitude).toBeDefined()
  })

  it('should return the correct Solar true geometric longitude for the given date', () => {
    const L = getSolarTrueGeometricLongitude(datetime)
    expect(L).toBe(53.441132823977554)
  })
})

/*****************************************************************************************************************/

describe('getSolarEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getSolarEclipticLongitude).toBeDefined()
  })

  it('should return the correct Solar ecliptic longitude for the given date', () => {
    const datetime = new Date('2015-02-05T12:00:00.000+00:00')
    const λ = getSolarEclipticLongitude(datetime)
    expect(λ).toBe(316.10388080739784)
  })
})

/*****************************************************************************************************************/

describe('getSolarEclipticCoordinate', () => {
  it('should be defined', () => {
    expect(getSolarEclipticCoordinate).toBeDefined()
  })

  it('should return the correct Solar ecliptic longitude for the given date', () => {
    const datetime = new Date('2015-02-05T12:00:00.000+00:00')
    const { λ, β } = getSolarEclipticCoordinate(datetime)
    expect(λ).toBeCloseTo(316.35605539442895)
    expect(β).toBeCloseTo(0)

    const { ra, dec } = convertEclipticToEquatorial(datetime, { λ, β })

    console.log({
      λ,
      β,
      ra,
      dec
    })
  })
})

/*****************************************************************************************************************/

describe('getSolarEquatorialCoordinate', () => {
  it('should be defined', () => {
    expect(getSolarEquatorialCoordinate).toBeDefined()
  })

  it('should return the correct Solar equatorial coordinate for the given date', () => {
    const datetime = new Date('2015-02-05T12:00:00.000+00:00')
    const { ra: α, dec: δ } = getSolarEquatorialCoordinate(datetime)
    expect(α).toBe(318.8121016210669)
    expect(δ).toBe(-15.933194068491067)
  })
})

/*****************************************************************************************************************/

describe('getSolarAngularDiameter', () => {
  it('should be defined', () => {
    expect(getSolarAngularDiameter).toBeDefined()
  })

  it('should return the correct Solar angular diameter for the given date', () => {
    const datetime = new Date('2015-01-15T00:00:00.000+00:00')
    const δ = getSolarAngularDiameter(datetime)
    expect(δ).toBeCloseTo(0.5420138437174595)
  })
})

/*****************************************************************************************************************/

describe('getSolarDistance', () => {
  it('should be defined', () => {
    expect(getSolarDistance).toBeDefined()
  })

  it('should be correct from the given datetime', () => {
    // For testing we need to specify a date because most calculations are
    // differential w.r.t a time component. We set it to the date provided
    // on p.165 of Meeus, Jean. 1991. Astronomical algorithms.Richmond,
    // Va: Willmann - Bell.:
    const d = new Date('1992-10-13T00:00:00.000+00:00')

    const R = getSolarDistance(d)

    expect(R).toBeCloseTo(0.997661843191 * AU_IN_METERS, 0)
  })
})

/*****************************************************************************************************************/

describe('getHeliocentricJulianDate', () => {
  it('should be defined', () => {
    expect(getHeliocentricJulianDate).toBeDefined()
  })

  it('should return the correct heliocentric Julian date for the given date', () => {
    const HJD = getHeliocentricJulianDate(datetime)

    const JD = getJulianDate(datetime)

    // We expect that HJD will be less than JD because the light travel time:
    expect(HJD).toBeLessThan(JD)

    // The difference should be less than 1 day:
    expect(JD - HJD).toBeLessThan(1)

    // The difference should be greater than 0:
    expect(JD - HJD).toBeGreaterThan(0)

    // The difference should be approximately less than ~9minutes:
    expect(JD - HJD).toBeLessThan(0.00625)
    expect(Math.round((JD - HJD) * 1440)).toBeCloseTo(8)
  })
})

/*****************************************************************************************************************/
