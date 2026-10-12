/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sgp4
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import { type GravityModel, WGS72, WGS84 } from '../src/gravity'

import {
  SatelliteRecord,
  type SatelliteRecordOptions,
  SGP4DecayedError,
  SGP4EphemerisTypeError,
  SGP4Error,
  SGP4MeanEccentricityError,
  SGP4MeanMotionError,
  SGP4PerturbedEccentricityError,
  SGP4SemiLatusRectumError
} from '../src/sgp4'

import { parseTwoLineElement } from '../src/tle'

/*****************************************************************************************************************/

describe('SGP4Error', () => {
  it('should be defined', () => {
    expect(SGP4Error).toBeDefined()
  })

  it('should be an error, and an SGP4 error', () => {
    const error = new SGP4Error('the orbit has decayed', 6)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(SGP4Error)
  })

  it('should carry its message, name and code', () => {
    const error = new SGP4Error('the orbit has decayed', 6)

    expect(error.message).toBe('the orbit has decayed')
    expect(error.name).toBe('SGP4Error')
    expect(error.code).toBe(6)
  })

  it('should carry no code for a failure the reference implementation does not report', () => {
    const error = new SGP4Error('the ephemeris type is not one SGP4 propagates')

    expect(error.code).toBeUndefined()
  })

  it('should type its code as one of the codes of the reference implementation, or undefined', () => {
    expectTypeOf<SGP4Error['code']>().toEqualTypeOf<1 | 2 | 3 | 4 | 6 | undefined>()
  })

  it('should not be constructed with a code that the reference implementation does not report', () => {
    // @ts-expect-error: the code 5 is no longer in use by the reference implementation:
    const retired = new SGP4Error('the satellite is underground', 5)

    // @ts-expect-error: the code 7 is not one the reference implementation reports:
    const invented = new SGP4Error('the satellite is unknown', 7)

    expect(retired).toBeInstanceOf(SGP4Error)
    expect(invented).toBeInstanceOf(SGP4Error)
  })

  it('should carry a stack trace', () => {
    expect(new SGP4Error('the orbit has decayed', 6).stack).toContain('SGP4Error')
  })

  it('should be caught by its class when it is thrown', () => {
    const propagate = () => {
      throw new SGP4Error('the orbit has decayed', 6)
    }

    expect(propagate).toThrowError(SGP4Error)
    expect(propagate).toThrowError(/the orbit has decayed/)
  })
})

/*****************************************************************************************************************/

describe('SGP4MeanEccentricityError', () => {
  it('should be defined', () => {
    expect(SGP4MeanEccentricityError).toBeDefined()
  })

  it('should be an error, an SGP4 error, and a SGP4MeanEccentricityError', () => {
    const error = new SGP4MeanEccentricityError(1.0002)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(SGP4Error)
    expect(error).toBeInstanceOf(SGP4MeanEccentricityError)
  })

  it('should carry its name, and the code 1 of the reference implementation', () => {
    const error = new SGP4MeanEccentricityError(1.0002)

    expect(error.name).toBe('SGP4MeanEccentricityError')
    expect(error.code).toBe(1)
  })

  it('should carry the mean eccentricity that it was raised for', () => {
    const error = new SGP4MeanEccentricityError(1.0002)

    expect(error.eccentricity).toBe(1.0002)
    expectTypeOf(error.eccentricity).toEqualTypeOf<number>()
  })

  it('should describe the failure in its message', () => {
    expect(new SGP4MeanEccentricityError(1.0002).message).toBe(
      'The mean eccentricity 1.0002 is not within [0, 1)'
    )
  })

  it('should be caught as an SGP4 error when it is thrown', () => {
    const propagate = () => {
      throw new SGP4MeanEccentricityError(1.0002)
    }

    expect(propagate).toThrowError(SGP4MeanEccentricityError)
    expect(propagate).toThrowError(SGP4Error)
  })
})

/*****************************************************************************************************************/

