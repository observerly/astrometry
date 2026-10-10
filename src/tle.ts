/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tle
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

/**
 *
 * A two-line element set (TLE) is the mean orbital elements of an Earth-orbiting object at an epoch,
 * as are published by the United States Space Force, e.g., by Space-Track and CelesTrak, in the
 * fixed-column format of two lines of 69 characters each.
 *
 * N.B. The elements are mean elements, e.g., the Kozai mean elements of the SGP4 theory they are
 * fitted against, and not osculating elements, and so they are only meaningful when they are
 * propagated by that same theory, e.g., SGP4, and not by a Keplerian orbit.
 *
 * N.B. The elements are given in the units of the format itself, e.g., degrees for the angles and
 * revolutions per day for the mean motion, and it is the propagator that converts them to the
 * units it works in.
 *
 * @see https://celestrak.org/columns/v04n03/
 *
 */
export type TwoLineElement = {
  /**
   *
   * The satellite catalogue number of the object, e.g., the NORAD ID, which is decoded from the
   * Alpha-5 scheme where it exceeds 99,999, e.g., "A0001" is 100001.
   *
   */
  satellite: number
  /**
   *
   * The security classification of the element set, e.g., "U" for unclassified, "C" for
   * classified, or "S" for secret.
   *
   */
  classification: 'U' | 'C' | 'S'
  /**
   *
   * The international designator of the object, e.g., the COSPAR ID, in the abbreviated form of the
   * last two digits of the launch year, the launch number of that year, and the piece of the
   * launch, e.g., "98067A" for the first piece of the 67th launch of 1998.
   *
   * N.B. The designator is empty for an object that was not assigned one, e.g., an analyst object.
   *
   */
  designator: string
  /**
   *
   * The epoch of the element set, as a Julian date in Coordinated Universal Time (UTC).
   *
   * N.B. The epoch is resolved to the ~0.9 milliseconds that the eight decimal places of the
   * fractional day of the format resolve, which a Date, of a millisecond resolution, would not
   * carry exactly.
   *
   */
  epoch: number
  /**
   *
   * The first time derivative of the mean motion divided by two, ṅ/2 (in revolutions per day²),
   * e.g., the "ballistic coefficient" of the format.
   *
   * N.B. SGP4 does not use the term, which is carried for the older SGP model it was fitted for.
   *
   */
  ndot: number
  /**
   *
   * The second time derivative of the mean motion divided by six, n̈/6 (in revolutions per day³).
   *
   * N.B. SGP4 does not use the term, which is carried for the older SGP model it was fitted for.
   *
   */
  nddot: number
  /**
   *
   * The B* drag term of the element set (in inverse Earth radii), e.g., the radiation pressure
   * coefficient of the SGP4 theory, which scales the atmospheric drag on the object.
   *
   */
  bstar: number
  /**
   *
   * The ephemeris type of the element set, which is 0 for every element set that is published,
   * e.g., the elements of the SGP4 theory.
   *
   */
  ephemeris: number
  /**
   *
   * The element set number, e.g., the count of the element sets that have been generated for the
   * object, which is incremented as each new element set is generated for it.
   *
   */
  element: number
  /**
   *
   * The inclination of the orbit (in degrees), e.g., the angle between the plane of the orbit and
   * the plane of the equator, in the range [0, 180].
   *
   */
  i: number
  /**
   *
   * The right ascension of the ascending node of the orbit (in degrees), e.g., the angle from the
   * vernal equinox to the point at which the object crosses the equator northward, in the range
   * [0, 360], where 360 is the rounding of the format of an angle of 359.99995° or more.
   *
   */
  Ω: number
  /**
   *
   * The eccentricity of the orbit (dimensionless), in the range [0, 1).
   *
   */
  e: number
  /**
   *
   * The argument of perigee of the orbit (in degrees), e.g., the angle from the ascending node to
   * the perigee, in the plane of the orbit, in the range [0, 360], where 360 is the rounding of the
   * format of an angle of 359.99995° or more.
   *
   */
  ω: number
  /**
   *
   * The mean anomaly of the object at the epoch (in degrees), in the range [0, 360], where 360 is
   * the rounding of the format of an angle of 359.99995° or more.
   *
   */
  M: number
  /**
   *
   * The mean motion of the object (in revolutions per day), e.g., the Kozai mean motion of the
   * SGP4 theory.
   *
   */
  n: number
  /**
   *
   * The revolution number of the object at the epoch, e.g., the count of the orbits it has made
   * since launch, modulo 100,000 in the five columns of the format.
   *
   */
  revolution: number
}

