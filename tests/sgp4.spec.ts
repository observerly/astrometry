/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sgp4
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import { SGP4Error, SGP4MeanEccentricityError } from '../src/sgp4'

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