describe('SGP4MeanMotionError', () => {
  it('should be defined', () => {
    expect(SGP4MeanMotionError).toBeDefined()
  })

  it('should be an error, an SGP4 error, and a SGP4MeanMotionError', () => {
    const error = new SGP4MeanMotionError(-0.0001)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(SGP4Error)
    expect(error).toBeInstanceOf(SGP4MeanMotionError)
  })

  it('should carry its name, and the code 2 of the reference implementation', () => {
    const error = new SGP4MeanMotionError(-0.0001)

    expect(error.name).toBe('SGP4MeanMotionError')
    expect(error.code).toBe(2)
  })

  it('should carry the mean motion that it was raised for', () => {
    const error = new SGP4MeanMotionError(-0.0001)

    expect(error.n).toBe(-0.0001)
    expectTypeOf(error.n).toEqualTypeOf<number>()
  })

  it('should describe the failure in its message', () => {
    expect(new SGP4MeanMotionError(-0.0001).message).toBe(
      'The mean motion -0.0001 is not greater than zero'
    )
  })

  it('should be caught as an SGP4 error when it is thrown', () => {
    const propagate = () => {
      throw new SGP4MeanMotionError(-0.0001)
    }

    expect(propagate).toThrowError(SGP4MeanMotionError)
    expect(propagate).toThrowError(SGP4Error)
  })
})

/*****************************************************************************************************************/

describe('SGP4PerturbedEccentricityError', () => {
  it('should be defined', () => {
    expect(SGP4PerturbedEccentricityError).toBeDefined()
  })

  it('should be an error, an SGP4 error, and a SGP4PerturbedEccentricityError', () => {
    const error = new SGP4PerturbedEccentricityError(1.05)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(SGP4Error)
    expect(error).toBeInstanceOf(SGP4PerturbedEccentricityError)
  })

  it('should carry its name, and the code 3 of the reference implementation', () => {
    const error = new SGP4PerturbedEccentricityError(1.05)

    expect(error.name).toBe('SGP4PerturbedEccentricityError')
    expect(error.code).toBe(3)
  })

  it('should carry the perturbed eccentricity that it was raised for', () => {
    const error = new SGP4PerturbedEccentricityError(1.05)

    expect(error.eccentricity).toBe(1.05)
    expectTypeOf(error.eccentricity).toEqualTypeOf<number>()
  })

  it('should describe the failure in its message', () => {
    expect(new SGP4PerturbedEccentricityError(1.05).message).toBe(
      'The perturbed eccentricity 1.05 is not within [0, 1]'
    )
  })

  it('should be caught as an SGP4 error when it is thrown', () => {
    const propagate = () => {
      throw new SGP4PerturbedEccentricityError(1.05)
    }

    expect(propagate).toThrowError(SGP4PerturbedEccentricityError)
    expect(propagate).toThrowError(SGP4Error)
  })
})

/*****************************************************************************************************************/

describe('SGP4SemiLatusRectumError', () => {
  it('should be defined', () => {
    expect(SGP4SemiLatusRectumError).toBeDefined()
  })

  it('should be an error, an SGP4 error, and a SGP4SemiLatusRectumError', () => {
    const error = new SGP4SemiLatusRectumError(-0.25)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(SGP4Error)
    expect(error).toBeInstanceOf(SGP4SemiLatusRectumError)
  })

  it('should carry its name, and the code 4 of the reference implementation', () => {
    const error = new SGP4SemiLatusRectumError(-0.25)

    expect(error.name).toBe('SGP4SemiLatusRectumError')
    expect(error.code).toBe(4)
  })

  it('should carry the semi-latus rectum that it was raised for', () => {
    const error = new SGP4SemiLatusRectumError(-0.25)

    expect(error.p).toBe(-0.25)
    expectTypeOf(error.p).toEqualTypeOf<number>()
  })

  it('should describe the failure in its message', () => {
    expect(new SGP4SemiLatusRectumError(-0.25).message).toBe(
      'The semi-latus rectum -0.25 is less than zero'
    )
  })

  it('should be caught as an SGP4 error when it is thrown', () => {
    const propagate = () => {
      throw new SGP4SemiLatusRectumError(-0.25)
    }

    expect(propagate).toThrowError(SGP4SemiLatusRectumError)
    expect(propagate).toThrowError(SGP4Error)
  })
})

/*****************************************************************************************************************/