/*****************************************************************************************************************/

/**
 *
 * convertAlpha5ToSatelliteNumber()
 *
 * Converts a satellite catalogue number of the Alpha-5 scheme to the number it encodes, e.g., the
 * scheme by which the five columns of the format carry a catalogue number that exceeds 99,999.
 *
 * A catalogue number of up to 99,999 is given as its five digits. One that exceeds it is given as a
 * letter for its ten-thousands, followed by four digits for the remainder, where the letters "A"
 * to "Z" stand for 10 to 33, e.g., "A0001" is 100001 and "Z9999" is 339999, the greatest catalogue
 * number the scheme carries.
 *
 * N.B. The letters "I" and "O" are omitted from the scheme, so that they are not mistaken for the
 * digits "1" and "0", and so the letters that follow them are displaced, e.g., "J" stands for 18
 * and "P" stands for 23.
 *
 * @param alpha5 - The satellite catalogue number of the Alpha-5 scheme, e.g., "25544" or "A0001".
 * @throws An error if the catalogue number is not of the Alpha-5 scheme.
 * @returns The satellite catalogue number it encodes, e.g., 25544 or 100001.
 *
 */
export const convertAlpha5ToSatelliteNumber = (alpha5: string): number => {
  // The columns of the format are fixed, and so a catalogue number of fewer than five digits may
  // be padded with spaces, rather than with zeros, e.g., " 4632":
  const value = alpha5.trim()

  // A catalogue number of up to 99,999 is given as its digits alone:
  if (/^\d{1,5}$/.test(value)) {
    return Number(value)
  }

  // A catalogue number that exceeds 99,999 is given as a letter, other than "I" or "O", for its
  // ten-thousands, followed by four digits for the remainder:
  if (!/^[A-HJ-NP-Z]\d{4}$/.test(value)) {
    throw new Error(`Invalid satellite number: "${alpha5}" is not of the Alpha-5 scheme`)
  }

  const letter = value[0]

  // The letters stand for the ten-thousands from 10 onwards, in order, less the "I" and the "O"
  // that are omitted before them:
  const prefix =
    letter.charCodeAt(0) - 'A'.charCodeAt(0) + 10 - (letter > 'I' ? 1 : 0) - (letter > 'O' ? 1 : 0)

  return prefix * 10000 + Number(value.slice(1))
}

/*****************************************************************************************************************/

/**
 *
 * getTwoLineElementChecksum()
 *
 * Calculates the checksum of a line of a two-line element set, e.g., the modulo 10 sum of the
 * first 68 columns of the line, in which each digit counts for its value, each minus sign counts
 * for one, and every other character, e.g., a letter, a space, a period or a plus sign, counts
 * for nothing.
 *
 * The checksum is carried in the 69th column of the line, and so a line is intact where the
 * checksum calculated for it is equal to the digit in that column.
 *
 * N.B. The checksum is calculated over the first 68 columns alone, and so the checksum of a line
 * that carries its checksum, or data beyond it, is that of the line without them.
 *
 * @param line - The line of the two-line element set, e.g., its first or second line.
 * @returns The checksum of the line, in the range [0, 9].
 *
 */
export const getTwoLineElementChecksum = (line: string): number => {
  let sum = 0

  for (const character of line.slice(0, 68)) {
    // Each minus sign counts for one, e.g., the sign of a negative exponent or a negative drag term:
    if (character === '-') {
      sum += 1
    }

    // Each digit counts for its value:
    if (character >= '0' && character <= '9') {
      sum += Number(character)
    }
  }

  return sum % 10
}

/*****************************************************************************************************************/

/**
 *
 * The columns of each line of a two-line element set that are fixed as a space or a period, e.g.,
 * the separators between its fields and the decimal points of its fields, which mark a line that
 * is not of the fixed-column format (zero-indexed).
 *
 */
const TWO_LINE_ELEMENT_SEPARATORS: Record<1 | 2, [number, ' ' | '.'][]> = {
  1: [
    [1, ' '],
    [8, ' '],
    [17, ' '],
    [23, '.'],
    [32, ' '],
    [34, '.'],
    [43, ' '],
    [52, ' '],
    [61, ' '],
    [63, ' ']
  ],
  2: [
    [1, ' '],
    [7, ' '],
    [11, '.'],
    [16, ' '],
    [20, '.'],
    [25, ' '],
    [33, ' '],
    [37, '.'],
    [42, ' '],
    [46, '.'],
    [51, ' '],
    [54, '.']
  ]
}

/*****************************************************************************************************************/

