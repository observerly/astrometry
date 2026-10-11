/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sgp4
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import {
  SGP4DecayedError,
  SGP4EphemerisTypeError,
  SGP4Error,
  SGP4MeanEccentricityError,
  SGP4MeanMotionError,
  SGP4PerturbedEccentricityError,
  SGP4SemiLatusRectumError
} from '../src/sgp4'

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
    expect(new SGP4MeanEccentricityError(1.0002).message).toBe('The mean eccentricity 1.0002 is not within [0, 1)')
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
    expect(new SGP4MeanMotionError(-0.0001).message).toBe('The mean motion -0.0001 is not greater than zero')
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
    expect(new SGP4PerturbedEccentricityError(1.05).message).toBe('The perturbed eccentricity 1.05 is not within [0, 1]')
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
    expect(new SGP4SemiLatusRectumError(-0.25).message).toBe('The semi-latus rectum -0.25 is less than zero')
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
    expect(new SGP4DecayedError(0.98).message).toBe('The orbit has decayed, as its radius of 0.98 Earth radii is less than that of the Earth')
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
    expect(new SGP4EphemerisTypeError(4).message).toBe('The ephemeris type 4 is not one that SGP4 propagates')
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