describe('SGP4DecayedError', () => {
  it('should be defined', () => {
    expect(SGP4DecayedError).toBeDefined()
  })

  it('should be an error, an SGP4 error, and a SGP4DecayedError', () => {
    const error = new SGP4DecayedError(0.98)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(SGP4Error)
    expect(error).toBeInstanceOf(SGP4DecayedError)
  })

  it('should carry its name, and the code 6 of the reference implementation', () => {
    const error = new SGP4DecayedError(0.98)

    expect(error.name).toBe('SGP4DecayedError')
    expect(error.code).toBe(6)
  })

  it('should carry the radius that it was raised for', () => {
    const error = new SGP4DecayedError(0.98)

    expect(error.radius).toBe(0.98)
    expectTypeOf(error.radius).toEqualTypeOf<number>()
  })

  it('should describe the failure in its message', () => {
    expect(new SGP4DecayedError(0.98).message).toBe(
      'The orbit has decayed, as its radius of 0.98 Earth radii is less than that of the Earth'
    )
  })

  it('should be caught as an SGP4 error when it is thrown', () => {
    const propagate = () => {
      throw new SGP4DecayedError(0.98)
    }

    expect(propagate).toThrowError(SGP4DecayedError)
    expect(propagate).toThrowError(SGP4Error)
  })
})

/*****************************************************************************************************************/

describe('SGP4EphemerisTypeError', () => {
  it('should be defined', () => {
    expect(SGP4EphemerisTypeError).toBeDefined()
  })

  it('should be an error, an SGP4 error, and a SGP4EphemerisTypeError', () => {
    const error = new SGP4EphemerisTypeError(4)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(SGP4Error)
    expect(error).toBeInstanceOf(SGP4EphemerisTypeError)
  })

  it('should carry its name, and no code, as the reference implementation does not report it', () => {
    const error = new SGP4EphemerisTypeError(4)

    expect(error.name).toBe('SGP4EphemerisTypeError')
    expect(error.code).toBeUndefined()
  })

  it('should carry the ephemeris type that it was raised for', () => {
    const error = new SGP4EphemerisTypeError(4)

    expect(error.ephemeris).toBe(4)
    expectTypeOf(error.ephemeris).toEqualTypeOf<number>()
  })

  it('should describe the failure in its message', () => {
    expect(new SGP4EphemerisTypeError(4).message).toBe(
      'The ephemeris type 4 is not one that SGP4 propagates'
    )
  })

  it('should be caught as an SGP4 error when it is thrown', () => {
    const propagate = () => {
      throw new SGP4EphemerisTypeError(4)
    }

    expect(propagate).toThrowError(SGP4EphemerisTypeError)
    expect(propagate).toThrowError(SGP4Error)
  })
})

/*****************************************************************************************************************/

describe('SatelliteRecordOptions', () => {
  it('should type literal options, read back by gravity model and mode', () => {
    const options: SatelliteRecordOptions = { gravity: WGS84, mode: 'afspc' }

    expectTypeOf(options).toEqualTypeOf<SatelliteRecordOptions>()
    expect(options.gravity).toBe(WGS84)
    expect(options.mode).toBe('afspc')
  })

  it('should type every option as optional, e.g., such that the options may be empty', () => {
    const options: SatelliteRecordOptions = {}

    expectTypeOf<SatelliteRecordOptions['gravity']>().toEqualTypeOf<GravityModel | undefined>()
    expectTypeOf<SatelliteRecordOptions['mode']>().toEqualTypeOf<'improved' | 'afspc' | undefined>()
    expect(options).toEqual({})
  })

  it('should type the mode as one of "improved" or "afspc" alone', () => {
    // @ts-expect-error: a mode of operation that is not one of "improved" or "afspc" is not a mode:
    const options: SatelliteRecordOptions = { mode: 'i' }

    expect(options.mode).toBe('i')
  })
})

/*****************************************************************************************************************/

// The element set of the International Space Station (ZARYA) of 2008-09-20, e.g., a near-Earth orbit:
const iss = parseTwoLineElement(
  '1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927',
  '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537'
)

/*****************************************************************************************************************/

// The element set of a geostationary satellite (24208) of the verification set, e.g., a deep-space orbit of a
// period of ~24 hours, which is resonant with the rotation of the Earth:
const geostationary = parseTwoLineElement(
  '1 24208U 96044A   06177.04061740 -.00000094  00000-0  10000-3 0  1600',
  '2 24208   3.8536  80.0121 0026640 311.0977  48.3000  1.00778054 36119'
)

/*****************************************************************************************************************/

// The element set of a Molniya satellite (8195) of the verification set, e.g., a deep-space orbit of a period of
// ~12 hours and an eccentricity of ~0.69, which is resonant with the rotation of the Earth:
const molniya = parseTwoLineElement(
  '1 08195U 75081A   06176.33215444  .00000099  00000-0  11873-3 0   813',
  '2 08195  64.1586 279.0717 6877146 264.7651  20.2257  2.00491383225656'
)

