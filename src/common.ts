/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/common
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

export type Maybe<T> = NonNullable<T> | undefined

/*****************************************************************************************************************/

export type Interval = {
  /**
   *
   * The from date of an interval is the start date of the interval.
   *
   */
  from: Date
  /**
   *
   * The to date of an interval is the end date of the interval.
   *
   */
  to: Date
}

/*****************************************************************************************************************/

export type Observer = {
  /**
   *
   *
   * The datetime of an observer is the date and time at which the observation
   * was or will be made.
   *
   *
   */
  datetime: Date
  /**
   *
   *
   * The elevation of an observer is the distance above sea level of the point
   * of observation, or the height of the point of observation above the
   * surface of the Earth (in SI metres).
   *
   *
   */
  elevation?: number
} & GeographicCoordinate

/*****************************************************************************************************************/

export type CartesianCoordinate = {
  /**
   *
   *
   * The x-coordinate of a cartesian coordinate is the distance from the origin
   * to the point on the x-axis.
   *
   *
   */
  x: number
  /**
   *
   *
   * The y-coordinate of a cartesian coordinate is the distance from the origin
   * to the point on the y-axis.
   *
   *
   */
  y: number
  /**
   *
   *
   * The z-coordinate of a cartesian coordinate is the distance from the origin
   * to the point on the z-axis.
   *
   *
   */
  z?: number
}

/*****************************************************************************************************************/

export type EclipticCoordinate = {
  /**
   *
   *
   * The geocentric ecliptic longitude of a celestial object is the angular
   * distance measured eastward along the ecliptic from the March equinox to
   * the (hour circle of the) point above the Earth in question.
   *
   *
   */
  λ: number
  /**
   *
   *
   * The geocentric ecliptic latitude of a celestial object is the angular
   * distance measured north or south of the ecliptic of the point on the
   * celestial sphere, relative to the ecliptic plane for an observer on
   * the Earth.
   *
   *
   */
  β: number
}

/*****************************************************************************************************************/

export type GalacticCoordinate = {
  /**
   *
   *
   * The galactic longitude of a celestial object is the angular distance
   * measured eastward along the galactic equator from the galactic center
   * to the (hour circle of the) point above the Earth in question.
   *
   *
   */
  l: number
  /**
   *
   *
   * The galactic latitude of a celestial object is the angular distance
   * measured north or south of the galactic equator along the hour circle
   * passing through the point in question.
   *
   *
   */
  b: number
}

/*****************************************************************************************************************/

export type EquatorialCoordinate = {
  /**
   *
   *
   * The right ascension of a celestial object is the angular distance measured
   * eastward along the celestial equator from the Sun at the March equinox to
   * the (hour circle of the) point above the earth in question.
   *
   *
   */
  ra: number
  /**
   *
   *
   * The declination of a celestial object is the angular distance measured
   * north or south of the celestial equator along the hour circle passing
   * through the point in question.
   *
   *
   */
  dec: number
  /**
   *
   *
   * The epoch of a celestial object is the Julian date at which its coordinate was resolved, e.g.,
   * J2000.0 for a coordinate of the standard epoch, or 2457388.5 for a coordinate of the Gaia DR3
   * epoch of J2016.0.
   *
   * N.B. Where it is not given, the coordinate is taken to be of the standard epoch, J2000.0.
   *
   *
   */
  epoch?: number
}

/*****************************************************************************************************************/

export const isEquatorialCoordinate = (target: unknown): target is EquatorialCoordinate => {
  return (
    typeof target === 'object' &&
    target !== null &&
    Number.isFinite((target as EquatorialCoordinate).dec) &&
    Number.isFinite((target as EquatorialCoordinate).ra) &&
    // The epoch is optional, but it is a finite Julian date where it is given:
    ((target as EquatorialCoordinate).epoch === undefined ||
      Number.isFinite((target as EquatorialCoordinate).epoch))
  )
}

/*****************************************************************************************************************/

