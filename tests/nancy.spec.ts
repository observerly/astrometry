/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/nancy
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { isNancyRomanRecord } from '../src/nancy'

/*****************************************************************************************************************/

describe('isNancyRomanRecord', () => {
  it('should return true for a valid NancyRomanRecord', () => {
    const validRecord = { ral: 1, rau: 2, decl: 3, name: 'Nancy' }
    expect(isNancyRomanRecord(validRecord)).toBe(true)
  })

  it('should return false for an invalid record with missing properties', () => {
    const invalidRecord = { ral: 1, rau: 2, decl: 3 }
    expect(isNancyRomanRecord(invalidRecord)).toBe(false)
  })

  it('should return false for null', () => {
    expect(isNancyRomanRecord(null)).toBe(false)
  })

  it('should return false for a non-object type', () => {
    expect(isNancyRomanRecord(42)).toBe(false)
  })

  it('should return false for an object with incorrect property types', () => {
    const invalidRecord = { ral: 1, rau: 'two', decl: 3, name: 'Nancy' }
    expect(isNancyRomanRecord(invalidRecord)).toBe(false)
  })
})

/*****************************************************************************************************************/