/*****************************************************************************************************************/

// The element set of a navigation satellite (28129) of the verification set, e.g., a deep-space orbit of a period
// of ~12 hours and an eccentricity of ~0.005, which is not resonant:
const navigation = parseTwoLineElement(
  '1 28129U 03058A   06175.57071136 -.00000104  00000-0  10000-3 0   459',
  '2 28129  54.7298 324.8098 0048506 266.2640  93.1663  2.00562768 18443'
)

/*****************************************************************************************************************/

// The element set of a rocket body (23599) of the verification set, e.g., a deep-space orbit of an inclination of
// ~6.9°, whose node regresses through zero ~440 minutes after its epoch:
const transfer = parseTwoLineElement(
  '1 23599U 95029B   06171.76535463  .00085586  12891-6  12956-2 0  2905',
  '2 23599   6.9327   0.2849 5782022 274.4436  25.2425  4.47796565123555'
)

/*****************************************************************************************************************/

describe('SatelliteRecord', () => {
  it('should be defined', () => {
    expect(SatelliteRecord).toBeDefined()
  })

  it('should initialise with the gravity model of WGS 72 and the improved mode by default', () => {
    const record = new SatelliteRecord(iss)

    expect(record.gravity).toBe(WGS72)
    expect(record.mode).toBe('improved')
  })

  it('should initialise with the gravity model and mode given', () => {
    const record = new SatelliteRecord(iss, { gravity: WGS84, mode: 'afspc' })

    expect(record.gravity).toBe(WGS84)
    expect(record.mode).toBe('afspc')
  })

  it('should carry a frozen copy of the element set it was initialised from', () => {
    const tle = { ...iss }

    const record = new SatelliteRecord(tle)

    expect(record.tle).toEqual(iss)
    expect(record.tle).not.toBe(tle)
    expect(Object.isFrozen(record.tle)).toBe(true)
  })

  it('should not be displaced by a mutation of the element set it was initialised from', () => {
    const tle = { ...iss }

    const record = new SatelliteRecord(tle)

    tle.n = 1

    tle.i = 0

    expect(record.tle.n).toBe(iss.n)
    expect(record.tle.i).toBe(iss.i)
  })

  it('should type its gravity model, mode of operation and element set as read-only', () => {
    const record = new SatelliteRecord(iss)

    expectTypeOf(record.mode).toEqualTypeOf<'improved' | 'afspc'>()

    // @ts-expect-error: the gravity model of a record is not to be reassigned:
    record.gravity = WGS84

    // @ts-expect-error: the element set of a record is not to be mutated:
    expect(() => (record.tle.n = 1)).toThrowError(TypeError)
  })

  it('should throw an SGP4EphemerisTypeError for an element set of ephemeris type 4', () => {
    expect(() => new SatelliteRecord({ ...iss, ephemeris: 4 })).toThrowError(SGP4EphemerisTypeError)
  })

  it('should throw for a mode of operation that is not one of "improved" or "afspc"', () => {
    expect(
      () => new SatelliteRecord(iss, { mode: 'i' as SatelliteRecordOptions['mode'] })
    ).toThrowError(/Invalid mode: "i" is not one of "improved" or "afspc"/)
  })

  it('should initialise for an orbit of the deep-space theory, e.g., of a period of 225 minutes or more', () => {
    for (const tle of [geostationary, molniya, navigation, transfer]) {
      // The period of the orbit, from its mean motion of revolutions per day (in minutes):
      expect(1440 / tle.n).toBeGreaterThanOrEqual(225)
      expect(() => new SatelliteRecord(tle)).not.toThrowError()
    }
  })

  it('should throw an SGP4DecayedError for an element set whose orbit has decayed at its epoch', () => {
    // A mean motion of 17.5 revolutions per day is of an orbit whose semi-major axis is less than
    // the radius of the Earth:
    expect(() => new SatelliteRecord({ ...iss, n: 17.5 })).toThrowError(SGP4DecayedError)
  })

  it('should throw an SGP4MeanMotionError for an element set of a mean motion of zero', () => {
    // A mean motion of zero is of an orbit of no period, whose semi-major axis is not defined:
    expect(() => new SatelliteRecord({ ...iss, n: 0 })).toThrowError(SGP4MeanMotionError)
  })

  it('should throw an SGP4PerturbedEccentricityError for an element set whose perturbed eccentricity is not within [0, 1] at its epoch', () => {
    // The element set of 33334 of the verification set is of a mean motion of 0.00001 revolutions
    // per day, for which the perturbations of the Sun and of the Moon of the deep-space theory carry
    // the eccentricity far from [0, 1]:
    const tle = parseTwoLineElement(
      '1 33334U 78066F   06174.85818871  .00000620  00000-0  10000-3 0  680',
      '2 33334  68.4714 236.1303 5602877 123.7484 302.5767  0.00001000 6752'
    )

    expect(() => new SatelliteRecord(tle)).toThrowError(SGP4PerturbedEccentricityError)
  })
})

