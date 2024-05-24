/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/iers
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { LEAP_SECONDS } from '../src'

/*****************************************************************************************************************/

const IANA_LEAP_SECONDS_ENDPOINT = 'https://data.iana.org/time-zones/data/leap-seconds.list'

/*****************************************************************************************************************/

// feat: add iana derived LEAP_SECONDS timestamps array in @observerly/astrometry.
describe('LEAP_SECONDS', () => {
  it('should be well defined', () => {
    expect(LEAP_SECONDS).toBeDefined()
    expect(LEAP_SECONDS).toBeInstanceOf(Array)
  })

  it(`should contain ${28} elements`, () => {
    expect(LEAP_SECONDS).toHaveLength(28)
  })

  it('should be sorted in ascending order', () => {
    const sorted = [...LEAP_SECONDS.map(record => record.unix)].sort((a, b) => a - b)
    expect(LEAP_SECONDS.map(record => record.unix)).toEqual(sorted)
  })

  it('should validate against the IANA published leap seconds listing', async () => {
    // Fetch the IANA leap seconds listing:
    const response = await fetch(IANA_LEAP_SECONDS_ENDPOINT)
    // Return the response as text:
    const text = await response.text()

    // Extract leap second data:
    const leapSeconds = text
      .split('\n')
      .filter(line => /^\d+\s+\d+\s+#/.test(line))
      .map(line => {
        const [ntp, dtai] = line.trim().split(/\s+/)

        const unix = (parseInt(ntp, 10) - 2208988800) * 1000

        return {
          ntp: parseInt(ntp, 10),
          unix: unix, // NTP to Unix time conversion in milliseconds
          dtai: parseInt(dtai, 10),
          when: new Date(unix)
        }
      })

    expect(LEAP_SECONDS).toEqual(leapSeconds)
  })
})

/*****************************************************************************************************************/
