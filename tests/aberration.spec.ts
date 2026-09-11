/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/aberration
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type CartesianCoordinate,
  EARTH_ANGULAR_VELOCITY,
  EARTH_RADIUS,
  type EquatorialCoordinate,
  SPEED_OF_LIGHT,
  getCorrectionToEquatorialForAberration,
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForDiurnalAberration,
  getCorrectionToEquatorialForLightDeflection,
  getCorrectionToEquatorialForVelocityAberration,
  getHourAngle,
  getNutation,
  getSolarGeometricEclipticCoordinate,
  getTrueObliquityOfTheEcliptic
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
    expect(ra + betelgeuse.ra).toBe(88.79868727112795)
    expect(dec + betelgeuse.dec).toBe(7.406803873334351)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAnnualAberration(datetime, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.78837432108541)
    expect(dec + betelgeuse.dec).toBe(7.406109080849657)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForDiurnalAberration', () => {
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
    expect(ra + betelgeuse.ra).toBe(88.7928898251804)
    expect(dec + betelgeuse.dec).toBe(7.407057608077356)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(datetime, {
      latitude,
      longitude
    }, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.793040690999)
    expect(dec + betelgeuse.dec).toBe(7.407061603196344)
  })

  it('should never exceed the constant of diurnal aberration for the observer', () => {
    // The constant of diurnal aberration is ~0.32 arcseconds at the equator, and it is scaled by
    // the cosine of the observer's latitude, and, in right ascension, by the secant of the
    // declination of the target:
    const k = ((radians(EARTH_ANGULAR_VELOCITY) * EARTH_RADIUS) / SPEED_OF_LIGHT) * (180 / Math.PI) * 3600

    const bound =
      (k * Math.cos(radians(latitude))) / Math.cos(radians(betelgeuse.dec))

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
    const culmination = new Date(
      datetime.getTime() + ((360 - meridian) % 360) * 3.9934469 * 60000
    )

    const { ra, dec } = getCorrectionToEquatorialForDiurnalAberration(
      culmination,
      { latitude, longitude },
      betelgeuse
    )

    const k = ((radians(EARTH_ANGULAR_VELOCITY) * EARTH_RADIUS) / SPEED_OF_LIGHT) * (180 / Math.PI) * 3600

    // The correction in right ascension is at its bound, and the correction in declination, which
    // scales with the sine of the hour angle, vanishes:
    expect(Math.abs(ra) * 3600).toBeCloseTo(
      (k * Math.cos(radians(latitude))) / Math.cos(radians(betelgeuse.dec)),
      3
    )

    expect(Math.abs(dec) * 3600).toBeCloseTo(0, 3)
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
    expect(ra + betelgeuse.ra).toBe(88.79861879630835)
    expect(dec + betelgeuse.dec).toBe(7.406797581411706)
  })

  it('should return the correct aberration correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAberration(datetime, {
      latitude,
      longitude
    }, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.78845671208443)
    expect(dec + betelgeuse.dec).toBe(7.406106784046001)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForVelocityAberration', () => {
  // The orbital speed of an observer in a low Earth orbit (in SI metres per second):
  const V = 7669

  // The displacement of a target perpendicular to the direction of travel, e.g., the constant of
  // aberration for the velocity, in arcseconds:
  const maximum = ((V / SPEED_OF_LIGHT) * (180 / Math.PI)) * 3600

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
        const separation =
          Math.hypot(correction.ra * Math.cos(radians(dec)), correction.dec) * 3600

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

  // The geometric direction of the Sun, referred to the true equator and equinox of the date, e.g.,
  // the geometric ecliptic longitude carried to the true equinox by the nutation in longitude, and
  // converted about the true obliquity of the ecliptic:
  const sun = (() => {
    const { λ, β } = getSolarGeometricEclipticCoordinate(equinox)

    const ε = radians(getTrueObliquityOfTheEcliptic(equinox))

    const l = radians(λ + getNutation(equinox).Δψ)

    const b = radians(β)

    const ra = Math.atan2(Math.sin(l) * Math.cos(ε) - Math.tan(b) * Math.sin(ε), Math.cos(l))

    const dec = Math.asin(Math.sin(b) * Math.cos(ε) + Math.cos(b) * Math.sin(ε) * Math.sin(l))

    return { ra: (ra * 180) / Math.PI, dec: (dec * 180) / Math.PI }
  })()

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
