/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constellations
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  constellations,
  convertCartesianToEquatorial,
  convertEquatorialToCartesian,
  doTranspose,
  type EquatorialCoordinate,
  getConstellation,
  getJulianDate,
  getPrecessionMatrix,
  getRotatedCartesianCoordinate
} from '../src'

/*****************************************************************************************************************/

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

// For testing
const polaris: EquatorialCoordinate = { ra: 37.9528333, dec: 89.2641083 }

// For testing
const alphaCentauri: EquatorialCoordinate = { ra: 219.9009167, dec: -60.8339722 }

/*****************************************************************************************************************/

describe('constellations', () => {
  it('should be defined', () => {
    expect(constellations).toBeDefined()
  })

  it('should contain all 87+2 modern constellations', () => {
    // We have 89 constellations in total, as we split Serpens into two separate constellations:
    // e.g., Serpens Caput and Serpens Cauda:
    expect(constellations.size).toBe(89)
  })

  it('should give every boundary as finite coordinates', () => {
    // A boundary that repeats a vertex, e.g., Pyxis and Piscis Austrinus, is interpolated without a
    // coordinate that is not a number, which would otherwise be serialised as null in the GeoJSON.

    // Every number anywhere in the feature collection, e.g., each coordinate of each boundary:
    const numbers = (value: unknown): unknown[] =>
      Array.isArray(value) ? value.flatMap(numbers) : [value]

    for (const [, constellation] of constellations) {
      for (const feature of constellation.feature.features) {
        if (!('coordinates' in feature.geometry)) continue

        for (const n of numbers(feature.geometry.coordinates)) {
          expect(Number.isFinite(n)).toBe(true)
        }
      }
    }
  })
})

/*****************************************************************************************************************/

