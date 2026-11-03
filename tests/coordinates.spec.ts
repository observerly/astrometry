/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type CartesianCoordinate,
  convertCartesianToEquatorial,
  convertEclipticToEquatorial,
  convertEquatorialToCartesian,
  convertEquatorialToEcliptic,
  convertEquatorialToGalactic,
  convertEquatorialToHorizontal,
  convertGalacticToEquatorial,
  convertGeocentricToGeographic,
  convertHorizontalToEquatorial,
  doTranspose,
  EARTH_RADIUS,
  type EclipticCoordinate,
  type EquatorialCoordinate,
  type GalacticCoordinate,
  getAngularSeparation,
  getEquatorialToEclipticMatrix,
  getEquatorialToGalacticMatrix,
  getGreenwichApparentSiderealTime,
  getGreenwichSiderealTime,
  getRotatedCartesianCoordinate,
  getTrueObliquityOfTheEcliptic
} from '../src'

import {
  convertRadiansToDegrees as degrees,
  convertDegreesToRadians as radians
} from '../src/utilities'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
const longitude = -155.468094

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

/*****************************************************************************************************************/

describe('convertEclipticToEquatorial', () => {
  it('should be defined', () => {
    expect(convertEclipticToEquatorial).toBeDefined()
  })

  it('should return the correct equatorial coodinate for the planet Venus for the datetime provided', () => {
    const venus = {
      λ: 245.79403406596947,
      β: 1.8937944394473665
    }

    const { ra, dec } = convertEclipticToEquatorial(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(ra).toBe(244.248410736812)
    expect(dec).toBe(-19.4032236885202)
  })

  it('should return an EquatorialCoordinate', () => {
    const equatorial = convertEclipticToEquatorial(datetime, {
      λ: 88.75463188003741,
      β: -16.024965884145512
    })
    expectTypeOf(equatorial).toEqualTypeOf<EquatorialCoordinate>()
    expect(Number.isFinite(equatorial.ra)).toBe(true)
    expect(Number.isFinite(equatorial.dec)).toBe(true)
  })

  // The equatorial coordinate of each star, referred to the true equator and equinox of the date,
  // as the transpose of R1(ε) of the true obliquity of obl06 and nut06a of ERFA resolves it (in
  // degrees):
  it.each([
    {
      name: 'Betelgeuse',
      λ: 88.75463188003741,
      β: -16.024965884145512,
      ra: 88.7929583,
      dec: 7.4070639
    },
    {
      name: 'Polaris',
      λ: 88.56747909128318,
      β: 66.10350510263201,
      ra: 37.95456067,
      dec: 89.26410897
    },
    {
      name: 'Canopus',
      λ: 104.9582461828288,
      β: -75.82191669443161,
      ra: 95.98787778,
      dec: -52.69566111
    },
    {
      name: 'Regulus',
      λ: 149.8296,
      β: 0.4648,
      ra: 152.09301156098815,
      dec: 11.966052022467238
    },
    {
      name: 'Spica',
      λ: 204.0717,
      β: -2.0548,
      ra: 201.51646700899585,
      dec: -11.246162665943382
    },
    {
      name: 'Fomalhaut',
      λ: 334.1167,
      β: -21.1356,
      ra: 344.6622855816683,
      dec: -29.52336642319395
    }
  ])('should agree with ERFA for $name', ({ λ, β, ra, dec }) => {
    const equatorial = convertEclipticToEquatorial(datetime, { λ, β })

    // N.B. The true obliquity of the library agrees with that of ERFA to ~0.07 mas at the date, and
    // so 1e-7° is ~0.36 mas:
    const separation = getAngularSeparation(
      { θ: equatorial.dec, φ: equatorial.ra },
      { θ: dec, φ: ra }
    )

    expect(separation).toBeLessThan(1e-7)
  })

  it('should leave the true equinox of the date fixed, at (0°, 0°)', () => {
    const { ra, dec } = convertEclipticToEquatorial(datetime, { λ: 0, β: 0 })

    expect(ra).toBeCloseTo(0, 12)
    expect(dec).toBeCloseTo(0, 12)
  })

  it('should carry the north ecliptic pole to (270°, 90° − ε)', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { ra, dec } = convertEclipticToEquatorial(datetime, { λ: 0, β: 90 })

    expect(ra).toBeCloseTo(270, 10)
    expect(dec).toBeCloseTo(90 - ε, 10)
  })

  it('should carry the south ecliptic pole to (90°, ε − 90°)', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { ra, dec } = convertEclipticToEquatorial(datetime, { λ: 0, β: -90 })

    expect(ra).toBeCloseTo(90, 10)
    expect(dec).toBeCloseTo(ε - 90, 10)
  })

  it('should carry the celestial pole, at (90°, 90° − ε), to a declination of 90°', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { dec } = convertEclipticToEquatorial(datetime, { λ: 90, β: 90 - ε })

    expect(dec).toBeCloseTo(90, 6)
  })

  it('should carry the solstice, at (90°, 0°), to (90°, ε)', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { ra, dec } = convertEclipticToEquatorial(datetime, { λ: 90, β: 0 })

    expect(ra).toBeCloseTo(90, 10)
    expect(dec).toBeCloseTo(ε, 10)
  })

  it('should carry the autumnal equinox, at (180°, 0°), to (180°, 0°)', () => {
    const { ra, dec } = convertEclipticToEquatorial(datetime, { λ: 180, β: 0 })

    expect(ra).toBeCloseTo(180, 10)
    expect(dec).toBeCloseTo(0, 10)
  })

  it('should return a right ascension within [0°, 360°)', () => {
    for (let λ = 0; λ <= 360; λ += 15) {
      for (const β of [-90, -89, -45, -10, 0, 10, 45, 89, 90]) {
        const { ra } = convertEclipticToEquatorial(datetime, { λ, β })

        expect(ra).toBeGreaterThanOrEqual(0)
        expect(ra).toBeLessThan(360)
      }
    }
  })

  it('should return a declination within [-90°, 90°]', () => {
    for (let λ = 0; λ < 360; λ += 15) {
      for (const β of [-90, -89, -45, -10, 0, 10, 45, 89, 90]) {
        const { dec } = convertEclipticToEquatorial(datetime, { λ, β })

        expect(dec).toBeGreaterThanOrEqual(-90)
        expect(dec).toBeLessThanOrEqual(90)
      }
    }
  })

  it('should agree with the rotation of the transpose of getEquatorialToEclipticMatrix', () => {
    const Eᵀ = doTranspose(getEquatorialToEclipticMatrix(datetime))

    for (let λ = 0; λ < 360; λ += 22.5) {
      for (const β of [-89, -75.82191669443161, 0, 1.8937944394473665, 45, 89]) {
        const { ra, dec } = convertEclipticToEquatorial(datetime, { λ, β })

        // N.B. The ecliptic coordinate is resolved to a unit vector in the ecliptic frame as an
        // equatorial coordinate would be, e.g., λ in place of the right ascension, and β in place
        // of the declination:
        const rotated = convertCartesianToEquatorial(
          getRotatedCartesianCoordinate(Eᵀ, convertEquatorialToCartesian({ ra: λ, dec: β }))
        )

        expect(ra).toBeCloseTo(rotated.ra, 12)
        expect(dec).toBeCloseTo(rotated.dec, 12)
      }
    }
  })

  it('should be undone by convertEquatorialToEcliptic across the sphere', () => {
    for (let λ = 0; λ < 360; λ += 22.5) {
      for (const β of [-89, -60, -23.4, 0, 5.15, 45, 89]) {
        const equatorial = convertEclipticToEquatorial(datetime, { λ, β })

        const ecliptic = convertEquatorialToEcliptic(datetime, equatorial)

        const separation = getAngularSeparation({ θ: β, φ: λ }, { θ: ecliptic.β, φ: ecliptic.λ })

        expect(separation).toBeLessThan(1e-10)
      }
    }
  })
})

