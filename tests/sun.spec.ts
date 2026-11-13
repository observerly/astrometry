/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/moon
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  AU_IN_METERS,
  SPEED_OF_LIGHT as c,
  convertCartesianToEquatorial,
  convertDegreesToRadians,
  convertEclipticToEquatorial,
  type EquatorialCoordinate,
  getAngularSeparation,
  getBarycentricJulianDate,
  getBarycentricSolarVector,
  getEclipticPlane,
  getGeometricSolarVector,
  getHeliocentricJulianDate,
  getJulianDate,
  getNutation,
  getSolarAngularDiameter,
  getSolarDistance,
  getSolarEclipticCoordinate,
  getSolarEclipticLongitude,
  getSolarEquationOfCenter,
  getSolarEquatorialCoordinate,
  getSolarGeometricEclipticCoordinate,
  getSolarMeanAnomaly,
  getSolarMeanGeometricLongitude,
  getSolarNoon,
  getSolarTrueAnomaly,
  getSolarTrueGeometricLongitude,
  getSunrise,
  getSunset,
  SOLAR_STANDARD_ALTITUDE_OF_RISE_AND_SET
} from '../src'

import { ARCSECOND_IN_DEGREES } from '../src/constants'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getSolarMeanAnomaly', () => {
  it('should be defined', () => {
    expect(getSolarMeanAnomaly).toBeDefined()
  })

  it('should return the correct Solar mean anomaly for the given date', () => {
    const M = getSolarMeanAnomaly(datetime)
    expect(M).toBe(128.6616906345762)
  })
})

/*****************************************************************************************************************/

describe('getSolarEquationOfCenter', () => {
  it('should be defined', () => {
    expect(getSolarEquationOfCenter).toBeDefined()
  })

  it('should return the correct Solar equation of center for the given date', () => {
    const C = getSolarEquationOfCenter(datetime)
    expect(C).toBe(1.4748516050367209)
  })

  it('should return the Solar equation of center of Meeus Example 25.a for 1992 October 13.0 TD', () => {
    // 1992 October 13.0 TD is 1992 October 12 23:59:00.816 UTC, e.g., TT − UTC = 27 s + 32.184 s:
    const C = getSolarEquationOfCenter(new Date('1992-10-12T23:59:00.816Z'))
    expect(C).toBeCloseTo(-1.89732, 5)
  })
})

/*****************************************************************************************************************/

describe('getSolarMeanGeometricLongitude', () => {
  it('should be defined', () => {
    expect(getSolarMeanGeometricLongitude).toBeDefined()
  })

  it('should return the correct Solar mean geometric longitude for the given date', () => {
    const L = getSolarMeanGeometricLongitude(datetime)
    expect(L).toBe(51.96643812978073)
  })

  it('should return the Solar mean geometric longitude of Meeus Example 25.a for 1992 October 13.0 TD', () => {
    // 1992 October 13.0 TD is 1992 October 12 23:59:00.816 UTC, e.g., TT − UTC = 27 s + 32.184 s:
    const L = getSolarMeanGeometricLongitude(new Date('1992-10-12T23:59:00.816Z'))
    expect(L).toBeCloseTo(201.8072, 5)
  })
})

/*****************************************************************************************************************/

describe('getSolarTrueAnomaly', () => {
  it('should be defined', () => {
    expect(getSolarTrueAnomaly).toBeDefined()
  })

  it('should return the correct Solar true anomaly for the given date', () => {
    const ν = getSolarTrueAnomaly(datetime)
    expect(ν).toBe(130.1365422396129)
  })
})

/*****************************************************************************************************************/

describe('getSolarTrueGeometricLongitude', () => {
  it('should be defined', () => {
    expect(getSolarTrueGeometricLongitude).toBeDefined()
  })

  it('should return the correct Solar true geometric longitude for the given date', () => {
    const L = getSolarTrueGeometricLongitude(datetime)
    expect(L).toBe(53.441289734817445)
  })
})

/*****************************************************************************************************************/

