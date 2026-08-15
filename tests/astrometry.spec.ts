/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertEquatorialToHorizontal,
  convertJulianDateToUTC,
  type EquatorialCoordinate,
  type EquatorialProperMotion,
  getAngularSeparation,
  getAntipodeCoordinate,
  getCorrectionToEquatorialForProperMotion,
  getGreenwichApparentSiderealTime,
  getGreenwichSiderealTime,
  getHourAngle,
  getJulianDate,
  getLocalApparentSiderealTime,
  getLocalSiderealTime,
  getNormalisedSphericalCoordinate,
  getParallacticAngle,
  J2000
} from '../src'

import { convertDegreesToRadians as radians } from '../src/utilities'

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

const arcturus: EquatorialCoordinate = { ra: 213.9153, dec: 19.182409 }

const spica: EquatorialCoordinate = { ra: 201.2983, dec: -11.1614 }

/*****************************************************************************************************************/

describe('getAngularSeparation', () => {
  it('should be defined', () => {
    expect(getAngularSeparation).toBeDefined()
  })

  it('should return the angular separation between two objects', () => {
    const θ = getAngularSeparation(
      {
        θ: arcturus.dec,
        φ: arcturus.ra
      },
      {
        θ: spica.dec,
        φ: spica.ra
      }
    )
    expect(θ).toBe(32.79290589269235)
  })

  it('should return the greatest possible angular separation for two objects at their antipodes', () => {
    const θ = getAngularSeparation(
      {
        θ: 30,
        φ: 0
      },
      {
        θ: -30,
        φ: 180
      }
    )
    expect(θ).toBe(180)
  })

  it('should return the maximum possible angular separation for two objects at their antipodes', () => {
    const θ = getAngularSeparation(
      {
        θ: 90,
        φ: 0
      },
      {
        θ: -90,
        φ: 180
      }
    )
    expect(θ).toBe(180)
  })

  it('should return no separation for a coordinate compared with itself', () => {
    // The dot product of a unit vector with itself rounds to just beyond one, and so the arc
    // cosine of it alone is out of domain, e.g., the separation is not a number:
    for (let θ = -90; θ <= 90; θ += 0.25) {
      for (let φ = 0; φ < 360; φ += 7) {
        expect(getAngularSeparation({ θ, φ }, { θ, φ })).toBe(0)
      }
    }
  })

  it('should return the greatest separation for two coordinates at their antipodes, wherever they lie', () => {
    for (let θ = -90; θ <= 90; θ += 0.5) {
      for (let φ = 0; φ < 360; φ += 7) {
        expect(getAngularSeparation({ θ, φ }, { θ: -θ, φ: φ + 180 })).toBeCloseTo(180, 9)
      }
    }
  })

  it('should resolve a separation that is small against the coordinates themselves', () => {
    // The separation is ill-conditioned towards zero where it is taken as the arc cosine of the
    // dot product, e.g., a separation of a milliarcsecond is resolved as none at all:
    const target = { θ: 7.4070639, φ: 88.7929583 }

    for (const arcsec of [1e-3, 1e-2, 1e-1, 1, 10]) {
      const separation = getAngularSeparation(target, { ...target, θ: target.θ + arcsec / 3600 })

      expect(separation * 3600).toBeCloseTo(arcsec, 9)
    }
  })
})

/*****************************************************************************************************************/

describe('getAntipodeCoordinate', () => {
  it('should be defined', () => {
    expect(getAntipodeCoordinate).toBeDefined()
  })

  it('should return the antipode of the given object', () => {
    const antipode = getAntipodeCoordinate({
      θ: -30,
      φ: 30
    })

    expect(antipode.θ).toBe(30)
    expect(antipode.φ).toBe(210)
  })

  it('should return the antipode of the given object', () => {
    const antipode = getAntipodeCoordinate({
      θ: 60,
      φ: 90
    })

    expect(antipode.θ).toBe(-60)
    expect(antipode.φ).toBe(270)
  })

  it('should return an azimuthal angle within the range [0, 360) for any coordinate given', () => {
    for (let φ = -720; φ <= 720; φ += 13) {
      const antipode = getAntipodeCoordinate({ θ: 0, φ })

      expect(antipode.φ).toBeGreaterThanOrEqual(0)
      expect(antipode.φ).toBeLessThan(360)
    }
  })

  it('should be diametrically opposite to the coordinate given', () => {
    // The angular separation between a coordinate and its antipode is 180°, e.g., the two points
    // lie at either end of a diameter of the sphere:
    for (const A of [
      { θ: 0, φ: 0 },
      { θ: 45, φ: 30 },
      { θ: -45, φ: 200 },
      { θ: 90, φ: 123 },
      { θ: 19.182409, φ: 213.9153 }
    ]) {
      expect(getAngularSeparation(A, getAntipodeCoordinate(A))).toBeCloseTo(180, 9)
    }
  })
})

