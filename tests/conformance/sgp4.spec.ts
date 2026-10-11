/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/sgp4
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { WGS72, WGS72OLD, WGS84 } from '../../src/gravity'

import { SGP4Error, SatelliteRecord } from '../../src/sgp4'

import { parseTwoLineElement } from '../../src/tle'

import { sgp4NearEarthReferences } from './sgp4'

/*****************************************************************************************************************/

// The tolerances below are the error envelope of the propagation as it stands, measured against the references of
// the reference implementation, and pinned with a modest headroom so that a regression beyond the current envelope
// fails. The envelope is that of the rounding of the arithmetic of the two implementations, e.g., ~0.2 micrometres
// in position and ~2 × 10⁻¹⁰ metres per second in velocity, far beneath the accuracy of the theory itself.

/*****************************************************************************************************************/

// The position of the object (in SI metres):
const POSITION_TOLERANCE = 1e-6

/*****************************************************************************************************************/

// The velocity of the object (in SI metres per second):
const VELOCITY_TOLERANCE = 1e-9

/*****************************************************************************************************************/

// The gravity models of the references, by name:
const GRAVITY_MODELS = { WGS72OLD, WGS72, WGS84 }

/*****************************************************************************************************************/

describe('SatelliteRecord conformance against the reference implementation of SGP4', () => {
  for (const reference of sgp4NearEarthReferences) {
    describe(`satellite ${reference.satellite} with the gravity model of ${reference.gravity}`, () => {
      const record = new SatelliteRecord(parseTwoLineElement(reference.line1, reference.line2), {
        gravity: GRAVITY_MODELS[reference.gravity]
      })

      for (const state of reference.states) {
        it(`should resolve the state vector at ${state.minutes} minutes within the tolerance`, () => {
          const { position, velocity } = record.getStateVectorAtMinutesSinceEpoch(state.minutes)

          // The references are in kilometres and kilometres per second:
          expect(
            Math.hypot(
              position.x - state.position[0] * 1000,
              position.y - state.position[1] * 1000,
              position.z - state.position[2] * 1000
            )
          ).toBeLessThan(POSITION_TOLERANCE)

          expect(
            Math.hypot(
              velocity.x - state.velocity[0] * 1000,
              velocity.y - state.velocity[1] * 1000,
              velocity.z - state.velocity[2] * 1000
            )
          ).toBeLessThan(VELOCITY_TOLERANCE)
        })
      }

      const failure = reference.error

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
