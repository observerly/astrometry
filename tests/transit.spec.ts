/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  doesBodyRiseOrSet,
  type EquatorialCoordinate,
  type GeographicCoordinate,
  getBodyNextRise,
  getBodyNextSet,
  getBodyTransit,
  isBodyAboveHorizon,
  isBodyCircumpolar,
  isBodyVisible,
  isBodyVisibleForNight
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
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

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

  it('should return false for an object that does not set below the horizon', () => {
    expect(
      isBodyCircumpolar(
        {
          latitude: -latitude,
          longitude
        },
        betelgeuse,
        0
      )
    ).toBe(false)
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

describe('doesBodyRiseOrSet', () => {
  it('should be defined', () => {
    expect(doesBodyRiseOrSet).toBeDefined()
  })

  it('should return transit parameters for a northerm hemisphere object for a postive latitude', () => {
    expect(
      doesBodyRiseOrSet(
        {
          latitude,
          longitude
        },
        betelgeuse
      )
    ).toEqual({
      Ar: 0.13703602843777568,
      H1: 0.04685668397579211
    })
  })

  it('should return false for a nothern hemisphere object for a negative latitude', () => {
    expect(
      doesBodyRiseOrSet(
        {
          latitude: -85,
          longitude
        },
        polaris
      )
    ).toBe(false)
  })
})

/*****************************************************************************************************************/

describe('getBodyTransit', () => {
  it('should be defined', () => {
    expect(getBodyTransit).toBeDefined()
  })

  it('should return transit parameters for a northerm hemisphere object for a postive latitude', () => {
    const transit = getBodyTransit(
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    if (!transit) {
      expect(transit).toBeDefined()
      return
    }

    const { LSTr, LSTs, R, S } = transit

    expect(LSTr).toBe(23.740485646638913)
    expect(LSTs).toBe(12.098575460027751)
    expect(R).toBeCloseTo(82.12362992591511)
    expect(S).toBeCloseTo(277.8763700740849)
  })
})

/*****************************************************************************************************************/

describe('getBodyNextRise', () => {
  it('should be defined', () => {
    expect(getBodyNextRise).toBeDefined()
  })

  it('should return transit parameters for a northerm hemisphere object for a postive latitude', () => {
    const rise = getBodyNextRise(
      new Date('2021-05-14T21:00:00.000+00:00'),
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(rise).toBeDefined()
    expect(rise).not.toBeFalsy()
    expect(rise).not.toBe(true)

    if (!rise) {
      expect(rise).toBeDefined()
      return
    }

    const { GST, LST, az, datetime: d } = rise

    expect(GST).toBe(10.105025246638917)
    expect(LST).toBe(23.740485646638913)
    expect(az).toBeCloseTo(82.12362992591511)
    expect(d).toStrictEqual(new Date('2021-05-15T18:31:28.713Z'))
  })

  it('should return transit parameters for a souther hemisphere object for a postive latitude', () => {
    const rise = getBodyNextRise(
      new Date('2021-10-01T21:00:00.000+00:00'),
      {
        latitude: -latitude,
        longitude
      },
      betelgeuse
    )

    expect(rise).toBeDefined()
    expect(rise).not.toBeFalsy()
    expect(rise).not.toBe(true)

    if (typeof rise === 'boolean') return

    const { GST, LST, az, datetime: d } = rise

    expect(GST).toBe(10.46311506002775)
    expect(LST).toBe(0.09857546002774953)
    expect(az).toBeCloseTo(82.12362992591511)
    expect(d).toStrictEqual(new Date('2021-10-02T09:42:26.990Z'))
  })
})

/*****************************************************************************************************************/

describe('getBodyNextSet', () => {
  it('should be defined', () => {
    expect(getBodyNextSet).toBeDefined()
  })

  it('should return transit parameters for a northerm hemisphere object for a postive latitude', () => {
    const set = getBodyNextSet(
      new Date('2021-05-14T07:00:00.000+00:00'),
      {
        latitude,
        longitude
      },
      betelgeuse
    )

    expect(set).toBeDefined()
    expect(set).not.toBeFalsy()
    expect(set).not.toBe(true)

    if (typeof set === 'boolean') return

    const { GST, LST, az, datetime: d } = set

    expect(GST).toBe(22.463115060027754)
    expect(LST).toBe(12.098575460027751)
    expect(az).toBeCloseTo(277.8763700740849)
    expect(d).toStrictEqual(new Date('2021-05-15T06:54:52.253Z'))
  })
})

/*****************************************************************************************************************/

describe('isBodyVisibleForNight', () => {
  it('should be defined', () => {
    expect(isBodyVisibleForNight).toBeDefined()
  })

  it('should return true for Polaris on January 1st 2021 at midnight', () => {
    expect(
      isBodyVisibleForNight(
        new Date('2021-01-01T12:00:00.000+00:00'),
        {
          latitude,
          longitude
        },
        polaris
      )
    ).toBe(true)
  })

  it('should return true for Betelgeuse on January 1st 2021 at midnight', () => {
    expect(
      isBodyVisibleForNight(
        new Date('2021-01-01T12:00:00.000+00:00'),
        {
          latitude: 56.130366,
          longitude
        },
        betelgeuse
      )
    ).toBe(true)
  })

  it('should return false for Betelgeuse on July 1st 2021 at midnight', () => {
    expect(
      isBodyVisibleForNight(
        new Date('2021-06-01T12:00:00.000+00:00'),
        {
          latitude: 56.130366,
          longitude
        },
        betelgeuse
      )
    ).toBe(false)
  })

  it('should return false for Canopus on September 1st 2021 at midnight', () => {
    expect(
      isBodyVisibleForNight(
        new Date('2021-09-01T12:00:00.000+00:00'),
        {
          latitude: 56.130366,
          longitude
        },
        {
          ra: 95.9879167,
          dec: -52.6956944
        }
      )
    ).toBe(false)
  })
})

/*****************************************************************************************************************/

describe('getBodyNextRise and getBodyNextSet maximum call stack size error', () => {
  it('should not throw a maximum call stack size exceeded error for Messier 4', () => {
    const datetime = new Date('2024-05-31T22:38:21.424Z')

    expect(datetime).toMatchObject(new Date(2024, 4, 31, 22, 38, 21, 424))

    const observer: GeographicCoordinate = {
      latitude: 43.5314582,
      longitude: 5.4483161
    }

    const target: EquatorialCoordinate = {
      ra: 246.275,
      dec: -26.58349
    }

    const set = getBodyNextSet(datetime, observer, target, 0.8190762287002356)

    console.log(set)

    expect(set).toBeDefined()

    const rise = getBodyNextRise(datetime, observer, target, 0.8190762287002356)

    console.log(rise)

    expect(rise).toBeDefined()
  })

  it('should not throw a maximum call stack size exceeded error for Messier 57', () => {
    const datetime = new Date('2024-05-31T22:38:21.424Z')

    expect(datetime).toMatchObject(new Date(2024, 4, 31, 22, 38, 21, 424))

    const observer: GeographicCoordinate = {
      latitude: 43.5314582,
      longitude: 5.4483161
    }

    const target: EquatorialCoordinate = {
      ra: 283.395875,
      dec: 33.028583
    }

    const set = getBodyNextSet(datetime, observer, target, 0.8190762287002356)

    console.log(set)

    expect(set).toBeDefined()

    const rise = getBodyNextRise(datetime, observer, target, 0.8190762287002356)

    console.log(rise)

    expect(rise).toBeDefined()
  })

  it('should not throw a maximum call stack size exceeded error for arbitary target', () => {
    const datetime = new Date('2024-05-31T22:38:21.424Z')

    expect(datetime).toMatchObject(new Date(2024, 4, 31, 22, 38, 21, 424))

    const observer: GeographicCoordinate = {
      latitude: 43.5314582,
      longitude: 5.4483161
    }

    const target: EquatorialCoordinate = {
      ra: 83.63320833333333,
      dec: 22.01447222222222
    }

    const set = getBodyNextSet(datetime, observer, target, 0.8190762287002356)

    console.log(set)

    expect(set).toBeDefined()

    const rise = getBodyNextRise(datetime, observer, target, 0.8190762287002356)

    console.log(rise)

    expect(rise).toBeDefined()
  })
})

/*****************************************************************************************************************/