/*****************************************************************************************************************/

describe('getNormalisedSphericalCoordinate', () => {
  it('should be defined', () => {
    expect(getNormalisedSphericalCoordinate).toBeDefined()
  })

  it('should return a coordinate that is already resolved unchanged', () => {
    // A coordinate within [-90, 90] x [0, 360) names a point on the sphere already, and so it is
    // returned as it is. N.B. The reflection is decided from the meridian, and not by comparing the
    // reflected polar angle against it: 90 - |90 - meridian| does not reproduce the meridian to the
    // last bit, and so comparing them rotated the azimuthal angle of one coordinate in five to the
    // antipodal meridian:
    for (const [θ, φ] of [
      [-47.12052901230394, 27.36041502645363],
      [-78.26820559674799, 193.02955089798024],
      [-34.780465192013345, 154.00423043521494],
      [-49.99999998142572, 3.2185283771468676e-8]
    ]) {
      const normalised = getNormalisedSphericalCoordinate({ θ, φ })

      expect(normalised.θ).toBeCloseTo(θ, 12)
      expect(normalised.φ).toBeCloseTo(φ, 12)
    }
  })

  it('should return every coordinate that is already resolved unchanged', () => {
    // The reflection turned on the last bit of an arithmetic identity, and so it did not fail for a
    // coordinate of a round number, but for a fifth of those in between:
    for (let i = 0; i < 20000; i++) {
      const θ = (i / 20000) * 180 - 90

      const φ = (i / 20000) * 360

      const normalised = getNormalisedSphericalCoordinate({ θ, φ })

      expect(normalised.θ).toBeCloseTo(θ, 12)
      expect(normalised.φ).toBeCloseTo(φ, 12)
    }
  })

  it('should resolve a coordinate to the point on the sphere it names', () => {
    // The unit vector of the coordinate as it is given, and of the coordinate as it is resolved,
    // are the same vector, whatever the coordinate, e.g., however far it lies beyond a pole:
    for (const θ of [-720, -270, -180, -120, -90, -45, 0, 45, 90, 120, 180, 270, 720]) {
      for (const φ of [-720, -180, -0.5, 0, 10, 190, 359.5, 720]) {
        const normalised = getNormalisedSphericalCoordinate({ θ, φ })

        expect(normalised.θ).toBeGreaterThanOrEqual(-90)
        expect(normalised.θ).toBeLessThanOrEqual(90)
        expect(normalised.φ).toBeGreaterThanOrEqual(0)
        expect(normalised.φ).toBeLessThan(360)

        // The polar angle of the vector, e.g., sin θ, and its azimuthal angle resolved on the
        // parallel, e.g., cos θ cos φ and cos θ sin φ, are unchanged by the normalisation:
        expect(Math.sin(radians(normalised.θ))).toBeCloseTo(Math.sin(radians(θ)), 9)

        expect(Math.cos(radians(normalised.θ)) * Math.cos(radians(normalised.φ))).toBeCloseTo(
          Math.cos(radians(θ)) * Math.cos(radians(φ)),
          9
        )

        expect(Math.cos(radians(normalised.θ)) * Math.sin(radians(normalised.φ))).toBeCloseTo(
          Math.cos(radians(θ)) * Math.sin(radians(φ)),
          9
        )
      }
    }
  })

  it('should return the normalised spherical coordinate when normalisation is not needed', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: 60,
      φ: 90
    })

    expect(normalised.θ).toBe(60)
    expect(normalised.φ).toBe(90)
  })

  it('should return the normalised spherical coordinate when positive bounds are exceeded', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: 120,
      φ: 450
    })

    // The polar angle is reflected back over the north pole, and so the azimuthal angle is rotated
    // to the antipodal meridian:
    expect(normalised.θ).toBe(60)
    expect(normalised.φ).toBe(270)
  })

  it('should return the normalised spherical coordinate when negative bounds are exceeded', () => {
    const normalised = getNormalisedSphericalCoordinate({
      θ: -120,
      φ: -270
    })

    // The polar angle is reflected back over the south pole, and so the azimuthal angle is rotated
    // to the antipodal meridian:
    expect(normalised.θ).toBe(-60)
    expect(normalised.φ).toBe(270)
  })

  it('should not rotate the azimuthal angle when the polar angle is within the bounds of the poles', () => {
    for (const θ of [-90, -45, 0, 45, 90]) {
      expect(getNormalisedSphericalCoordinate({ θ, φ: 90 })).toEqual({ θ, φ: 90 })
    }
  })

  it('should return the same point on the sphere as the coordinate given', () => {
    // The angular separation between a coordinate and its normalisation is zero if, and only if,
    // both describe the same point on the sphere:
    for (const A of [
      { θ: 92, φ: 45 },
      { θ: -92, φ: 45 },
      { θ: 179, φ: 200 },
      { θ: -179, φ: 200 },
      { θ: 271, φ: -30 },
      { θ: 120, φ: 450 }
    ]) {
      expect(getAngularSeparation(A, getNormalisedSphericalCoordinate(A))).toBeCloseTo(0, 9)
    }
  })

  it('should normalise the polar angle to the range [-90, 90] and the azimuthal angle to the range [0, 360)', () => {
    for (let θ = -720; θ <= 720; θ += 37) {
      for (let φ = -720; φ <= 720; φ += 13) {
        const normalised = getNormalisedSphericalCoordinate({ θ, φ })

        expect(normalised.θ).toBeGreaterThanOrEqual(-90)
        expect(normalised.θ).toBeLessThanOrEqual(90)
        expect(normalised.φ).toBeGreaterThanOrEqual(0)
        expect(normalised.φ).toBeLessThan(360)
      }
    }
  })
})

