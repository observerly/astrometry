/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate, getCorrectionToEquatorialForAbberation } from '../src'

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

describe('getCorrectionToEquatorialForAbberation', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForAbberation).toBeDefined()
  })

  it('should return the angular separation between two objects', () => {
    const { ra, dec } = getCorrectionToEquatorialForAbberation(datetime, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.78837512114575)
    expect(dec + betelgeuse.dec).toBe(7.406109156062398)
  })
})

/*****************************************************************************************************************/
