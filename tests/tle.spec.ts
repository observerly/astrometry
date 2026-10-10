/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tle
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import { convertAlpha5ToSatelliteNumber, type TwoLineElement } from '../src/tle'

/*****************************************************************************************************************/

describe('TwoLineElement', () => {
  it('should type a literal element set, read back field by field', () => {
    // The element set of the International Space Station (ZARYA) of 2008-09-20:
    //
    // 1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927
    // 2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537
    const tle: TwoLineElement = {
      satellite: 25544,
      classification: 'U',
      designator: '98067A',
      epoch: 2454730.01782528,
      ndot: -0.00002182,
      nddot: 0,
      bstar: -0.11606e-4,
      ephemeris: 0,
      element: 292,
      i: 51.6416,
      Ω: 247.4627,
      e: 0.0006703,
      ω: 130.536,
      M: 325.0288,
      n: 15.72125391,
      revolution: 56353
    }

    expectTypeOf(tle).toEqualTypeOf<TwoLineElement>()
    expect(tle.satellite).toBe(25544)
    expect(tle.classification).toBe('U')
    expect(tle.designator).toBe('98067A')
    expect(tle.epoch).toBe(2454730.01782528)
    expect(tle.i).toBe(51.6416)
    expect(tle.Ω).toBe(247.4627)
    expect(tle.e).toBe(0.0006703)
    expect(tle.ω).toBe(130.536)
    expect(tle.M).toBe(325.0288)
    expect(tle.n).toBe(15.72125391)
  })

  it('should type the classification as one of the published classifications', () => {
    expectTypeOf<TwoLineElement['classification']>().toEqualTypeOf<'U' | 'C' | 'S'>()
  })
})

/*****************************************************************************************************************/

describe('convertAlpha5ToSatelliteNumber', () => {
  it('should be defined', () => {
    expect(convertAlpha5ToSatelliteNumber).toBeDefined()
  })

  it('should convert a catalogue number of up to 99,999 to its digits alone', () => {
    expect(convertAlpha5ToSatelliteNumber('00005')).toBe(5)
    expect(convertAlpha5ToSatelliteNumber('25544')).toBe(25544)
    expect(convertAlpha5ToSatelliteNumber('99999')).toBe(99999)
  })

  it('should convert a catalogue number that is padded with spaces, rather than with zeros', () => {
    expect(convertAlpha5ToSatelliteNumber(' 4632')).toBe(4632)
    expect(convertAlpha5ToSatelliteNumber('    5')).toBe(5)
  })

  it('should convert a catalogue number that exceeds 99,999 from its leading letter', () => {
    expect(convertAlpha5ToSatelliteNumber('A0000')).toBe(100000)
    expect(convertAlpha5ToSatelliteNumber('A0001')).toBe(100001)
    expect(convertAlpha5ToSatelliteNumber('H9999')).toBe(179999)
  })

  it('should displace the letters that follow the omitted "I" and "O"', () => {
    expect(convertAlpha5ToSatelliteNumber('J0000')).toBe(180000)
    expect(convertAlpha5ToSatelliteNumber('N9999')).toBe(229999)
    expect(convertAlpha5ToSatelliteNumber('P0000')).toBe(230000)
  })

  it('should convert the greatest catalogue number the scheme carries', () => {
    expect(convertAlpha5ToSatelliteNumber('Z9999')).toBe(339999)
  })

  it('should agree with the Alpha-5 encoding of every ten-thousands from 10 to 33', () => {
    // The letters of the scheme, in order, less the omitted "I" and "O":
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

    for (let i = 0; i < letters.length; i++) {
      expect(convertAlpha5ToSatelliteNumber(`${letters[i]}1234`)).toBe((i + 10) * 10000 + 1234)
    }
  })

  it('should throw for the omitted letters "I" and "O"', () => {
    expect(() => convertAlpha5ToSatelliteNumber('I0000')).toThrowError(/Invalid satellite number/)
    expect(() => convertAlpha5ToSatelliteNumber('O0000')).toThrowError(/Invalid satellite number/)
  })

  it('should throw for a lowercase letter', () => {
    expect(() => convertAlpha5ToSatelliteNumber('a0001')).toThrowError(/Invalid satellite number/)
  })

  it('should throw for a catalogue number that is not of five columns', () => {
    expect(() => convertAlpha5ToSatelliteNumber('A001')).toThrowError(/Invalid satellite number/)
    expect(() => convertAlpha5ToSatelliteNumber('A00001')).toThrowError(/Invalid satellite number/)
    expect(() => convertAlpha5ToSatelliteNumber('123456')).toThrowError(/Invalid satellite number/)
  })

  it('should throw for a catalogue number that is empty, or blank', () => {
    expect(() => convertAlpha5ToSatelliteNumber('')).toThrowError(/Invalid satellite number/)
    expect(() => convertAlpha5ToSatelliteNumber('     ')).toThrowError(/Invalid satellite number/)
  })

  it('should throw for a catalogue number with a letter other than the leading one', () => {
    expect(() => convertAlpha5ToSatelliteNumber('12A45')).toThrowError(/Invalid satellite number/)
    expect(() => convertAlpha5ToSatelliteNumber('AA001')).toThrowError(/Invalid satellite number/)
  })
})

/*****************************************************************************************************************/