/*****************************************************************************************************************/

describe('getGreenwichSiderealTime', () => {
  it('should be defined', () => {
    expect(getGreenwichSiderealTime).toBeDefined()
  })

  it('should return the Greenwich Sidereal Time (GST) of the given date', () => {
    const GST = getGreenwichSiderealTime(datetime)
    expect(GST).toBe(15.463990399019053)
  })

  it('should return a target that is directly overhead at for ', () => {
    const GST = getGreenwichSiderealTime(datetime)

    // The observer is at the same latitude as Betelgeuse's declination, and the same longitude as as
    // Betelgeuse's right ascension minus the GST times 15 degrees per hour:
    // This simulates a target directly overhead for the "observer":
    const observer = { latitude: betelgeuse.dec, longitude: betelgeuse.ra - GST * 15 }

    // Convert the target to horizontal coordinates:
    const target = convertEquatorialToHorizontal(datetime, observer, betelgeuse)
    // The target should be directly overhead:
    expect(target.alt).toBe(90)
  })
})

/*****************************************************************************************************************/

describe('getGreenwichApparentSiderealTime', () => {
  it('should be defined', () => {
    expect(getGreenwichApparentSiderealTime).toBeDefined()
  })

  it('should return the Greenwich Apparent Sidereal Time (GAST) of the given date', () => {
    const GAST = getGreenwichApparentSiderealTime(datetime)
    expect(GAST).toBe(15.463691802606913)
  })

  it('should differ from the Greenwich Mean Sidereal Time (GMST) by the equation of the equinoxes', () => {
    const GAST = getGreenwichApparentSiderealTime(datetime)
    const GMST = getGreenwichSiderealTime(datetime)
    // The equation of the equinoxes is always less than around one second of time:
    expect(Math.abs(GAST - GMST) * 3600).toBeLessThan(1.2)
  })

  it('should return the Greenwich Apparent Sidereal Time (GAST) for the Meeus example epoch', () => {
    // Meeus, Astronomical Algorithms, Example 12.a, for 1987 April 10 at 0h UT, for which the
    // apparent sidereal time at Greenwich is 13h 10m 46.1351s:
    const GAST = getGreenwichApparentSiderealTime(new Date('1987-04-10T00:00:00.000+00:00'))
    expect(GAST).toBeCloseTo(13 + 10 / 60 + 46.1351 / 3600, 4)
  })
})

/*****************************************************************************************************************/

