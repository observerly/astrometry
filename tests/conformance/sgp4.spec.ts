/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/sgp4
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { WGS72, WGS72OLD, WGS84 } from '../../src/gravity'

import { SGP4Error, SatelliteRecord } from '../../src/sgp4'

import { parseTwoLineElement } from '../../src/tle'

import { sgp4References } from './sgp4'

/*****************************************************************************************************************/

// The tolerances below are the error envelope of the propagation as it stands, measured against the references of
// the reference implementation, and pinned with a modest headroom so that a regression beyond the current envelope
// fails. The envelope is that of the rounding of the arithmetic of the two implementations, e.g., ~2 micrometres in
// position and ~2 × 10⁻¹⁰ metres per second in velocity, far beneath the accuracy of the theory itself.
//
// N.B. A propagation of a resonant orbit integrates its resonance in steps of 720 minutes from the epoch, and so the
// rounding of each step accumulates over a propagation of years, e.g., ~65 micrometres in position and ~7 × 10⁻⁹
// metres per second in velocity over the ~3.5 years of the longest propagation of the verification set, and so a
// propagation of more than a million minutes from the epoch is held to an envelope of its own.

/*****************************************************************************************************************/

// The position of the object (in SI metres):
const POSITION_TOLERANCE = 5e-6

/*****************************************************************************************************************/

// The velocity of the object (in SI metres per second):
const VELOCITY_TOLERANCE = 1e-9

/*****************************************************************************************************************/

// The time since the epoch (in minutes) beyond which a propagation is held to the envelope of a propagation of years:
const LONG_PROPAGATION = 1e6

/*****************************************************************************************************************/

// The position of the object, of a propagation of years (in SI metres):
const LONG_PROPAGATION_POSITION_TOLERANCE = 1e-4

/*****************************************************************************************************************/

// The velocity of the object, of a propagation of years (in SI metres per second):
const LONG_PROPAGATION_VELOCITY_TOLERANCE = 1e-8

/*****************************************************************************************************************/

// The gravity models of the references, by name:
const GRAVITY_MODELS = { WGS72OLD, WGS72, WGS84 }

/*****************************************************************************************************************/

describe('SatelliteRecord conformance against the reference implementation of SGP4', () => {
  for (const reference of sgp4References) {
    describe(`satellite ${reference.satellite} with the gravity model of ${reference.gravity} in the ${reference.mode} mode`, () => {
      const tle = parseTwoLineElement(reference.line1, reference.line2)

      const options = { gravity: GRAVITY_MODELS[reference.gravity], mode: reference.mode }

      const failure = reference.error

      // The reference implementation fails for an element set at its epoch as it initialises it, and
      // so the record is rejected as it is initialised:
      if (failure && failure.minutes === 0 && reference.states.length === 0) {
        it(`should fail as it is initialised with the error code ${failure.code}, as the reference does`, () => {
          let error: unknown

          try {
            new SatelliteRecord(tle, options)
          } catch (e) {
            error = e
          }

          expect(error).toBeInstanceOf(SGP4Error)
          expect((error as SGP4Error).code).toBe(failure.code)
        })

        return
      }

      const record = new SatelliteRecord(tle, options)

      for (const state of reference.states) {
        it(`should resolve the state vector at ${state.minutes} minutes within the tolerance`, () => {
          const { position, velocity } = record.getStateVectorAtMinutesSinceEpoch(state.minutes)

          const long = Math.abs(state.minutes) > LONG_PROPAGATION

          // The references are in kilometres and kilometres per second:
          expect(
            Math.hypot(
              position.x - state.position[0] * 1000,
              position.y - state.position[1] * 1000,
              position.z - state.position[2] * 1000
            )
          ).toBeLessThan(long ? LONG_PROPAGATION_POSITION_TOLERANCE : POSITION_TOLERANCE)

          expect(
            Math.hypot(
              velocity.x - state.velocity[0] * 1000,
              velocity.y - state.velocity[1] * 1000,
              velocity.z - state.velocity[2] * 1000
            )
          ).toBeLessThan(long ? LONG_PROPAGATION_VELOCITY_TOLERANCE : VELOCITY_TOLERANCE)
        })
      }

      if (failure) {
        it(`should fail at ${failure.minutes} minutes with the error code ${failure.code}, as the reference does`, () => {
          let error: unknown

          try {
            record.getStateVectorAtMinutesSinceEpoch(failure.minutes)
          } catch (e) {
            error = e
          }

          expect(error).toBeInstanceOf(SGP4Error)
          expect((error as SGP4Error).code).toBe(failure.code)
        })
      }
    })
  }
})

/*****************************************************************************************************************/