/**
 *
 * Asserts that a line of a two-line element set is of the fixed-column format, e.g., that it is of
 * the line number given, that it spans the 68 columns of its fields, that its separators fall in
 * their columns, and that its checksum, where it carries one, is that of the line.
 *
 * @param line - The line of the two-line element set.
 * @param number - The number of the line, e.g., 1 or 2.
 * @throws An error if the line is not of the fixed-column format, or its checksum is not that of the line.
 *
 */
const assertTwoLineElementLine = (line: string, number: 1 | 2): void => {
  // The format is of printable ASCII alone, e.g., a tab, a non-breaking space or any other character
  // beyond it is not of the format, and would otherwise be trimmed from a field, or carried into it,
  // without notice:
  if (!/^[\x20-\x7E]*$/.test(line)) {
    throw new Error(
      `Invalid two-line element: line ${number} must be of printable ASCII characters alone`
    )
  }

  if (line.length < 68) {
    throw new Error(
      `Invalid two-line element: line ${number} must span 68 columns, but spans ${line.length}`
    )
  }

  if (line[0] !== String(number)) {
    throw new Error(`Invalid two-line element: line ${number} must begin with its line number`)
  }

  for (const [column, separator] of TWO_LINE_ELEMENT_SEPARATORS[number]) {
    if (line[column] !== separator) {
      throw new Error(
        `Invalid two-line element: line ${number} must carry "${separator}" in column ${column + 1}`
      )
    }
  }

  // The checksum is carried in the 69th column, and is verified where the line carries one, e.g.,
  // a line of 68 columns, or one whose 69th column is blank, carries none, and is taken as it is:
  const checksum = line[68]

  if (checksum === undefined || checksum === ' ') {
    return
  }

  // Any character other than a digit in the column of the checksum is a corruption of the line,
  // and not the absence of a checksum:
  if (checksum < '0' || checksum > '9') {
    throw new Error(
      `Invalid two-line element: line ${number} carries "${checksum}" in column 69, which is not a checksum`
    )
  }

  const sum = getTwoLineElementChecksum(line)

  if (Number(checksum) !== sum) {
    throw new Error(
      `Invalid two-line element: line ${number} carries a checksum of ${checksum}, but sums to ${sum}`
    )
  }
}

/*****************************************************************************************************************/

/**
 *
 * Parses a field of a two-line element set as a number, e.g., the columns [start, end) of the line,
 * which must hold a number alone, and not a blank, nor a number followed by other characters.
 *
 * The field is matched as it falls in its columns, and not as it is once trimmed, as the format is
 * fixed-column, and so a number is right-justified within its field, and its decimal places fill
 * the field to its last column:
 *
 * - A decimal is digits either side of its decimal point, e.g., " 51.6416" or "15.72125391", and
 *   not " 51.    " nor " 51.64  ", which are short of the decimal places of the field.
 * - A signed fraction is a sign column of a space, a plus or a minus sign, followed by its decimal
 *   point and its decimal places, e.g., "-.00002182", and not "0.00002182", whose sign column
 *   holds a digit.
 * - An integer is digits alone, e.g., "  292".
 *
 * N.B. A number of any other notation that Number() would resolve, e.g., "0x1F" or "1e4", is not of
 * the format, and is rejected.
 *
 * @param line - The line of the two-line element set.
 * @param start - The first column of the field (zero-indexed).
 * @param end - The column after the last column of the field (zero-indexed).
 * @param field - The name of the field, for the message of the error.
 * @param options - Whether the field holds an integer, whether it holds a signed fraction, and the value of the field where it is blank, or undefined where it must not be blank.
 * @throws An error if the field is blank, where it must not be, or does not hold a number of the format.
 * @returns The number the field holds.
 *
 */
const parseTwoLineElementField = (
  line: string,
  start: number,
  end: number,
  field: string,
  {
    integer = false,
    signed = false,
    blank
  }: { integer?: boolean; signed?: boolean; blank?: number } = {}
): number => {
  // The field as it falls in its columns, e.g., with the blanks that right-justify it:
  const value = line.slice(start, end)

  if (value.trim() === '' && blank !== undefined) {
    return blank
  }

  // An integer is right-justified digits, a signed fraction is a sign column followed by its
  // decimal point and decimal places, and a decimal is right-justified digits either side of its
  // decimal point, whose decimal places fill the field to its last column:
  const pattern = integer ? /^ *\d+$/ : signed ? /^[ +-]\.\d+$/ : /^ *\d+\.\d+$/

  if (!pattern.test(value)) {
    throw new Error(`Invalid two-line element: the ${field} "${value}" is not a number`)
  }

  return Number(value.trim())
}