describe('getSolarEclipticLongitude', () => {
  it('should be defined', () => {
    expect(getSolarEclipticLongitude).toBeDefined()
  })

  it('should return the correct Solar ecliptic longitude for the given date', () => {
    // The geometric ecliptic longitude is ~316.3569°, referred to the mean equinox of the date (ERFA epv00 and ecm06):
    const datetime = new Date('2015-02-05T12:00:00.000+00:00')
    const λ = getSolarEclipticLongitude(datetime)
    expect(λ).toBe(316.36292999704807)
  })

  it.each([
    ['1900-01-01T00:00:00Z', 280.1549596198215, 280.15471],
    ['2026-11-08T00:00:00Z', 225.59539034120212, 225.59464],
    ['2099-12-31T00:00:00Z', 279.5923685239677, 279.59017]
  ])(
    'should not drift from the geometric Solar ecliptic longitude of the date for %s',
    (iso, expected, reference) => {
      // The Sun's ecliptic longitude at perigee advances by ~1.72° per century, and so the reference is the
      // geometric ecliptic longitude, referred to the mean equinox of the date (ERFA epv00 and ecm06):
      const λ = getSolarEclipticLongitude(new Date(iso))

      expect(λ).toBeCloseTo(expected, 10)
      expect(Math.abs(λ - reference)).toBeLessThan(0.01)

      // The longitude is in the range [0, 360):
      expect(λ).toBeGreaterThanOrEqual(0)
      expect(λ).toBeLessThan(360)
    }
  )
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

  it.each([
    // J2000.0 TT, e.g., τ = 0, at which every term of the series in a power of τ vanishes:
    ['2000-01-01T11:58:55.816Z', -20.84205823],
    ['2015-02-05T12:00:00.000Z', -20.774321756],
    ['2026-01-03T00:00:00.000Z', -20.828198613],
    ['2026-02-15T00:00:00.000Z', -20.752801332],
    ['2026-04-01T00:00:00.000Z', -20.499131611],
    ['2026-05-15T00:00:00.000Z', -20.280174857],
    ['2026-06-21T08:00:00.000Z', -20.165174948],
    ['2026-07-04T00:00:00.000Z', -20.148764371],
    ['2026-08-15T00:00:00.000Z', -20.2373718],
    ['2026-09-23T00:00:00.000Z', -20.410149213],
    ['2026-10-01T00:00:00.000Z', -20.457114354],
    ['2026-11-13T00:00:00.000Z', -20.708241228],
    ['2026-12-15T00:00:00.000Z', -20.819302249],
    // Epochs far from J2000.0, at which the terms in τ, τ² and τ³ are at their largest:
    ['1800-01-01T00:00:00.000Z', -20.8433005],
    ['1900-06-01T00:00:00.000Z', -20.208102631],
    ['2100-03-01T00:00:00.000Z', -20.682763157],
    ['2500-09-01T00:00:00.000Z', -20.269468778],
    ['3000-01-01T00:00:00.000Z', -20.815830091]
  ])(
    'should displace the Sun by the aberration of light of the daily variation in longitude for %s',
    (iso, expected) => {
      const datetime = new Date(iso)

      const { λ } = getSolarGeometricEclipticCoordinate(datetime)

      const apparent = getSolarEclipticCoordinate(datetime)

      const { Δψ } = getNutation(datetime)

      // The aberration of light is what remains of the apparent longitude once the geometric longitude and the
      // nutation in longitude are taken from it, e.g., −0.005775518 · R · Δλ, where Δλ is the daily variation
      // of the geocentric longitude of the Sun in a fixed reference frame, of which the terms in 7.311, 0.305
      // and 0.010 are multiplied by τ, those in 0.309, 0.021 and 0.004 by τ², and that in 0.010 by τ³ (Meeus,
      // Astronomical Algorithms, 2nd edition, Chapter 25, p. 168) (in arcseconds):
      const aberration = (apparent.λ - (λ + Δψ)) / ARCSECOND_IN_DEGREES

      expect(aberration).toBeCloseTo(expected, 8)
    }
  )

  it('should displace the Sun by the aberration of light of Meeus Example 25.b for 1992 October 13.0 TD', () => {
    // 1992 October 13.0 TD is 1992 October 12 23:59:00.816 UTC, e.g., TT − UTC = 27 s + 32.184 s:
    const datetime = new Date('1992-10-12T23:59:00.816Z')

    const { λ } = getSolarGeometricEclipticCoordinate(datetime)

    const apparent = getSolarEclipticCoordinate(datetime)

    const { Δψ } = getNutation(datetime)

    const aberration = (apparent.λ - (λ + Δψ)) / ARCSECOND_IN_DEGREES

    // The aberration of light of the example is −20.539 arcseconds, e.g., −20.4898 arcseconds over the radius
    // vector of an unperturbed elliptical motion, which the daily variation in longitude departs from by the
    // ~0.01 arcseconds of the perturbations of the Moon and of the planets:
    expect(Math.abs(aberration - -20.539)).toBeLessThan(0.015)
  })

  it.each([1900, 1992, 2026, 2099])(
    'should agree with the aberration of light of an unperturbed elliptical motion on every day of %i',
    year => {
      for (
        const day = new Date(Date.UTC(year, 0, 1));
        day.getUTCFullYear() === year;
        day.setUTCDate(day.getUTCDate() + 1)
      ) {
        const { λ, R } = getSolarGeometricEclipticCoordinate(day)

        const apparent = getSolarEclipticCoordinate(day)

        const { Δψ } = getNutation(day)

        const aberration = (apparent.λ - (λ + Δψ)) / ARCSECOND_IN_DEGREES

        // The aberration of light of an unperturbed elliptical motion is −20.4898 arcseconds over the radius
        // vector (in astronomical units) (Meeus, Astronomical Algorithms, 2nd edition, Chapter 25, p. 167), which
        // the daily variation in longitude departs from by no more than the ~0.01 arcseconds of the perturbations
        // of the Moon and of the planets, and not by the ~0.04 arcseconds of a term in 7.311 that is not
        // multiplied by τ:
        expect(Math.abs(aberration - -20.4898 / (R / AU_IN_METERS))).toBeLessThan(0.015)
      }
    }
  )

  it.each([
    '1900-06-01T00:00:00.000Z',
    '2000-01-01T11:58:55.816Z',
    '2026-11-13T00:00:00.000Z',
    '2500-09-01T00:00:00.000Z'
  ])(
    'should not displace the ecliptic latitude or the distance of the Sun by the aberration of light for %s',
    iso => {
      const datetime = new Date(iso)

      const { β, R } = getSolarGeometricEclipticCoordinate(datetime)

      const apparent = getSolarEclipticCoordinate(datetime)

      expect(apparent.β).toBe(β)
      expect(apparent.R).toBe(R)
    }
  )
})

