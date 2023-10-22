/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/orbit
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  getPlanetaryEquationOfCenter,
  getPlanetaryMeanAnomaly,
  getPlanetaryTrueAnomaly,
  getPlanetaryHeliocentricEclipticLongitude,
  getPlanetaryHeliocentricEclipticLatitude,
  getPlanetaryHeliocentricDistance,
  getPlanetaryGeocentricEclipticCoordinate,
  planets
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getPlanetaryMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getPlanetaryMeanAnomaly).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const M = getPlanetaryMeanAnomaly(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(M).toBeCloseTo(57.636998)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryEquationOfCenter', () => {
  it('should be defined', () => {
    expect(getPlanetaryEquationOfCenter).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const E = getPlanetaryEquationOfCenter(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(E).toBeCloseTo(0.655907)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryTrueAnomaly', () => {
  it('should be defined', () => {
    expect(getPlanetaryTrueAnomaly).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const E = getPlanetaryTrueAnomaly(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(E).toBeCloseTo(58.288946)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryHeliocentricEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getPlanetaryHeliocentricEclipticLongitude).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const L = getPlanetaryHeliocentricEclipticLongitude(
      new Date('2016-01-04T03:00:00+00:00'),
      venus
    )
    expect(L).toBeCloseTo(189.891413)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryHeliocentricEclipticLatitude', () => {
  it('should be defined', () => {
    expect(getPlanetaryHeliocentricEclipticLatitude).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const Λ = getPlanetaryHeliocentricEclipticLatitude(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(Λ).toBeCloseTo(3.119613)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryHeliocentricDistance', () => {
  it('should be defined', () => {
    expect(getPlanetaryHeliocentricDistance).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const R = getPlanetaryHeliocentricDistance(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(R).toBe(0.7207354164908778)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryGeocentricEclipticCoordinate', () => {
  it('should be defined', () => {
    expect(getPlanetaryGeocentricEclipticCoordinate).toBeDefined()
  })

  it('should return the correct value for Venus (an interior planet) at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()
    const { λ, β } = getPlanetaryGeocentricEclipticCoordinate(
      new Date('2016-01-04T03:00:00+00:00'),
      venus
    )
    expect(λ).toBe(245.79403406596947)
    expect(β).toBe(1.8937944394473665)
  })

  it('should return the correct value for Saturn (an exterior planet) at the datetime prescribed', () => {
    const saturn = planets.find(planet => planet.name === 'Saturn')
    expect(saturn).toBeDefined()
    const { λ, β } = getPlanetaryGeocentricEclipticCoordinate(
      new Date('2016-01-04T03:00:00+00:00'),
      saturn
    )
    expect(λ).toBe(251.5017460271163)
    expect(β).toBe(1.6685889641726377)
  })
})

/*****************************************************************************************************************/
