/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/ecliptic
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getEclipticPlane } from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

/*****************************************************************************************************************/

describe('getEclipticPlane', () => {
  it('should be defined', () => {
    expect(getEclipticPlane).toBeDefined()
  })

  it('should return the correct amount of coordinate points of the ecliptic plane for the given datetime', () => {
    const ecliptic = getEclipticPlane(datetime)
    expect(ecliptic.length).toBe(366)
  })
})

/*****************************************************************************************************************/
