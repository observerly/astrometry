/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  convertEclipticToEquatorial,
  convertGalacticToEquatorial,
  convertEquatorialToHorizontal
} from '../src'

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

/*****************************************************************************************************************/

describe('convertEclipticToEquatorial', () => {
  it('should be defined', () => {
    expect(convertEclipticToEquatorial).toBeDefined()
  })

  it('should return the correct equatorial coodinate for the planet Venus for the datetime provided', () => {
    const venus = {
      λ: 245.79403406596947,
      β: 1.8937944394473665
    }

    const { ra, dec } = convertEclipticToEquatorial(new Date('2016-01-04T03:00:00+00:00'), venus)
    expect(ra).toBe(244.24799409185357)
    expect(dec).toBe(-19.405675761170443)
  })
})

/*****************************************************************************************************************/

describe('convertEquatorialToHorizontal', () => {
  it('should be defined', () => {
    expect(convertEquatorialToHorizontal).toBeDefined()
  })

  it('should return the correct horizontal coodinate for the star Betelgeuse for the datetime provided', () => {
    const { alt, az } = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)
    expect(alt).toBe(72.78539444063765)
    expect(az).toBe(134.44877920325155)
  })
})

/*****************************************************************************************************************/

describe('convertGalacticToEquatorial', () => {
  it('should be defined', () => {
    expect(convertGalacticToEquatorial).toBeDefined()
  })

  it('should return the correct equatorial coodinate for the given galactic coordinate at J2000.0 epoch', () => {
    const { ra, dec } = convertGalacticToEquatorial({
      l: 180.0,
      b: 55.33333333
    })
    expect(ra).toBe(153.92856024361822)
    expect(dec).toBe(40.55960513183074)
  })
})

/*****************************************************************************************************************/
