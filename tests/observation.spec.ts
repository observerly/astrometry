/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/observation
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { type EquatorialCoordinate, Observation, getHourAngle } from '../src'

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

    expect(Polaris.ra).toBe(38.25053405665552)
    expect(Polaris.dec).toBe(89.26695677414656)
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
    expect(Polaris.ra).toBe(44.38754834841689)
    expect(Polaris.dec).toBe(89.35084011469124)
    expect(Polaris.ha).toBe(getHourAngle(datetime, longitude, Polaris.ra))
  })
})

/*****************************************************************************************************************/