/*****************************************************************************************************************/

describe('getSolarGeometricEclipticCoordinate', () => {
  it('should be defined', () => {
    expect(getSolarGeometricEclipticCoordinate).toBeDefined()
  })

  it('should differ from the apparent ecliptic longitude by the nutation and the aberration of light', () => {
    const datetime = new Date('2015-02-05T12:00:00.000+00:00')

    const { λ, β, R } = getSolarGeometricEclipticCoordinate(datetime)

    const apparent = getSolarEclipticCoordinate(datetime)

    const { Δψ } = getNutation(datetime)

    // The apparent longitude is the geometric longitude carried to the true equinox of the date by
    // the nutation in longitude, and displaced towards the Earth by the aberration of light, e.g.,
    // ~20.5 arcseconds at 1 AU (in degrees):
    const aberration = apparent.λ - (λ + Δψ)

    expect(aberration).toBeLessThan(-0.0055)
    expect(aberration).toBeGreaterThan(-0.0059)

    expect(apparent.β).toBe(β)
    expect(apparent.R).toBe(R)
  })
})

/*****************************************************************************************************************/

describe('getGeometricSolarVector', () => {
  it('should be defined', () => {
    expect(getGeometricSolarVector).toBeDefined()
  })

  it('should resolve the Sun at between perihelion and aphelion from the Earth', () => {
    const { x, y, z } = getGeometricSolarVector(datetime)

    const d = Math.hypot(x, y, z)

    expect(d).toBeGreaterThan(0.983)
    expect(d).toBeLessThan(1.017)
  })
})

/*****************************************************************************************************************/

describe('getBarycentricSolarVector', () => {
  it('should be defined', () => {
    expect(getBarycentricSolarVector).toBeDefined()
  })

  it('should displace the Sun from the barycentre by no more than ~0.01 astronomical units', () => {
    const { x, y, z } = getBarycentricSolarVector(datetime)

    expect(Math.hypot(x, y, z)).toBeLessThan(0.011)
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
    expect(α).toBeCloseTo(318.8081506224865, 12)
    expect(δ).toBeCloseTo(-15.93257444270331, 12)
  })
})

/*****************************************************************************************************************/