/*****************************************************************************************************************/

/**
 *
 * Parses a field of a two-line element set as an angle (in degrees), e.g., the right ascension of
 * the ascending node, the argument of perigee or the mean anomaly, within [0, 360].
 *
 * N.B. The upper bound is inclusive, as the four decimal places of the format round an angle of
 * 359.99995° or more to "360.0000", which is the same direction as 0°.
 *
 * @param line - The line of the two-line element set.
 * @param start - The first column of the field (zero-indexed).
 * @param end - The column after the last column of the field (zero-indexed).
 * @param field - The name of the field, for the message of the error.
 * @throws An error if the field does not hold a number, or the angle is not within [0, 360].
 * @returns The angle the field holds (in degrees).
 *
 */
const parseTwoLineElementAngleField = (
  line: string,
  start: number,
  end: number,
  field: string
): number => {
  const angle = parseTwoLineElementField(line, start, end, field)

  if (angle < 0 || angle > 360) {
    throw new Error(
      `Invalid two-line element: the ${field} ${angle} is not within [0, 360] degrees`
    )
  }

  return angle
}

/*****************************************************************************************************************/

/**
 *
 * Parses a field of a two-line element set in the implied decimal point and exponent notation of
 * the format, e.g., " 12345-3", which is a sign, the five digits of a mantissa whose decimal point
 * is implied before them, and a signed exponent of ten, e.g., +0.12345 × 10⁻³.
 *
 * @param line - The line of the two-line element set.
 * @param start - The first column of the field (zero-indexed), e.g., the column of its sign.
 * @param field - The name of the field, for the message of the error.
 * @throws An error if the field is not of the implied decimal point and exponent notation.
 * @returns The number the field holds.
 *
 */
const parseTwoLineElementExponentialField = (
  line: string,
  start: number,
  field: string
): number => {
  const value = line.slice(start, start + 8)

  // The sign of the mantissa is a space or a plus sign where it is positive, the mantissa is five
  // digits, and the exponent is a single digit, signed by a space, a plus sign or a minus sign:
  const match = /^([ +-])(\d{5})([ +-]\d)$/.exec(value)

  if (!match) {
    throw new Error(
      `Invalid two-line element: the ${field} "${value}" is not of the implied decimal point notation`
    )
  }

  const [, sign, mantissa, exponent] = match

  return Number(`${sign === '-' ? '-' : ''}0.${mantissa}e${exponent.replace(' ', '+')}`)
}

/*****************************************************************************************************************/

/**
 *
 * parseTwoLineElement()
 *
 * Parses a two-line element set (TLE) from its two lines of the fixed-column format, e.g., as are
 * published by Space-Track and CelesTrak, to the mean orbital elements it carries, in the units of
 * the format itself, e.g., degrees for the angles and revolutions per day for the mean motion.
 *
 * Each line is asserted to be of the fixed-column format, e.g., that its separators fall in their
 * columns, and its checksum, where it carries one in its 69th column, is verified. Any data beyond
 * the 69th column, e.g., the start, stop and step of a verification element set, is ignored.
 *
 * N.B. The epoch of the format carries the last two digits of its year alone, which are resolved
 * as the years 1957 to 2056, e.g., "57" is 1957 and "56" is 2056, as the first object was launched
 * in 1957.
 *
 * N.B. The catalogue number of the object is decoded from the Alpha-5 scheme where it exceeds
 * 99,999, e.g., "A0001" is 100001.
 *
 * @see https://celestrak.org/columns/v04n03/
 *
 * @param line1 - The first line of the two-line element set.
 * @param line2 - The second line of the two-line element set.
 * @throws An error if either line is not of the fixed-column format, or its checksum is not that of the line.
 * @throws An error if the catalogue numbers of the two lines are not the same.
 * @throws An error if either line is not of printable ASCII characters alone.
 * @throws An error if the inclination is not within [0, 180], or the right ascension of the ascending node, the argument of perigee or the mean anomaly is not within [0, 360].
 * @throws An error if the mean motion is not greater than zero.
 * @returns The two-line element set, e.g., the mean orbital elements of the object at its epoch.
 *
 */
