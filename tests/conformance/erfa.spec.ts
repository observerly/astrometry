/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/erfa
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getCorrectionToEquatorialForAnnualAberration } from '../../src/aberration'

import {
  getAngularSeparation,
  getGreenwichApparentSiderealTime,
  getGreenwichSiderealTime
} from '../../src/astrometry'

import { getObliquityOfTheEcliptic, getTrueObliquityOfTheEcliptic } from '../../src/ecliptic'

import { getCorrectionToEquatorialForNutation, getNutation } from '../../src/nutation'

import {
  getCorrectionToEquatorialForFrameBias,
  getCorrectionToEquatorialForPrecessionOfEquinoxes
} from '../../src/precession'

import { erfaInstants } from './erfa'

/*****************************************************************************************************************/

// The tolerances below are the error envelope of the library as it stands, measured against the ERFA references,
// and pinned with a modest headroom so that a regression beyond the current envelope fails. They are a baseline,
// and not a target: each is to be tightened as the models that dominate it are resolved.

/*****************************************************************************************************************/

// The nutation in longitude against the full series of IAU 2000A (in degrees):
const NUTATION_IN_LONGITUDE_TOLERANCE = 0.000001

/*****************************************************************************************************************/

// The nutation in obliquity against the full series of IAU 2000A (in degrees):
const NUTATION_IN_OBLIQUITY_TOLERANCE = 0.0000003

/*****************************************************************************************************************/

// The mean obliquity of the ecliptic against the model of IAU 2006 (in degrees):
const MEAN_OBLIQUITY_TOLERANCE = 0.000001

/*****************************************************************************************************************/

// The true obliquity of the ecliptic against IAU 2006/2000A (in degrees):
const TRUE_OBLIQUITY_TOLERANCE = 0.0000003

/*****************************************************************************************************************/

// The Greenwich Mean Sidereal Time against the model of IAU 2006 (in seconds of time):
const MEAN_SIDEREAL_TIME_TOLERANCE = 0.015

/*****************************************************************************************************************/

// The Greenwich Apparent Sidereal Time against IAU 2006/2000A (in seconds of time):
const APPARENT_SIDEREAL_TIME_TOLERANCE = 0.015

/*****************************************************************************************************************/

// The mean place of the date, e.g., the catalogue coordinate carried by the precession alone, against the model of
// IAU 2006 (in degrees). The reference is the precession without the frame bias, which the library likewise leaves
// out:
const PRECESSION_TOLERANCE = 0.0000001

/*****************************************************************************************************************/

// The equinox-based apparent place of a star away from the celestial poles, resolved as the catalogue coordinate
// displaced by the corrections for frame bias, precession, nutation and annual aberration in turn, against IAU
// 2006/2000A (in degrees):
const APPARENT_PLACE_TOLERANCE = 0.00001

/*****************************************************************************************************************/

// The equinox-based apparent place of a star near a celestial pole, resolved likewise, against IAU 2006/2000A (in
// degrees):
const APPARENT_PLACE_POLAR_TOLERANCE = 0.00005

/*****************************************************************************************************************/

// The declination (in degrees) at or above which the apparent place of a star is held to the polar envelope, e.g.,
// the envelope of the first order corrections near the pole:
const POLAR_DECLINATION = 85

/*****************************************************************************************************************/

