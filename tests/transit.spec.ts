/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/epoch
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertEquatorialToHorizontal,
  doesBodyRiseOrSet,
  type EquatorialCoordinate,
  type GeographicCoordinate,
  getBodyNextRise,
  getBodyNextSet,
  getBodyTransit,
  isBodyAboveHorizon,
  isBodyCircumpolar,
  isBodyVisible,
  isBodyVisibleForNight,
  type Transit
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

  it('should determine the hemisphere of the observer from their latitude, and not from the horizon', () => {
    // For an observer just south of the equator, σ Octantis never sets below a
    // horizon of -6°, e.g., it is circumpolar, despite the observer's latitude
    // being greater than the horizon:
    expect(
      isBodyCircumpolar(
        {
          latitude: -3,
          longitude
        },
        sigmaOctantis,
        -6
      )
    ).toBe(true)
  })

  it('should return true for a northern hemisphere object that stays above the observer horizon', () => {
    // Polaris is at its lowest at an altitude of latitude + dec - 90 ≈ 19.1° for
    // the observer, and so it never sets below a horizon of 15°:
    expect(
      isBodyCircumpolar(
        {
          latitude,
          longitude
        },
        polaris,
        15
      )
    ).toBe(true)
  })

  it('should return false for a northern hemisphere object that sets below the observer horizon', () => {
    // Polaris is at its lowest at an altitude of latitude + dec - 90 ≈ 19.1° for
    // the observer, and so it does set below a horizon of 30°:
    expect(
      isBodyCircumpolar(
        {
          latitude,
          longitude
        },
        polaris,
        30
      )
    ).toBe(false)
  })

  it('should return true for a southern hemisphere object that stays above the observer horizon', () => {
    // σ Octantis is at its lowest at an altitude of ~18.8° for the observer, and
    // so it never sets below a horizon of 15°:
    expect(
      isBodyCircumpolar(
        {
          latitude: -latitude,
          longitude
        },
        sigmaOctantis,
        15
      )
    ).toBe(true)
  })

  it('should return false for a southern hemisphere object that sets below the observer horizon', () => {
    // σ Octantis is at its lowest at an altitude of ~18.8° for the observer, and
    // so it does set below a horizon of 20°:
    expect(
      isBodyCircumpolar(
        {
          latitude: -latitude,
          longitude
        },
        sigmaOctantis,
        20
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

describe('isBodyAboveHorizon for an elevated observer', () => {
  it('should see an object below the astronomical horizon that is above the depressed horizon', () => {
    // The local horizon of an observer at the elevation of Mauna Kea is depressed by ~1.9°, and so
    // an object at an altitude of -1° is above their local horizon, and below the horizon of an
    // observer at sea level:
    const target = { alt: -1, az: 90 }

    expect(isBodyAboveHorizon(datetime, { latitude, longitude, elevation: 4207 }, target, 0)).toBe(
      true
    )

    expect(isBodyAboveHorizon(datetime, { latitude, longitude }, target, 0)).toBe(false)
  })

  it('should not see an object below the depressed horizon', () => {
    const target = { alt: -3, az: 90 }

    expect(isBodyAboveHorizon(datetime, { latitude, longitude, elevation: 4207 }, target, 0)).toBe(
      false
    )
  })
})

/*****************************************************************************************************************/

describe('isBodyVisible and isBodyCircumpolar for an elevated observer', () => {
  it('should see an object whose culmination is below the horizon but above the depressed horizon', () => {
    // The object culminates at an altitude of ~29° for the observer, e.g., below a horizon of 30°,
    // but above the horizon of 30° as depressed by ~1.9° for the elevation of Mauna Kea:
    const target = { ra: 0, dec: latitude - 61 }

    expect(isBodyVisible({ latitude, longitude, elevation: 4207 }, target, 30)).toBe(true)

    expect(isBodyVisible({ latitude, longitude }, target, 30)).toBe(false)
  })

  it('should resolve an object as circumpolar when its lower culmination stays above the depressed horizon', () => {
    // Polaris is at its lowest at an altitude of ~19.1° for the observer, e.g., below a horizon of
    // 20°, but above the horizon of 20° as depressed for the elevation of Mauna Kea:
    expect(isBodyCircumpolar({ latitude, longitude, elevation: 4207 }, polaris, 20)).toBe(true)

    expect(isBodyCircumpolar({ latitude, longitude }, polaris, 20)).toBe(false)
  })

  it('should agree with isBodyAboveHorizon for an object above the depressed horizon alone', () => {
    // The object culminates at an altitude of ~-1°, e.g., below the astronomical horizon, and
    // above the depressed horizon of the elevated observer. Both predicates agree that it is
    // visible for the elevated observer, and that it is not for an observer at sea level:
    const target = { ra: 0, dec: latitude - 91 }

    const elevated = { latitude, longitude, elevation: 4207 }

    expect(isBodyVisible(elevated, target, 0)).toBe(true)
    expect(isBodyAboveHorizon(datetime, elevated, { alt: -1, az: 90 }, 0)).toBe(true)

    expect(isBodyVisible({ latitude, longitude }, target, 0)).toBe(false)
    expect(isBodyAboveHorizon(datetime, { latitude, longitude }, { alt: -1, az: 90 }, 0)).toBe(false)
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
      H1: 0.0468566839757921
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

  it('should return false for a body whose transit parameters are not finite', () => {
    // The transit parameters are not resolvable for an object at a pole, for an observer at a pole,
    // or for a horizon that is not a finite altitude, and so the body neither rises nor sets:
    expect(doesBodyRiseOrSet({ latitude, longitude }, { ra: 0, dec: 90 })).toBe(false)

    expect(doesBodyRiseOrSet({ latitude: 90, longitude }, { ra: 0, dec: 20 }, 15)).toBe(false)

    expect(
      doesBodyRiseOrSet({ latitude, longitude }, betelgeuse, Number.POSITIVE_INFINITY)
    ).toBe(false)

    expect(doesBodyRiseOrSet({ latitude, longitude }, betelgeuse, Number.NaN)).toBe(false)

    expect(doesBodyRiseOrSet({ latitude, longitude }, { ra: 0, dec: Number.NaN })).toBe(false)

    expect(doesBodyRiseOrSet({ latitude: Number.NaN, longitude }, betelgeuse)).toBe(false)
  })
})

/*****************************************************************************************************************/

// The number of sidereal hours for which a body is above the horizon of the observer, e.g., the
// arc it traces between rise and set, which wraps at 24 hours of local sidereal time:
const arc = ({ LSTr, LSTs }: Transit): number => (LSTs - LSTr + 24) % 24

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

  it('should resolve the transit at the horizon given by the caller', () => {
    // The body spends less of the day above a horizon that is raised above the astronomical
    // horizon, and it rises and sets further to the north for an observer in the northern
    // hemisphere:
    const astronomical = getBodyTransit({ latitude, longitude }, betelgeuse, 0)

    const raised = getBodyTransit({ latitude, longitude }, betelgeuse, 15)

    if (!astronomical || !raised) {
      expect(astronomical).toBeDefined()
      expect(raised).toBeDefined()
      return
    }

    expect(arc(raised)).toBeLessThan(arc(astronomical))

    expect(raised.R).toBeCloseTo(87.40427669101627)
    expect(raised.S).toBeCloseTo(272.5957233089837)
  })

  it('should resolve the transit at the depressed horizon of an elevated observer', () => {
    // The local horizon of an elevated observer is depressed below the astronomical horizon, and so
    // the body rises earlier, and sets later, than it does at sea level, and therefore spends more
    // of the day above the horizon:
    const sea = getBodyTransit({ latitude, longitude }, betelgeuse, 0)

    const summit = getBodyTransit({ latitude, longitude, elevation: 4000 }, betelgeuse, 0)

    if (!sea || !summit) {
      expect(sea).toBeDefined()
      expect(summit).toBeDefined()
      return
    }

    expect(arc(summit)).toBeGreaterThan(arc(sea))
  })

  it('should return undefined for a body that never reaches the horizon given by the caller', () => {
    // Betelgeuse culminates at an altitude of ~77.6° for the observer, and so it never reaches a
    // horizon of 80°:
    expect(getBodyTransit({ latitude, longitude }, betelgeuse, 80)).toBeUndefined()
  })

  it('should return undefined, and never a transit that is not a finite time, for a body whose transit parameters are not resolvable', () => {
    expect(getBodyTransit({ latitude, longitude }, { ra: 0, dec: Number.NaN })).toBeUndefined()

    expect(getBodyTransit({ latitude: Number.NaN, longitude }, betelgeuse)).toBeUndefined()

    expect(getBodyTransit({ latitude, longitude }, betelgeuse, Number.NaN)).toBeUndefined()
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

  it('should rise at the horizon given by the caller', () => {
    const rise = getBodyNextRise(
      datetime,
      {
        latitude,
        longitude
      },
      betelgeuse,
      15
    )

    // The body both rises and sets at the horizon given, and so a boolean, which reports that it
    // either never rises or never sets, is a failure and not a case to be skipped over:
    expect(typeof rise).not.toBe('boolean')

    if (typeof rise === 'boolean') {
      return
    }

    // The body is at the horizon given by the caller, and not at the astronomical horizon, at the
    // time of rise returned:
    const { alt, az } = convertEquatorialToHorizontal(
      rise.datetime,
      { latitude, longitude },
      betelgeuse
    )

    expect(alt).toBeCloseTo(15, 2)
    expect(az).toBeCloseTo(rise.az, 3)

    expect(rise.datetime).toStrictEqual(new Date('2021-05-14T19:39:18.123Z'))
  })

  it('should rise earlier for an elevated observer than it does at sea level', () => {
    // The local horizon of an elevated observer is depressed below the astronomical horizon, and so
    // the body crosses it earlier at rise:
    const sea = getBodyNextRise(datetime, { latitude, longitude }, betelgeuse, 0)

    const summit = getBodyNextRise(
      datetime,
      { latitude, longitude, elevation: 4000 },
      betelgeuse,
      0
    )

    if (typeof sea === 'boolean' || typeof summit === 'boolean') {
      expect(typeof sea).toBe('object')
      expect(typeof summit).toBe('object')
      return
    }

    expect(summit.datetime.getTime()).toBeLessThan(sea.datetime.getTime())
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

  it('should return false, and not recurse indefinitely, for an object that has no transit', () => {
    // The object circles the south celestial pole, which lies on the horizon of an observer at the
    // equator, and so it stays within 5° of the horizon and never crosses one that is depressed to
    // -12°. It is therefore visible at culmination, but has no transit for the observer on any day:
    expect(
      getBodyNextRise(
        datetime,
        {
          latitude: 0,
          longitude
        },
        { ra: 100, dec: -85 },
        -12
      )
    ).toBe(false)
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

  it('should set at the horizon given by the caller', () => {
    const set = getBodyNextSet(
      new Date('2021-05-14T07:00:00.000+00:00'),
      {
        latitude,
        longitude
      },
      betelgeuse,
      15
    )

    // The body both rises and sets at the horizon given, and so a boolean, which reports that it
    // either never rises or never sets, is a failure and not a case to be skipped over:
    expect(typeof set).not.toBe('boolean')

    if (typeof set === 'boolean') {
      return
    }

    // The body is at the horizon given by the caller, and not at the astronomical horizon, at the
    // time of set returned:
    const { alt, az } = convertEquatorialToHorizontal(
      set.datetime,
      { latitude, longitude },
      betelgeuse
    )

    expect(alt).toBeCloseTo(15, 2)
    expect(az).toBeCloseTo(set.az, 3)

    expect(set.datetime).toStrictEqual(new Date('2021-05-15T05:50:58.753Z'))
  })

  it('should return true, and not recurse indefinitely, for an object that has no transit', () => {
    // The object circles the south celestial pole, which lies on the horizon of an observer at the
    // equator, and so it stays within 5° of the horizon and never crosses one that is depressed to
    // -12°. It is therefore always above that horizon, and so it never sets:
    expect(
      getBodyNextSet(
        datetime,
        {
          latitude: 0,
          longitude
        },
        { ra: 100, dec: -85 },
        -12
      )
    ).toBe(true)
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

  it('should not modify the datetime given by the caller', () => {
    const when = new Date('2021-01-01T12:34:56.000+00:00')

    isBodyVisibleForNight(
      when,
      {
        latitude,
        longitude
      },
      polaris
    )

    expect(when.toISOString()).toBe('2021-01-01T12:34:56.000Z')
  })

  it('should return the same visibility irrespective of the host timezone', () => {
    // Betelgeuse is not visible for the night of the 31st May 2021 from Mauna Kea, but is
    // visible for the night before, e.g., the day boundary must be derived in UTC:
    const when = new Date('2021-05-31T03:00:00.000+00:00')

    const TZ = process.env.TZ

    try {
      for (const timezone of ['Pacific/Auckland', 'America/New_York']) {
        process.env.TZ = timezone

        expect(
          isBodyVisibleForNight(
            when,
            {
              latitude,
              longitude
            },
            betelgeuse
          )
        ).toBe(false)
      }
    } finally {
      process.env.TZ = TZ
    }
  })
})

/*****************************************************************************************************************/

describe('getBodyNextRise and getBodyNextSet maximum call stack size error', () => {
  it('should not throw a maximum call stack size exceeded error for Messier 4', () => {
    const datetime = new Date('2024-05-31T22:38:21.424Z')

    const d = new Date(2024, 4, 31, 22, 38, 21, 424)

    expect(datetime).toMatchObject(new Date(d.getTime() - d.getTimezoneOffset() * 60000))

    const observer: GeographicCoordinate = {
      latitude: 43.5314582,
      longitude: 5.4483161
    }

    const target: EquatorialCoordinate = {
      ra: 246.275,
      dec: -26.58349
    }

    const set = getBodyNextSet(datetime, observer, target, 0.8190762287002356)
    expect(set).toBeDefined()

    const rise = getBodyNextRise(datetime, observer, target, 0.8190762287002356)
    expect(rise).toBeDefined()
  })

  it('should not throw a maximum call stack size exceeded error for Messier 57', () => {
    const datetime = new Date('2024-05-31T22:38:21.424Z')

    const d = new Date(2024, 4, 31, 22, 38, 21, 424)

    expect(datetime).toMatchObject(new Date(d.getTime() - d.getTimezoneOffset() * 60000))

    const observer: GeographicCoordinate = {
      latitude: 43.5314582,
      longitude: 5.4483161
    }

    const target: EquatorialCoordinate = {
      ra: 283.395875,
      dec: 33.028583
    }

    const set = getBodyNextSet(datetime, observer, target, 0.8190762287002356)
    expect(set).toBeDefined()

    const rise = getBodyNextRise(datetime, observer, target, 0.8190762287002356)
    expect(rise).toBeDefined()
  })

  it('should not throw a maximum call stack size exceeded error for arbitary target', () => {
    const datetime = new Date('2024-05-31T22:38:21.424Z')

    const d = new Date(2024, 4, 31, 22, 38, 21, 424)

    expect(datetime).toMatchObject(new Date(d.getTime() - d.getTimezoneOffset() * 60000))

    const observer: GeographicCoordinate = {
      latitude: 43.5314582,
      longitude: 5.4483161
    }

    const target: EquatorialCoordinate = {
      ra: 83.63320833333333,
      dec: 22.01447222222222
    }

    const set = getBodyNextSet(datetime, observer, target, 0.8190762287002356)
    expect(set).toBeDefined()

    const rise = getBodyNextRise(datetime, observer, target, 0.8190762287002356)
    expect(rise).toBeDefined()
  })
})

/*****************************************************************************************************************/
