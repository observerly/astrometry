/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observation
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import {
  type EquatorialCoordinate,
  Observation,
  getAngularSeparation,
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForNutation,
  getCorrectionToEquatorialForPrecessionOfEquinoxes,
  getHourAngle
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

// For testing we will fix the elevant to be at Sea Level:
export const elevation = 0

// For testing
const polaris: EquatorialCoordinate = { ra: 37.95454961, dec: 89.264113893 }

/*****************************************************************************************************************/

describe('Observation', () => {
  it('should be defined', () => {
    expect(Observation).toBeDefined
  })

  it('should return a sensible value for the J2000 default epoch', () => {
    const Polaris = new Observation(polaris, {
      datetime: new Date('2000-01-01T00:00:00.000+00:00'),
      latitude,
      longitude
    })

    Polaris.at({
      datetime: new Date('2000-01-01T00:00:00.000+00:00')
    })

    expect(Polaris.ra).toBeCloseTo(38.192923035327546, 9)
    expect(Polaris.dec).toBeCloseTo(89.26695674949698, 9)
  })

  it('should be a reactive observable when the datetime changes', () => {
    const Polaris = new Observation(polaris, {
      datetime,
      latitude,
      longitude
    })

    Polaris.at({
      datetime
    })

    expect(Polaris.datetime.getTime()).toEqual(datetime.getTime())
    expect(Polaris.ra).toBeCloseTo(44.098238698701046, 9)
    expect(Polaris.dec).toBeCloseTo(89.3516600387926, 9)
    expect(Polaris.ha).toBe(getHourAngle(datetime, longitude, Polaris.ra))
  })

  it('should recompute the hour angle when the datetime changes', () => {
    const Polaris = new Observation(polaris, {
      datetime,
      latitude,
      longitude
    })

    // Advance the observation to a new datetime (six hours later):
    const updated = new Date('2021-05-14T06:00:00.000+00:00')

    Polaris.at({
      datetime: updated
    })

    // The hour angle is a function of the datetime (via the local sidereal time), so it must track
    // the updated datetime and stay consistent with the recomputed Right Ascension:
    expect(Polaris.datetime.getTime()).toEqual(updated.getTime())
    expect(Polaris.ha).toBe(getHourAngle(updated, longitude, Polaris.ra))
  })
})

/*****************************************************************************************************************/

describe('Observation for a target near the celestial pole', () => {
  // The composed corrections carry this target to within a few arcseconds of the north celestial
  // pole for the datetime, where the corrected coordinate is the most sensitive to the composition:
  const target: EquatorialCoordinate = { ra: 0, dec: 89.91108342 }

  const when = new Date('2015-12-22T00:00:00.000+00:00')

  it('should resolve a declination within the range of the sphere', () => {
    const observation = new Observation(target, { datetime: when, latitude, longitude })

    expect(observation.dec).toBeLessThanOrEqual(90)
    expect(observation.dec).toBeGreaterThanOrEqual(-90)

    expect(observation.ra).toBeGreaterThanOrEqual(0)
    expect(observation.ra).toBeLessThan(360)
  })

  it('should describe the same point on the celestial sphere as the corrected coordinate', () => {
    const observation = new Observation(target, { datetime: when, latitude, longitude })

    // The corrected coordinate, composed in sequence from the same corrections the observation
    // applies, each resolved about the place the one before it resolves:
    const aberration = getCorrectionToEquatorialForAnnualAberration(when, target)

    const aberrated = { ra: target.ra + aberration.ra, dec: target.dec + aberration.dec }

    const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(when, aberrated)

    const mean = { ra: aberrated.ra + precession.ra, dec: aberrated.dec + precession.dec }

    const nutation = getCorrectionToEquatorialForNutation(when, mean)

    const corrected = {
      θ: mean.dec + nutation.dec,
      φ: mean.ra + nutation.ra
    }

    // The angular separation between the corrected coordinate and the normalised coordinate of
    // the observation is zero if, and only if, both describe the same point on the sphere:
    expect(
      getAngularSeparation(corrected, { θ: observation.dec, φ: observation.ra })
    ).toBeCloseTo(0, 5)
  })
})

/*****************************************************************************************************************/
