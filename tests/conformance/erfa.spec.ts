/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/erfa
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForLightDeflection
} from '../../src/aberration'

import {
  getAngularSeparation,
  getGreenwichApparentSiderealTime,
  getGreenwichSiderealTime
} from '../../src/astrometry'

import { getObliquityOfTheEcliptic } from '../../src/ecliptic'

import {
  getCorrectionToEquatorialForNutation,
  getNutation,
  getTrueObliquityOfTheEcliptic
} from '../../src/nutation'

import { getCorrectionToEquatorialForAnnualParallax } from '../../src/parallax'

import {
  getCorrectionToEquatorialForFrameBias,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getFrameBiasMatrix
} from '../../src/precession'

import { ERFAFrameBiasMatrix, erfaCorrections, erfaInstants, erfaLightDeflections } from './erfa'

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

// The gravitational deflection of light by the Sun, against eraLdsun, e.g., to within 1 milliarcsecond from the limb
// of the Sun outwards, which is the envelope of the geometric direction of the Sun of the library (in degrees):
const LIGHT_DEFLECTION_TOLERANCE = 1 / 3600000

/*****************************************************************************************************************/

// The rotation of the nutation, against eraNumat, e.g., to within 2 milliarcseconds over the whole of the sphere,
// which is the envelope of the series of the nutation of the library (in degrees):
const NUTATION_ROTATION_TOLERANCE = 2 / 3600000

/*****************************************************************************************************************/

// The annual aberration, against eraAb, e.g., to within 1 milliarcsecond over the whole of the sphere, which is the
// envelope of the barycentric velocity of the Earth of the library of ~0.5 metres per second (in degrees):
const ANNUAL_ABERRATION_TOLERANCE = 1 / 3600000

/*****************************************************************************************************************/

// The annual parallax of a target of 0.768 arcseconds, against eraPmpx, e.g., to within 0.1 milliarcseconds over
// the whole of the sphere (in degrees):
const ANNUAL_PARALLAX_TOLERANCE = 0.1 / 3600000

/*****************************************************************************************************************/

// The equinox-based apparent place of a star away from the celestial poles, resolved as the catalogue coordinate
// carried to J2000.0 by the frame bias and displaced by the corrections for light deflection, annual aberration,
// precession and nutation in turn, against IAU 2006/2000A, e.g., to within 2 milliarcseconds (in degrees):
const APPARENT_PLACE_TOLERANCE = 2 / 3600000

/*****************************************************************************************************************/

// The equinox-based apparent place of a star near a celestial pole, resolved likewise, against IAU 2006/2000A (in
// degrees):
const APPARENT_PLACE_POLAR_TOLERANCE = 2 / 3600000

/*****************************************************************************************************************/

// The declination (in degrees) at or above which the apparent place of a star is held to the polar envelope, e.g.,
// the envelope of the corrections near the pole:
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

        // The catalogue coordinate is referred to the ICRS, and so it is carried to the mean equator and equinox
        // of J2000.0 by the frame bias, e.g., the frame the corrections of the library are referred from:
        const bias = getCorrectionToEquatorialForFrameBias(target)

        const J2000 = { ra: target.ra + bias.ra, dec: target.dec + bias.dec }

        // The apparent place of the date, e.g., the J2000.0 coordinate displaced by the gravitational deflection
        // of light and by the annual aberration within the frame of J2000.0, as eraAtciq displaces it within the
        // BCRS, carried to its mean place of the date by the correction for the precession of the equinoxes, and
        // from that mean place to the true equator and equinox of the date by the correction for the nutation,
        // given the mean place:
        const deflection = getCorrectionToEquatorialForLightDeflection(when, J2000)

        const deflected = { ra: J2000.ra + deflection.ra, dec: J2000.dec + deflection.dec }

        const aberration = getCorrectionToEquatorialForAnnualAberration(when, deflected)

        const aberrated = { ra: deflected.ra + aberration.ra, dec: deflected.dec + aberration.dec }

        const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(when, aberrated)

        const mean = { ra: aberrated.ra + precession.ra, dec: aberrated.dec + precession.dec }

        const nutation = getCorrectionToEquatorialForNutation(when, mean)

        const apparent = { ra: mean.ra + nutation.ra, dec: mean.dec + nutation.dec }

        const separation = getAngularSeparation(
          { θ: apparent.dec, φ: apparent.ra },
          { θ: star.apparent.dec, φ: star.apparent.ra }
        )

        // The corrections near a celestial pole are the most sensitive to the place they are resolved about, and
        // so a star near a celestial pole is held to the polar envelope:
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