describe('getEclipticPlane', () => {
  it('should be defined', () => {
    expect(getEclipticPlane).toBeDefined()
  })

  it('should return the correct amount of coordinate points of the ecliptic plane for the given datetime', () => {
    const ecliptic = getEclipticPlane(datetime)
    expect(ecliptic.length).toBe(366)
  })

  it('should return a coordinate point for every day of a leap year, and for the following 1st January', () => {
    const ecliptic = getEclipticPlane(new Date('2024-05-14T00:00:00.000+00:00'))
    expect(ecliptic.length).toBe(367)
  })

  it('should start at the 1st January of the year of the datetime given', () => {
    const [first] = getEclipticPlane(datetime)

    const { ra, dec } = getSolarEquatorialCoordinate(new Date('2021-01-01T00:00:00.000+00:00'))

    expect(first.ra).toBe(ra)
    expect(first.dec).toBe(dec)
  })

  it('should not modify the datetime given', () => {
    getEclipticPlane(datetime)

    expect(datetime).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
  })

  it('should return the same ecliptic plane irrespective of the host timezone', () => {
    const TZ = process.env.TZ

    // The year boundary is derived in UTC, and the plane is therefore independent of the timezone of
    // the host system the library is running on:
    const expected = getEclipticPlane(datetime)

    try {
      for (const timezone of ['Pacific/Auckland', 'America/New_York', 'Asia/Kolkata']) {
        process.env.TZ = timezone

        const ecliptic = getEclipticPlane(datetime)

        expect(ecliptic.length).toBe(expected.length)

        for (let i = 0; i < ecliptic.length; i++) {
          expect(ecliptic[i].ra).toBe(expected[i].ra)
          expect(ecliptic[i].dec).toBe(expected[i].dec)
        }
      }
    } finally {
      process.env.TZ = TZ
    }
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
    //
    // N.B. The example is given for 1992 October 13.0 TD, e.g., at 0h of Dynamical Time, which is 0h of
    // Terrestrial Time, and so the date is the civil time of that instant, e.g., 59.184 seconds before
    // 0h UTC, as the series is resolved at the Terrestrial Time of the date given:
    const d = new Date('1992-10-12T23:59:00.816+00:00')

    const R = getSolarDistance(d)

    expect(R).toBeCloseTo(0.997661949974 * AU_IN_METERS, 0)
  })
})

/*****************************************************************************************************************/

