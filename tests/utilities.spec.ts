/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/utilities
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { convertDegreesToRadians } from '../src/utilities'

/*****************************************************************************************************************/

describe('onvertDegreesToRadians', () => {
  it('should be defined', () => {
    expect(convertDegreesToRadians).toBeDefined()
  })

  it('should convert degrees to radians correctly for 180°', () => {
    const radians = convertDegreesToRadians(180)
    expect(radians).toBe(Math.PI)
  })

  it('should convert degrees to radians correctly for 90°', () => {
    const radians = convertDegreesToRadians(90)
    expect(radians).toBe(Math.PI / 2)
  })

  it('should convert degrees to radians correctly for 45°', () => {
    const radians = convertDegreesToRadians(45)
    expect(radians).toBe(Math.PI / 4)
  })
})

/*****************************************************************************************************************/
