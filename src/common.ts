/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/common
// @license        Copyright © 2021-2023 observerly

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
}

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
