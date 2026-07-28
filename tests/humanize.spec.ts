/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/humanize
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  formatDegreeToDMSHumanized,
  formatDegreeToHMSHumanized
} from '../src'

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
    expect(humanised).toBe('+07° 24\' 25.430"')
  })

  it('should return the correct humanized value for Spica', () => {
    const spica: EquatorialCoordinate = {
      ra: 201.2983,
      dec: -11.1614
    }

    const humanised = formatDegreeToDMSHumanized(spica.dec)
    expect(humanised).toBe('-11° 09\' 41.040"')
  })

  it('should return the correct humanized value for -2 degrees', () => {
    const humanised = formatDegreeToDMSHumanized(-2)
    expect(humanised).toBe('-02° 00\' 00.000"')
  })

  it('should return the correct humanized value for a value between -1 and 0 degrees', () => {
    // The degrees component is zero for such a value, and so the sign is carried by the value
    // given, and not by its degrees component:
    expect(formatDegreeToDMSHumanized(-0.5)).toBe('-00° 30\' 00.000"')
    expect(formatDegreeToDMSHumanized(-0.008)).toBe('-00° 00\' 28.800"')
  })

  it('should return the correct humanized value for a value between 0 and 1 degrees', () => {
    expect(formatDegreeToDMSHumanized(0.5)).toBe('+00° 30\' 00.000"')
  })

  it('should return the correct humanized value for zero degrees', () => {
    expect(formatDegreeToDMSHumanized(0)).toBe('+00° 00\' 00.000"')
  })
})

/*****************************************************************************************************************/

describe('formatDegreeToHMSHumanized', () => {
  it('should be defined', () => {
    expect(formatDegreeToHMSHumanized).toBeDefined()
  })

  it('should return the correct humanized value for Betelgeuse', () => {
    const betelgeuse: EquatorialCoordinate = {
      ra: 88.7929583,
      dec: 7.4070639
    }

    const humanised = formatDegreeToHMSHumanized(betelgeuse.ra)
    expect(humanised).toBe('05ʰ 55ᵐ 10.310ˢ')
  })

  it('should return the correct humanized value for Spica', () => {
    const spica: EquatorialCoordinate = {
      ra: 201.2983,
      dec: -11.1614
    }

    const humanised = formatDegreeToHMSHumanized(spica.ra)
    expect(humanised).toBe('13ʰ 25ᵐ 11.592ˢ')
  })

  it('should return the correct humanized value for -2 degrees', () => {
    const humanised = formatDegreeToHMSHumanized(-2)
    expect(humanised).toBe('23ʰ 52ᵐ 00.000ˢ')
  })
})

/*****************************************************************************************************************/
