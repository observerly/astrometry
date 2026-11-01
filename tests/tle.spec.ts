/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tle
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, expectTypeOf, it } from 'vitest'

/*****************************************************************************************************************/

import {
  convertAlpha5ToSatelliteNumber,
  getTwoLineElementChecksum,
  parseTwoLineElement,
  type TwoLineElement
} from '../src/tle'

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

describe('getTwoLineElementChecksum', () => {
  it('should be defined', () => {
    expect(getTwoLineElementChecksum).toBeDefined()
  })

  it('should calculate the checksum of the first line of an element set', () => {
    expect(
      getTwoLineElementChecksum(
        '1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927'
      )
    ).toBe(7)
  })

  it('should calculate the checksum of the second line of an element set', () => {
    expect(
      getTwoLineElementChecksum(
        '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537'
      )
    ).toBe(7)
  })

  it('should calculate the checksum of a line with negative exponents and drag terms', () => {
    expect(
      getTwoLineElementChecksum(
        '1 16925U 86065D   06151.67415771  .02550794 -30915-6  18784-3 0  4486'
      )
    ).toBe(6)

    expect(
      getTwoLineElementChecksum(
        '1 04632U 70093B   04031.91070959 -.00000084  00000-0  10000-3 0  9955'
      )
    ).toBe(5)
  })

  it('should count each minus sign for one', () => {
    // A line of zeros, other than its line number of 1, and two minus signs:
    expect(
      getTwoLineElementChecksum(
        '1 00000U 00000A   00000.00000000  .00000000  00000-0  00000-0 0    0'
      )
    ).toBe(3)
  })

  it('should count a letter for nothing, e.g., the leading letter of an Alpha-5 catalogue number', () => {
    expect(
      getTwoLineElementChecksum(
        '1 A0001U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  292'
      )
    ).toBe(8)
  })

  it('should calculate the checksum over the first 68 columns alone', () => {
    const line = '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537'

    // The checksum is that of the line without its checksum:
    expect(getTwoLineElementChecksum(line.slice(0, 68))).toBe(7)

    // The checksum is that of the line without any data beyond it, e.g., the start, stop and step
    // of a line of a verification element set:
    expect(getTwoLineElementChecksum(`${line}     0.00      4320.0        360.00`)).toBe(7)
  })

  it('should calculate a checksum of zero for an empty line', () => {
    expect(getTwoLineElementChecksum('')).toBe(0)
  })
})

/*****************************************************************************************************************/

// The element set of the International Space Station (ZARYA) of 2008-09-20:
const line1 = '1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927'

const line2 = '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537'

// Replaces the checksum of a line with the checksum of its first 68 columns, so that a line that is
// altered for a test is not rejected for its checksum, but for the alteration alone:
const resum = (line: string): string => `${line.slice(0, 68)}${getTwoLineElementChecksum(line)}`

// Replaces the columns [start, start + value.length) of a line with the value given, and resums it:
const splice = (line: string, start: number, value: string): string =>
  resum(`${line.slice(0, start)}${value}${line.slice(start + value.length)}`)

/*****************************************************************************************************************/