describe('getLocalSiderealTime', () => {
  it('should be defined', () => {
    expect(getLocalSiderealTime).toBeDefined()
  })

  it('should return the Local Sidereal Time (LST) of the given date at longitude 0 at Greenwich', () => {
    const LST = getLocalSiderealTime(datetime, 0)
    const GST = getGreenwichSiderealTime(datetime)
    expect(LST).toBe(GST)
  })

  it('should return the Local Sidereal Time (LST) of the given date at longitude 0 at Greenwich', () => {
    const datetime = new Date('2021-05-14T01:06:33.99870+00:00')
    const LST = getLocalSiderealTime(datetime, 0)
    const GST = getGreenwichSiderealTime(datetime)
    expect(LST).toBe(GST)
  })

  it('should return the Local Sidereal Time (LST) of the given date', () => {
    const LST = getLocalSiderealTime(datetime, longitude)
    expect(LST).toBe(5.099450799019053)
  })
})

/*****************************************************************************************************************/

describe('getLocalApparentSiderealTime', () => {
  it('should be defined', () => {
    expect(getLocalApparentSiderealTime).toBeDefined()
  })

  it('should return the Greenwich Apparent Sidereal Time (GAST) of the given date at longitude 0 at Greenwich', () => {
    const LAST = getLocalApparentSiderealTime(datetime, 0)
    const GAST = getGreenwichApparentSiderealTime(datetime)
    expect(LAST).toBe(GAST)
  })

  it('should return the Local Apparent Sidereal Time (LAST) of the given date', () => {
    const LAST = getLocalApparentSiderealTime(datetime, longitude)
    expect(LAST).toBe(5.099152202606913)
  })

  it('should differ from the Local Sidereal Time (LST) by the equation of the equinoxes', () => {
    const LAST = getLocalApparentSiderealTime(datetime, longitude)
    const LST = getLocalSiderealTime(datetime, longitude)
    // The equation of the equinoxes is always less than around one second of time:
    expect(Math.abs(LAST - LST) * 3600).toBeLessThan(1.2)
  })
})

/*****************************************************************************************************************/

describe('getHourAngle', () => {
  it('should be defined', () => {
    expect(getHourAngle).toBeDefined()
  })

  it('should return the Hour Angle (HA) of the given date at longitude 0 at Greenwich', () => {
    const HA = getHourAngle(datetime, 0, betelgeuse.ra)
    expect(HA).toBe(143.1668976852858)
  })

  it('should return the Hour Angle (HA) of the given date', () => {
    const HA = getHourAngle(datetime, longitude, betelgeuse.ra)
    expect(HA).toBe(347.6988036852858)
  })
})

/*****************************************************************************************************************/

describe('getParallacticAngle', () => {
  it('should be defined', () => {
    expect(getParallacticAngle).toBeDefined()
  })

  it('should return the Parallactic Angle (PA) of the given date at longitude 0 at Greenwich', () => {
    const q = getParallacticAngle(datetime, { latitude, longitude }, betelgeuse)
    expect(q).toBe(317.37187353779296)
  })
})

/*****************************************************************************************************************/

// For testing, Barnard's Star has the largest proper motion of any known star, at J2000.0:
const barnard: EquatorialCoordinate = { ra: 269.45207917, dec: 4.69339722 }

// The proper motion of Barnard's Star, in arcseconds per Julian year:
const barnardProperMotion: EquatorialProperMotion = { ra: -0.79858, dec: 10.32812 }