export const parseTwoLineElement = (line1: string, line2: string): TwoLineElement => {
  // A line may be given with the line terminator of the file it was read from, e.g., a carriage
  // return or a line feed, which is not of the format, and is stripped.
  //
  // N.B. Trailing spaces are not stripped, as they are of the format, e.g., the blank revolution
  // number of a line of 68 columns, which would otherwise be stripped short of its columns, and
  // any other trailing whitespace is not of the format, and is rejected as it is:
  const first = line1.replace(/[\r\n]+$/, '')

  const second = line2.replace(/[\r\n]+$/, '')

  assertTwoLineElementLine(first, 1)

  assertTwoLineElementLine(second, 2)

  const satellite = convertAlpha5ToSatelliteNumber(first.slice(2, 7))

  // The catalogue number is carried by both lines, and two lines of different objects are not an
  // element set at all:
  if (convertAlpha5ToSatelliteNumber(second.slice(2, 7)) !== satellite) {
    throw new Error(
      `Invalid two-line element: the satellite numbers of line 1 "${first.slice(2, 7)}" and line 2 "${second.slice(2, 7)}" are not the same`
    )
  }

  // The classification is unclassified where it is blank:
  const classification = first[7] === ' ' ? 'U' : first[7]

  if (classification !== 'U' && classification !== 'C' && classification !== 'S') {
    throw new Error(
      `Invalid two-line element: the classification "${classification}" is not one of "U", "C" or "S"`
    )
  }

  // The epoch is carried as the last two digits of its year, and the day of that year, where the
  // 1st of January at 00:00 UTC is day 1.0:
  //
  // N.B. The year is two digits exactly, e.g., a sign or a single digit is not a year of the format,
  // and would otherwise be resolved to a year of the wrong century, e.g., "-1" to 1999:
  if (!/^\d{2}$/.test(first.slice(18, 20))) {
    throw new Error(
      `Invalid two-line element: the epoch year "${first.slice(18, 20)}" is not of two digits`
    )
  }

  const yy = Number(first.slice(18, 20))

  const day = parseTwoLineElementField(first, 20, 32, 'epoch day')

  // N.B. A day of 366 is accepted for a year that is not a leap year, e.g., as the reference
  // implementation accepts it, and is resolved to the 1st of January of the year that follows it:
  if (day < 1 || day >= 367) {
    throw new Error(
      `Invalid two-line element: the epoch "${first.slice(18, 32)}" is not a day of a year`
    )
  }

  // The first object was launched in 1957, and so the years 57 to 99 are of the 20th century, and
  // the years 00 to 56 are of the 21st century:
  const year = yy < 57 ? 2000 + yy : 1900 + yy

  // The Julian date of the 0th of January of the year, e.g., the 31st of December of the year
  // before it, at 00:00 UTC, from which the day of the year is counted:
  const zeroth = Date.UTC(year, 0, 1, 0, 0, 0, 0) / 86400000 + 2440587.5 - 1

  const i = parseTwoLineElementField(second, 8, 16, 'inclination')

  if (i < 0 || i > 180) {
    throw new Error(`Invalid two-line element: the inclination ${i} is not within [0, 180] degrees`)
  }

  const n = parseTwoLineElementField(second, 52, 63, 'mean motion')

  if (n <= 0) {
    throw new Error(`Invalid two-line element: the mean motion ${n} is not greater than zero`)
  }

  // The eccentricity is carried as the seven digits that follow its implied decimal point, where a
  // blank is a zero, e.g., "0006703" is 0.0006703:
  const eccentricity = second.slice(26, 33).replaceAll(' ', '0')

  if (!/^\d{7}$/.test(eccentricity)) {
    throw new Error(
      `Invalid two-line element: the eccentricity "${second.slice(26, 33)}" is not of seven digits`
    )
  }

  return {
    satellite,
    classification,
    designator: first.slice(9, 17).trim(),
    epoch: zeroth + day,
    ndot: parseTwoLineElementField(first, 33, 43, 'first derivative of the mean motion', {
      signed: true
    }),
    nddot: parseTwoLineElementExponentialField(first, 44, 'second derivative of the mean motion'),
    bstar: parseTwoLineElementExponentialField(first, 53, 'drag term'),
    ephemeris: parseTwoLineElementField(first, 62, 63, 'ephemeris type', {
      integer: true,
      blank: 0
    }),
    element: parseTwoLineElementField(first, 64, 68, 'element set number', {
      integer: true,
      blank: 0
    }),
    i,
    Ω: parseTwoLineElementAngleField(second, 17, 25, 'right ascension of the ascending node'),
    e: Number(`0.${eccentricity}`),
    ω: parseTwoLineElementAngleField(second, 34, 42, 'argument of perigee'),
    M: parseTwoLineElementAngleField(second, 43, 51, 'mean anomaly'),
    n,
    revolution: parseTwoLineElementField(second, 63, 68, 'revolution number', {
      integer: true,
      blank: 0
    })
  }
}

/*****************************************************************************************************************/