describe('parseTwoLineElement', () => {
  it('should be defined', () => {
    expect(parseTwoLineElement).toBeDefined()
  })

  it('should parse the element set of the International Space Station', () => {
    const tle = parseTwoLineElement(line1, line2)

    expectTypeOf(tle).toEqualTypeOf<TwoLineElement>()

    expect(tle.satellite).toBe(25544)
    expect(tle.classification).toBe('U')
    expect(tle.designator).toBe('98067A')
    expect(tle.epoch).toBeCloseTo(2454730.01782528, 9)
    expect(tle.ndot).toBe(-0.00002182)
    expect(tle.nddot).toBe(0)
    expect(tle.bstar).toBeCloseTo(-0.11606e-4, 15)
    expect(tle.ephemeris).toBe(0)
    expect(tle.element).toBe(292)
    expect(tle.i).toBe(51.6416)
    expect(tle.Ω).toBe(247.4627)
    expect(tle.e).toBe(0.0006703)
    expect(tle.ω).toBe(130.536)
    expect(tle.M).toBe(325.0288)
    expect(tle.n).toBe(15.72125391)
    expect(tle.revolution).toBe(56353)
  })

  it('should resolve the epoch as the Julian date of the day of the year in UTC', () => {
    const tle = parseTwoLineElement(line1, line2)

    // Day 264.51782528 of 2008 is the 20th of September 2008, at 12:25:40.104 UTC:
    expect((tle.epoch - 2440587.5) * 86400000).toBeCloseTo(
      Date.UTC(2008, 8, 20, 12, 25, 40, 104),
      0
    )
  })

  it('should resolve the years 57 to 99 to the 20th century', () => {
    const tle = parseTwoLineElement(splice(line1, 18, '57001.00000000'), line2)

    // The 1st of January 1957 at 00:00 UTC:
    expect(tle.epoch).toBe(2435839.5)
  })

  it('should resolve the years 00 to 56 to the 21st century', () => {
    const tle = parseTwoLineElement(splice(line1, 18, '56001.00000000'), line2)

    // The 1st of January 2056 at 00:00 UTC:
    expect(tle.epoch).toBe(Date.UTC(2056, 0, 1) / 86400000 + 2440587.5)
  })

  it('should parse the second derivative of the mean motion in the implied decimal point notation', () => {
    const tle = parseTwoLineElement(splice(line1, 44, '-30915-6'), line2)

    expect(tle.nddot).toBeCloseTo(-0.30915e-6, 18)
  })

  it('should parse a positive drag term in the implied decimal point notation', () => {
    const tle = parseTwoLineElement(splice(line1, 53, ' 28098-4'), line2)

    expect(tle.bstar).toBeCloseTo(0.28098e-4, 18)
  })

  it('should parse an exponent that is signed by a plus sign', () => {
    const tle = parseTwoLineElement(splice(line1, 53, ' 13519+0'), line2)

    expect(tle.bstar).toBeCloseTo(0.13519, 15)
  })

  it('should parse an element set of a satellite number of the Alpha-5 scheme', () => {
    const tle = parseTwoLineElement(splice(line1, 2, 'A0001'), splice(line2, 2, 'A0001'))

    expect(tle.satellite).toBe(100001)
  })

  it('should parse a satellite number that is padded with spaces, rather than with zeros', () => {
    const tle = parseTwoLineElement(splice(line1, 2, ' 4632'), splice(line2, 2, '04632'))

    expect(tle.satellite).toBe(4632)
  })

  it('should resolve a blank classification as unclassified', () => {
    const tle = parseTwoLineElement(splice(line1, 7, ' '), line2)

    expect(tle.classification).toBe('U')
  })

  it('should parse a classified element set', () => {
    expect(parseTwoLineElement(splice(line1, 7, 'C'), line2).classification).toBe('C')
    expect(parseTwoLineElement(splice(line1, 7, 'S'), line2).classification).toBe('S')
  })

  it('should resolve a blank designator as empty', () => {
    const tle = parseTwoLineElement(splice(line1, 9, '        '), line2)

    expect(tle.designator).toBe('')
  })

  it('should resolve a blank ephemeris type and element set number as zero', () => {
    const tle = parseTwoLineElement(splice(line1, 62, '      '), line2)

    expect(tle.ephemeris).toBe(0)
    expect(tle.element).toBe(0)
  })

  it('should resolve the blanks of the eccentricity as zeros', () => {
    const tle = parseTwoLineElement(line1, splice(line2, 26, '   6703'))

    expect(tle.e).toBe(0.0006703)
  })

  it('should parse lines with the trailing whitespace and carriage return of a file', () => {
    const tle = parseTwoLineElement(`${line1}  \r`, `${line2}\r\n`)

    expect(tle.satellite).toBe(25544)
    expect(tle.revolution).toBe(56353)
  })

  it('should parse lines of 68 columns, which carry no checksum', () => {
    const tle = parseTwoLineElement(line1.slice(0, 68), line2.slice(0, 68))

    expect(tle.satellite).toBe(25544)
    expect(tle.revolution).toBe(56353)
  })

  it('should parse a line of 68 columns whose trailing fields are blank', () => {
    // The revolution number is blank, and there is no checksum, e.g., the line ends in the spaces
    // of its blank field, which are of the format, and are not stripped as trailing whitespace:
    const tle = parseTwoLineElement(line1, `${line2.slice(0, 63)}     `)

    expect(tle.revolution).toBe(0)
  })

  it('should throw for a line that ends in whitespace other than a space', () => {
    // A trailing non-breaking space, which would otherwise be stripped as trailing whitespace:
    expect(() => parseTwoLineElement(`${line1}\u00a0`, line2)).toThrowError(
      /line 1 must be of printable ASCII characters alone/
    )
  })

  it('should ignore any data beyond the 69th column', () => {
    const tle = parseTwoLineElement(line1, `${line2}     0.00      4320.0        360.00`)

    expect(tle.n).toBe(15.72125391)
    expect(tle.revolution).toBe(56353)
  })

  it('should throw for a line whose checksum is not that of the line', () => {
    expect(() => parseTwoLineElement(`${line1.slice(0, 68)}8`, line2)).toThrowError(
      /line 1 carries a checksum of 8, but sums to 7/
    )

    expect(() => parseTwoLineElement(line1, `${line2.slice(0, 68)}0`)).toThrowError(
      /line 2 carries a checksum of 0, but sums to 7/
    )
  })

  it('should throw for a line of fewer than 68 columns', () => {
    expect(() => parseTwoLineElement(line1.slice(0, 61), line2)).toThrowError(
      /line 1 must span 68 columns, but spans 61/
    )
  })

  it('should throw for lines that are given in the wrong order', () => {
    expect(() => parseTwoLineElement(line2, line1)).toThrowError(
      /line 1 must begin with its line number/
    )
  })

  it('should throw for a line whose separators do not fall in their columns', () => {
    // The inclination shifted one column to the left, e.g., a line that is not of the format:
    expect(() => parseTwoLineElement(line1, splice(line2, 7, '51.6416  '))).toThrowError(
      /line 2 must carry/
    )
  })

  it('should throw for a line without the separator between the designator and the epoch', () => {
    // The 18th column separates the designator from the epoch, and a character there would
    // otherwise be discarded from both, e.g., the designator ends before it and the epoch after it:
    expect(() => parseTwoLineElement(splice(line1, 17, 'X'), line2)).toThrowError(
      /line 1 must carry " " in column 18/
    )
  })

  it('should throw for the lines of two different satellites', () => {
    expect(() => parseTwoLineElement(line1, splice(line2, 2, '25545'))).toThrowError(
      /the satellite numbers of line 1 "25544" and line 2 "25545" are not the same/
    )
  })

  it('should throw for a classification that is not one of those that are published', () => {
    expect(() => parseTwoLineElement(splice(line1, 7, 'X'), line2)).toThrowError(
      /the classification "X" is not one of "U", "C" or "S"/
    )
  })

  it('should throw for an epoch that is not a day of a year', () => {
    expect(() => parseTwoLineElement(splice(line1, 18, '08000.50000000'), line2)).toThrowError(
      /is not a day of a year/
    )

    expect(() => parseTwoLineElement(splice(line1, 18, '08367.00000000'), line2)).toThrowError(
      /is not a day of a year/
    )
  })

  it('should throw for a field that does not hold a number', () => {
    expect(() => parseTwoLineElement(line1, splice(line2, 8, ' 51.64x6'))).toThrowError(
      /the inclination " 51.64x6" is not a number/
    )
  })

  it('should throw for a blank field that must not be blank', () => {
    // The inclination, blank but for the decimal point its separator requires:
    expect(() => parseTwoLineElement(line1, splice(line2, 8, '   .    '))).toThrowError(
      /the inclination "   \.    " is not a number/
    )
  })

  it('should throw for an epoch year that is not of two digits', () => {
    // A blank year:
    expect(() => parseTwoLineElement(splice(line1, 18, '  '), line2)).toThrowError(
      /the epoch year "  " is not of two digits/
    )

    // A signed year, which would otherwise resolve to a year of the wrong century, e.g., 1999:
    expect(() => parseTwoLineElement(splice(line1, 18, '-1'), line2)).toThrowError(
      /the epoch year "-1" is not of two digits/
    )

    expect(() => parseTwoLineElement(splice(line1, 18, '+5'), line2)).toThrowError(
      /the epoch year "\+5" is not of two digits/
    )

    // A year of a single digit, padded with a space:
    expect(() => parseTwoLineElement(splice(line1, 18, ' 8'), line2)).toThrowError(
      /the epoch year " 8" is not of two digits/
    )
  })

  it('should throw for a field in a notation that is not of the format', () => {
    // A hexadecimal element set number, which Number() would resolve to 31:
    expect(() => parseTwoLineElement(splice(line1, 64, '0x1F'), line2)).toThrowError(
      /the element set number "0x1F" is not a number/
    )

    // An exponential revolution number, which Number() would resolve to 10000:
    expect(() => parseTwoLineElement(line1, splice(line2, 63, '1e4  '))).toThrowError(
      /the revolution number "1e4  " is not a number/
    )

    // A signed epoch day:
    expect(() => parseTwoLineElement(splice(line1, 20, '+64.51782528'), line2)).toThrowError(
      /the epoch day "\+64.51782528" is not a number/
    )
  })

  it('should throw for an integer field that holds a decimal point', () => {
    expect(() => parseTwoLineElement(line1, splice(line2, 63, '563.5'))).toThrowError(
      /the revolution number "563.5" is not a number/
    )
  })

  it('should throw for a decimal whose decimal places do not fill its field', () => {
    // A decimal point with no decimal places after it:
    expect(() => parseTwoLineElement(line1, splice(line2, 8, ' 51.    '))).toThrowError(
      /the inclination " 51.    " is not a number/
    )

    // A decimal point with fewer decimal places than its field carries, e.g., a field that is not
    // right-justified:
    expect(() => parseTwoLineElement(line1, splice(line2, 8, ' 51.64  '))).toThrowError(
      /the inclination " 51.64  " is not a number/
    )
  })

  it('should throw for a first derivative of the mean motion whose sign column holds a digit', () => {
    // The 34th column is the sign of the field, e.g., a space, a plus sign or a minus sign:
    expect(() => parseTwoLineElement(splice(line1, 33, '0.00002182'), line2)).toThrowError(
      /the first derivative of the mean motion "0.00002182" is not a number/
    )
  })

  it('should throw for an integer that is not right-justified within its field', () => {
    expect(() => parseTwoLineElement(splice(line1, 64, '292 '), line2)).toThrowError(
      /the element set number "292 " is not a number/
    )
  })

  it('should throw for an eccentricity that is not of seven digits', () => {
    expect(() => parseTwoLineElement(line1, splice(line2, 26, '1e-5   '))).toThrowError(
      /the eccentricity "1e-5   " is not of seven digits/
    )

    expect(() => parseTwoLineElement(line1, splice(line2, 26, '-000670'))).toThrowError(
      /the eccentricity "-000670" is not of seven digits/
    )
  })

  it('should throw for a field that is not of the implied decimal point notation', () => {
    expect(() => parseTwoLineElement(splice(line1, 53, '-1160x-4'), line2)).toThrowError(
      /the drag term "-1160x-4" is not of the implied decimal point notation/
    )
  })

  it('should throw for an inclination that is not within [0, 180] degrees', () => {
    expect(() => parseTwoLineElement(line1, splice(line2, 8, '180.0001'))).toThrowError(
      /the inclination 180.0001 is not within \[0, 180\] degrees/
    )
  })

  it('should throw for a mean motion that is not greater than zero', () => {
    expect(() => parseTwoLineElement(line1, splice(line2, 52, ' 0.00000000'))).toThrowError(
      /the mean motion 0 is not greater than zero/
    )
  })

  it('should throw for an angle of the orbit that is negative', () => {
    // A minus sign fits within the column of the leading digit, ahead of the decimal point the
    // separator requires, but the format does not sign the field:
    expect(() => parseTwoLineElement(line1, splice(line2, 17, '-12.3456'))).toThrowError(
      /the right ascension of the ascending node "-12.3456" is not a number/
    )

    expect(() => parseTwoLineElement(line1, splice(line2, 34, '-30.5360'))).toThrowError(
      /the argument of perigee "-30.5360" is not a number/
    )
  })

  it('should parse a signed first derivative of the mean motion, e.g., the field the format signs', () => {
    expect(parseTwoLineElement(splice(line1, 33, '+.00002182'), line2).ndot).toBe(0.00002182)
    expect(parseTwoLineElement(line1, line2).ndot).toBe(-0.00002182)
  })

  it('should throw for an angle of the orbit that is greater than 360 degrees', () => {
    expect(() => parseTwoLineElement(line1, splice(line2, 17, '400.0000'))).toThrowError(
      /the right ascension of the ascending node 400 is not within \[0, 360\] degrees/
    )

    expect(() => parseTwoLineElement(line1, splice(line2, 43, '999.9999'))).toThrowError(
      /the mean anomaly 999.9999 is not within \[0, 360\] degrees/
    )
  })

  it('should parse an angle of the orbit of 360 degrees, e.g., the rounding of the format', () => {
    // The four decimal places of the format round an angle of 359.99995° or more to 360.0000:
    const tle = parseTwoLineElement(line1, splice(line2, 43, '360.0000'))

    expect(tle.M).toBe(360)
  })

  it('should throw for a line whose 69th column is neither a checksum nor blank', () => {
    expect(() => parseTwoLineElement(`${line1.slice(0, 68)}X`, line2)).toThrowError(
      /line 1 carries "X" in column 69, which is not a checksum/
    )
  })

  it('should parse a line whose 69th column is blank, e.g., which carries no checksum', () => {
    // The verification element sets carry data beyond the 69th column, and so a blank 69th column
    // is not trimmed away as trailing whitespace:
    const tle = parseTwoLineElement(line1, `${line2.slice(0, 68)}      0.00      4320.0`)

    expect(tle.revolution).toBe(56353)
  })

  it('should throw for a line of characters other than printable ASCII', () => {
    // A non-breaking space within the inclination, which would otherwise be trimmed from it:
    expect(() =>
      parseTwoLineElement(line1, `${line2.slice(0, 8)}\u00a051.6416${line2.slice(16, 68)}`)
    ).toThrowError(/line 2 must be of printable ASCII characters alone/)

    // A tab within the designator, which would otherwise be carried into it:
    expect(() =>
      parseTwoLineElement(`${line1.slice(0, 9)}98067\tA ${line1.slice(17, 68)}`, line2)
    ).toThrowError(/line 1 must be of printable ASCII characters alone/)
  })
})

/*****************************************************************************************************************/