/*****************************************************************************************************************/

describe('convertEquatorialToEcliptic', () => {
  it('should be defined', () => {
    expect(convertEquatorialToEcliptic).toBeDefined()
  })

  it('should return an EclipticCoordinate', () => {
    const ecliptic = convertEquatorialToEcliptic(datetime, { ra: 88.7929583, dec: 7.4070639 })
    expectTypeOf(ecliptic).toEqualTypeOf<EclipticCoordinate>()
    expect(Number.isFinite(ecliptic.λ)).toBe(true)
    expect(Number.isFinite(ecliptic.β)).toBe(true)
  })

  // The ecliptic coordinate of each star, referred to the true ecliptic and equinox of the date, as
  // R1(ε) of the true obliquity of obl06 and nut06a of ERFA resolves it (in degrees):
  it.each([
    {
      name: 'Betelgeuse',
      ra: 88.7929583,
      dec: 7.4070639,
      λ: 88.75463188003741,
      β: -16.024965884145512
    },
    {
      name: 'Polaris',
      ra: 37.95456067,
      dec: 89.26410897,
      λ: 88.56747909128318,
      β: 66.10350510263201
    },
    {
      name: 'Canopus',
      ra: 95.98787778,
      dec: -52.69566111,
      λ: 104.9582461828288,
      β: -75.82191669443161
    },
    {
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      λ: 285.31538380903453,
      β: 61.73089339236144
    },
    {
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      λ: 271.8709429630775,
      β: -65.84224577931604
    }
  ])('should agree with ERFA for $name', ({ ra, dec, λ, β }) => {
    const ecliptic = convertEquatorialToEcliptic(datetime, { ra, dec })

    // N.B. The true obliquity of the library agrees with that of ERFA to ~0.07 mas at the date, and
    // so 1e-7° is ~0.36 mas:
    const separation = getAngularSeparation({ θ: ecliptic.β, φ: ecliptic.λ }, { θ: β, φ: λ })

    expect(separation).toBeLessThan(1e-7)
  })

  it('should leave the true equinox of the date fixed, at (0°, 0°)', () => {
    const { λ, β } = convertEquatorialToEcliptic(datetime, { ra: 0, dec: 0 })

    expect(λ).toBeCloseTo(0, 12)
    expect(β).toBeCloseTo(0, 12)
  })

  it('should carry the celestial pole to (90°, 90° − ε)', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { λ, β } = convertEquatorialToEcliptic(datetime, { ra: 0, dec: 90 })

    expect(λ).toBeCloseTo(90, 10)
    expect(β).toBeCloseTo(90 - ε, 10)
  })

  it('should carry the ecliptic pole, at (270°, 90° − ε), to an ecliptic latitude of 90°', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { β } = convertEquatorialToEcliptic(datetime, { ra: 270, dec: 90 - ε })

    expect(β).toBeCloseTo(90, 6)
  })

  it('should carry the solstice, at (90°, ε), onto the ecliptic at a longitude of 90°', () => {
    const ε = getTrueObliquityOfTheEcliptic(datetime)

    const { λ, β } = convertEquatorialToEcliptic(datetime, { ra: 90, dec: ε })

    expect(λ).toBeCloseTo(90, 10)
    expect(β).toBeCloseTo(0, 10)
  })

  it('should return an ecliptic longitude within [0°, 360°)', () => {
    for (let ra = 0; ra < 360; ra += 15) {
      for (const dec of [-89, -45, -10, 0, 10, 45, 89]) {
        const { λ } = convertEquatorialToEcliptic(datetime, { ra, dec })

        expect(λ).toBeGreaterThanOrEqual(0)
        expect(λ).toBeLessThan(360)
      }
    }
  })

  it('should agree with the rotation of getEquatorialToEclipticMatrix', () => {
    for (let ra = 0; ra < 360; ra += 22.5) {
      for (const dec of [-89, -52.69566111, 0, 7.4070639, 45, 89]) {
        const { λ, β } = convertEquatorialToEcliptic(datetime, { ra, dec })

        // N.B. The ecliptic coordinate is resolved from the unit vector in the ecliptic frame as an
        // equatorial coordinate would be, e.g., λ in place of the right ascension, and β in place
        // of the declination:
        const rotated = convertCartesianToEquatorial(
          getRotatedCartesianCoordinate(
            getEquatorialToEclipticMatrix(datetime),
            convertEquatorialToCartesian({ ra, dec })
          )
        )

        expect(λ).toBeCloseTo(rotated.ra, 12)
        expect(β).toBeCloseTo(rotated.dec, 12)
      }
    }
  })

  it('should be undone by convertEclipticToEquatorial across the sphere', () => {
    for (let ra = 0; ra < 360; ra += 22.5) {
      for (const dec of [-89, -60, -23.4, 0, 5.15, 45, 89]) {
        const ecliptic = convertEquatorialToEcliptic(datetime, { ra, dec })

        const equatorial = convertEclipticToEquatorial(datetime, ecliptic)

        const separation = getAngularSeparation(
          { θ: dec, φ: ra },
          { θ: equatorial.dec, φ: equatorial.ra }
        )

        expect(separation).toBeLessThan(1e-10)
      }
    }
  })
})

/*****************************************************************************************************************/