describe('getHeliocentricJulianDate', () => {
  it('should be defined', () => {
    expect(getHeliocentricJulianDate).toBeDefined()
  })

  // For testing we need to specify a date because most calculations are differential w.r.t a time
  // component, at which the Earth is ~1.0106 AU from the Sun, e.g., ~504.3 light seconds:
  const when = new Date('2021-05-14T00:00:00.000+00:00')

  // The interval, in seconds, between the Julian date and the heliocentric Julian date, which is
  // signed, e.g., it is negative where the light reaches the Sun first:
  const offset = (target: EquatorialCoordinate, at: Date = when): number =>
    (getHeliocentricJulianDate(at, target) - getJulianDate(at)) * 86400

  // The direction of the Sun from the centre of the Earth, referred to the mean equator and equinox
  // of J2000.0, e.g., the frame the coordinate of a target is given in:
  const sun = convertCartesianToEquatorial(getGeometricSolarVector(when))

  // The light travel time from the Sun to the Earth (in seconds):
  const τ = getSolarGeometricEclipticCoordinate(when).R / c

  // The north pole of the ecliptic of J2000.0, which the Sun is ~90 degrees from throughout the year:
  const pole = { ra: 270, dec: 66.5607089 }

  // IP Pegasi, e.g., the target of the worked example of the light travel time corrections in the
  // documentation of astropy.time, at 23h 23m 08.55s, +18° 24' 59.3" (ICRS):
  const pegasi = { ra: 350.785625, dec: 18.416472222 }

  it('should precede the Julian date for a target behind the Sun', () => {
    // The Sun lies between the observer and the target, and so the light of the target reaches the
    // Sun before it reaches the observer, by the light travel time of the distance between them:
    expect(offset({ ra: sun.ra, dec: sun.dec })).toBeCloseTo(-τ, 4)
  })

  it('should follow the Julian date for a target opposite the Sun', () => {
    // The observer lies between the target and the Sun, and so the light of the target reaches
    // the observer first:
    expect(offset({ ra: (sun.ra + 180) % 360, dec: -sun.dec })).toBeCloseTo(τ, 4)
  })

  it('should differ by twice the light travel time between a target behind and opposite the Sun', () => {
    // The correction is not the light travel time to the Sun for every target, e.g., a target
    // opposite the Sun is otherwise ~17 minutes in error:
    const difference =
      offset({ ra: (sun.ra + 180) % 360, dec: -sun.dec }) - offset({ ra: sun.ra, dec: sun.dec })

    expect(difference).toBeCloseTo(2 * τ, 4)
    expect(difference / 60).toBeGreaterThan(16.5)
  })

  it('should equal the Julian date for a target perpendicular to the Sun', () => {
    // The observer is displaced from the Sun across the line of sight, and not along it, and so
    // the light of the target reaches them both at once:
    expect(offset({ ra: (sun.ra + 90) % 360, dec: 0 })).toBeCloseTo(0, 4)
    expect(offset({ ra: (sun.ra + 270) % 360, dec: 0 })).toBeCloseTo(0, 4)
    expect(offset({ ra: (sun.ra + 180) % 360, dec: 90 - sun.dec })).toBeCloseTo(0, 4)
  })

  it('should scale with the cosine of the angular separation of the target from the Sun', () => {
    for (let ra = 0; ra < 360; ra += 30) {
      for (let dec = -75; dec <= 75; dec += 25) {
        const separation = getAngularSeparation({ θ: dec, φ: ra }, { θ: sun.dec, φ: sun.ra })

        expect(offset({ ra, dec })).toBeCloseTo(
          -τ * Math.cos(convertDegreesToRadians(separation)),
          4
        )
      }
    }
  })

  it('should be equal and opposite for a target and the target opposite it', () => {
    for (let ra = 0; ra < 360; ra += 45) {
      for (let dec = -60; dec <= 60; dec += 30) {
        expect(offset({ ra, dec })).toBeCloseTo(-offset({ ra: (ra + 180) % 360, dec: -dec }), 3)
      }
    }
  })

  it('should be bounded by the light travel time to the Sun', () => {
    // No target is corrected by more than the distance of the observer from the Sun, and so the
    // correction is bounded by ~500 seconds:
    for (let ra = 0; ra < 360; ra += 15) {
      for (let dec = -90; dec <= 90; dec += 15) {
        expect(Math.abs(offset({ ra, dec }))).toBeLessThanOrEqual(τ + 1e-4)
      }
    }
  })

  it('should be independent of the right ascension of a target at a celestial pole', () => {
    expect(offset({ ra: 123.456, dec: 90 })).toBeCloseTo(offset({ ra: 0, dec: 90 }), 3)
    expect(offset({ ra: 123.456, dec: -90 })).toBeCloseTo(offset({ ra: 0, dec: -90 }), 3)
    expect(offset({ ra: 0, dec: 90 })).toBeCloseTo(-offset({ ra: 0, dec: -90 }), 3)
  })

  it('should be periodic in the right ascension of the target', () => {
    expect(offset({ ra: 448.7929583, dec: 7.4070639 })).toBeCloseTo(
      offset({ ra: 88.7929583, dec: 7.4070639 }),
      3
    )

    expect(offset({ ra: -271.2070417, dec: 7.4070639 })).toBeCloseTo(
      offset({ ra: 88.7929583, dec: 7.4070639 }),
      3
    )
  })

  it('should vanish for a target at the pole of the ecliptic throughout the year', () => {
    // The Sun is carried about the ecliptic over the year, and so it is always ~90 degrees from
    // the pole of it, e.g., the observer is never displaced along the direction to the target:
    for (let month = 0; month < 12; month++) {
      expect(Math.abs(offset(pole, new Date(Date.UTC(2021, month, 14))))).toBeLessThan(0.1)
    }
  })

  it('should change sign over half a year for a target on the ecliptic', () => {
    // The target is behind the Sun at the first date, and opposite the Sun half a year on, e.g.,
    // the heliocentric Julian date of it runs from ~8.4 minutes behind the Julian date to ~8.2
    // minutes ahead of it:
    const target = { ra: sun.ra, dec: sun.dec }

    const later = new Date('2021-11-14T00:00:00.000+00:00')

    expect(offset(target)).toBeLessThan(-500)
    expect(offset(target, later)).toBeGreaterThan(490)
    expect(offset(target, later)).toBeLessThan(500)
  })

  it('should return the heliocentric light travel time of astropy for IP Pegasi', () => {
    // The worked example of the documentation of astropy.time resolves the heliocentric light
    // travel time of IP Pegasi at MJD 56325.95833333 and MJD 56325.978254 (UTC) as −0.00376576
    // and −0.00376712 days, from Greenwich, e.g., to within the ~21 light milliseconds of the
    // radius of the Earth of the geocentre:
    const first = new Date('2013-02-02T23:00:00.000+00:00')

    const second = new Date('2013-02-02T23:28:41.146+00:00')

    expect(offset(pegasi, first) / 86400).toBeCloseTo(-0.00376576, 6)
    expect(offset(pegasi, second) / 86400).toBeCloseTo(-0.00376712, 6)
  })

  it('should return a Julian date within a light travel time of the Julian date', () => {
    const JD = getJulianDate(when)

    const HJD = getHeliocentricJulianDate(when, { ra: 88.7929583, dec: 7.4070639 })

    expect(Number.isFinite(HJD)).toBe(true)
    expect(Math.abs(HJD - JD)).toBeLessThan(0.006)
  })

  it('should not resolve a heliocentric Julian date for a target that is not finite', () => {
    expect(getHeliocentricJulianDate(when, { ra: Number.NaN, dec: 7.4070639 })).toBeNaN()
    expect(getHeliocentricJulianDate(when, { ra: 88.7929583, dec: Number.NaN })).toBeNaN()
  })

  it('should not modify the datetime given by the caller', () => {
    const at = new Date('2021-05-14T00:00:00.000+00:00')
    getHeliocentricJulianDate(at, { ra: 88.7929583, dec: 7.4070639 })
    expect(at).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
  })
})

