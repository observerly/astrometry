/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/orbit
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  convertDegreesToRadians as radians,
  convertRadiansToDegrees as degrees,
  convertEclipticToEquatorial,
  getEquatorialToEclipticMatrix,
  getMatrixProduct,
  getNutationMatrix,
  getPlanetaryEquationOfCenter,
  getPlanetaryGeocentricEclipticCoordinate,
  getPlanetaryHeliocentricDistance,
  getPlanetaryHeliocentricEclipticLatitude,
  getPlanetaryHeliocentricEclipticLongitude,
  getPlanetaryMeanAnomaly,
  getPlanetaryPositions,
  getPlanetaryTrueAnomaly,
  getPrecessionMatrix,
  getRotatedCartesianCoordinate,
  getRotationMatrix,
  planets
} from '../src'

import { MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000 } from '../src/constants'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
const longitude = -155.468094

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
    expect(M).toBeCloseTo(57.437992)
  })

  it.each([
    ['Mercury', 174.792528],
    ['Venus', 50.376633],
    ['Earth', 357.52689],
    ['Mars', 19.390197],
    ['Jupiter', 19.667962],
    ['Saturn', 317.355366],
    ['Uranus', 142.283828],
    ['Neptune', 259.915209]
  ])(
    'should return the mean longitude less the longitude of perihelion for %s at the J2000.0 epoch (TT)',
    (name, expected) => {
      const planet = planets.find(planet => planet.name === name)
      expect(planet).toBeDefined()

      if (!planet) {
        throw new Error(`${name} is not defined`)
      }

      // 2000 January 1.5 TT is 2000 January 1 11:58:55.816 UTC, e.g., TT − UTC = 32 s + 32.184 s:
      const M = getPlanetaryMeanAnomaly(new Date('2000-01-01T11:58:55.816+00:00'), planet)
      expect(M).toBeCloseTo(expected, 6)
    }
  )

  it.each([
    ['Mercury', 149472.67411175],
    ['Venus', 58517.81538729],
    ['Earth', 35999.37244981],
    ['Mars', 19140.30268499],
    ['Jupiter', 3034.74612775],
    ['Saturn', 1222.49362201],
    ['Uranus', 428.48202785],
    ['Neptune', 218.45945325]
  ])(
    'should advance the mean anomaly of %s at its mean motion over a Julian century',
    (name, rate) => {
      const planet = planets.find(planet => planet.name === name)

      if (!planet) {
        throw new Error(`${name} is not defined`)
      }

      // The orbital period of the planet is in Julian years, of 365.25 days each, and so over a Julian
      // century of 36525 days the mean anomaly advances by the mean motion of the mean longitude of the
      // planet (in degrees per Julian century, Standish, E. M., Keplerian Elements for Approximate
      // Positions of the Major Planets), and not by that of a century of tropical years:
      const epoch = new Date('2000-01-01T11:58:55.816+00:00')

      const century = new Date(epoch.getTime() + 36525 * 86400000)

      // N.B. The Terrestrial Time of the two instants is the same 64.184 s ahead of UTC, e.g., as no
      // leap second is taken to be inserted after the last of the table:
      const advance =
        getPlanetaryMeanAnomaly(century, planet) - getPlanetaryMeanAnomaly(epoch, planet)

      expect(((((advance - rate) % 360) + 540) % 360) - 180).toBeCloseTo(0, 1)
    }
  )
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
    expect(E).toBeCloseTo(0.654486)
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
    expect(E).toBeCloseTo(58.092478)
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
    expect(L).toBeCloseTo(189.694945)
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
    expect(Λ).toBeCloseTo(3.124186)
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
    expect(R).toBe(0.7207209466568515)
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
    expect(λ).toBe(245.86633391147632)
    expect(β).toBe(1.8958603718987546)
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
    expect(λ).toBe(251.6416446197856)
    expect(β).toBe(1.6278803703297742)
  })

  it('should return the correct value for Mars (an exterior planet) at the datetime prescribed', () => {
    const mars = planets.find(planet => planet.name === 'Mars')
    expect(mars).toBeDefined()

    if (!mars) {
      throw new Error('Mars is not defined')
    }

    // On the 8th of November 2026 Mars lies ~59° from the Earth in heliocentric longitude, e.g., where the
    // elongation is far from conjunction or opposition, and so the Earth's displacement along the line to the
    // planet, R cos(l' − L), is ~0.51 AU. The geocentric ecliptic coordinate is λ ≈ 142.0633°, β ≈ 1.7509°
    // (ERFA plan94 and epv00, true ecliptic and equinox of date):
    const { λ, β } = getPlanetaryGeocentricEclipticCoordinate(
      new Date('2026-11-08T00:00:00Z'),
      mars
    )

    expect(λ).toBeCloseTo(142.50729317712552, 10)
    expect(β).toBeCloseTo(1.7499765570372463, 10)
  })

  it.each(['Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'])(
    'should return the geocentric ecliptic coordinate of %s as the difference of the heliocentric vectors of the planet and the Earth',
    name => {
      const planet = planets.find(planet => planet.name === name)
      const earth = planets.find(planet => planet.name === 'Earth')

      if (!planet || !earth) {
        throw new Error(`${name} or Earth is not defined`)
      }

      for (let day = 0; day < 3650; day += 73) {
        const datetime = new Date(Date.UTC(2020, 0, 1) + day * 86400000)

        const L = getPlanetaryHeliocentricEclipticLongitude(datetime, planet)
        const Λ = getPlanetaryHeliocentricEclipticLatitude(datetime, planet)
        const R = getPlanetaryHeliocentricDistance(datetime, planet)

        const Ω = planet.Ω || 0

        // The planet's heliocentric longitude projected onto the ecliptic:
        const l =
          Ω +
          degrees(
            Math.atan2(
              Math.sin(radians(L - Ω)) * Math.cos(radians(planet.i)),
              Math.cos(radians(L - Ω))
            )
          )

        const Le = getPlanetaryHeliocentricEclipticLongitude(datetime, earth)
        const Re = getPlanetaryHeliocentricDistance(datetime, earth)

        // The geocentric vector of the planet is the heliocentric vector of the planet less that of the Earth:
        const x = R * Math.cos(radians(Λ)) * Math.cos(radians(l)) - Re * Math.cos(radians(Le))
        const y = R * Math.cos(radians(Λ)) * Math.sin(radians(l)) - Re * Math.sin(radians(Le))
        const z = R * Math.sin(radians(Λ))

        // The elements of the planets are referred to the ecliptic and equinox of J2000.0, and so the
        // vector is rotated onto the mean equator of J2000.0, carried to the true equator and equinox
        // of the date by the precession and the nutation, and rotated onto the true ecliptic of the date:
        const r = Math.hypot(x, y, z)

        const v = getRotatedCartesianCoordinate(
          getMatrixProduct(
            getEquatorialToEclipticMatrix(datetime),
            getMatrixProduct(
              getNutationMatrix(datetime),
              getMatrixProduct(
                getPrecessionMatrix(datetime),
                getRotationMatrix('x', -MEAN_OBLIQUITY_OF_THE_ECLIPTIC_AT_J2000)
              )
            )
          ),
          { x: x / r, y: y / r, z: z / r }
        )

        const { λ, β } = getPlanetaryGeocentricEclipticCoordinate(datetime, planet)

        expect(Math.cos(radians(λ))).toBeCloseTo(v.x / Math.hypot(v.x, v.y), 10)
        expect(Math.sin(radians(λ))).toBeCloseTo(v.y / Math.hypot(v.x, v.y), 10)
        expect(β).toBeCloseTo(degrees(Math.atan2(v.z, Math.hypot(v.x, v.y))), 8)
      }
    }
  )

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

    expect(ra).toBeCloseTo(224.38577722592606)
    expect(dec).toBeCloseTo(-17.539090028463548)
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

    expect(ra).toBeCloseTo(38.53981247503315)
    expect(dec).toBeCloseTo(13.62294209494143)
  })

  it('should return a geocentric ecliptic longitude in the range [0, 360)', () => {
    // On the 4th of January 2016 Neptune lies just west of the vernal equinox, e.g., at a longitude
    // of ~337.6°, and not at the -22.4° the sum of the heliocentric longitude and its correction gives:
    const neptune = planets.find(planet => planet.name === 'Neptune')

    if (!neptune) {
      throw new Error('Neptune is not defined')
    }

    const { λ } = getPlanetaryGeocentricEclipticCoordinate(
      new Date('2016-01-04T03:00:00Z'),
      neptune
    )

    expect(λ).toBeCloseTo(337.6288988145574, 10)
  })

  it.each([
    ['Venus', '1900-01-01T00:00:00Z', 306.375],
    ['Venus', '2099-12-31T00:00:00Z', 318.867],
    ['Uranus', '1900-01-01T00:00:00Z', 250.146],
    ['Uranus', '2099-12-31T00:00:00Z', 17.726],
    ['Neptune', '1900-01-01T00:00:00Z', 85.221],
    ['Neptune', '2099-12-31T00:00:00Z', 167.297]
  ])(
    'should refer the geocentric ecliptic longitude of %s to the equinox of the date at %s',
    (name, iso, reference) => {
      const planet = planets.find(planet => planet.name === name)

      if (!planet) {
        throw new Error(`${name} is not defined`)
      }

      // The equinox precesses by ~1.4° per century, and so a longitude left referred to the equinox of
      // J2000.0, as the orbital elements of the planets are, is ~1.4° from the longitude referred to the
      // true ecliptic and equinox of the date a century either side of it (ERFA plan94 and epv00):
      const { λ } = getPlanetaryGeocentricEclipticCoordinate(new Date(iso), planet)

      expect(Math.abs(λ - reference)).toBeLessThan(0.25)
    }
  )
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
      λ: 245.86633391147632,
      β: 1.8958603718987546,
      ra: expect.closeTo(244.3242524624544, 12),
      dec: expect.closeTo(-19.413664246117726, 12),
      alt: expect.closeTo(-23.107363620353066, 12),
      az: expect.closeTo(256.68260339582156, 12)
    })

    expect(venus).toHaveProperty('ra')
    expect(venus).toHaveProperty('dec')
  })
})

/*****************************************************************************************************************/