describe('conformance of the nutation to ERFA', () => {
  it.each(erfaInstants)(
    'should be within the pinned envelope of IAU 2000A at $datetime',
    reference => {
      const { Δψ, Δε } = getNutation(new Date(reference.datetime))

      expect(Math.abs(Δψ - reference.Δψ)).toBeLessThan(NUTATION_IN_LONGITUDE_TOLERANCE)

      expect(Math.abs(Δε - reference.Δε)).toBeLessThan(NUTATION_IN_OBLIQUITY_TOLERANCE)
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the obliquity of the ecliptic to ERFA', () => {
  it.each(erfaInstants)(
    'should be within the pinned envelope of IAU 2006 at $datetime',
    reference => {
      const ε0 = getObliquityOfTheEcliptic(new Date(reference.datetime))

      const ε = getTrueObliquityOfTheEcliptic(new Date(reference.datetime))

      expect(Math.abs(ε0 - reference.ε0)).toBeLessThan(MEAN_OBLIQUITY_TOLERANCE)

      expect(Math.abs(ε - (reference.ε0 + reference.Δε))).toBeLessThan(TRUE_OBLIQUITY_TOLERANCE)
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the sidereal times to ERFA', () => {
  it.each(erfaInstants)(
    'should be within the pinned envelope of IAU 2006/2000A at $datetime',
    reference => {
      const GMST = getGreenwichSiderealTime(new Date(reference.datetime))

      const GAST = getGreenwichApparentSiderealTime(new Date(reference.datetime))

      // The displacements in the sidereal times, converted from hours to seconds of time:
      expect(Math.abs(GMST - reference.GMST) * 3600).toBeLessThan(MEAN_SIDEREAL_TIME_TOLERANCE)

      expect(Math.abs(GAST - reference.GAST) * 3600).toBeLessThan(APPARENT_SIDEREAL_TIME_TOLERANCE)
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the precession to ERFA', () => {
  it.each(erfaInstants)(
    'should be within the pinned envelope of IAU 2006 at $datetime',
    reference => {
      const when = new Date(reference.datetime)

      for (const star of reference.stars) {
        const target = { ra: star.ra, dec: star.dec }

        // The mean place of the date, e.g., the catalogue coordinate displaced by the correction for the
        // precession of the equinoxes:
        const correction = getCorrectionToEquatorialForPrecessionOfEquinoxes(when, target)

        const mean = { ra: target.ra + correction.ra, dec: target.dec + correction.dec }

        // N.B. Per ISO 80000-2, the polar angle, θ, is the declination of the coordinate, and the azimuthal angle,
        // φ, is its right ascension:
        const separation = getAngularSeparation(
          { θ: mean.dec, φ: mean.ra },
          { θ: star.precessed.dec, φ: star.precessed.ra }
        )

        expect(separation).toBeLessThan(PRECESSION_TOLERANCE)
      }
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the apparent place to ERFA', () => {
  it.each(erfaInstants)(
    'should be within the pinned envelope of IAU 2006/2000A at $datetime',
    reference => {
      const when = new Date(reference.datetime)

      for (const star of reference.stars) {
        const target = { ra: star.ra, dec: star.dec }

        // The apparent place of the date, e.g., the catalogue coordinate displaced by the corrections for the
        // frame bias, the precession of the equinoxes, the nutation and the annual aberration in turn, each about
        // the place the one before it resolves:
        const bias = getCorrectionToEquatorialForFrameBias(target)

        const J2000 = { ra: target.ra + bias.ra, dec: target.dec + bias.dec }

        const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(when, J2000)

        const mean = { ra: J2000.ra + precession.ra, dec: J2000.dec + precession.dec }

        const nutation = getCorrectionToEquatorialForNutation(when, mean)

        const aberration = getCorrectionToEquatorialForAnnualAberration(when, mean)

        const apparent = {
          ra: mean.ra + nutation.ra + aberration.ra,
          dec: mean.dec + nutation.dec + aberration.dec
        }

        const separation = getAngularSeparation(
          { θ: apparent.dec, φ: apparent.ra },
          { θ: star.apparent.dec, φ: star.apparent.ra }
        )

        // The first order corrections to the right ascension divide by the cosine of the declination, and so a
        // star near a celestial pole is held to the polar envelope:
        const tolerance =
          Math.abs(star.dec) < POLAR_DECLINATION
            ? APPARENT_PLACE_TOLERANCE
            : APPARENT_PLACE_POLAR_TOLERANCE

        expect(separation).toBeLessThan(tolerance)
      }
    }
  )
})

/*****************************************************************************************************************/
