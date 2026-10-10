/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/tle
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { parseTwoLineElement } from '../../src/tle'

import { tleCorruptedReferences, tleReferences } from './tle'

/*****************************************************************************************************************/

// The tolerances below are the error envelope of the parser as it stands, measured against the references of the
// reference implementation, and pinned with a modest headroom so that a regression beyond the current envelope
// fails. The envelope is that of the conversion of the references from the units of the reference, e.g., radians,
// back to the units of the format, e.g., degrees, and not of the parser, which resolves every field exactly.

/*****************************************************************************************************************/

// The epoch, as a Julian date (in days), e.g., ~86 microseconds, beneath the ~0.86 milliseconds the format resolves:
const EPOCH_TOLERANCE = 1e-9

/*****************************************************************************************************************/

// The angles of the orbit, e.g., the inclination, the right ascension of the ascending node, the argument of perigee
// and the mean anomaly (in degrees):
const ANGLE_TOLERANCE = 1e-12

/*****************************************************************************************************************/

// The eccentricity of the orbit (dimensionless):
const ECCENTRICITY_TOLERANCE = 1e-15

/*****************************************************************************************************************/

// The mean motion of the orbit (in revolutions per day):
const MEAN_MOTION_TOLERANCE = 1e-13

/*****************************************************************************************************************/

// The first and second time derivatives of the mean motion (in revolutions per day² and per day³), and the B* drag
// term (in inverse Earth radii):
const DERIVATIVE_TOLERANCE = 1e-16

/*****************************************************************************************************************/

describe('parseTwoLineElement conformance against the reference implementation of SGP4', () => {
  for (const reference of tleReferences) {
    describe(`satellite ${reference.satellite} at the epoch ${reference.epoch}`, () => {
      const tle = parseTwoLineElement(reference.line1, reference.line2)

      it('should resolve the satellite number, classification and designator exactly', () => {
        expect(tle.satellite).toBe(reference.satellite)
        expect(tle.classification).toBe(reference.classification)
        expect(tle.designator).toBe(reference.designator)
      })

      it('should resolve the ephemeris type, element set number and revolution number exactly', () => {
        expect(tle.ephemeris).toBe(reference.ephemeris)
        expect(tle.element).toBe(reference.element)
        expect(tle.revolution).toBe(reference.revolution)
      })

      it('should resolve the epoch within the tolerance', () => {
        expect(Math.abs(tle.epoch - reference.epoch)).toBeLessThan(EPOCH_TOLERANCE)
      })

      it('should resolve the angles of the orbit within the tolerance', () => {
        expect(Math.abs(tle.i - reference.i)).toBeLessThan(ANGLE_TOLERANCE)
        expect(Math.abs(tle.Ω - reference.Ω)).toBeLessThan(ANGLE_TOLERANCE)
        expect(Math.abs(tle.ω - reference.ω)).toBeLessThan(ANGLE_TOLERANCE)
        expect(Math.abs(tle.M - reference.M)).toBeLessThan(ANGLE_TOLERANCE)
      })

      it('should resolve the eccentricity within the tolerance', () => {
        expect(Math.abs(tle.e - reference.e)).toBeLessThan(ECCENTRICITY_TOLERANCE)
      })

      it('should resolve the mean motion within the tolerance', () => {
        expect(Math.abs(tle.n - reference.n)).toBeLessThan(MEAN_MOTION_TOLERANCE)
      })

      it('should resolve the derivatives of the mean motion and the drag term within the tolerance', () => {
        expect(Math.abs(tle.ndot - reference.ndot)).toBeLessThan(DERIVATIVE_TOLERANCE)
        expect(Math.abs(tle.nddot - reference.nddot)).toBeLessThan(DERIVATIVE_TOLERANCE)
        expect(Math.abs(tle.bstar - reference.bstar)).toBeLessThan(DERIVATIVE_TOLERANCE)
      })
    })
  }

  for (const { line1, line2 } of tleCorruptedReferences) {
    it(`should reject the corrupted element set of satellite ${line1.slice(2, 7)} by its checksum`, () => {
      expect(() => parseTwoLineElement(line1, line2)).toThrowError(/checksum/)
    })
  }
})

/*****************************************************************************************************************/