/*****************************************************************************************************************/

describe('getBarycentricJulianDate', () => {
  // For testing we need to specify a date because most calculations are differential w.r.t a time
  // component, at which the Earth is ~1.0106 AU from the Sun, e.g., ~504.3 light seconds:
  const when = new Date('2021-05-14T00:00:00.000+00:00')

  // The interval, in seconds, between the Julian date and the barycentric Julian date, which is
  // signed, e.g., it is negative where the light reaches the barycenter first:
  const offset = (target: EquatorialCoordinate): number =>
    (getBarycentricJulianDate(when, target) - getJulianDate(when)) * 86400

  it('should be defined', () => {
    expect(getBarycentricJulianDate).toBeDefined()
  })

  it('should precede the Julian date for a target behind the Sun', () => {
    // The barycenter lies between the observer and the target, and so the light of the target
    // reaches the barycenter before it reaches the observer, by the light travel time of the
    // distance between them:
    const sun = getSolarEquatorialCoordinate(when)

    expect(offset({ ra: sun.ra, dec: sun.dec })).toBeCloseTo(-getSolarDistance(when) / c, 4)
  })

  it('should follow the Julian date for a target opposite the Sun', () => {
    // The observer lies between the target and the barycenter, and so the light of the target
    // reaches the observer first:
    const sun = getSolarEquatorialCoordinate(when)

    expect(offset({ ra: (sun.ra + 180) % 360, dec: -sun.dec })).toBeCloseTo(
      getSolarDistance(when) / c,
      4
    )
  })

  it('should equal the Julian date for a target perpendicular to the Sun', () => {
    // The observer is displaced from the barycenter across the line of sight, and not along it,
    // and so the light of the target reaches them both at once:
    const sun = getSolarEquatorialCoordinate(when)

    expect(offset({ ra: (sun.ra + 90) % 360, dec: 0 })).toBeCloseTo(0, 6)
  })

  it('should be bounded by the light travel time to the Sun', () => {
    // No target is corrected by more than the distance of the observer from the barycenter, and so
    // the correction is bounded by ~500 seconds:
    const bound = getSolarDistance(when) / c

    for (let ra = 0; ra < 360; ra += 15) {
      for (let dec = -90; dec <= 90; dec += 15) {
        expect(Math.abs(offset({ ra, dec }))).toBeLessThanOrEqual(bound + 1e-6)
      }
    }
  })

  it('should return a Julian date within a light travel time of the Julian date', () => {
    const JD = getJulianDate(when)

    const BJD = getBarycentricJulianDate(when, { ra: 88.7929583, dec: 7.4070639 })

    expect(Number.isFinite(BJD)).toBe(true)
    expect(Math.abs(BJD - JD)).toBeLessThan(0.006)
  })
})

