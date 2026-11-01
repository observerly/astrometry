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

// The element set of a geostationary satellite (24208) of the verification set, e.g., a deep-space orbit:
const geostationary = parseTwoLineElement(
  '1 24208U 96044A   06177.04061740 -.00000094  00000-0  10000-3 0  1600',
  '2 24208   3.8536  80.0121 0026640 311.0977  48.3000  1.00778054 36119'
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

  it('should throw an SGP4Error for an orbit of the deep-space theory, which is not yet resolved', () => {
    expect(() => new SatelliteRecord(geostationary)).toThrowError(SGP4Error)
    expect(() => new SatelliteRecord(geostationary)).toThrowError(/deep-space theory/)
  })

  it('should throw an SGP4DecayedError for an element set whose orbit has decayed at its epoch', () => {
    // A mean motion of 17.5 revolutions per day is of an orbit whose semi-major axis is less than
    // the radius of the Earth:
    expect(() => new SatelliteRecord({ ...iss, n: 17.5 })).toThrowError(SGP4DecayedError)
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

  it('should propagate a near-Earth orbit alike in either mode of operation', () => {
    // The mode of operation displaces the sidereal angle at the epoch alone, which the near-Earth
    // theory does not resolve the state vector from:
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