// A datetime at some number of Julian years from the J2000.0 epoch. N.B. A Julian year is exactly
// 365.25 days, and so it is not a calendar year:
const at = (years: number): Date => convertJulianDateToUTC(J2000 + years * 365.25)

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForProperMotion', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForProperMotion).toBeDefined()
  })

  it('should return no correction at the epoch of the coordinate', () => {
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(at(0), barnard, barnardProperMotion)

    expect(ra).toBeCloseTo(0, 9)
    expect(dec).toBeCloseTo(0, 9)
  })

  it('should return no correction for a target with no proper motion', () => {
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(datetime, betelgeuse, {
      ra: 0,
      dec: 0
    })

    expect(ra).toBe(0)
    expect(dec).toBe(0)
  })

  it('should return the correction for the proper motion of Barnard’s Star', () => {
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(
      datetime,
      barnard,
      barnardProperMotion
    )

    // The interval between the J2000.0 epoch and the datetime, in Julian years:
    const years = (getJulianDate(datetime) - J2000) / 365.25

    // The declination moves north at the rate given, e.g., ~10.3" per year:
    expect(dec * 3600).toBeCloseTo(barnardProperMotion.dec * years, 9)

    // The right ascension moves west at the rate given, divided through by the cosine of the
    // declination, as the rate given is the great-circle rate:
    expect(ra * 3600).toBeCloseTo(
      (barnardProperMotion.ra * years) / Math.cos((barnard.dec * Math.PI) / 180),
      9
    )

    // Barnard's Star moves ~10.3" per year, and so it has moved ~3.7' over the interval:
    expect(dec * 60).toBeCloseTo(3.68, 1)
  })

  it('should scale linearly with the interval since the epoch of the coordinate', () => {
    const decade = getCorrectionToEquatorialForProperMotion(at(10), barnard, barnardProperMotion)

    const century = getCorrectionToEquatorialForProperMotion(at(100), barnard, barnardProperMotion)

    expect(century.ra / decade.ra).toBeCloseTo(10, 6)
    expect(century.dec / decade.dec).toBeCloseTo(10, 6)
  })

  it('should reverse the correction for a datetime before the epoch of the coordinate', () => {
    const before = getCorrectionToEquatorialForProperMotion(at(-10), barnard, barnardProperMotion)

    const after = getCorrectionToEquatorialForProperMotion(at(10), barnard, barnardProperMotion)

    expect(before.ra).toBeCloseTo(-after.ra, 9)
    expect(before.dec).toBeCloseTo(-after.dec, 9)
  })

  it('should correct towards increasing right ascension and declination for a positive proper motion', () => {
    // As the IAU defines them for the ICRS, both rates are measured towards the increasing
    // coordinate, e.g., eastward and northward respectively:
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(
      at(10),
      { ra: 100, dec: 20 },
      { ra: 1, dec: 1 }
    )

    expect(ra).toBeGreaterThan(0)
    expect(dec).toBeGreaterThan(0)
  })

  it('should correct towards decreasing right ascension and declination for a negative proper motion', () => {
    // A negative rate is an object moving westward, or southward, respectively:
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(
      at(10),
      { ra: 100, dec: 20 },
      { ra: -1, dec: -1 }
    )

    expect(ra).toBeLessThan(0)
    expect(dec).toBeLessThan(0)
  })

  it('should scale the proper motion in right ascension by the secant of the declination', () => {
    // The same great-circle rate corresponds to a greater rate of change of the right ascension at
    // a greater declination, e.g., the meridians converge towards the poles:
    const equator = getCorrectionToEquatorialForProperMotion(
      datetime,
      { ra: 0, dec: 0 },
      { ra: 1, dec: 0 }
    )

    const sixty = getCorrectionToEquatorialForProperMotion(
      datetime,
      { ra: 0, dec: 60 },
      { ra: 1, dec: 0 }
    )

    expect(sixty.ra / equator.ra).toBeCloseTo(2, 6)
  })

  it('should resolve the correction from the epoch of the coordinate where it is given', () => {
    // The Gaia DR3 catalogue resolves its coordinates at the J2016.0 epoch, e.g., the Julian date
    // 2457388.5, and so a coordinate of that epoch has 16 fewer years of motion to correct for:
    const { dec } = getCorrectionToEquatorialForProperMotion(
      datetime,
      { ...barnard, epoch: 2457388.5 },
      barnardProperMotion
    )

    const years = (getJulianDate(datetime) - 2457388.5) / 365.25

    expect(dec * 3600).toBeCloseTo(barnardProperMotion.dec * years, 9)

    // The correction is smaller than it is for the same coordinate of the J2000 epoch:
    const { dec: j2000 } = getCorrectionToEquatorialForProperMotion(
      datetime,
      barnard,
      barnardProperMotion
    )

    expect(dec).toBeLessThan(j2000)
  })

  it('should resolve no correction at the epoch of the coordinate where it is given', () => {
    const { ra, dec } = getCorrectionToEquatorialForProperMotion(
      new Date('2016-01-01T00:00:00.000+00:00'),
      { ...barnard, epoch: getJulianDate(new Date('2016-01-01T00:00:00.000+00:00')) },
      barnardProperMotion
    )

    expect(ra).toBeCloseTo(0, 12)
    expect(dec).toBeCloseTo(0, 12)
  })

  it('should not resolve a right ascension for a target at a celestial pole', () => {
    // The right ascension of a target at either pole is degenerate, and so it is left uncorrected:
    for (const dec of [90, -90]) {
      const correction = getCorrectionToEquatorialForProperMotion(
        datetime,
        { ra: 0, dec },
        { ra: 1, dec: 1 }
      )

      expect(correction.ra).toBe(0)
      expect(Number.isFinite(correction.dec)).toBe(true)
    }
  })
})

/***************************************************************************************************************/