describe('convertEquatorialToHorizontal', () => {
  it('should be defined', () => {
    expect(convertEquatorialToHorizontal).toBeDefined()
  })

  it('should return the correct horizontal coodinate for the star Betelgeuse for the datetime provided', () => {
    const { alt, az } = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)
    expect(alt).toBeCloseTo(72.78239710139869, 9)
    expect(az).toBeCloseTo(134.43777898765828, 9)
  })

  it('should return the correct horizontal coodinate for a target directly overhead for the datetime provided', () => {
    const GAST = getGreenwichApparentSiderealTime(datetime)

    // The observer is at the same latitude as Betelgeuse's declination, and the same longitude as as
    // Betelgeuse's right ascension minus the GAST times 15 degrees per hour, e.g., the apparent
    // sidereal time the hour angle of the conversion is taken against:
    // This simulates a target directly overhead for the "observer":
    const observer = { latitude: betelgeuse.dec, longitude: betelgeuse.ra - GAST * 15 }

    // Convert the target to horizontal coordinates:
    const target = convertEquatorialToHorizontal(datetime, observer, betelgeuse)
    // The target should be directly overhead:
    expect(target.alt).toBe(90)
    // The target should be at the observer's meridian:
    expect(target.az).toBe(270)
  })

  it('should not displace a distant target for an observer at an elevation greater than 0', () => {
    // The elevation of the observer does not change where a distant target is on the celestial
    // sphere: it depresses the observer's horizon, which the horizon-relative predicates apply:
    const { alt, az } = convertEquatorialToHorizontal(
      datetime,
      { latitude, longitude, elevation: 100 },
      betelgeuse
    )
    expect(alt).toBeCloseTo(72.78239710139869, 9)
    expect(az).toBeCloseTo(134.43777898765828, 9)
  })

  it('should return a target at the zenith at an altitude of 90 degrees for an elevated observer', () => {
    const GAST = getGreenwichApparentSiderealTime(datetime)

    // The observer is directly beneath the target, at the elevation of Mauna Kea:
    const observer = {
      latitude: betelgeuse.dec,
      longitude: betelgeuse.ra - GAST * 15,
      elevation: 4207
    }

    const target = convertEquatorialToHorizontal(datetime, observer, betelgeuse)

    // The altitude of a target is bounded by the zenith, whatever the observer's elevation:
    expect(target.alt).toBe(90)
  })

  it('should return the correct horizontal coordinate for an observer below sea level', () => {
    // The dip of the horizon vanishes at sea level, and so an observer below sea level resolves
    // the same horizontal coordinate as an observer at sea level:
    const { alt, az } = convertEquatorialToHorizontal(
      datetime,
      { latitude, longitude, elevation: -430 },
      betelgeuse
    )

    expect(alt).toBeCloseTo(72.78239710139869, 9)
    expect(az).toBeCloseTo(134.43777898765828, 9)
  })

  it('should not displace a distant target for an observer at a very large elevation', () => {
    // The altitude of a distant target is the same for an observer in low Earth orbit as it is at
    // sea level, as the depression of the horizon belongs to the horizon, and not to the target:
    const { alt } = convertEquatorialToHorizontal(
      datetime,
      { latitude, longitude, elevation: 400000 },
      betelgeuse
    )

    const { alt: sea } = convertEquatorialToHorizontal(
      datetime,
      { latitude, longitude },
      betelgeuse
    )

    expect(alt).toBeCloseTo(sea, 9)
  })

  it('should correct the altitude of a nearby target for its diurnal parallax', () => {
    // The geocentric horizontal coordinate of the target, e.g., with no distance to the target:
    const geocentric = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)

    // The topocentric horizontal coordinate of the target, at the mean distance of the Moon:
    const topocentric = convertEquatorialToHorizontal(
      datetime,
      { latitude, longitude },
      {
        ...betelgeuse,
        distance: 384400000
      }
    )

    // The horizontal parallax at the mean distance of the Moon is ~0.95°, and the parallax at the
    // altitude of the target is that parallax projected onto the vertical circle of the target:
    const p = degrees(Math.asin(EARTH_RADIUS / 384400000)) * Math.cos(radians(geocentric.alt))

    expect(p).toBeCloseTo(0.28, 2)

    // The parallax displaces the target towards the horizon, and so the topocentric altitude is
    // always lower than the geocentric altitude:
    expect(topocentric.alt).toBeCloseTo(geocentric.alt - p, 6)
    expect(topocentric.alt).toBeLessThan(geocentric.alt)

    // The parallax acts along the vertical circle of the target, and so the azimuth is unchanged:
    expect(topocentric.az).toBe(geocentric.az)
  })

  it('should not correct the altitude of a distant target for its diurnal parallax', () => {
    const geocentric = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)

    // At the distance of Betelgeuse, e.g., ~548 light years, the parallax is negligible:
    const topocentric = convertEquatorialToHorizontal(
      datetime,
      { latitude, longitude },
      {
        ...betelgeuse,
        distance: 5.18e18
      }
    )

    expect(topocentric.alt).toBeCloseTo(geocentric.alt, 9)
    expect(topocentric.az).toBe(geocentric.az)
  })
})

/*****************************************************************************************************************/

describe('convertHorizontalToEquatorial', () => {
  it('should be defined', () => {
    expect(convertHorizontalToEquatorial).toBeDefined()
  })

  it('should return the correct equatorial coodinate for the given horizontal coordinate at the datetime provided', () => {
    const { ra, dec } = convertHorizontalToEquatorial(
      datetime,
      { latitude, longitude },
      { alt: 72.78239710139869, az: 134.43777898765828 }
    )
    expect(ra).toBeCloseTo(88.7929583)
    expect(dec).toBeCloseTo(7.4070639)
  })
})

/*****************************************************************************************************************/

