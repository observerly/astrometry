/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/orbit
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  convertEclipticToEquatorial,
  getPlanetaryEquationOfCenter,
  getPlanetaryGeocentricEclipticCoordinate,
  getPlanetaryHeliocentricDistance,
  getPlanetaryHeliocentricEclipticLatitude,
  getPlanetaryHeliocentricEclipticLongitude,
  getPlanetaryMeanAnomaly,
  getPlanetaryPositions,
  getPlanetaryTrueAnomaly,
  planets
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

/*****************************************************************************************************************/

describe('getPlanetaryMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getPlanetaryMeanAnomaly).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const venus = planets.find(planet => planet.name === 'Venus')
    expect(venus).toBeDefined()

    if (!venus) {
      throw new Error('Venus is not defined')
    }

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

    if (!venus) {
      throw new Error('Venus is not defined')
    }

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

    if (!venus) {
      throw new Error('Venus is not defined')
    }

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

    if (!venus) {
      throw new Error('Venus is not defined')
    }

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

    if (!venus) {
      throw new Error('Venus is not defined')
    }

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

    if (!venus) {
      throw new Error('Venus is not defined')
    }

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

    if (!venus) {
      throw new Error('Venus is not defined')
    }

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

    if (!saturn) {
      throw new Error('Venus is not defined')
    }

    const { λ, β } = getPlanetaryGeocentricEclipticCoordinate(
      new Date('2016-01-04T03:00:00+00:00'),
      saturn
    )
    expect(λ).toBe(251.5017460271163)
    expect(β).toBe(1.6685889641726377)
  })

  it('should return the correct value for Mercury (an inferior planet) at the datetime prescribed', () => {
    const mercury = planets.find(planet => planet.name === 'Mercury')
    expect(mercury).toBeDefined()

    if (!mercury) {
      throw new Error('Venus is not defined')
    }

    const { λ, β } = getPlanetaryGeocentricEclipticCoordinate(
      new Date('2023-11-01T12:00:00+00:00'),
      mercury
    )

    const { ra, dec } = convertEclipticToEquatorial(datetime, {
      λ,
      β
    })

    expect(ra).toBeCloseTo(224.32477023329668)
    expect(dec).toBeCloseTo(-17.537833237099484)
  })

  it('should return the correct value for Jupiter (an exterior planet) at the datetime prescribed', () => {
    const jupiter = planets.find(planet => planet.name === 'Jupiter')
    expect(jupiter).toBeDefined()

    if (!jupiter) {
      throw new Error('Venus is not defined')
    }

    const { λ, β } = getPlanetaryGeocentricEclipticCoordinate(
      new Date('2023-11-01T12:00:00+00:00'),
      jupiter
    )

    const { ra, dec } = convertEclipticToEquatorial(datetime, {
      λ,
      β
    })

    expect(ra).toBeCloseTo(38.041925844118374)
    expect(dec).toBeCloseTo(13.764471149937803)
  })
})

/*****************************************************************************************************************/

describe('getPlanetaryPositions', () => {
  it('should be defined', () => {
    expect(getPlanetaryPositions).toBeDefined()
  })

  it('should return the correct value for Venus at the datetime prescribed', () => {
    const positions = getPlanetaryPositions(new Date('2016-01-04T03:00:00+00:00'), {
      latitude,
      longitude
    })

    const venus = positions.find(planet => planet.name === 'Venus')

    expect(venus).toBeDefined()

    if (!venus) {
      throw new Error('Venus is not defined')
    }

    expect(venus).toMatchObject({
      name: 'Venus',
      symbol: '♀',
      λ: 245.79403406596947,
      β: 1.8937944394473665,
      ra: 244.24799409185357,
      dec: -19.405675761170443,
      alt: -23.175487207053806,
      az: 256.7098995011133
    })

    expect(venus).toHaveProperty('ra')
    expect(venus).toHaveProperty('dec')
  })
})

/*****************************************************************************************************************/