describe('conformance of the light deflection to ERFA', () => {
  it.each(erfaLightDeflections)(
    'should be within the pinned envelope of eraLdsun at $datetime',
    reference => {
      const when = new Date(reference.datetime)

      for (const target of reference.targets) {
        const { ra, dec } = getCorrectionToEquatorialForLightDeflection(when, {
          ra: target.ra,
          dec: target.dec
        })

        // The displacement between the two deflections, with the right ascension scaled onto the sphere by the
        // cosine of the declination, as the deflections are small:
        const Δα = (ra - target.deflection.ra) * Math.cos((target.dec * Math.PI) / 180)

        const Δδ = dec - target.deflection.dec

        expect(Math.hypot(Δα, Δδ)).toBeLessThan(LIGHT_DEFLECTION_TOLERANCE)
      }
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the nutation, the annual aberration and the annual parallax to ERFA', () => {
  // The displacement between two coordinates, with the right ascension scaled onto the sphere by the cosine of the
  // declination, and taken the shorter of the two ways about it, as the displacements are small (in degrees):
  const getDisplacement = (
    a: { ra: number; dec: number },
    b: { ra: number; dec: number }
  ): number => {
    const Δα = ((((a.ra - b.ra + 180) % 360) + 360) % 360) - 180

    return Math.hypot(Δα * Math.cos((b.dec * Math.PI) / 180), a.dec - b.dec)
  }

  it.each(erfaCorrections)(
    'should rotate by the nutation within the pinned envelope of eraNumat at $datetime',
    reference => {
      const when = new Date(reference.datetime)

      for (const target of reference.targets) {
        const { ra, dec } = getCorrectionToEquatorialForNutation(when, target)

        expect(
          getDisplacement({ ra: target.ra + ra, dec: target.dec + dec }, target.nutated)
        ).toBeLessThan(NUTATION_ROTATION_TOLERANCE)
      }
    }
  )

  it.each(erfaCorrections)(
    'should displace by the annual aberration within the pinned envelope of eraAb at $datetime',
    reference => {
      const when = new Date(reference.datetime)

      for (const target of reference.targets) {
        const { ra, dec } = getCorrectionToEquatorialForAnnualAberration(when, target)

        expect(
          getDisplacement({ ra: target.ra + ra, dec: target.dec + dec }, target.aberrated)
        ).toBeLessThan(ANNUAL_ABERRATION_TOLERANCE)
      }
    }
  )

  it.each(erfaCorrections)(
    'should displace by the annual parallax within the pinned envelope of eraPmpx at $datetime',
    reference => {
      const when = new Date(reference.datetime)

      for (const target of reference.targets) {
        const { ra, dec } = getCorrectionToEquatorialForAnnualParallax(when, {
          ra: target.ra,
          dec: target.dec,
          parallax: reference.parallax
        })

        expect(
          getDisplacement({ ra: target.ra + ra, dec: target.dec + dec }, target.parallaxed)
        ).toBeLessThan(ANNUAL_PARALLAX_TOLERANCE)
      }
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the frame bias matrix to ERFA', () => {
  it('should agree with each element of the frame bias matrix of bp00', () => {
    const B = getFrameBiasMatrix()

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // N.B. The off-diagonal elements are of the order of 1e-7 radians, e.g., ~15 to ~17 mas, and so an
        // agreement to 1e-18 is an agreement to ~0.2 nanoarcseconds:
        expect(Math.abs(B[i][j] - ERFAFrameBiasMatrix[i][j])).toBeLessThan(i === j ? 1e-15 : 1e-18)
      }
    }
  })
})

/*****************************************************************************************************************/