export type EquatorialProperMotion = {
  /**
   *
   *
   * The proper motion of a celestial object in right ascension, μα*, is the rate at which the
   * object appears to move along the celestial equator, in arcseconds per Julian year.
   *
   * As the IAU defines it for the ICRS, the rate is measured towards increasing right ascension,
   * and so it is positive for an object moving eastward, and negative for an object moving
   * westward.
   *
   * N.B. As published by, e.g., the Gaia and Hipparcos catalogues, the proper motion in right
   * ascension is the great-circle rate, μα* = μα cos δ, e.g., it is scaled by the cosine of the
   * declination of the object, and is therefore not the rate of change of the right ascension
   * itself.
   *
   *
   */
  ra: number
  /**
   *
   *
   * The proper motion of a celestial object in declination, μδ, is the rate at which the object
   * appears to move along its hour circle, in arcseconds per Julian year.
   *
   * As the IAU defines it for the ICRS, the rate is measured towards increasing declination, and
   * so it is positive for an object moving northward, and negative for an object moving southward.
   *
   *
   */
  dec: number
}

/*****************************************************************************************************************/

export const isEquatorialProperMotion = (target: unknown): target is EquatorialProperMotion => {
  return (
    typeof target === 'object' &&
    target !== null &&
    Number.isFinite((target as EquatorialProperMotion).dec) &&
    Number.isFinite((target as EquatorialProperMotion).ra)
  )
}

/*****************************************************************************************************************/

export type GeographicCoordinate = {
  /**
   *
   *
   * The latitude of a geographic coordinate is the angular distance north or
   * south of the equator of the point on the Earth's surface.
   *
   *
   */
  latitude: number
  /**
   *
   *
   * The longitude of a geographic coordinate is the angular distance east or
   * west of the prime meridian of the point on the Earth's surface.
   *
   *
   */
  longitude: number
  /**
   *
   *
   * The elevation of a geographic coordinate is the distance above sea level of the point
   * on the Earth's surface, or the height of the point on the Earth's surface above the
   * surface of the Earth (in SI metres).
   *
   *
   */
  elevation?: number
}

/*****************************************************************************************************************/

export type Hemisphere = 'Northern' | 'Southern'

/*****************************************************************************************************************/

export type HorizontalCoordinate = {
  /**
   *
   *
   * The altitude of a celestial object is the angular distance of that object
   * above the observer's horizon. It is the complement of the zenith angle.
   * The horizon is 0° altitude, while directly overhead is 90° altitude.
   *
   *
   */
  alt: number
  /**
   *
   *
   * The azimuth of a celestial object is the angular distance measured eastward
   * along the celestial horizon from the north point of the horizon to the (hour
   * circle of the) point above the earth in question.
   *
   *
   */
  az: number
}

/*****************************************************************************************************************/

export const isHorizontalCoordinate = (target: unknown): target is HorizontalCoordinate => {
  return (
    typeof target === 'object' &&
    target !== null &&
    Number.isFinite((target as HorizontalCoordinate).alt) &&
    Number.isFinite((target as HorizontalCoordinate).az)
  )
}

/*****************************************************************************************************************/

/**
 *
 * A spherical coordinate follows the ISO 80000-2 convention, in which the polar angle is denoted θ
 * and the azimuthal angle is denoted φ, and not the mathematical convention, in which the two are
 * transposed.
 *
 * N.B. ISO 80000-2 measures the polar angle from the zenith, e.g., the positive z-axis, giving a
 * range of [0, 180]. As is conventional in astronomy, we instead measure it from the reference
 * plane, e.g., the horizon or the celestial equator, giving a range of [-90, 90], such that θ is
 * the altitude or the declination of a target directly, and not its complement.
 *
 * @see https://www.iso.org/standard/64973.html
 *
 */
export type SphericalCoordinate = {
  /**
   *
   * The polar angle subtended by a point in spherical coordinates is the angle
   * measured from the reference plane to the line segment connecting the origin
   * to the point, in the range [-90, 90].
   *
   * N.B. The polar angle is the latitudinal angle of a coordinate, e.g., the
   * altitude of a { HorizontalCoordinate }, the declination of an
   * { EquatorialCoordinate }, or the latitude of a { GeographicCoordinate }.
   *
   */
  θ: number
  /**
   *
   * The azimuthal angle subtended by a point in spherical coordinates is the
   * angle measured from the positive x-axis to the line segment connecting
   * the origin to the projection of the point onto the reference plane, in the
   * range [0, 360).
   *
   * N.B. The azimuthal angle is the longitudinal angle of a coordinate, e.g.,
   * the azimuth of a { HorizontalCoordinate }, the right ascension of an
   * { EquatorialCoordinate }, or the longitude of a { GeographicCoordinate }.
   *
   */
  φ: number
}

/*****************************************************************************************************************/