/*****************************************************************************************************************/

describe('getStateVector', () => {
  it('should be defined', () => {
    expect(new SatelliteRecord(iss).getStateVector).toBeDefined()
  })

  it('should resolve the state vector at a datetime as the reference implementation does', () => {
    // The states of the reference implementation, e.g., sgp4(jd, fr) of the sgp4 package (version
    // 2.24), at datetimes before, at and after the epoch (in SI metres and metres per second):
    const references = [
      {
        datetime: '2008-09-19T06:30:15.500Z',
        position: [-2176719.1413881686, 4711548.318479676, -4294720.34465269],
        velocity: [-4406.893644400693, -5229.061561253891, -3513.3726101800307]
      },
      {
        datetime: '2008-09-20T12:25:40.104Z',
        position: [4083901.9810565645, -993633.3935020985, 5243603.777455451],
        velocity: [2512.8383219250645, 7259.888275163114, -583.7772143125264]
      },
      {
        datetime: '2008-09-20T18:00:00.000Z',
        position: [-4250605.231757479, -4529280.246741651, -2612241.8670164663],
        velocity: [2268.585535699919, -5145.259450708303, 5244.035659673653]
      },
      {
        datetime: '2008-09-21T12:00:00.000Z',
        position: [-2989332.261932896, 3120873.2547878465, -5169653.2673757],
        velocity: [-4350.121482006888, -6211.87372952239, -1240.782929218685]
      }
    ]

    const record = new SatelliteRecord(iss)

    for (const { datetime, position: p, velocity: v } of references) {
      const { position, velocity } = record.getStateVector(new Date(datetime))

      // The epoch of the element set is carried as a Julian date, whose resolution displaces the
      // object by ~0.1 metres from the reference implementation, which carries it in two parts:
      expect(Math.hypot(position.x - p[0], position.y - p[1], position.z - p[2])).toBeLessThan(0.15)
      expect(Math.hypot(velocity.x - v[0], velocity.y - v[1], velocity.z - v[2])).toBeLessThan(2e-4)
    }
  })

  it('should resolve the state vector at a datetime as it does at the minutes since the epoch', () => {
    const record = new SatelliteRecord(iss)

    // The epoch of the element set is day 264.51782528 of 2008, e.g., 2008-09-20T12:25:40.104192Z,
    // which a Date resolves to the millisecond, and so 90 minutes after the millisecond of the epoch
    // is 0.192 milliseconds short of 90 minutes after the epoch itself:
    const epoch = Date.UTC(2008, 8, 20, 12, 25, 40, 104)

    const { position: a } = record.getStateVector(new Date(epoch + 90 * 60 * 1000))

    const { position: b } = record.getStateVectorAtMinutesSinceEpoch(90 - 0.000192 / 60)

    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(0.15)
  })

  it('should resolve the state vector of a deep-space orbit at a datetime as it does at the minutes since the epoch', () => {
    const record = new SatelliteRecord(geostationary)

    // The epoch of the element set is day 177.04061740 of 2006, e.g., 2006-06-26T00:58:29.343360Z,
    // which a Date resolves to the millisecond, and so 600 minutes after the millisecond of the epoch
    // is 0.36 milliseconds short of 600 minutes after the epoch itself:
    const epoch = Date.UTC(2006, 5, 26, 0, 58, 29, 343)

    const { position: a } = record.getStateVector(new Date(epoch + 600 * 60 * 1000))

    const { position: b } = record.getStateVectorAtMinutesSinceEpoch(600 - 0.00036 / 60)

    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(0.15)
  })

  it('should throw for a datetime that is not a valid date', () => {
    expect(() => new SatelliteRecord(iss).getStateVector(new Date('invalid'))).toThrowError(
      /Invalid datetime: the datetime must be a valid date/
    )
  })

  it('should throw an SGP4DecayedError at a datetime after the orbit has decayed', () => {
    // The element set of 28872 of the verification set decays ~55 minutes after its epoch:
    const record = new SatelliteRecord(
      parseTwoLineElement(
        '1 28872U 05037B   05333.02012661  .25992681  00000-0  24476-3 0  1534',
        '2 28872  96.4736 157.9986 0303955 244.0492 110.6523 16.46015938 10708'
      )
    )

    // The epoch of the element set is day 333.02012661 of 2005, e.g., 2005-11-29T00:28:58.939Z:
    expect(() => record.getStateVector(new Date('2005-11-29T01:30:00.000Z'))).toThrowError(
      SGP4DecayedError
    )
  })
})

