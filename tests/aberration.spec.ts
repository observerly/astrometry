/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/aberration
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  AU_IN_METERS,
  type CartesianCoordinate,
  convertCartesianToEquatorial,
  doDotProduct,
  doNormalize,
  EARTH_ANGULAR_VELOCITY,
  EARTH_RADIUS,
  type EquatorialCoordinate,
  getAngularSeparation,
  getAntipodeCoordinate,
  getBarycentricEarthVelocity,
  getCorrectionToEquatorialForAberration,
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForDiurnalAberration,
  getCorrectionToEquatorialForLightDeflection,
  getCorrectionToEquatorialForVelocityAberration,
  getGeocentricRotationalVelocity,
  getGeometricSolarVector,
  getHourAngle,
  getLocalSiderealTime,
  SPEED_OF_LIGHT
} from '../src'

import { MICROARCSECOND_IN_DEGREES } from '../src/constants'

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

describe('getCorrectionToEquatorialForAnnualAberration', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForAnnualAberration).toBeDefined()
  })

  it('should return the correct aberration correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAnnualAberration(
      new Date('2000-01-01T00:00:00+00:00'),
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBeCloseTo(88.798686690145, 9)
    expect(dec + betelgeuse.dec).toBeCloseTo(7.406803713851167, 9)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAnnualAberration(datetime, betelgeuse)
    expect(ra + betelgeuse.ra).toBeCloseTo(88.788391902834, 9)
    expect(dec + betelgeuse.dec).toBeCloseTo(7.406101846632362, 9)
  })

  it('should not displace a target at the apex or the antapex of the motion of the Earth', () => {
    const apex = convertCartesianToEquatorial(doNormalize(getBarycentricEarthVelocity(datetime)))

    const antapex = getAntipodeCoordinate({ θ: apex.dec, φ: apex.ra })

    for (const target of [apex, { ra: antapex.φ, dec: antapex.θ }]) {
      const { ra, dec } = getCorrectionToEquatorialForAnnualAberration(datetime, target)

      const separation = getAngularSeparation(
        { θ: target.dec + dec, φ: target.ra + ra },
        { θ: target.dec, φ: target.ra }
      )

      expect(separation * 3600).toBeLessThan(1e-6)
    }
  })

  it('should displace a target towards the apex of the motion of the Earth', () => {
    const apex = convertCartesianToEquatorial(doNormalize(getBarycentricEarthVelocity(datetime)))

    for (let ra = 0; ra < 360; ra += 30) {
      for (const dec of [-60, -30, 0, 30, 60]) {
        const correction = getCorrectionToEquatorialForAnnualAberration(datetime, { ra, dec })

        const before = getAngularSeparation({ θ: dec, φ: ra }, { θ: apex.dec, φ: apex.ra })

        const after = getAngularSeparation(
          { θ: dec + correction.dec, φ: ra + correction.ra },
          { θ: apex.dec, φ: apex.ra }
        )

        // N.B. A target within an arcminute of the apex or the antapex is barely displaced at all:
        if (before > 1 / 60 && before < 180 - 1 / 60) {
          expect(after).toBeLessThan(before)
        }
      }
    }
  })

  it('should displace a target by v sin θ / c, e.g., ~20.5″ at right angles to the apex', () => {
    const velocity = getBarycentricEarthVelocity(datetime)

    // The speed of the Earth as a fraction of the speed of light, e.g., ~1e-4:
    const β = (Math.sqrt(doDotProduct(velocity, velocity)) * AU_IN_METERS) / 86400 / SPEED_OF_LIGHT

    const apex = convertCartesianToEquatorial(doNormalize(velocity))

    for (let ra = 0; ra < 360; ra += 30) {
      for (const dec of [-89, -60, -30, 0, 30, 60, 89]) {
        const correction = getCorrectionToEquatorialForAnnualAberration(datetime, { ra, dec })

        const θ = radians(getAngularSeparation({ θ: dec, φ: ra }, { θ: apex.dec, φ: apex.ra }))

        const separation = getAngularSeparation(
          { θ: dec + correction.dec, φ: ra + correction.ra },
          { θ: dec, φ: ra }
        )

        // N.B. The displacement is v sin θ / c to the first order, and the terms of the second
        // order and of the gravitational potential of the Sun are each within ~10 mas:
        expect(Math.abs(separation * 3600 - (β * Math.sin(θ) * 180 * 3600) / Math.PI)).toBeLessThan(
          0.01
        )
      }
    }
  })

  it('should never exceed ~20.7″ anywhere on the sphere', () => {
    for (let ra = 0; ra < 360; ra += 15) {
      for (const dec of [-90, -89, -60, -30, 0, 30, 60, 89, 90]) {
        const correction = getCorrectionToEquatorialForAnnualAberration(datetime, { ra, dec })

        const separation = getAngularSeparation(
          { θ: dec + correction.dec, φ: ra + correction.ra },
          { θ: dec, φ: ra }
        )

        expect(Number.isFinite(correction.ra)).toBe(true)
        expect(Number.isFinite(correction.dec)).toBe(true)
        expect(separation * 3600).toBeLessThan(20.7)
      }
    }
  })

  it('should resolve the displacement in right ascension the shorter way about the sphere', () => {
    for (let ra = 0; ra < 360; ra += 15) {
      for (const dec of [-89, -45, 0, 45, 89]) {
        const correction = getCorrectionToEquatorialForAnnualAberration(datetime, { ra, dec })

        expect(correction.ra).toBeGreaterThanOrEqual(-180)
        expect(correction.ra).toBeLessThan(180)
      }
    }
  })

  it('should return the same correction for a right ascension a whole turn apart', () => {
    const a = getCorrectionToEquatorialForAnnualAberration(datetime, betelgeuse)

    const b = getCorrectionToEquatorialForAnnualAberration(datetime, {
      ra: betelgeuse.ra + 360,
      dec: betelgeuse.dec
    })

    expect(b.ra).toBeCloseTo(a.ra, 12)
    expect(b.dec).toBeCloseTo(a.dec, 12)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForDiurnalAberration', () => {
  // The observer the rotation of the Earth carries, e.g., at Mauna Kea, at the surface:
  const observer = { latitude, longitude }

  // The constant of diurnal aberration for the observer, e.g., the speed the rotation of the Earth
  // carries them at as a fraction of the speed of light, which is ~0.30 arcseconds at the latitude
  // of Mauna Kea (in degrees):
  const κ =
    degrees((radians(EARTH_ANGULAR_VELOCITY) * EARTH_RADIUS) / SPEED_OF_LIGHT) *
    Math.cos(radians(latitude))

  // The declinations to sample the sphere at, e.g., to within less than the constant of diurnal
  // aberration of either celestial pole, and at the poles themselves:
  const declinations = [-90, -90 + 1e-9, -89.9999, -60, -30, 0, 30, 60, 89.9999, 90 - 1e-9, 90]

  // The datetimes to sample a rotation of the Earth at, e.g., every three hours:
  const datetimes = [0, 3, 6, 9, 12, 15, 18, 21].map(
    hour => new Date(datetime.getTime() + hour * 3600000)
  )

  it('should be defined', () => {
    expect(getCorrectionToEquatorialForDiurnalAberration).toBeDefined()
  })

  it('should return the correct aberration correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
      new Date('2000-01-01T00:00:00+00:00'),
      {
        latitude,
        longitude
      },
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBeCloseTo(88.7928898251804, 9)
    expect(dec + betelgeuse.dec).toBeCloseTo(7.407057608077356, 9)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBeCloseTo(88.793040690999, 9)
    expect(dec + betelgeuse.dec).toBeCloseTo(7.407061603196344, 9)
  })

  it('should never exceed the constant of diurnal aberration for the observer', () => {
    // The constant of diurnal aberration is ~0.32 arcseconds at the equator, and it is scaled by
    // the cosine of the observer's latitude, and, in right ascension, by the secant of the
    // declination of the target:
    const k =
      ((radians(EARTH_ANGULAR_VELOCITY) * EARTH_RADIUS) / SPEED_OF_LIGHT) * (180 / Math.PI) * 3600

    const bound = (k * Math.cos(radians(latitude))) / Math.cos(radians(betelgeuse.dec))

    // Sample the correction over a whole rotation of the Earth, e.g., every minute for 24 hours:
    for (let minute = 0; minute < 1440; minute++) {
      const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
        new Date(datetime.getTime() + minute * 60000),
        { latitude, longitude },
        betelgeuse
      )

      expect(Math.abs(ra) * 3600).toBeLessThanOrEqual(bound)
      expect(Math.abs(dec) * 3600).toBeLessThanOrEqual(bound)
    }
  })

  it('should vanish for an observer at the poles', () => {
    // The observer is not carried by the rotation of the Earth at the poles, and so there is no
    // diurnal aberration for such an observer:
    for (const latitude of [90, -90]) {
      const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
        datetime,
        { latitude, longitude },
        betelgeuse
      )

      expect(ra).toBeCloseTo(0, 12)
      expect(dec).toBeCloseTo(0, 12)
    }
  })

  it('should be at a maximum in right ascension for a target on the observer meridian', () => {
    // The target is displaced towards the east point of the observer's horizon, which is at right
    // angles to the meridian, and so the displacement is wholly in right ascension there:
    const meridian = getHourAngle(datetime, longitude, betelgeuse.ra)

    // The datetime at which the target culminates, e.g., ~4 minutes of time per degree of the
    // hour angle still to be traversed:
    const culmination = new Date(datetime.getTime() + ((360 - meridian) % 360) * 3.9934469 * 60000)

    const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
      culmination,
      { latitude, longitude },
      betelgeuse
    )

    const k =
      ((radians(EARTH_ANGULAR_VELOCITY) * EARTH_RADIUS) / SPEED_OF_LIGHT) * (180 / Math.PI) * 3600

    // The correction in right ascension is at its bound, and the correction in declination, which
    // scales with the sine of the hour angle, vanishes:
    expect(Math.abs(ra) * 3600).toBeCloseTo(
      (k * Math.cos(radians(latitude))) / Math.cos(radians(betelgeuse.dec)),
      3
    )

    expect(Math.abs(dec) * 3600).toBeCloseTo(0, 3)
  })

  it('should return a bounded correction for a target at a celestial pole', () => {
    // Every meridian meets at a pole, where cos δ vanishes, and so the correction is recovered
    // from the displaced vector, and not expanded about the target, which would divide by cos δ:
    for (const when of datetimes) {
      for (let ra = 0; ra < 360; ra += 15) {
        for (const dec of [90, -90]) {
          const correction = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
            ra,
            dec
          })

          expect(Number.isFinite(correction.ra)).toBe(true)
          expect(Number.isFinite(correction.dec)).toBe(true)

          expect(correction.ra).toBeGreaterThanOrEqual(-180)
          expect(correction.ra).toBeLessThan(180)

          // The target is displaced away from the pole by the whole of the constant, as the pole
          // is at right angles to the east point of the horizon:
          expect(Math.abs(correction.dec)).toBeCloseTo(κ, 9)
        }
      }
    }
  })

  it('should resolve the displacement in right ascension the shorter way about the sphere', () => {
    for (const when of datetimes) {
      for (let ra = 0; ra < 360; ra += 15) {
        for (const dec of declinations) {
          const correction = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
            ra,
            dec
          })

          expect(Number.isFinite(correction.ra)).toBe(true)
          expect(Number.isFinite(correction.dec)).toBe(true)

          expect(correction.ra).toBeGreaterThanOrEqual(-180)
          expect(correction.ra).toBeLessThan(180)
        }
      }
    }
  })

  it('should resolve the same apparent place for a target at a celestial pole, whatever its right ascension', () => {
    // A pole is the one direction, whichever meridian it is given along, and so it is displaced
    // to the one apparent place:
    for (const when of datetimes) {
      for (const dec of [90, -90]) {
        const a = getCorrectionToEquatorialForDiurnalAberration(when, observer, { ra: 0, dec })

        for (let ra = 15; ra < 360; ra += 15) {
          const b = getCorrectionToEquatorialForDiurnalAberration(when, observer, { ra, dec })

          const separation = getAngularSeparation(
            { θ: dec + a.dec, φ: a.ra },
            { θ: dec + b.dec, φ: ra + b.ra }
          )

          expect(separation).toBeLessThan(MICROARCSECOND_IN_DEGREES)
        }
      }
    }
  })

  it('should displace a target by κ sin θ, e.g., ~0.30″ at right angles to the east point', () => {
    for (const when of datetimes) {
      // The east point of the horizon of the observer, e.g., on the celestial equator, six hours
      // of right ascension to the east of their meridian:
      const east = { θ: 0, φ: getLocalSiderealTime(when, longitude) * 15 + 90 }

      for (let ra = 0; ra < 360; ra += 30) {
        for (const dec of declinations) {
          const correction = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
            ra,
            dec
          })

          const θ = radians(getAngularSeparation({ θ: dec, φ: ra }, east))

          const separation = getAngularSeparation(
            { θ: dec + correction.dec, φ: ra + correction.ra },
            { θ: dec, φ: ra }
          )

          // N.B. The displacement is κ sin θ to the first order, and the term of the second order
          // is κ² / 2 at the most, e.g., ~0.2 microarcseconds:
          expect(Math.abs(separation - κ * Math.sin(θ))).toBeLessThan(MICROARCSECOND_IN_DEGREES)
        }
      }
    }
  })

  it('should never exceed the constant of diurnal aberration anywhere on the sphere', () => {
    for (const when of datetimes) {
      for (let ra = 0; ra < 360; ra += 15) {
        for (const dec of declinations) {
          const correction = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
            ra,
            dec
          })

          const separation = getAngularSeparation(
            { θ: dec + correction.dec, φ: ra + correction.ra },
            { θ: dec, φ: ra }
          )

          expect(separation).toBeLessThan(κ + MICROARCSECOND_IN_DEGREES)

          // The displacement in declination is an arc of a great circle, and so it is bounded
          // by the constant itself, whatever the declination of the target:
          expect(Math.abs(correction.dec)).toBeLessThan(κ + MICROARCSECOND_IN_DEGREES)
        }
      }
    }
  })

  it('should displace a target towards the east point of the observer horizon', () => {
    for (const when of datetimes) {
      const east = { θ: 0, φ: getLocalSiderealTime(when, longitude) * 15 + 90 }

      for (let ra = 0; ra < 360; ra += 30) {
        for (const dec of declinations) {
          const correction = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
            ra,
            dec
          })

          const before = getAngularSeparation({ θ: dec, φ: ra }, east)

          const after = getAngularSeparation(
            { θ: dec + correction.dec, φ: ra + correction.ra },
            east
          )

          // N.B. A target within an arcminute of the east or the west point is barely displaced:
          if (before > 1 / 60 && before < 180 - 1 / 60) {
            expect(after).toBeLessThan(before)
          }
        }
      }
    }
  })

  it('should not displace a target at the east or the west point of the observer horizon', () => {
    // The aberration is transverse, and so a target the observer is carried directly towards, or
    // directly away from, is not displaced:
    for (const when of datetimes) {
      const meridian = getLocalSiderealTime(when, longitude) * 15

      for (const ra of [meridian + 90, meridian - 90]) {
        const correction = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
          ra,
          dec: 0
        })

        const separation = getAngularSeparation(
          { θ: correction.dec, φ: ra + correction.ra },
          { θ: 0, φ: ra }
        )

        expect(separation).toBeLessThan(MICROARCSECOND_IN_DEGREES)
      }
    }
  })

  it('should agree with the velocity aberration of the rotation of the Earth towards the poles', () => {
    // The diurnal aberration is the aberration of the velocity the rotation of the Earth carries
    // the observer at, and so the two resolve the one apparent place, whatever the declination:
    for (const when of datetimes) {
      const velocity = getGeocentricRotationalVelocity(when, observer)

      for (let ra = 0; ra < 360; ra += 30) {
        for (const dec of declinations) {
          const diurnal = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
            ra,
            dec
          })

          const resolved = getCorrectionToEquatorialForVelocityAberration({ ra, dec }, velocity)

          const separation = getAngularSeparation(
            { θ: dec + diurnal.dec, φ: ra + diurnal.ra },
            { θ: dec + resolved.dec, φ: ra + resolved.ra }
          )

          expect(separation).toBeLessThan(MICROARCSECOND_IN_DEGREES)
        }
      }
    }
  })

  it('should not displace a target on the celestial equator in declination', () => {
    // The observer is carried within the plane of the equator, and so a target within that plane
    // is displaced along it:
    for (const when of datetimes) {
      for (let ra = 0; ra < 360; ra += 15) {
        const correction = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
          ra,
          dec: 0
        })

        expect(correction.dec).toBeCloseTo(0, 12)
      }
    }
  })

  it('should mirror the displacement in declination between the two hemispheres', () => {
    for (const when of datetimes) {
      for (let ra = 0; ra < 360; ra += 30) {
        for (const dec of [15, 45, 75, 89]) {
          const north = getCorrectionToEquatorialForDiurnalAberration(when, observer, { ra, dec })

          const south = getCorrectionToEquatorialForDiurnalAberration(when, observer, {
            ra,
            dec: -dec
          })

          expect(south.ra).toBeCloseTo(north.ra, 12)
          expect(south.dec).toBeCloseTo(-north.dec, 12)
        }
      }
    }
  })

  it('should not depend on the hemisphere of the observer', () => {
    // The speed of the observer is that of their parallel, which is the same to either side of
    // the equator:
    const north = getCorrectionToEquatorialForDiurnalAberration(datetime, observer, betelgeuse)

    const south = getCorrectionToEquatorialForDiurnalAberration(
      datetime,
      { latitude: -latitude, longitude },
      betelgeuse
    )

    expect(south.ra).toBeCloseTo(north.ra, 12)
    expect(south.dec).toBeCloseTo(north.dec, 12)
  })

  it('should scale with the distance of the observer from the axis of rotation', () => {
    // An observer above the surface is carried about a wider parallel, e.g., the summit of Mauna
    // Kea is ~4,205 metres above the surface, and so is carried ~0.07 % faster than the surface:
    const elevation = 4205

    const target = { ra: betelgeuse.ra, dec: betelgeuse.dec }

    const surface = getCorrectionToEquatorialForDiurnalAberration(datetime, observer, target)

    const summit = getCorrectionToEquatorialForDiurnalAberration(
      datetime,
      { latitude, longitude, elevation },
      target
    )

    const ratio = (EARTH_RADIUS + elevation) / EARTH_RADIUS

    expect(summit.ra / surface.ra).toBeCloseTo(ratio, 6)
    expect(summit.dec / surface.dec).toBeCloseTo(ratio, 6)
  })

  it('should return the same correction for a right ascension a whole turn apart', () => {
    const a = getCorrectionToEquatorialForDiurnalAberration(datetime, observer, betelgeuse)

    const b = getCorrectionToEquatorialForDiurnalAberration(datetime, observer, {
      ra: betelgeuse.ra + 360,
      dec: betelgeuse.dec
    })

    expect(b.ra).toBeCloseTo(a.ra, 12)
    expect(b.dec).toBeCloseTo(a.dec, 12)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForAberration', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForAberration).toBeDefined()
  })

  it('should return the correct aberration correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAberration(
      new Date('2000-01-01T00:00:00+00:00'),
      {
        latitude,
        longitude
      },
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBeCloseTo(88.7986182153254, 9)
    expect(dec + betelgeuse.dec).toBeCloseTo(7.406797421928522, 9)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAberration(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBeCloseTo(88.788474293833, 9)
    expect(dec + betelgeuse.dec).toBeCloseTo(7.406099549828706, 9)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForVelocityAberration', () => {
  // The orbital speed of an observer in a low Earth orbit (in SI metres per second):
  const V = 7669

  // The displacement of a target perpendicular to the direction of travel, e.g., the constant of
  // aberration for the velocity, in arcseconds:
  const maximum = (V / SPEED_OF_LIGHT) * (180 / Math.PI) * 3600

  it('should be defined', () => {
    expect(getCorrectionToEquatorialForVelocityAberration).toBeDefined()
  })

  it('should not displace a target the observer travels directly towards', () => {
    // The aberration is transverse, and so a target along the direction of travel is not displaced:
    const { ra, dec } = getCorrectionToEquatorialForVelocityAberration(
      { ra: 0, dec: 0 },
      { x: V, y: 0, z: 0 }
    )

    expect(ra).toBeCloseTo(0, 12)
    expect(dec).toBeCloseTo(0, 12)
  })

  it('should displace a target towards the east for an observer travelling east', () => {
    const { ra, dec } = getCorrectionToEquatorialForVelocityAberration(
      { ra: 0, dec: 0 },
      { x: 0, y: V, z: 0 }
    )

    expect(ra * 3600).toBeCloseTo(maximum, 6)
    expect(dec).toBeCloseTo(0, 12)
  })

  it('should displace a target towards the north for an observer travelling north', () => {
    const { ra, dec } = getCorrectionToEquatorialForVelocityAberration(
      { ra: 0, dec: 0 },
      { x: 0, y: 0, z: V }
    )

    expect(ra).toBeCloseTo(0, 12)
    expect(dec * 3600).toBeCloseTo(maximum, 6)
  })

  it('should reduce to the constant of diurnal aberration for the rotation of the Earth', () => {
    // An observer at the equator is carried eastward at ~465 m/s, for which the constant of diurnal
    // aberration is the ~0.32 arcseconds the diurnal correction is resolved from:
    const { ra } = getCorrectionToEquatorialForVelocityAberration(
      { ra: 0, dec: 0 },
      { x: 0, y: 465.1, z: 0 }
    )

    expect(ra * 3600).toBeCloseTo(0.32, 2)
  })

  it('should not displace a target for an observer at rest', () => {
    const correction = getCorrectionToEquatorialForVelocityAberration(
      { ra: 45, dec: 30 },
      { x: 0, y: 0, z: 0 }
    )

    expect(correction.ra).toBeCloseTo(0, 12)
    expect(correction.dec).toBeCloseTo(0, 12)
  })

  it('should take an observer that gives no z component to travel in the plane of the equator', () => {
    // The z component of a cartesian coordinate is optional, and so a consumer that omits it, e.g.,
    // from JavaScript, is not returned a displacement that is not a number:
    const correction = getCorrectionToEquatorialForVelocityAberration({ ra: 10, dec: 20 }, {
      x: V,
      y: V
    } as Required<CartesianCoordinate>)

    expect(Number.isFinite(correction.ra)).toBe(true)
    expect(Number.isFinite(correction.dec)).toBe(true)

    expect(correction).toEqual(
      getCorrectionToEquatorialForVelocityAberration({ ra: 10, dec: 20 }, { x: V, y: V, z: 0 })
    )
  })

  it('should resolve the displacement in right ascension for a target near a celestial pole', () => {
    // The parallel of a target near a pole is shorter than the displacement along it, and so the
    // displacement in right ascension would be unbounded were it expanded about the target. It is
    // recovered from the displaced vector instead, and so it is an angle about the pole, whatever
    // the declination and whatever the speed of the observer:
    for (const speed of [1, 465, V, 29800, 3e6]) {
      for (const offset of [1, 1e-3, 1e-6, 1e-9, 1e-12, 0]) {
        for (const sign of [1, -1]) {
          const correction = getCorrectionToEquatorialForVelocityAberration(
            { ra: 123, dec: sign * (90 - offset) },
            { x: speed, y: speed, z: speed }
          )

          expect(Number.isFinite(correction.ra)).toBe(true)
          expect(Number.isFinite(correction.dec)).toBe(true)

          expect(correction.ra).toBeGreaterThanOrEqual(-180)
          expect(correction.ra).toBeLessThan(180)
        }
      }
    }
  })

  it('should resolve a target at a celestial pole', () => {
    // Every meridian meets at a pole, and so the displaced target takes a right ascension of its
    // own, which may be far from the one it was given. It is resolved, and not guarded against:
    for (const dec of [90, -90]) {
      const correction = getCorrectionToEquatorialForVelocityAberration(
        { ra: 123, dec },
        { x: V, y: V, z: V }
      )

      expect(Number.isFinite(correction.ra)).toBe(true)
      expect(Number.isFinite(correction.dec)).toBe(true)
    }
  })

  it('should bound the displacement by the speed of the observer', () => {
    // No target is displaced by more than v/c, whatever its coordinate or the direction of travel:
    for (let ra = 0; ra < 360; ra += 15) {
      for (let dec = -85; dec <= 85; dec += 5) {
        const correction = getCorrectionToEquatorialForVelocityAberration(
          { ra, dec },
          { x: V, y: -V, z: V / 2 }
        )

        // The displacement along the parallel shortens as cos δ, and so it is the great circle
        // displacement that is bounded, and not the displacement in right ascension itself.
        //
        // N.B. The bound is the first order of v/c, which the displacement exceeds by its own
        // second order for an observer with a component of travel away from the target:
        const separation = Math.hypot(correction.ra * Math.cos(radians(dec)), correction.dec) * 3600

        expect(separation).toBeLessThanOrEqual(Math.hypot(1, 1, 0.5) * maximum * (1 + 1e-4))
      }
    }
  })

  it('should resolve the displacement the shorter way about the sphere at any right ascension', () => {
    // The displacement in right ascension is taken the shorter of the two ways about the sphere,
    // and so a small displacement is resolved as a small angle whatever the right ascension of
    // the target, e.g., it is not offset by a full turn for a target beyond 180°:
    for (const ra of [0, 90, 179.5, 180.5, 270, 359.5]) {
      const east = { x: -V * Math.sin(radians(ra)), y: V * Math.cos(radians(ra)), z: 0 }

      const { ra: Δra, dec: Δdec } = getCorrectionToEquatorialForVelocityAberration(
        { ra, dec: 0 },
        east
      )

      expect(Δra * 3600).toBeCloseTo(maximum, 6)
      expect(Δdec).toBeCloseTo(0, 9)
    }
  })

  it('should reverse the displacement when the observer reverses their velocity', () => {
    const target: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

    const forward = getCorrectionToEquatorialForVelocityAberration(target, { x: V, y: -V, z: V })

    const backward = getCorrectionToEquatorialForVelocityAberration(target, { x: -V, y: V, z: -V })

    // The displacement carries the second order of v/c as well as the first, and so the reversal
    // is antisymmetric to within that second order, e.g., to ~1e-7 degrees at these speeds:
    expect(backward.ra).toBeCloseTo(-forward.ra, 6)
    expect(backward.dec).toBeCloseTo(-forward.dec, 6)
  })
})
/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForLightDeflection', () => {
  // The equinox of 2013-09-22, with the Sun at ~1.004 AU from the Earth:
  const equinox = new Date('2013-09-22T04:00:00.000+00:00')

  // The geometric direction of the Sun, referred to the mean equator and equinox of J2000.0, as the correction
  // resolves it:
  const sun = convertCartesianToEquatorial(getGeometricSolarVector(equinox))

  it('should be defined', () => {
    expect(getCorrectionToEquatorialForLightDeflection).toBeDefined()
  })

  it('should deflect a target at the limb of the Sun by ~1.75 arcseconds away from the Sun', () => {
    // A target along the equator of the date, at the eastern limb of the Sun, e.g., at the angular radius of
    // the Sun from its centre in right ascension:
    const target = { ra: sun.ra + 0.2666, dec: sun.dec }

    const { ra, dec } = getCorrectionToEquatorialForLightDeflection(equinox, target)

    // The deflection (in arcseconds), e.g., 1.75 arcseconds at 1 AU, scaled by the distance of the Sun:
    expect(ra * Math.cos(radians(target.dec)) * 3600).toBeCloseTo(1.7437, 3)

    expect(Math.abs(dec * 3600)).toBeLessThan(0.0001)
  })

  it('should deflect a target at right angles to the Sun by ~4 milliarcseconds away from the Sun', () => {
    const target = { ra: sun.ra + 90, dec: sun.dec }

    const { ra, dec } = getCorrectionToEquatorialForLightDeflection(equinox, target)

    expect(ra * Math.cos(radians(target.dec)) * 3600).toBeCloseTo(0.0041, 3)

    expect(Math.abs(dec * 3600)).toBeLessThan(0.0001)
  })

  it('should deflect a target to the west of the Sun towards the west', () => {
    const target = { ra: sun.ra - 1, dec: sun.dec }

    const { ra } = getCorrectionToEquatorialForLightDeflection(equinox, target)

    expect(ra).toBeLessThan(0)
  })

  it('should return a finite correction for a target in the direction of the Sun', () => {
    const { ra, dec } = getCorrectionToEquatorialForLightDeflection(equinox, sun)

    expect(Number.isFinite(ra)).toBe(true)

    expect(Number.isFinite(dec)).toBe(true)
  })
})

/*****************************************************************************************************************/

describe('getBarycentricEarthVelocity', () => {
  it('should be defined', () => {
    expect(getBarycentricEarthVelocity).toBeDefined()
  })

  it('should move the Earth at between its aphelion and perihelion orbital speeds', () => {
    const { x, y, z } = getBarycentricEarthVelocity(datetime)

    // The speed of the Earth (in kilometres per second):
    const v = (Math.hypot(x, y, z) * 149597870.7) / 86400

    expect(v).toBeGreaterThan(29.2)
    expect(v).toBeLessThan(30.4)
  })

  it('should move the Earth at right angles to the direction of the Sun, to within its eccentricity', () => {
    const v = getBarycentricEarthVelocity(datetime)

    const s = getGeometricSolarVector(datetime)

    const cosine =
      (v.x * s.x + v.y * s.y + v.z * s.z) / Math.hypot(v.x, v.y, v.z) / Math.hypot(s.x, s.y, s.z)

    expect(Math.abs(cosine)).toBeLessThan(0.02)
  })
})

/*****************************************************************************************************************/
