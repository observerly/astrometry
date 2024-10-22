/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  convertEquatorialToHorizontal,
  getCorrectionToHorizontalForRefraction,
  getRefraction
} from '../src'

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

describe('getRefraction', () => {
  it('should be defined', () => {
    expect(getRefraction).toBeDefined()
  })

  it('should return the refraction correction to the observed object', () => {
    const target = convertEquatorialToHorizontal(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(target.az).toBe(134.44877920325155)
    expect(target.alt).toBe(72.78539444063765)

    const R = getRefraction(target, 283.15, 101325)
    expect(R).toBe(0.005224159687428409)
  })
})

/*****************************************************************************************************************/

describe('getCorrectionToHorizontalForRefractione', () => {
  it('should be defined', () => {
    expect(getCorrectionToHorizontalForRefraction).toBeDefined()
  })

  it('should return the correctly adjusted horizontal coordinate adjusted for atmospheric refraction', () => {
    const target = convertEquatorialToHorizontal(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(target.az).toBe(134.44877920325155)
    expect(target.alt).toBe(72.78539444063765)

    const { alt, az } = getCorrectionToHorizontalForRefraction(target)
    expect(az).toBe(target.az)
    expect(alt).toBeGreaterThanOrEqual(72.79061860032508)
    expect(alt).toBeLessThanOrEqual(73.0)
  })
})

/*****************************************************************************************************************/