describe('convertGalacticToEquatorial', () => {
  it('should be defined', () => {
    expect(convertGalacticToEquatorial).toBeDefined()
  })

  it('should return the correct equatorial coodinate for the given galactic coordinate at J2000.0 epoch', () => {
    const { ra, dec } = convertGalacticToEquatorial({
      l: 180.0,
      b: 55.33333333
    })

    // N.B. The equatorial coordinate, referred to the ICRS, as the g2icrs routine of ERFA resolves
    // it (in degrees):
    expect(ra).toBeCloseTo(153.928123039411, 10)
    expect(dec).toBeCloseTo(40.559789788700506, 10)
  })

  it('should return an EquatorialCoordinate', () => {
    const equatorial = convertGalacticToEquatorial({ l: 199.78723977963807, b: -8.958588971279083 })
    expectTypeOf(equatorial).toEqualTypeOf<EquatorialCoordinate>()
    expect(Number.isFinite(equatorial.ra)).toBe(true)
    expect(Number.isFinite(equatorial.dec)).toBe(true)
  })

  // The equatorial coordinate of each star, referred to the ICRS, as the g2icrs routine of ERFA
  // resolves it (in degrees):
  it.each([
    {
      name: 'Betelgeuse',
      l: 199.78723977963807,
      b: -8.958588971279083,
      ra: 88.7929583,
      dec: 7.4070639
    },
    {
      name: 'Polaris',
      l: 123.28054437658928,
      b: 26.46139355081295,
      ra: 37.95456067,
      dec: 89.26410897
    },
    {
      name: 'Canopus',
      l: 261.21208561578067,
      b: -25.292252241924412,
      ra: 95.98787778,
      dec: -52.69566111
    },
    {
      name: 'Vega',
      l: 67.44820298814159,
      b: 19.23725244509086,
      ra: 279.23473479,
      dec: 38.78368896
    },
    {
      name: 'σ Octantis',
      l: 303.9052326043725,
      b: -27.713470498059788,
      ra: 317.19541667,
      dec: -88.9565
    },
    {
      name: 'Sirius',
      l: 227.23028548110472,
      b: -8.890282427779283,
      ra: 101.28715533,
      dec: -16.71611586
    },
    {
      name: 'Deneb',
      l: 84.2847305311689,
      b: 1.997545400239554,
      ra: 310.35797975,
      dec: 45.28033881
    }
  ])('should agree with ERFA for $name', ({ l, b, ra, dec }) => {
    const equatorial = convertGalacticToEquatorial({ l, b })

    // N.B. The galactic pole and node of the library are those of ERFA, and so the two agree to the
    // rounding of the matrix elements of g2icrs, e.g., well within 1e-10°:
    const separation = getAngularSeparation(
      { θ: equatorial.dec, φ: equatorial.ra },
      { θ: dec, φ: ra }
    )

    expect(separation).toBeLessThan(1e-10)
  })

  it('should carry the origin of the galactic frame, at (0°, 0°), to the galactic centre', () => {
    const { ra, dec } = convertGalacticToEquatorial({ l: 0, b: 0 })

    // N.B. The galactic centre is given to 1e-5° in the Hipparcos catalogue, at (266.40499°,
    // −28.93617°), and so the separation from the origin of the galactic frame is of that order:
    const separation = getAngularSeparation({ θ: dec, φ: ra }, { θ: -28.93617, φ: 266.40499 })

    expect(separation).toBeLessThan(1e-5)
  })

  it('should carry the north galactic pole to (192.85948°, 27.12825°)', () => {
    const { ra, dec } = convertGalacticToEquatorial({ l: 0, b: 90 })

    expect(ra).toBeCloseTo(192.85948, 10)
    expect(dec).toBeCloseTo(27.12825, 10)
  })

  it('should carry the south galactic pole to (12.85948°, −27.12825°)', () => {
    const { ra, dec } = convertGalacticToEquatorial({ l: 0, b: -90 })

    expect(ra).toBeCloseTo(12.85948, 10)
    expect(dec).toBeCloseTo(-27.12825, 10)
  })

  it('should not depend on the galactic longitude at either galactic pole', () => {
    for (let l = 0; l < 360; l += 30) {
      const north = convertGalacticToEquatorial({ l, b: 90 })

      expect(north.ra).toBeCloseTo(192.85948, 10)
      expect(north.dec).toBeCloseTo(27.12825, 10)

      const south = convertGalacticToEquatorial({ l, b: -90 })

      expect(south.ra).toBeCloseTo(12.85948, 10)
      expect(south.dec).toBeCloseTo(-27.12825, 10)
    }
  })

  it('should carry the north celestial pole, at (122.93192°, 27.12825°), to δ = 90°', () => {
    const { dec } = convertGalacticToEquatorial({ l: 122.93192, b: 27.12825 })

    expect(dec).toBeCloseTo(90, 6)
  })

  it('should carry the south celestial pole, at (302.93192°, −27.12825°), to δ = −90°', () => {
    const { dec } = convertGalacticToEquatorial({ l: 302.93192, b: -27.12825 })

    expect(dec).toBeCloseTo(-90, 6)
  })

  it('should return a right ascension within [0°, 360°)', () => {
    for (let l = 0; l <= 360; l += 15) {
      for (const b of [-90, -89, -45, -27.12825, 0, 27.12825, 45, 89, 90]) {
        const { ra } = convertGalacticToEquatorial({ l, b })

        expect(ra).toBeGreaterThanOrEqual(0)
        expect(ra).toBeLessThan(360)
      }
    }
  })

  it('should return a declination within [−90°, 90°]', () => {
    for (let l = 0; l < 360; l += 15) {
      for (const b of [-90, -89, -45, -27.12825, 0, 27.12825, 45, 89, 90]) {
        const { dec } = convertGalacticToEquatorial({ l, b })

        expect(dec).toBeGreaterThanOrEqual(-90)
        expect(dec).toBeLessThanOrEqual(90)
      }
    }
  })

  it('should agree with the rotation of the transpose of getEquatorialToGalacticMatrix', () => {
    const Gᵀ = doTranspose(getEquatorialToGalacticMatrix())

    for (let l = 0; l < 360; l += 22.5) {
      for (const b of [-89, -60, -27.12825, 0, 12.25, 45, 89]) {
        const { ra, dec } = convertGalacticToEquatorial({ l, b })

        // N.B. The galactic coordinate is resolved to a unit vector in the galactic frame as an
        // equatorial coordinate would be, e.g., l in place of the right ascension, and b in place
        // of the declination:
        const rotated = convertCartesianToEquatorial(
          getRotatedCartesianCoordinate(Gᵀ, convertEquatorialToCartesian({ ra: l, dec: b }))
        )

        expect(ra).toBeCloseTo(rotated.ra, 12)
        expect(dec).toBeCloseTo(rotated.dec, 12)
      }
    }
  })

  it('should be undone by convertEquatorialToGalactic across the sphere', () => {
    for (let l = 0; l < 360; l += 22.5) {
      for (const b of [-89, -60, -27.12825, 0, 12.25, 45, 89]) {
        const equatorial = convertGalacticToEquatorial({ l, b })

        const galactic = convertEquatorialToGalactic(equatorial)

        const separation = getAngularSeparation({ θ: b, φ: l }, { θ: galactic.b, φ: galactic.l })

        expect(separation).toBeLessThan(1e-10)
      }
    }
  })
})

/*****************************************************************************************************************/

