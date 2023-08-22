/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/precession
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  getCorrectionToEquatorialForPrecessionOfEquinoxes
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing
const polaris: EquatorialCoordinate = { ra: 37.95454961, dec: 89.264113893 }

/*****************************************************************************************************************/

describe('getCorrectionToEquatorialForPrecessionOfEquinoxes', () => {
  it('should be defined', () => {
    expect(getCorrectionToEquatorialForPrecessionOfEquinoxes).toBeDefined()
  })

  it('should return the correct Lunar mean ecliptic longitude for the given date', () => {
    const { ra, dec } = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, polaris)
    expect(ra + polaris.ra).toBe(37.96789695343117)
    expect(dec + polaris.dec).toBe(89.26505189444276)
  })
})

/*****************************************************************************************************************/
