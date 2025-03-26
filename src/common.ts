/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/common
// @license        Copyright © 2021-2023 observerly

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
}

/*****************************************************************************************************************/

export const isEquatorialCoordinate = (target: unknown): target is EquatorialCoordinate => {
  return (
    typeof target === 'object' &&
    target !== null &&
    typeof (target as EquatorialCoordinate).dec === 'number' &&
    typeof (target as EquatorialCoordinate).ra === 'number'
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
    typeof (target as HorizontalCoordinate).alt === 'number' &&
    typeof (target as HorizontalCoordinate).az === 'number'
  )
}

/*****************************************************************************************************************/

export type SphericalCoordinate = {
  /**
   *
   * The polar angle subtended by a point in spherical coordinates is the angle
   * measured from the positive z-axis to the line segment connecting the
   * origin to the point.
   *
   */
  θ: number
  /**
   *
   * The azimuthal angle subtended by a point in spherical coordinates is the
   * angle measured from the positive x-axis to the line segment connecting
   * the origin to the point.
   *
   */
  φ: number
}

/*****************************************************************************************************************/