describe('convertEquatorialToGalactic', () => {
  it('should be defined', () => {
    expect(convertEquatorialToGalactic).toBeDefined()
  })

  it('should return a GalacticCoordinate', () => {
    const galactic = convertEquatorialToGalactic(betelgeuse)
    expectTypeOf(galactic).toEqualTypeOf<GalacticCoordinate>()
    expect(Number.isFinite(galactic.l)).toBe(true)
    expect(Number.isFinite(galactic.b)).toBe(true)
  })

  // The galactic coordinate of each star, as the icrs2g routine of ERFA resolves it (in degrees):
  it.each([
    {
      name: 'Betelgeuse',
      ra: 88.7929583,
      dec: 7.4070639,
      l: 199.78723977963807,
      b: -8.958588971279083
    },
    {
      name: 'Polaris',
      ra: 37.95456067,
      dec: 89.26410897,
      l: 123.28054437658928,
      b: 26.46139355081295
    },
    {
      name: 'Canopus',
      ra: 95.98787778,
      dec: -52.69566111,
      l: 261.21208561578067,
      b: -25.292252241924412
    },
    {
      name: 'Vega',
      ra: 279.23473479,
      dec: 38.78368896,
      l: 67.44820298814159,
      b: 19.23725244509086
    },
    {
      name: 'σ Octantis',
      ra: 317.19541667,
      dec: -88.9565,
      l: 303.9052326043725,
      b: -27.713470498059788
    },
    {
      name: 'Sirius',
      ra: 101.28715533,
      dec: -16.71611586,
      l: 227.23028548110472,
      b: -8.890282427779283
    },
    {
      name: 'Deneb',
      ra: 310.35797975,
      dec: 45.28033881,
      l: 84.2847305311689,
      b: 1.997545400239554
    }
  ])('should agree with ERFA for $name', ({ ra, dec, l, b }) => {
    const galactic = convertEquatorialToGalactic({ ra, dec })

    // N.B. The galactic pole and node of the library are those of ERFA, and so the two agree to the
    // rounding of the matrix elements of icrs2g, e.g., well within 1e-10°:
    const separation = getAngularSeparation({ θ: galactic.b, φ: galactic.l }, { θ: b, φ: l })

    expect(separation).toBeLessThan(1e-10)
  })

  it('should carry the galactic centre, at (266.40499°, −28.93617°), to (0°, 0°)', () => {
    const { l, b } = convertEquatorialToGalactic({ ra: 266.40499, dec: -28.93617 })

    // N.B. The galactic centre is given to 1e-5° in the Hipparcos catalogue, and so the separation
    // from the origin of the galactic frame is of that order:
    const separation = getAngularSeparation({ θ: b, φ: l }, { θ: 0, φ: 0 })

    expect(separation).toBeLessThan(1e-5)
  })

  it('should carry the north galactic pole, at (192.85948°, 27.12825°), to b = 90°', () => {
    const { b } = convertEquatorialToGalactic({ ra: 192.85948, dec: 27.12825 })

    expect(b).toBeCloseTo(90, 6)
  })

  it('should carry the south galactic pole, at (12.85948°, −27.12825°), to b = −90°', () => {
    const { b } = convertEquatorialToGalactic({ ra: 12.85948, dec: -27.12825 })

    expect(b).toBeCloseTo(-90, 6)
  })

  it('should carry the north celestial pole to (122.93192°, 27.12825°)', () => {
    const { l, b } = convertEquatorialToGalactic({ ra: 0, dec: 90 })

    expect(l).toBeCloseTo(122.93192, 10)
    expect(b).toBeCloseTo(27.12825, 10)
  })

  it('should carry the south celestial pole to (302.93192°, −27.12825°)', () => {
    const { l, b } = convertEquatorialToGalactic({ ra: 0, dec: -90 })

    expect(l).toBeCloseTo(302.93192, 10)
    expect(b).toBeCloseTo(-27.12825, 10)
  })

  it('should not depend on the right ascension at either celestial pole', () => {
    for (let ra = 0; ra < 360; ra += 30) {
      const north = convertEquatorialToGalactic({ ra, dec: 90 })

      expect(north.l).toBeCloseTo(122.93192, 10)
      expect(north.b).toBeCloseTo(27.12825, 10)

      const south = convertEquatorialToGalactic({ ra, dec: -90 })

      expect(south.l).toBeCloseTo(302.93192, 10)
      expect(south.b).toBeCloseTo(-27.12825, 10)
    }
  })

  it('should return a galactic longitude within [0°, 360°)', () => {
    for (let ra = 0; ra <= 360; ra += 15) {
      for (const dec of [-90, -89, -45, -28.93617, 0, 27.12825, 45, 89, 90]) {
        const { l } = convertEquatorialToGalactic({ ra, dec })

        expect(l).toBeGreaterThanOrEqual(0)
        expect(l).toBeLessThan(360)
      }
    }
  })

  it('should return a galactic latitude within [−90°, 90°]', () => {
    for (let ra = 0; ra < 360; ra += 15) {
      for (const dec of [-90, -89, -45, -28.93617, 0, 27.12825, 45, 89, 90]) {
        const { b } = convertEquatorialToGalactic({ ra, dec })

        expect(b).toBeGreaterThanOrEqual(-90)
        expect(b).toBeLessThanOrEqual(90)
      }
    }
  })

  it('should agree with the rotation of getEquatorialToGalacticMatrix', () => {
    for (let ra = 0; ra < 360; ra += 22.5) {
      for (const dec of [-89, -52.69566111, -28.93617, 0, 7.4070639, 45, 89]) {
        const { l, b } = convertEquatorialToGalactic({ ra, dec })

        // N.B. The galactic coordinate is resolved from the unit vector in the galactic frame as an
        // equatorial coordinate would be, e.g., l in place of the right ascension, and b in place
        // of the declination:
        const rotated = convertCartesianToEquatorial(
          getRotatedCartesianCoordinate(
            getEquatorialToGalacticMatrix(),
            convertEquatorialToCartesian({ ra, dec })
          )
        )

        expect(l).toBeCloseTo(rotated.ra, 12)
        expect(b).toBeCloseTo(rotated.dec, 12)
      }
    }
  })

  it('should be undone by the transpose of getEquatorialToGalacticMatrix across the sphere', () => {
    const Gᵀ = doTranspose(getEquatorialToGalacticMatrix())

    for (let ra = 0; ra < 360; ra += 22.5) {
      for (const dec of [-89, -60, -28.93617, 0, 27.12825, 45, 89]) {
        const { l, b } = convertEquatorialToGalactic({ ra, dec })

        const equatorial = convertCartesianToEquatorial(
          getRotatedCartesianCoordinate(Gᵀ, convertEquatorialToCartesian({ ra: l, dec: b }))
        )

        const separation = getAngularSeparation(
          { θ: dec, φ: ra },
          { θ: equatorial.dec, φ: equatorial.ra }
        )

        expect(separation).toBeLessThan(1e-10)
      }
    }
  })

  it('should be undone by convertGalacticToEquatorial across the sphere', () => {
    for (let ra = 0; ra < 360; ra += 22.5) {
      for (const dec of [-89, -60, -28.93617, 0, 27.12825, 45, 89]) {
        const { l, b } = convertEquatorialToGalactic({ ra, dec })

        const equatorial = convertGalacticToEquatorial({ l, b })

        const separation = getAngularSeparation(
          { θ: dec, φ: ra },
          { θ: equatorial.dec, φ: equatorial.ra }
        )

        expect(separation).toBeLessThan(1e-10)
      }
    }
  })
})

/*****************************************************************************************************************/

