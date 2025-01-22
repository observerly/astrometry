/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/aberration
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate, getCorrectionToEquatorialForAnnualAbberation } from '../src'

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

describe('getCorrectionToEquatorialForAnnualAbberation', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForAnnualAbberation).toBeDefined()
  })

  it('should return the correct abberation correction for the J2000 default epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAnnualAbberation(
      new Date('2000-01-01T00:00:00+00:00'),
      betelgeuse
    )
    expect(ra + betelgeuse.ra).toBe(88.79868732900589)
    expect(dec + betelgeuse.dec).toBe(7.4068039145745)
  })

  it('should return the correct abberation correction for the designated epoch', () => {
    const { ra, dec } = getCorrectionToEquatorialForAnnualAbberation(datetime, betelgeuse)
    expect(ra + betelgeuse.ra).toBe(88.78837512114575)
    expect(dec + betelgeuse.dec).toBe(7.406109156062398)
  })
})

/*****************************************************************************************************************/