describe('getConstellation', () => {
  it('should be defined', () => {
    expect(getConstellation).toBeDefined()
  })

  it('should give the correct constellation of Orion for the star Betelgeuse', () => {
    const constellation = getConstellation(betelgeuse)

    expect(constellation).toBeDefined()

    if (!constellation) {
      throw new Error('Constellation not defined')
    }

    expect(constellation.name).toBe('Orion')
    expect(constellation.abbreviation).toBe('Ori')
  })

  it('should give the correct constellation of Ursa Minor for the star Polaris', () => {
    const constellation = getConstellation(polaris)

    expect(constellation).toBeDefined()

    if (!constellation) {
      throw new Error('Constellation not defined')
    }

    expect(constellation.name).toBe('Ursa Minor')
    expect(constellation.abbreviation).toBe('UMi')
  })

  it('should give the correct constellation of Centaurus for the star Alpha Centauri', () => {
    const constellation = getConstellation(alphaCentauri)

    expect(constellation).toBeDefined()

    if (!constellation) {
      throw new Error('Constellation not defined')
    }

    expect(constellation.name).toBe('Centaurus')
    expect(constellation.abbreviation).toBe('Cen')
  })

  it.each([
    ['Unukalhai (α Serpentis)', 236.067, 6.4256, 'Serpens Caput', 'SerCap'],
    ['M5', 229.6384, 2.081, 'Serpens Caput', 'SerCap'],
    ['Alya (θ¹ Serpentis)', 284.0549, 4.2036, 'Serpens Cauda', 'SerCad'],
    ['M16', 274.7, -13.807, 'Serpens Cauda', 'SerCad']
  ])('should give the correct part of Serpens for %s', (_, ra, dec, name, abbreviation) => {
    // The Nancy Roman lookup table gives Serpens as the one constellation, and so the part either side of
    // Ophiuchus is resolved from the right ascension of the target:
    const constellation = getConstellation({ ra, dec })

    expect(constellation).toBeDefined()

    if (!constellation) {
      throw new Error('Constellation not defined')
    }

    expect(constellation.name).toBe(name)
    expect(constellation.abbreviation).toBe(abbreviation)
  })

  it.each([
    ['NGC 7814', 0.8121, 16.1453, 'Pegasus', 'Peg'],
    ['30 Piscium', 0.49, -6.0141, 'Pisces', 'Psc'],
    ['a target at 0.1° and the celestial equator', 0.1, 0, 'Pisces', 'Psc']
  ])(
    'should give the correct constellation for %s, just east of 0h',
    (_, ra, dec, name, abbreviation) => {
      // The precession to 1875 carries a target just east of 0h to just west of it, e.g., to a right
      // ascension of ~359°, and not to a negative right ascension that lies outside of every boundary:
      const constellation = getConstellation({ ra, dec })

      expect(constellation).toBeDefined()

      if (!constellation) {
        throw new Error('Constellation not defined')
      }

      expect(constellation.name).toBe(name)
      expect(constellation.abbreviation).toBe(abbreviation)
    }
  )

  it.each([
    ['~0.01″ south of the boundary to Pegasus', 359.25, 9.9999972, 'Pisces', 'Psc'],
    ['~0.01″ north of the boundary to Pisces', 359.25, 10.0000028, 'Pegasus', 'Peg'],
    ['~0.01″ south of the boundary to Virgo', 178.5, -11.0000028, 'Corvus', 'Crv'],
    ['~0.01″ north of the boundary to Corvus', 178.5, -10.9999972, 'Virgo', 'Vir'],
    ['~0.01″ south of the boundary to Centaurus', 187.5, -55.0000028, 'Crux', 'Cru'],
    ['~0.01″ north of the boundary to Crux', 187.5, -54.9999972, 'Centaurus', 'Cen'],
    ['~0.02″ west of the boundary to Chamaeleon', 115.0004944, -80, 'Mensa', 'Men'],
    ['~0.02″ east of the boundary to Mensa', 115.0005056, -80, 'Chamaeleon', 'Cha']
  ])(
    'should give the correct constellation for a B1875.0 position %s',
    (_, ra, dec, name, abbreviation) => {
      // The boundaries of the Nancy Roman lookup table are given for the mean equator and equinox of
      // the Besselian epoch B1875.0, e.g., the Julian date 2405889.258550, as 25 tropical years of
      // 365.242198781 days before B1900.0 at the Julian date 2415020.31352:
      const epoch = new Date('1874-12-31T18:12:18.761Z')

      expect(getJulianDate(epoch)).toBeCloseTo(2405889.25855, 6)

      // The position is given either side of a boundary as it is tabulated, e.g., a declination of
      // +10° between Pisces and Pegasus, and is carried from the mean equator and equinox of B1875.0
      // back to that of J2000.0 by the transpose of the precession matrix:
      const target = convertCartesianToEquatorial(
        getRotatedCartesianCoordinate(
          doTranspose(getPrecessionMatrix(epoch)),
          convertEquatorialToCartesian({ ra, dec })
        )
      )

      const constellation = getConstellation(target)

      expect(constellation).toBeDefined()

      if (!constellation) {
        throw new Error('Constellation not defined')
      }

      expect(constellation.name).toBe(name)
      expect(constellation.abbreviation).toBe(abbreviation)
    }
  )

  it.each([
    ['Betelgeuse', 88.7929583, 7.4070639, 'Orion', 'Ori'],
    ['Polaris', 37.9528333, 89.2641083, 'Ursa Minor', 'UMi'],
    ['Alpha Centauri', 219.9009167, -60.8339722, 'Centaurus', 'Cen'],
    ['a target ~0.04″ west of the boundary to Chamaeleon', 113.04658957, -80, 'Mensa', 'Men'],
    ['a target ~0.04″ east of the boundary to Mensa', 113.04661179, -80, 'Chamaeleon', 'Cha'],
    ['a target ~0.015″ south of the boundary to Pegasus', 0.5, 10.69604225, 'Pisces', 'Psc'],
    ['a target ~0.015″ north of the boundary to Pisces', 0.5, 10.69605059, 'Pegasus', 'Peg'],
    ['a target ~0.015″ south of the boundary to Virgo', 180, -11.69599244, 'Corvus', 'Crv'],
    ['a target ~0.015″ north of the boundary to Corvus', 180, -11.69598411, 'Virgo', 'Vir']
  ])(
    'should give the same constellation for %s irrespective of the host timezone',
    (_, ra, dec, name, abbreviation) => {
      // The epoch of the Nancy Roman lookup table is an instant in UTC, and not the local midnight of
      // the host, which would otherwise carry the boundaries by up to ~0.1″ between timezones, e.g.,
      // enough to move a target that lies within ~0.1″ of a boundary into the neighbouring constellation:
      const TZ = process.env.TZ

      try {
        for (const timezone of [
          'UTC',
          'Etc/GMT-14',
          'Etc/GMT+12',
          'Pacific/Auckland',
          'Asia/Kolkata',
          'Europe/London',
          'America/New_York',
          'America/Los_Angeles'
        ]) {
          process.env.TZ = timezone

          const constellation = getConstellation({ ra, dec })

          expect(constellation?.name, timezone).toBe(name)
          expect(constellation?.abbreviation, timezone).toBe(abbreviation)
        }
      } finally {
        process.env.TZ = TZ
      }
    }
  )
})

/*****************************************************************************************************************/