describe('convertEquatorialToHorizontal for an observer at a celestial pole', () => {
  it('should resolve the altitude of a target to its declination at either pole', () => {
    // Every target circles the horizon of an observer at a pole at a constant altitude, e.g., its
    // declination, which the conversion resolves through its ordinary path, and does not intercept
    // with a sentinel coordinate:
    for (const target of [betelgeuse, { ra: 21.07875, dec: -88.9569444 }]) {
      const north = convertEquatorialToHorizontal(datetime, { latitude: 90, longitude: 0 }, target)

      expect(north.alt).toBeCloseTo(target.dec, 9)
      expect(Number.isFinite(north.az)).toBe(true)

      const south = convertEquatorialToHorizontal(datetime, { latitude: -90, longitude: 0 }, target)

      expect(south.alt).toBeCloseTo(-target.dec, 9)
      expect(Number.isFinite(south.az)).toBe(true)
    }
  })

  it('should return NaN for a latitude that is not finite', () => {
    // A latitude of NaN or of ±Infinity does not name an observer, and so the coordinate returned
    // is NaN, rather than a sentinel a caller would take for a real coordinate:
    for (const latitude of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const coordinate = convertEquatorialToHorizontal(
        datetime,
        { latitude, longitude: 0 },
        betelgeuse
      )

      expect(Number.isNaN(coordinate.alt)).toBe(true)
      expect(Number.isNaN(coordinate.az)).toBe(true)
    }
  })
})

/*****************************************************************************************************************/

describe('convertGeocentricToGeographic', () => {
  // The position of an observer above the given geographic coordinate, at the given distance from
  // the center of the Earth, e.g., the inverse of the conversion under test, resolved from the
  // sidereal rotation of the Earth:
  const getGeocentricPosition = (
    datetime: Date,
    { latitude, longitude }: { latitude: number; longitude: number },
    distance: number
  ) => {
    const α = radians(longitude + getGreenwichSiderealTime(datetime) * 15)

    const φ = radians(latitude)

    return {
      x: distance * Math.cos(φ) * Math.cos(α),
      y: distance * Math.cos(φ) * Math.sin(α),
      z: distance * Math.sin(φ)
    }
  }

  it('should be defined', () => {
    expect(convertGeocentricToGeographic).toBeDefined()
  })

  it('should resolve a position above the meridian of Greenwich at the equator', () => {
    const distance = EARTH_RADIUS + 420000

    const position = getGeocentricPosition(datetime, { latitude: 0, longitude: 0 }, distance)

    const { latitude, longitude, elevation } = convertGeocentricToGeographic(datetime, position)

    expect(latitude).toBeCloseTo(0, 9)
    expect(longitude).toBeCloseTo(0, 9)
    expect(elevation).toBeCloseTo(420000, 6)
  })

  it('should resolve a position above the observer at Mauna Kea', () => {
    const distance = EARTH_RADIUS + 550000

    const position = getGeocentricPosition(datetime, { latitude, longitude }, distance)

    const geographic = convertGeocentricToGeographic(datetime, position)

    expect(geographic.latitude).toBeCloseTo(latitude, 9)
    expect(geographic.longitude).toBeCloseTo(longitude, 9)
    expect(geographic.elevation).toBeCloseTo(550000, 6)
  })

  it('should resolve a position above either pole', () => {
    for (const sign of [1, -1]) {
      const { latitude, longitude, elevation } = convertGeocentricToGeographic(datetime, {
        x: 0,
        y: 0,
        z: sign * (EARTH_RADIUS + 420000)
      })

      expect(latitude).toBeCloseTo(sign * 90, 9)
      expect(Number.isFinite(longitude)).toBe(true)
      expect(elevation).toBeCloseTo(420000, 6)
    }
  })

  it('should resolve the longitude the shorter way about the sphere', () => {
    const distance = EARTH_RADIUS + 420000

    for (const meridian of [179.5, -179.5, 90, -90]) {
      const position = getGeocentricPosition(
        datetime,
        { latitude: 0, longitude: meridian },
        distance
      )

      const { longitude } = convertGeocentricToGeographic(datetime, position)

      expect(longitude).toBeCloseTo(meridian, 9)
      expect(longitude).toBeGreaterThanOrEqual(-180)
      expect(longitude).toBeLessThan(180)
    }
  })

  it('should take the elevation above the radius given', () => {
    // An observer of a different figure of the Earth gives the radius of it, e.g., the WGS84
    // equatorial radius, and the elevation is taken above that radius:
    const radius = 6378137

    const position = getGeocentricPosition(datetime, { latitude: 0, longitude: 0 }, radius + 420000)

    const { elevation } = convertGeocentricToGeographic(datetime, position, radius)

    expect(elevation).toBeCloseTo(420000, 6)
  })

  it('should resolve the elevation of a geostationary observer', () => {
    const distance = 42164000

    const position = getGeocentricPosition(datetime, { latitude: 0, longitude: 100 }, distance)

    const { elevation } = convertGeocentricToGeographic(datetime, position)

    expect(elevation).toBeCloseTo(distance - EARTH_RADIUS, 6)
  })

  it('should throw for a position with a component that is not finite', () => {
    for (const position of [
      { x: Number.NaN, y: 0, z: 0 },
      { x: 0, y: Number.POSITIVE_INFINITY, z: 0 },
      { x: 0, y: 0, z: Number.NEGATIVE_INFINITY }
    ]) {
      expect(() => convertGeocentricToGeographic(datetime, position)).toThrow(
        'Invalid position: each of the x, y and z components must be finite'
      )
    }
  })

  it('should throw for a position at the center of the Earth', () => {
    expect(() => convertGeocentricToGeographic(datetime, { x: 0, y: 0, z: 0 })).toThrow(
      'Invalid position: the position must not be at the center of the Earth'
    )
  })

  it('should throw for a radius that is not finite', () => {
    expect(() =>
      convertGeocentricToGeographic(datetime, { x: EARTH_RADIUS, y: 0, z: 0 }, Number.NaN)
    ).toThrow('Invalid radius: the radius must be finite')
  })

  it('should throw for a radius that is not greater than zero', () => {
    for (const radius of [0, -6378137]) {
      expect(() =>
        convertGeocentricToGeographic(datetime, { x: EARTH_RADIUS, y: 0, z: 0 }, radius)
      ).toThrow('Invalid radius: the radius must be greater than zero')
    }
  })
})

/*****************************************************************************************************************/