/*****************************************************************************************************************/

describe('getStateVectorAtMinutesSinceEpoch', () => {
  it('should be defined', () => {
    expect(new SatelliteRecord(iss).getStateVectorAtMinutesSinceEpoch).toBeDefined()
  })

  it('should resolve the state vector of a near-Earth orbit in SI metres and metres per second', () => {
    const { position, velocity } = new SatelliteRecord(iss).getStateVectorAtMinutesSinceEpoch(0)

    // The International Space Station orbits at ~350 km above the surface, at ~7.7 km/s:
    const radius = Math.hypot(position.x, position.y, position.z)

    const speed = Math.hypot(velocity.x, velocity.y, velocity.z)

    expect(radius).toBeGreaterThan(6.6e6)
    expect(radius).toBeLessThan(6.8e6)
    expect(speed).toBeGreaterThan(7.6e3)
    expect(speed).toBeLessThan(7.8e3)
  })

  it('should return to its position after one orbital period, to within the perturbations of the theory', () => {
    const record = new SatelliteRecord(iss)

    // The period of the orbit, from its mean motion of revolutions per day (in minutes):
    const period = 1440 / iss.n

    const { position: start } = record.getStateVectorAtMinutesSinceEpoch(0)

    const { position: end } = record.getStateVectorAtMinutesSinceEpoch(period)

    // The secular perturbations of the theory, e.g., the regression of the node and the advance of
    // the perigee, carry the object ~5.6 km from where it began over one period:
    const separation = Math.hypot(end.x - start.x, end.y - start.y, end.z - start.z)

    expect(separation).toBeGreaterThan(1e3)
    expect(separation).toBeLessThan(10e3)
  })

  it('should propagate to a time before the epoch, e.g., a negative time since it', () => {
    const { position } = new SatelliteRecord(iss).getStateVectorAtMinutesSinceEpoch(-1440)

    expect(Math.hypot(position.x, position.y, position.z)).toBeGreaterThan(6.6e6)
  })

  it('should resolve the state vector of a geostationary orbit by the deep-space theory', () => {
    const record = new SatelliteRecord(geostationary)

    const { position, velocity } = record.getStateVectorAtMinutesSinceEpoch(0)

    // A geostationary orbit is of a radius of ~42,164 km, at ~3.07 km/s:
    const radius = Math.hypot(position.x, position.y, position.z)

    const speed = Math.hypot(velocity.x, velocity.y, velocity.z)

    expect(radius).toBeGreaterThan(41.9e6)
    expect(radius).toBeLessThan(42.4e6)
    expect(speed).toBeGreaterThan(3.0e3)
    expect(speed).toBeLessThan(3.15e3)
  })

  it('should resolve the state vector of a 12-hour orbit of a high eccentricity from its perigee to its apogee', () => {
    const record = new SatelliteRecord(molniya)

    // The period of the orbit, from its mean motion of revolutions per day (in minutes):
    const period = 1440 / molniya.n

    // The radius of the orbit at each of 200 steps of one period of it (in metres):
    const radii = Array.from({ length: 201 }, (_, step) => {
      const { position } = record.getStateVectorAtMinutesSinceEpoch((step / 200) * period)

      return Math.hypot(position.x, position.y, position.z)
    })

    // A Molniya orbit of a semi-major axis of ~26,560 km and an eccentricity of ~0.69 is of a
    // perigee of ~8,300 km, and of an apogee of ~44,800 km, from the centre of the Earth:
    expect(Math.min(...radii)).toBeGreaterThan(8.2e6)
    expect(Math.min(...radii)).toBeLessThan(8.5e6)
    expect(Math.max(...radii)).toBeGreaterThan(44.6e6)
    expect(Math.max(...radii)).toBeLessThan(45.0e6)
  })

  it('should resolve the state vector of a 12-hour orbit of a low eccentricity, which is not resonant', () => {
    const { position, velocity } = new SatelliteRecord(
      navigation
    ).getStateVectorAtMinutesSinceEpoch(0)

    // A navigation satellite orbits at a radius of ~26,560 km, at ~3.87 km/s:
    const radius = Math.hypot(position.x, position.y, position.z)

    const speed = Math.hypot(velocity.x, velocity.y, velocity.z)

    expect(radius).toBeGreaterThan(26.3e6)
    expect(radius).toBeLessThan(26.8e6)
    expect(speed).toBeGreaterThan(3.8e3)
    expect(speed).toBeLessThan(3.95e3)
  })

  it('should return a geostationary orbit to its position after one orbital period, to within the perturbations of the theory', () => {
    const record = new SatelliteRecord(geostationary)

    // The period of the orbit, from its mean motion of revolutions per day (in minutes):
    const period = 1440 / geostationary.n

    const { position: start } = record.getStateVectorAtMinutesSinceEpoch(0)

    const { position: end } = record.getStateVectorAtMinutesSinceEpoch(period)

    // The perturbations of the theory carry the object ~5.6 km from where it began over one period,
    // e.g., of an orbit whose circumference is ~265,000 km:
    const separation = Math.hypot(end.x - start.x, end.y - start.y, end.z - start.z)

    expect(separation).toBeGreaterThan(1e3)
    expect(separation).toBeLessThan(10e3)
  })

  it('should propagate a deep-space orbit to a time before the epoch, e.g., a negative time since it', () => {
    const record = new SatelliteRecord(geostationary)

    for (const minutes of [-720, -1440, -14400]) {
      const { position } = record.getStateVectorAtMinutesSinceEpoch(minutes)

      const radius = Math.hypot(position.x, position.y, position.z)

      expect(radius).toBeGreaterThan(41.8e6)
      expect(radius).toBeLessThan(42.4e6)
    }
  })

  it('should propagate a resonant orbit alike, whatever the propagations of the record before it', () => {
    for (const tle of [geostationary, molniya]) {
      const expected = new SatelliteRecord(tle).getStateVectorAtMinutesSinceEpoch(1440)

      const record = new SatelliteRecord(tle)

      // The resonance of the orbit is integrated from the epoch at each propagation, and so a
      // propagation far after, or far before, the epoch leaves nothing behind it in the record:
      record.getStateVectorAtMinutesSinceEpoch(100000)

      record.getStateVectorAtMinutesSinceEpoch(-100000)

      expect(record.getStateVectorAtMinutesSinceEpoch(1440)).toEqual(expected)
    }
  })

  it('should propagate a resonant orbit continuously across each step of the integration of its resonance', () => {
    // The resonance of the orbit is integrated in steps of 720 minutes from the epoch, either side
    // of which the object is no further apart than it travels at its speed, e.g., over an interval
    // of a thousandth of a minute either side of the step (in minutes):
    const interval = 0.001

    for (const tle of [geostationary, molniya]) {
      const record = new SatelliteRecord(tle)

      for (const minutes of [-1440, -720, 720, 1440, 7200]) {
        const { position: before } = record.getStateVectorAtMinutesSinceEpoch(minutes - interval)

        const { position: after } = record.getStateVectorAtMinutesSinceEpoch(minutes + interval)

        const { velocity } = record.getStateVectorAtMinutesSinceEpoch(minutes)

        // The distance the object travels at its speed over the interval either side (in metres):
        const distance = Math.hypot(velocity.x, velocity.y, velocity.z) * 2 * interval * 60

        const separation = Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z)

        expect(Math.abs(separation - distance)).toBeLessThan(distance * 1e-3)
      }
    }
  })

  it('should propagate a deep-space orbit alike in either mode of operation at its epoch', () => {
    for (const tle of [geostationary, molniya, navigation, transfer]) {
      const improved = new SatelliteRecord(tle, { mode: 'improved' })

      const afspc = new SatelliteRecord(tle, { mode: 'afspc' })

      expect(afspc.getStateVectorAtMinutesSinceEpoch(0)).toEqual(
        improved.getStateVectorAtMinutesSinceEpoch(0)
      )
    }
  })

  it('should propagate a resonant orbit differently in each mode of operation, by less than a millimetre a day from its epoch', () => {
    // The mode of operation displaces the sidereal angle at the epoch, which the resonance of a
    // geosynchronous or a 12-hour orbit is resolved against, e.g., by micrometres over a day:
    for (const tle of [geostationary, molniya]) {
      const improved = new SatelliteRecord(tle, {
        mode: 'improved'
      }).getStateVectorAtMinutesSinceEpoch(1440)

      const afspc = new SatelliteRecord(tle, { mode: 'afspc' }).getStateVectorAtMinutesSinceEpoch(
        1440
      )

      expect(afspc).not.toEqual(improved)

      expect(
        Math.hypot(
          afspc.position.x - improved.position.x,
          afspc.position.y - improved.position.y,
          afspc.position.z - improved.position.z
        )
      ).toBeLessThan(1e-3)
    }
  })

  it('should propagate an orbit of a low inclination differently in each mode of operation, once its node is negative', () => {
    const improved = new SatelliteRecord(transfer, { mode: 'improved' })

    const afspc = new SatelliteRecord(transfer, { mode: 'afspc' })

    // The node of the orbit regresses through zero ~440 minutes after its epoch, before which it is
    // within [0, 2π) in either mode of operation:
    const { position: a } = improved.getStateVectorAtMinutesSinceEpoch(400)

    const { position: b } = afspc.getStateVectorAtMinutesSinceEpoch(400)

    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(1e-3)

    // The mode of the Air Force Space Command keeps the node within [0, 2π) thereafter, and the
    // improved mode does not, which displaces the long-period perturbations of the Sun and of the
    // Moon, e.g., by ~964 metres at 460 minutes, as the reference implementation is displaced:
    const { position: c } = improved.getStateVectorAtMinutesSinceEpoch(460)

    const { position: d } = afspc.getStateVectorAtMinutesSinceEpoch(460)

    expect(Math.hypot(c.x - d.x, c.y - d.y, c.z - d.z)).toBeGreaterThan(900)
    expect(Math.hypot(c.x - d.x, c.y - d.y, c.z - d.z)).toBeLessThan(1000)
  })

  it('should propagate a deep-space orbit that is neither resonant nor of a low inclination alike in either mode of operation', () => {
    // The mode of operation displaces the sidereal angle at the epoch, and the range of the node of
    // an orbit of an inclination of less than 0.2 radians, neither of which such an orbit resolves
    // the state vector from:
    const improved = new SatelliteRecord(navigation, { mode: 'improved' })

    const afspc = new SatelliteRecord(navigation, { mode: 'afspc' })

    expect(afspc.getStateVectorAtMinutesSinceEpoch(1440)).toEqual(
      improved.getStateVectorAtMinutesSinceEpoch(1440)
    )
  })

  it('should propagate a near-Earth orbit alike in either mode of operation', () => {
    // The mode of operation is of the deep-space theory alone, e.g., of its sidereal angle at the
    // epoch and of the range of its node, neither of which the near-Earth theory resolves the state
    // vector from:
    const improved = new SatelliteRecord(iss, { mode: 'improved' })

    const afspc = new SatelliteRecord(iss, { mode: 'afspc' })

    expect(afspc.getStateVectorAtMinutesSinceEpoch(720)).toEqual(
      improved.getStateVectorAtMinutesSinceEpoch(720)
    )
  })

  it('should not be displaced by a mutation of the element set it was initialised from', () => {
    const tle = { ...iss }

    const record = new SatelliteRecord(tle)

    const before = record.getStateVectorAtMinutesSinceEpoch(90)

    tle.n = 1

    tle.i = 0

    expect(record.getStateVectorAtMinutesSinceEpoch(90)).toEqual(before)
  })

  it('should throw for a time since the epoch that is not finite', () => {
    const record = new SatelliteRecord(iss)

    expect(() => record.getStateVectorAtMinutesSinceEpoch(Number.NaN)).toThrowError(
      /the minutes since the epoch must be finite/
    )

    expect(() => record.getStateVectorAtMinutesSinceEpoch(Number.POSITIVE_INFINITY)).toThrowError(
      /the minutes since the epoch must be finite/
    )
  })
})

/*****************************************************************************************************************/
