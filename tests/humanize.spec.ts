/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/humanize
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate, formatDegreeToDMSHumanized } from '../src'

/*****************************************************************************************************************/

describe('formatDegreeToDMSHumanized', () => {
  it('should be defined', () => {
    expect(formatDegreeToDMSHumanized).toBeDefined()
  })

  it('should return the correct humanized value for Betelgeuse', () => {
    const betelgeuse: EquatorialCoordinate = {
      ra: 88.7929583,
      dec: 7.4070639
    }

    const humanised = formatDegreeToDMSHumanized(betelgeuse.dec)
    expect(humanised).toBe('+07° 24\' 25.43"')
  })

  it('should return the correct humanized value for Spica', () => {
    const spica: EquatorialCoordinate = {
      ra: 201.2983,
      dec: -11.1614
    }

    const humanised = formatDegreeToDMSHumanized(spica.dec)
    expect(humanised).toBe('-11° 09\' 41.04"')
  })

  it('should return the correct humanized value for -2 degrees', () => {
    const humanised = formatDegreeToDMSHumanized(-2)
    expect(humanised).toBe('-02° 00\' 00"')
  })
})

/*****************************************************************************************************************/