describe('convertEquatorialToCartesian', () => {
  it('should be defined', () => {
    expect(convertEquatorialToCartesian).toBeDefined()
  })

  it('should return a Required<CartesianCoordinate>', () => {
    const { x, y, z } = convertEquatorialToCartesian({ ra: 0, dec: 0 })
    expectTypeOf(convertEquatorialToCartesian({ ra: 0, dec: 0 })).toEqualTypeOf<
      Required<CartesianCoordinate>
    >()
    expect(typeof x).toBe('number')
    expect(typeof y).toBe('number')
    expect(typeof z).toBe('number')
  })

  it('should return (1, 0, 0) for a right ascension of 0° and a declination of 0°', () => {
    // The vernal equinox lies along the x-axis of the equatorial frame:
    expect(convertEquatorialToCartesian({ ra: 0, dec: 0 })).toEqual({ x: 1, y: 0, z: 0 })
  })

  it('should return (0, 1, 0) for a right ascension of 90° and a declination of 0°', () => {
    const { x, y, z } = convertEquatorialToCartesian({ ra: 90, dec: 0 })
    expect(x).toBeCloseTo(0, 15)
    expect(y).toBeCloseTo(1, 15)
    expect(z).toBeCloseTo(0, 15)
  })

  it('should return (−1, 0, 0) for a right ascension of 180° and a declination of 0°', () => {
    const { x, y, z } = convertEquatorialToCartesian({ ra: 180, dec: 0 })
    expect(x).toBeCloseTo(-1, 15)
    expect(y).toBeCloseTo(0, 15)
    expect(z).toBeCloseTo(0, 15)
  })

  it('should return (0, −1, 0) for a right ascension of 270° and a declination of 0°', () => {
    const { x, y, z } = convertEquatorialToCartesian({ ra: 270, dec: 0 })
    expect(x).toBeCloseTo(0, 15)
    expect(y).toBeCloseTo(-1, 15)
    expect(z).toBeCloseTo(0, 15)
  })

  it('should return (√½, √½, 0) for a right ascension of 45° and a declination of 0°', () => {
    const { x, y, z } = convertEquatorialToCartesian({ ra: 45, dec: 0 })
    expect(x).toBeCloseTo(Math.SQRT1_2, 15)
    expect(y).toBeCloseTo(Math.SQRT1_2, 15)
    expect(z).toBeCloseTo(0, 15)
  })

  it('should return (0, 0, 1) for any right ascension at a declination of 90°', () => {
    // Every hour circle meets at the north celestial pole, and so the right ascension is moot:
    for (const ra of [0, 45, 90, 137.25, 180, 270, 359.999]) {
      const { x, y, z } = convertEquatorialToCartesian({ ra, dec: 90 })
      expect(x).toBeCloseTo(0, 15)
      expect(y).toBeCloseTo(0, 15)
      expect(z).toBe(1)
    }
  })

  it('should return (0, 0, −1) for any right ascension at a declination of −90°', () => {
    // Likewise, every hour circle meets at the south celestial pole:
    for (const ra of [0, 45, 90, 137.25, 180, 270, 359.999]) {
      const { x, y, z } = convertEquatorialToCartesian({ ra, dec: -90 })
      expect(x).toBeCloseTo(0, 15)
      expect(y).toBeCloseTo(0, 15)
      expect(z).toBe(-1)
    }
  })

  it('should return a z-component of sin δ, e.g., positive to the north and negative to the south', () => {
    expect(convertEquatorialToCartesian({ ra: 120, dec: 30 }).z).toBeCloseTo(0.5, 15)
    expect(convertEquatorialToCartesian({ ra: 120, dec: -30 }).z).toBeCloseTo(-0.5, 15)
  })

  it('should return a vector of unit length for an arbitrary coordinate', () => {
    for (const ra of [0, 23.4392911, 101.28715533, 213.9153, 279.23473479, 359.999]) {
      for (const dec of [-89.5, -16.71611586, 0, 19.18241027, 38.78368896, 89.26410897]) {
        const { x, y, z } = convertEquatorialToCartesian({ ra, dec })
        expect(Math.hypot(x, y, z)).toBeCloseTo(1, 15)
      }
    }
  })

  it('should return the literal direction of Vega at J2000.0', () => {
    // Vega (α Lyrae), at a right ascension of 18h 36m 56.3364s and a declination of
    // +38° 47′ 01.280″ at J2000.0:
    const { x, y, z } = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })
    expect(x).toBeCloseTo(0.12509646363329072, 15)
    expect(y).toBeCloseTo(-0.7694131278689816, 15)
    expect(z).toBeCloseTo(0.6263819229905306, 15)
  })

  it('should be periodic in 360° of right ascension', () => {
    const a = convertEquatorialToCartesian({ ra: 279.23473479, dec: 38.78368896 })
    const b = convertEquatorialToCartesian({ ra: 279.23473479 + 360, dec: 38.78368896 })
    const c = convertEquatorialToCartesian({ ra: 279.23473479 - 360, dec: 38.78368896 })

    expect(b.x).toBeCloseTo(a.x, 14)
    expect(b.y).toBeCloseTo(a.y, 14)
    expect(b.z).toBeCloseTo(a.z, 14)

    expect(c.x).toBeCloseTo(a.x, 14)
    expect(c.y).toBeCloseTo(a.y, 14)
    expect(c.z).toBeCloseTo(a.z, 14)
  })

  it('should resolve the direction alone, and so ignore the epoch and parallax of the target', () => {
    const target: EquatorialCoordinate = { ra: 279.23473479, dec: 38.78368896 }

    expect(
      convertEquatorialToCartesian({ ...target, epoch: 2457388.5, parallax: 0.13023 })
    ).toEqual(convertEquatorialToCartesian(target))
  })

  it('should share the frame of convertGeocentricToGeographic, e.g., x towards the vernal equinox', () => {
    // A position scaled out along the direction lies above the geographic latitude equal to the
    // declination, as both resolve the equatorial frame with the z-axis along the rotational axis:
    const target = { ra: 279.23473479, dec: 38.78368896 }

    const { x, y, z } = convertEquatorialToCartesian(target)

    const { latitude } = convertGeocentricToGeographic(datetime, {
      x: x * 2 * EARTH_RADIUS,
      y: y * 2 * EARTH_RADIUS,
      z: z * 2 * EARTH_RADIUS
    })

    expect(latitude).toBeCloseTo(target.dec, 10)
  })

  it('should not mutate the target', () => {
    const target: EquatorialCoordinate = { ra: 279.23473479, dec: 38.78368896 }

    convertEquatorialToCartesian(target)

    expect(target).toEqual({ ra: 279.23473479, dec: 38.78368896 })
  })

  it('should propagate a coordinate that is not finite as NaN', () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const { x, y } = convertEquatorialToCartesian({ ra: value, dec: 0 })
      expect(Number.isNaN(x)).toBe(true)
      expect(Number.isNaN(y)).toBe(true)

      const { z } = convertEquatorialToCartesian({ ra: 0, dec: value })
      expect(Number.isNaN(z)).toBe(true)
    }
  })
})

/*****************************************************************************************************************/