/***************************************************************************************************************/

describe('getSolarNoon', () => {
  it('should be defined', () => {
    expect(getSolarNoon).toBeDefined()
  })

  it('should return the meridian transit of the Sun for the given date', () => {
    const noon = getSolarNoon(datetime, { latitude: 49.914425, longitude: -6.315165 })
    expect(noon.toISOString()).toBe('2021-05-14T12:21:36.654Z')
  })

  it('should resolve the solar noon for an observer in perpetual daylight', () => {
    // At Tromsø at midsummer the Sun does not set, but it still crosses the local meridian:
    const noon = getSolarNoon(new Date('2026-06-21T00:00:00.000+00:00'), {
      latitude: 69.6492,
      longitude: 18.9553
    })

    expect(noon.toISOString()).toBe('2026-06-21T10:45:59.080Z')
  })

  it('should not modify the datetime given by the caller', () => {
    const when = new Date('2021-05-14T00:00:00.000+00:00')
    getSolarNoon(when, { latitude: 49.914425, longitude: -6.315165 })
    expect(when).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
  })
})

/*****************************************************************************************************************/

describe('SOLAR_STANDARD_ALTITUDE_OF_RISE_AND_SET', () => {
  it('should be the standard almanac altitude of the centre of the Sun at rise and set', () => {
    expect(SOLAR_STANDARD_ALTITUDE_OF_RISE_AND_SET).toBe(-0.8333)
  })
})

/*****************************************************************************************************************/

describe('getSunrise', () => {
  it('should be defined', () => {
    expect(getSunrise).toBeDefined()
  })

  it('should return the sunrise of the standard almanac convention for the given date', () => {
    const sunrise = getSunrise(datetime, { latitude: 49.914425, longitude: -6.315165 })
    expect(sunrise?.toISOString()).toBe('2021-05-14T04:40:53.501Z')
  })

  it('should return an earlier sunrise for an observer at an elevation', () => {
    // The elevation of the observer depresses the horizon below the astronomical horizon, and
    // so the Sun reaches it earlier as it rises:
    const sunrise = getSunrise(datetime, {
      latitude: 49.914425,
      longitude: -6.315165,
      elevation: 2000
    })

    expect(sunrise?.toISOString()).toBe('2021-05-14T04:31:19.190Z')
  })

  it('should return null for an observer in perpetual daylight', () => {
    const sunrise = getSunrise(new Date('2026-06-21T00:00:00.000+00:00'), {
      latitude: 69.6492,
      longitude: 18.9553
    })

    expect(sunrise).toBeNull()
  })

  it('should not modify the datetime given by the caller', () => {
    const when = new Date('2021-05-14T00:00:00.000+00:00')
    getSunrise(when, { latitude: 49.914425, longitude: -6.315165 })
    expect(when).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
  })
})

/*****************************************************************************************************************/

describe('getSunset', () => {
  it('should be defined', () => {
    expect(getSunset).toBeDefined()
  })

  it('should return the sunset of the standard almanac convention for the given date', () => {
    const sunset = getSunset(datetime, { latitude: 49.914425, longitude: -6.315165 })
    expect(sunset?.toISOString()).toBe('2021-05-14T20:03:14.025Z')
  })

  it('should return null for an observer in perpetual daylight', () => {
    const sunset = getSunset(new Date('2026-06-21T00:00:00.000+00:00'), {
      latitude: 69.6492,
      longitude: 18.9553
    })

    expect(sunset).toBeNull()
  })

  it('should return a sunrise, noon and sunset in the order of the day', () => {
    const observer = { latitude: 49.914425, longitude: -6.315165 }

    const sunrise = getSunrise(datetime, observer) as Date
    const noon = getSolarNoon(datetime, observer)
    const sunset = getSunset(datetime, observer) as Date

    expect(sunrise.getTime()).toBeLessThan(noon.getTime())
    expect(noon.getTime()).toBeLessThan(sunset.getTime())
  })

  it('should not modify the datetime given by the caller', () => {
    const when = new Date('2021-05-14T00:00:00.000+00:00')
    getSunset(when, { latitude: 49.914425, longitude: -6.315165 })
    expect(when).toEqual(new Date('2021-05-14T00:00:00.000+00:00'))
  })
})

/*****************************************************************************************************************/
