/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  type EquatorialCoordinate,
  isBodyCircumpolar,
  isBodyVisible,
  isBodyAboveHorizon
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
const polaris: EquatorialCoordinate = { ra: 37.95456, dec: 89.264108 }

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 5.919529, dec: 7.407064 }

// For testings
const sigmaOctantis: EquatorialCoordinate = { ra: 21.07875, dec: -88.9569444 }

/*****************************************************************************************************************/

describe('isBodyCircumpolar', () => {
  it('should be defined', () => {
    expect(isBodyCircumpolar).toBeDefined()
  })

  it('should return true for northerm hemisphere circumpolar objects', () => {
    expect(
      isBodyCircumpolar(
        {
          latitude,
          longitude
        },
        polaris,
        0
      )
    ).toBe(true)
  })

  it('should return false for northerm hemisphere non-circumpolar objects', () => {
    expect(
      isBodyCircumpolar(
        {
          latitude,
          longitude
        },
        sigmaOctantis,
        0
      )
    ).toBe(false)
  })

  it('should return true for southern hemisphere circumpolar objects', () => {
    expect(
      isBodyCircumpolar(
        {
          latitude: -latitude,
          longitude
        },
        sigmaOctantis,
        0
      )
    ).toBe(true)
  })

  it('should return false for southern hemisphere non-circumpolar objects', () => {
    expect(
      isBodyCircumpolar(
        {
          latitude: -latitude,
          longitude
        },
        polaris,
        0
      )
    ).toBe(false)
  })

  it('should return false for an object that does set below the horizon', () => {
    expect(
      isBodyCircumpolar(
        {
          latitude,
          longitude
        },
        betelgeuse,
        0
      )
    ).toBe(false)
  })

  it('should return true for an object that does not set below the horizon', () => {
    expect(
      isBodyCircumpolar(
        {
          latitude: -latitude,
          longitude
        },
        betelgeuse,
        0
      )
    ).toBe(true)
  })
})

/*****************************************************************************************************************/

describe('isBodyVisible', () => {
  it('should be defined', () => {
    expect(isBodyVisible).toBeDefined()
  })

  it('should return true for a northerm hemisphere object for a postivie latitude', () => {
    expect(
      isBodyVisible(
        {
          latitude,
          longitude
        },
        betelgeuse,
        0
      )
    ).toBe(true)
  })

  it('should return false for a southern hemisphere object for a postivie latitude', () => {
    expect(
      isBodyVisible(
        {
          latitude,
          longitude
        },
        sigmaOctantis,
        0
      )
    ).toBe(false)
  })

  it('should return true for a southern hemisphere object for a negative latitude', () => {
    expect(
      isBodyVisible(
        {
          latitude: -latitude,
          longitude
        },
        betelgeuse,
        0
      )
    ).toBe(true)
  })

  it('should return false for a northerm hemisphere object for a negative latitude', () => {
    expect(
      isBodyVisible(
        {
          latitude: -latitude,
          longitude
        },
        polaris,
        0
      )
    ).toBe(false)
  })
})

/*****************************************************************************************************************/

describe('isBodyAboveHorizon', () => {
  it('should be defined', () => {
    expect(isBodyAboveHorizon).toBeDefined()
  })

  it('should return true for a northerm hemisphere object for a postivie latitude', () => {
    expect(
      isBodyAboveHorizon(
        datetime,
        {
          latitude,
          longitude
        },
        betelgeuse,
        0
      )
    ).toBe(true)
  })

  it('should return false for a southern hemisphere object for a postivie latitude', () => {
    expect(
      isBodyAboveHorizon(
        datetime,
        {
          latitude,
          longitude
        },
        sigmaOctantis,
        0
      )
    ).toBe(false)
  })

  it('should return true for a southern hemisphere object for a negative latitude', () => {
    expect(
      isBodyAboveHorizon(
        datetime,
        {
          latitude: -latitude,
          longitude
        },
        betelgeuse,
        0
      )
    ).toBe(true)
  })

  it('should return false for a northerm hemisphere object for a negative latitude', () => {
    expect(
      isBodyAboveHorizon(
        datetime,
        {
          latitude: -latitude,
          longitude
        },
        polaris,
        0
      )
    ).toBe(false)
  })
})

/*****************************************************************************************************************/
