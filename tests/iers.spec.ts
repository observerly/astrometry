/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/iers
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it, vi } from 'vitest'

/*****************************************************************************************************************/

import { CURRENT_EXPIRY_UNIX_TIMESTAMP, LEAP_SECONDS } from '../src'

/*****************************************************************************************************************/

const IANA_LEAP_SECONDS_ENDPOINT = 'https://data.iana.org/time-zones/data/leap-seconds.list'

/*****************************************************************************************************************/

// feat: add iana derived LEAP_SECONDS timestamps array in @observerly/astrometry.
describe('CURRENT_EXPIRY_UNIX_TIMESTAMP', () => {
  it('should be defined', () => {
    expect(CURRENT_EXPIRY_UNIX_TIMESTAMP).toBeDefined()
  })

  it('should be the expiry of the current IERS leap second table', () => {
    expect(new Date(CURRENT_EXPIRY_UNIX_TIMESTAMP).toISOString()).toBe('2026-12-28T00:00:00.000Z')
  })

  it('should be the same expiry irrespective of the host timezone', async () => {
    const TZ = process.env.TZ

    // The expiry is resolved when the module is first evaluated, and so the module is re-evaluated
    // for each timezone under test:
    try {
      for (const timezone of ['Pacific/Auckland', 'America/New_York', 'Asia/Kolkata']) {
        process.env.TZ = timezone

        vi.resetModules()

        const { CURRENT_EXPIRY_UNIX_TIMESTAMP: expiry } = await import('../src/iers')

        expect(new Date(expiry).toISOString()).toBe('2026-12-28T00:00:00.000Z')
      }
    } finally {
      process.env.TZ = TZ
      vi.resetModules()
    }
  })
})

/*****************************************************************************************************************/

describe('LEAP_SECONDS', () => {
  it('should be well defined', () => {
    expect(LEAP_SECONDS).toBeDefined()
    expect(LEAP_SECONDS).toBeInstanceOf(Array)
  })

  it(`should contain ${28} elements`, () => {
    expect(LEAP_SECONDS).toHaveLength(28)
  })

  it('should end at the most recent leap second', () => {
    // No leap second has been introduced since the final entry of the table:
    const [last] = LEAP_SECONDS.slice(-1)

    expect(last.dtai).toBe(37)
    expect(last.when.toISOString()).toBe('2017-01-01T00:00:00.000Z')
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
