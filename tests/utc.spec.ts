/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { utc } from '../src/utc'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000-02:00')

/*****************************************************************************************************************/

describe('UTC', () => {
  it('should be defined', () => {
    expect(utc).toBeDefined()
  })

  it('should return the correct UTC of the given datetime with timezone', () => {
    const UTC = utc(datetime)
    expect(UTC.getTime()).toBe(new Date('2021-05-14T02:00:00.000Z').getTime())
  })

  it('should have a timezone offset of the known offset when conversion has been applied', () => {
    const UTC = utc(datetime)
    expect(UTC.getTimezoneOffset()).toBe(datetime.getTimezoneOffset())
  })
})

/*****************************************************************************************************************/
