/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/utilities
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import { type EquatorialCoordinate } from '../src'

import {
  convertDegreesToRadians,
  convertRadiansToDegrees,
  convertDegreeToDMS,
  convertDegreeToHMS,
  getNormalizedAzimuthalDegree,
  getNormalizedInclinationDegree
} from '../src/utilities'

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

describe('getNormalizedAzimuthalDegree', () => {
  it('should be defined', () => {
    expect(getNormalizedAzimuthalDegree).toBeDefined()
  })

  it('should correctly normalize a degree value to between 0 and 360', () => {
    let degree = getNormalizedAzimuthalDegree(361)
    expect(degree).toBe(1)

    degree = getNormalizedAzimuthalDegree(-1)
    expect(degree).toBe(359)

    degree = getNormalizedAzimuthalDegree(0)
    expect(degree).toBe(0)

    degree = getNormalizedAzimuthalDegree(360)
    expect(degree).toBe(0)

    degree = getNormalizedAzimuthalDegree(720)
    expect(degree).toBe(0)

    degree = getNormalizedAzimuthalDegree(-360)
    expect(degree).toBe(0)

    degree = getNormalizedAzimuthalDegree(-720)
    expect(degree).toBe(0)

    degree = getNormalizedAzimuthalDegree(540)
    expect(degree).toBe(180)

    degree = getNormalizedAzimuthalDegree(-540)
    expect(degree).toBe(180)

    degree = getNormalizedAzimuthalDegree(180)
    expect(degree).toBe(180)

    degree = getNormalizedAzimuthalDegree(390)
    expect(degree).toBe(30)
  })
})

/*****************************************************************************************************************/

describe('getNormalizedInclinationDegree', () => {
  it('should be defined', () => {
    expect(getNormalizedInclinationDegree).toBeDefined()
  })

  it('should correctly normalize a degree value to between -90 and 90', () => {
    let degree = getNormalizedInclinationDegree(91)
    expect(degree).toBe(89)

    degree = getNormalizedInclinationDegree(-91)
    expect(degree).toBe(-89)

    degree = getNormalizedInclinationDegree(0)
    expect(degree).toBe(0)

    degree = getNormalizedInclinationDegree(90)
    expect(degree).toBe(90)

    degree = getNormalizedInclinationDegree(-90)
    expect(degree).toBe(-90)

    degree = getNormalizedInclinationDegree(180)
    expect(degree).toBe(0)

    degree = getNormalizedInclinationDegree(-180)
    expect(degree).toBe(0)

    degree = getNormalizedInclinationDegree(270)
    expect(degree).toBe(-90)

    degree = getNormalizedInclinationDegree(-270)
    expect(degree).toBe(90)

    degree = getNormalizedInclinationDegree(120)
    expect(degree).toBe(60)

    degree = getNormalizedInclinationDegree(-130)
    expect(degree).toBe(-50)
  })
})

/*****************************************************************************************************************/

describe('convertDegreeToDMS', () => {
  it('should be defined', () => {
    expect(convertDegreeToDMS).toBeDefined()
  })

  it('should correctly convert a degree value to degrees, minutes and seconds for Betelgeuse', () => {
    const betelgeuse: EquatorialCoordinate = {
      ra: 88.7929583,
      dec: 7.4070639
    }

    const { deg, min, sec } = convertDegreeToDMS(betelgeuse.dec)
    expect(deg).toBe(7)
    expect(min).toBe(24)
    expect(sec).toBe(25.43)
  })

  it('should correctly convert a degree value to degrees, minutes and seconds for Spica', () => {
    const spica: EquatorialCoordinate = {
      ra: 201.2983,
      dec: -11.1614
    }

    const { deg, min, sec } = convertDegreeToDMS(spica.dec)
    expect(deg).toBe(-11)
    expect(min).toBe(9)
    expect(sec).toBe(41.04)
  })
})

/*****************************************************************************************************************/

describe('convertDegreeToHMS', () => {
  it('should be defined', () => {
    expect(convertDegreeToHMS).toBeDefined()
  })

  it('should correctly convert a degree value to hours, minutes and seconds for Betelgeuse', () => {
    const betelgeuse: EquatorialCoordinate = {
      ra: 88.7929583,
      dec: 7.4070639
    }

    const { hrs, min, sec } = convertDegreeToHMS(betelgeuse.ra)
    expect(hrs).toBe(5)
    expect(min).toBe(55)
    expect(sec).toBe(10.31)
  })

  it('should correctly convert a degree value to hours, minutes and seconds for Spica', () => {
    const spica: EquatorialCoordinate = {
      ra: 201.2983,
      dec: -11.1614
    }

    const { hrs, min, sec } = convertDegreeToHMS(spica.ra)
    expect(hrs).toBe(13)
    expect(min).toBe(25)
    expect(sec).toBe(11.592)
  })
})

/*****************************************************************************************************************/
