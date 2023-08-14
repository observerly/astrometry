/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/utilities
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { convertDegreesToRadians, convertRadiansToDegrees } from '../src/utilities'

/*****************************************************************************************************************/

describe('convertDegreesToRadians', () => {
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

describe('convertRadiansToDegrees', () => {
  it('should be defined', () => {
    expect(convertRadiansToDegrees).toBeDefined()
  })

  it('should convert radians to degrees correctly for π', () => {
    const degrees = convertRadiansToDegrees(Math.PI)
    expect(degrees).toBe(180)
  })

  it('should convert radians to degrees correctly for π/2', () => {
    const degrees = convertRadiansToDegrees(Math.PI / 2)
    expect(degrees).toBe(90)
  })

  it('should convert radians to degrees correctly for π/4', () => {
    const degrees = convertRadiansToDegrees(Math.PI / 4)
    expect(degrees).toBe(45)
  })
})

/*****************************************************************************************************************/