describe('convertCartesianToEquatorial', () => {
  // One microarcsecond (in degrees):
  const µas = 1 / 3_600_000_000

  it('should be defined', () => {
    expect(convertCartesianToEquatorial).toBeDefined()
  })

  it('should return an EquatorialCoordinate', () => {
    expectTypeOf(
      convertCartesianToEquatorial({ x: 1, y: 0, z: 0 })
    ).toEqualTypeOf<EquatorialCoordinate>()
  })

  it('should return (0°, 0°) for the vector (1, 0, 0)', () => {
    expect(convertCartesianToEquatorial({ x: 1, y: 0, z: 0 })).toEqual({ ra: 0, dec: 0 })
  })

  it('should return (90°, 0°) for the vector (0, 1, 0)', () => {
    expect(convertCartesianToEquatorial({ x: 0, y: 1, z: 0 })).toEqual({ ra: 90, dec: 0 })
  })

  it('should return (180°, 0°) for the vector (−1, 0, 0)', () => {
    expect(convertCartesianToEquatorial({ x: -1, y: 0, z: 0 })).toEqual({ ra: 180, dec: 0 })
  })

  it('should return (270°, 0°) for the vector (0, −1, 0)', () => {
    expect(convertCartesianToEquatorial({ x: 0, y: -1, z: 0 })).toEqual({ ra: 270, dec: 0 })
  })

  it('should return (45°, 45°) for the vector (1, 1, √2)', () => {
    const { ra, dec } = convertCartesianToEquatorial({ x: 1, y: 1, z: Math.SQRT2 })
    expect(ra).toBeCloseTo(45, 12)
    expect(dec).toBeCloseTo(45, 12)
  })

  it('should return a declination of 90° for the vector (0, 0, 1)', () => {
    const { ra, dec } = convertCartesianToEquatorial({ x: 0, y: 0, z: 1 })
    expect(dec).toBe(90)
    // Every hour circle meets at the pole, and so any right ascension is valid, but it is finite:
    expect(Number.isFinite(ra)).toBe(true)
  })

  it('should return a declination of −90° for the vector (0, 0, −1)', () => {
    const { ra, dec } = convertCartesianToEquatorial({ x: 0, y: 0, z: -1 })
    expect(dec).toBe(-90)
    expect(Number.isFinite(ra)).toBe(true)
  })

  it('should return (0°, 0°) for the vector (2, 0, 0), as only the direction counts', () => {
    expect(convertCartesianToEquatorial({ x: 2, y: 0, z: 0 })).toEqual({ ra: 0, dec: 0 })
  })

  it('should return the same coordinate for a vector of any non-zero length', () => {
    const { ra, dec } = convertCartesianToEquatorial({ x: 0.3, y: -1.2, z: 2.5 })

    for (const scale of [1e-12, 0.5, 3, 6378137, 1e12]) {
      const coordinate = convertCartesianToEquatorial({
        x: 0.3 * scale,
        y: -1.2 * scale,
        z: 2.5 * scale
      })
      expect(coordinate.ra).toBeCloseTo(ra, 12)
      expect(coordinate.dec).toBeCloseTo(dec, 12)
    }
  })

  it('should return NaN for both angles for the zero vector, as it has no direction', () => {
    const { ra, dec } = convertCartesianToEquatorial({ x: 0, y: 0, z: 0 })
    expect(ra).toBeNaN()
    expect(dec).toBeNaN()
  })

  it('should return NaN for both angles for the negative zero vector', () => {
    const { ra, dec } = convertCartesianToEquatorial({ x: -0, y: -0, z: -0 })
    expect(ra).toBeNaN()
    expect(dec).toBeNaN()
  })

  it('should return a right ascension of +0°, and not −0°, for a vector of a y-component of −0', () => {
    expect(convertCartesianToEquatorial({ x: 1, y: -0, z: 0 }).ra).toBe(0)
  })

  it('should return a right ascension less than 360° for a direction just below the x-axis', () => {
    // A right ascension of a vanishingly small negative angle would otherwise round up to 360°:
    const { ra } = convertCartesianToEquatorial({ x: 1, y: -1e-17, z: 0 })
    expect(ra).toBeGreaterThanOrEqual(0)
    expect(ra).toBeLessThan(360)
    expect(ra).toBeCloseTo(0, 12)
  })

  it('should return a right ascension in [0, 360) and a declination in [−90, 90] for any direction', () => {
    for (const x of [-1, -0.5, 0, 0.5, 1]) {
      for (const y of [-1, -1e-17, 0, 1e-17, 1]) {
        for (const z of [-1, -0.5, 0, 0.5, 1]) {
          if (x === 0 && y === 0 && z === 0) continue
          const { ra, dec } = convertCartesianToEquatorial({ x, y, z })
          expect(ra).toBeGreaterThanOrEqual(0)
          expect(ra).toBeLessThan(360)
          expect(dec).toBeGreaterThanOrEqual(-90)
          expect(dec).toBeLessThanOrEqual(90)
        }
      }
    }
  })

  it('should round trip through convertEquatorialToCartesian within a microarcsecond at a declination of 89.9999°', () => {
    // An arcsine of the z-component would lose ~10 µas here, as sin δ is flat towards the pole:
    for (const ra of [0, 45, 90, 137.25, 180, 212.5, 270, 333.3]) {
      for (const dec of [89.9999, -89.9999]) {
        const coordinate = convertCartesianToEquatorial(convertEquatorialToCartesian({ ra, dec }))
        expect(Math.abs(coordinate.ra - ra)).toBeLessThanOrEqual(µas)
        expect(Math.abs(coordinate.dec - dec)).toBeLessThanOrEqual(µas)
      }
    }
  })

  it('should round trip through convertEquatorialToCartesian within a microarcsecond for an arbitrary coordinate', () => {
    for (const ra of [0.000001, 23.4392911, 101.28715533, 213.9153, 279.23473479, 359.999]) {
      for (const dec of [-89.5, -16.71611586, 0, 19.18241027, 38.78368896, 89.26410897]) {
        const coordinate = convertCartesianToEquatorial(convertEquatorialToCartesian({ ra, dec }))
        expect(Math.abs(coordinate.ra - ra)).toBeLessThanOrEqual(µas)
        expect(Math.abs(coordinate.dec - dec)).toBeLessThanOrEqual(µas)
      }
    }
  })

  it('should return the literal coordinate of Vega at J2000.0', () => {
    // The unit direction vector of Vega (α Lyrae) at J2000.0:
    const { ra, dec } = convertCartesianToEquatorial({
      x: 0.12509646363329072,
      y: -0.7694131278689816,
      z: 0.6263819229905306
    })

    expect(Math.abs(ra - 279.23473479)).toBeLessThanOrEqual(µas)
    expect(Math.abs(dec - 38.78368896)).toBeLessThanOrEqual(µas)
  })

  it('should not mutate the vector', () => {
    const vector = { x: 0.3, y: -1.2, z: 2.5 }

    convertCartesianToEquatorial(vector)

    expect(vector).toEqual({ x: 0.3, y: -1.2, z: 2.5 })
  })

  it('should propagate a component that is NaN as NaN', () => {
    for (const vector of [
      { x: Number.NaN, y: 0, z: 1 },
      { x: 1, y: Number.NaN, z: 0 },
      { x: 1, y: 0, z: Number.NaN }
    ]) {
      const { ra, dec } = convertCartesianToEquatorial(vector)
      expect(Number.isNaN(ra) || Number.isNaN(dec)).toBe(true)
    }
  })
})

/*****************************************************************************************************************/
