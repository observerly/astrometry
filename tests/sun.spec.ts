/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  getSolarMeanAnomaly,
  getSolarEquationOfCenter,
  getSolarMeanGeometricLongitude,
  getSolarTrueAnomaly,
  getSolarTrueGeometricLongitude,
  getSolarEclipticLongitude
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
