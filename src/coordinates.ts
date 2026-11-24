/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/coordinates
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import {
  getApparentHourAngle,
  getGreenwichSiderealTime,
  getLocalApparentSiderealTime
} from './astrometry'

import type {
  CartesianCoordinate,
  EclipticCoordinate,
  EquatorialCoordinate,
  GalacticCoordinate,
  GeographicCoordinate,
  HorizontalCoordinate
} from './common'
import { EARTH_FLATTENING, EARTH_RADIUS } from './constants'

import {
  doTranspose,
  getMatrixProduct,
  getRotatedCartesianCoordinate,
  getRotationMatrix
} from './maths'

import { getTrueObliquityOfTheEcliptic } from './nutation'

import {
  convertRadiansToDegrees as degrees,
  getNormalizedAzimuthalDegree,
  convertDegreesToRadians as radians
} from './utilities'

/*****************************************************************************************************************/

/**
 *
 * convertEclipticToEquatorial()
 *
 * Performs the conversion from Ecliptic to Equatorial coordinates for a given
 * datetime and target (observer agnostic).
 *
 * N.B. The conversion is about the true obliquity of the ecliptic, e.g., the mean obliquity of
 * the date corrected for the nutation in obliquity, and so an ecliptic coordinate of the date is
 * referred to the true equator and equinox of the date.
 *
 * N.B. The conversion is the rotation of the unit vector of the target about the x-axis, e.g., the
 * direction of the true equinox of the date, through the transpose of R1(ε), e.g., the inverse of
 * the rotation of convertEquatorialToEcliptic().
 *
 * @param datetime - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param target - The ecliptical coordinate of the observed object.
 * @returns The equatorial coordinates of the target, with the right ascension within [0°, 360°).
 *
 */
export function convertEclipticToEquatorial(
  datetime: Date,
  target: EclipticCoordinate
): EquatorialCoordinate {
  // The rotation from the true ecliptic and equinox of the date to the true equator and equinox of
  // the date, the transpose of R1(ε), e.g., of getEquatorialToEclipticMatrix() of the frames
  // module, which is composed here as the frames module depends on this one:
  const Eᵀ = doTranspose(getRotationMatrix('x', getTrueObliquityOfTheEcliptic(datetime)))

  // The unit vector of the target in the ecliptic frame, resolved from the longitude and latitude
  // of the ecliptic in place of the right ascension and declination, and rotated onto the equator:
  return convertCartesianToEquatorial(
    getRotatedCartesianCoordinate(Eᵀ, convertEquatorialToCartesian({ ra: target.λ, dec: target.β }))
  )
}

/*****************************************************************************************************************/

/**
 *
 * convertEquatorialToEcliptic()
 *
 * Performs the conversion from Equatorial to Ecliptic coordinates for a given datetime and target
 * (observer agnostic), as the rotation of the unit vector of the target about the x-axis, e.g., the
 * direction of the true equinox of the date, through the true obliquity of the ecliptic, R1(ε).
 *
 * N.B. The conversion is about the true obliquity of the ecliptic, e.g., the mean obliquity of
 * the date corrected for the nutation in obliquity, and so the equatorial coordinate is taken as
 * referred to the true equator and equinox of the date, as convertEclipticToEquatorial() returns.
 *
 * @param datetime - The date to convert the equatorial coordinate for.
 * @param target - The equatorial coordinate of the target.
 * @returns The ecliptic coordinate of the target, with the longitude within [0°, 360°).
 *
 */
export function convertEquatorialToEcliptic(
  datetime: Date,
  target: EquatorialCoordinate
): EclipticCoordinate {
  // The rotation from the true equator and equinox of the date to the true ecliptic and equinox of
  // the date, R1(ε), e.g., getEquatorialToEclipticMatrix() of the frames module, which is composed
  // here as the frames module depends on this one:
  const E = getRotationMatrix('x', getTrueObliquityOfTheEcliptic(datetime))

  // The unit vector of the target, rotated into the ecliptic frame, and resolved as the longitude
  // and latitude of the ecliptic in place of the right ascension and declination:
  const { ra, dec } = convertCartesianToEquatorial(
    getRotatedCartesianCoordinate(E, convertEquatorialToCartesian(target))
  )

  return {
    λ: ra,
    β: dec
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertGalacticToEquatorial()
 *
 * Performs the conversion from Galactic to Equatorial coordinates for a given target (observer and
 * datetime agnostic), as the rotation of the unit vector of the target from the galactic frame to
 * the International Celestial Reference System (ICRS), as is defined by the Hipparcos catalogue
 * (ESA 1997, Vol. 1, §1.5.3), through the transpose of G = R3(90° − θ) · R1(90° − δP) ·
 * R3(αP + 90°), e.g., the inverse of the rotation of convertEquatorialToGalactic().
 *
 * N.B. The galactic frame is fixed, e.g., it is not a function of the date, and is referred to the
 * ICRS, and so the equatorial coordinate is returned as a catalogue coordinate of the ICRS.
 *
 * @param target - The galactic coordinate of the observed object.
 * @returns The equatorial coordinate of the target, referred to the ICRS, with the right ascension
 * within [0°, 360°).
 *
 */
export function convertGalacticToEquatorial(target: GalacticCoordinate): EquatorialCoordinate {
  // The right ascension of the north galactic pole, referred to the ICRS (in degrees):
  const αP = 192.85948

  // The declination of the north galactic pole, referred to the ICRS (in degrees):
  const δP = 27.12825

  // The galactic longitude of the north celestial pole of the ICRS (in degrees):
  const θ = 122.93192

  // The rotation from the galactic frame to the ICRS, the transpose of G, e.g., of
  // getEquatorialToGalacticMatrix() of the frames module, which is composed here as the frames
  // module depends on this one:
  const Gᵀ = doTranspose(
    getMatrixProduct(
      getRotationMatrix('z', 90 - θ),
      getMatrixProduct(getRotationMatrix('x', 90 - δP), getRotationMatrix('z', αP + 90))
    )
  )

  // The unit vector of the target in the galactic frame, resolved from the galactic longitude and
  // latitude in place of the right ascension and declination, and rotated into the ICRS:
  return convertCartesianToEquatorial(
    getRotatedCartesianCoordinate(Gᵀ, convertEquatorialToCartesian({ ra: target.l, dec: target.b }))
  )
}

/*****************************************************************************************************************/

/**
 *
 * convertEquatorialToGalactic()
 *
 * Performs the conversion from Equatorial to Galactic coordinates for a given target (observer and
 * datetime agnostic), as the rotation of the unit vector of the target from the International
 * Celestial Reference System (ICRS) to the galactic frame, as is defined by the Hipparcos catalogue
 * (ESA 1997, Vol. 1, §1.5.3), e.g., G = R3(90° − θ) · R1(90° − δP) · R3(αP + 90°).
 *
 * N.B. The galactic frame is fixed, e.g., it is not a function of the date, and is referred to the
 * ICRS, and so the equatorial coordinate is taken as a catalogue coordinate referred to the ICRS.
 *
 * @param target - The equatorial coordinate of the target, referred to the ICRS.
 * @returns The galactic coordinate of the target, with the longitude within [0°, 360°).
 *
 */
export function convertEquatorialToGalactic(target: EquatorialCoordinate): GalacticCoordinate {
  // The right ascension of the north galactic pole, referred to the ICRS (in degrees):
  const αP = 192.85948

  // The declination of the north galactic pole, referred to the ICRS (in degrees):
  const δP = 27.12825

  // The galactic longitude of the north celestial pole of the ICRS (in degrees):
  const θ = 122.93192

  // The rotation from the ICRS to the galactic frame, G, e.g., getEquatorialToGalacticMatrix() of
  // the frames module, which is composed here as the frames module depends on this one:
  const G = getMatrixProduct(
    getRotationMatrix('z', 90 - θ),
    getMatrixProduct(getRotationMatrix('x', 90 - δP), getRotationMatrix('z', αP + 90))
  )

  // The unit vector of the target, rotated into the galactic frame, and resolved as the galactic
  // longitude and latitude in place of the right ascension and declination:
  const { ra, dec } = convertCartesianToEquatorial(
    getRotatedCartesianCoordinate(G, convertEquatorialToCartesian(target))
  )

  return {
    l: ra,
    b: dec
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertEquatorialToHorizontal()
 *
 * Performs the conversion from Equatorial to Horizontal coordinates for a given
 * datetime, observer, and target.
 *
 * N.B. A target given at a geocentric distance, e.g., the Moon or an artificial satellite, is
 * corrected for its diurnal parallax, as seen from the observer on or above the WGS84 ellipsoid,
 * whose latitude is the geodetic latitude and whose elevation is above the ellipsoid.
 *
 * @param datetime - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param observer - The geographic coordinate of the observer.
 * @param target - The equatorial coordinate and geocentric distance (in SI metres) of the target.
 * @returns The horizontal coordinates of the target
 *
 */
export function convertEquatorialToHorizontal(
  datetime: Date,
  observer: GeographicCoordinate,
  target: EquatorialCoordinate & { distance?: number }
): HorizontalCoordinate {
  const { latitude, longitude, elevation = 0 } = observer

  let declination = radians(target.dec)

  // N.B. The cosine of the latitude does not vanish for any finite latitude, e.g., it is ~6.1e-17
  // at ±90°, where the altitude resolves to the declination of the target through the ordinary
  // path, and a latitude that is not finite, e.g., NaN or ±Infinity, propagates through it as NaN:

  // Get the hour angle for the target, taken against the Local Apparent Sidereal Time, e.g., referred
  // to the true equinox of the date, as the apparent place of a target is, which balances the
  // nutation in longitude its right ascension carries:
  let ha = radians(getApparentHourAngle(datetime, longitude, target.ra))

  // The topocentric hour angle and declination of a nearby target, e.g., as seen from the observer
  // on the surface of the Earth, rather than from its center:
  if (target.distance !== undefined && target.distance > 0) {
    // An observer with a coordinate that is not finite is at no one position, and so the parallax
    // of the target, and with it the coordinate, is NaN:
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(elevation)) {
      return { alt: Number.NaN, az: Number.NaN }
    }

    // The geocentric position of the observer on or above the WGS84 ellipsoid (in SI metres):
    const { x, y, z } = convertGeographicToGeocentric(datetime, observer)

    // The observer is in the plane of their own meridian, at ρ from the axis of rotation and at z
    // above the plane of the equator, and so is resolved in that plane, e.g., in the frame of the
    // apparent hour angle of the target, rather than against the mean sidereal time the geocentric
    // position is rotated by (in SI metres):
    const ρ = Math.hypot(x, y)

    // The position of the target less the position of the observer, in the frame of the meridian
    // of the observer, e.g., with the x-axis towards the meridian on the equator, the y-axis towards
    // an hour angle of 90°, west of the meridian, and the z-axis towards the celestial pole, which
    // holds exactly for any distance, e.g., for the Moon and for an artificial satellite, and not to
    // the first order of the parallax alone (in SI metres):
    const u = target.distance * Math.cos(declination) * Math.cos(ha) - ρ

    const v = target.distance * Math.cos(declination) * Math.sin(ha)

    const w = target.distance * Math.sin(declination) - z

    ha = Math.atan2(v, u)

    declination = Math.atan2(w, Math.hypot(u, v))
  }

  // Calculate the altitude of the target, ensuring it is within the range -π/2 to π/2 for arcsin,
  // i.e., between [-1, 1]. This accounts for the observer's target being directly overhead, e.g., at the zenith,
  // or directly below the observer, e.g., at the nadir.
  const altitude = Math.asin(
    Math.max(
      -1,
      Math.min(
        1,
        Math.sin(declination) * Math.sin(radians(latitude)) +
          Math.cos(declination) * Math.cos(radians(latitude)) * Math.cos(ha)
      )
    )
  )

  // The azimuth of the target, measured from the north through the east, resolved from both of its
  // components, as ERFA hd2ae resolves it, e.g., and not from its cosine alone, which is undefined
  // at either pole of the Earth, where the altitude does not depend on the hour angle:
  const azimuth = Math.atan2(
    -Math.cos(declination) * Math.sin(ha),
    Math.sin(declination) * Math.cos(radians(latitude)) -
      Math.cos(declination) * Math.sin(radians(latitude)) * Math.cos(ha)
  )

  // N.B. The elevation of the observer does not displace a distant target: it depresses the
  // observer's horizon, e.g., getLocalHorizon(), which the horizon-relative predicates apply to the
  // horizon they compare the altitude of the target against:
  return {
    alt: degrees(altitude),
    az: (degrees(azimuth) + 360) % 360
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertHorizontalToEquatorial()
 *
 * Performs the conversion from Horizontal to Equatorial coordinates for a given
 * datetime, observer, and target.
 *
 * @param datetime - The date and time of the observation for which to calculate the Horizontal coordinate
 * @param observer - The geographic coordinate of the observer.
 * @param target - The horizontal coordinate of the observed object.
 * @returns The equatorial coordinates of the target
 */
export function convertHorizontalToEquatorial(
  datetime: Date,
  observer: GeographicCoordinate,
  target: HorizontalCoordinate
): EquatorialCoordinate {
  const { latitude, longitude } = observer

  const altitude = radians(target.alt)
  const azimuth = radians(target.az)

  // Calculate the declination (in radians) for the target:
  const dec = Math.asin(
    Math.sin(radians(latitude)) * Math.sin(altitude) +
      Math.cos(radians(latitude)) * Math.cos(altitude) * Math.cos(azimuth)
  )

  // Calculate the hour angle (in radians) for the target:
  let ha = Math.atan2(
    (-Math.sin(azimuth) * Math.cos(altitude)) / Math.cos(dec),
    (Math.sin(altitude) - Math.sin(radians(latitude)) * Math.sin(dec)) /
      (Math.cos(radians(latitude)) * Math.cos(dec))
  )

  // Adjust the hour angle for the observer's longitude:
  if (ha < 0) {
    ha += 2 * Math.PI
  }

  // Calculate the Local Apparent Sidereal Time (LAST) for the observer, e.g., referred to the true
  // equinox of the date, against which the hour angle of an apparent place is taken:
  const LST = getLocalApparentSiderealTime(datetime, longitude)

  // Calculate the Right Ascension (in degrees) for the target:
  let ra = LST * 15 - degrees(ha)

  // Adjust the angle to be within the range 0° to 360°:
  if (ra < 0) {
    ra += 360
  }

  return {
    ra: ra % 360,
    dec: degrees(dec)
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertGeocentricToGeographic()
 *
 * Performs the conversion from a geocentric equatorial cartesian position to the geographic
 * coordinate of the observer at that position, e.g., the coordinate of the point on the surface
 * of the Earth directly beneath them, together with their elevation above it.
 *
 * The position is given in the geocentric equatorial frame, e.g., the frame an ephemeris resolves
 * the position of a satellite in, with the x-axis towards the vernal equinox, the z-axis along the
 * rotational axis of the Earth, and the origin at its center (in SI metres).
 *
 * N.B. The latitude is resolved against a spherical Earth, e.g., it is the geocentric latitude,
 * which is the figure of the Earth everywhere else in the library, and the elevation is taken
 * above the radius given, e.g., an observer of a different figure of the Earth gives the radius
 * of it.
 *
 * @param datetime - The date and time of the observation, which orients the Earth beneath the position.
 * @param position - The geocentric equatorial cartesian position of the observer (in SI metres).
 * @param radius - The radius of the Earth (in SI metres). Defaults to the equatorial radius.
 * @throws An error if any component of the position is not finite, or the position is at the center of the Earth.
 * @throws An error if the radius is not finite, or is not greater than zero.
 * @returns The geographic coordinate of the observer, e.g., { latitude, longitude, elevation }.
 *
 */
export function convertGeocentricToGeographic(
  datetime: Date,
  position: Required<CartesianCoordinate>,
  radius: number = EARTH_RADIUS
): GeographicCoordinate {
  const { x, y, z } = position

  // A position with a component that is not finite has no direction to resolve a coordinate from:
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    throw new Error('Invalid position: each of the x, y and z components must be finite')
  }

  // The distance of the position from the center of the Earth (in SI metres):
  const distance = Math.hypot(x, y, z)

  // Every direction meets at the center of the Earth, and so a position there is above no one
  // point of the surface:
  if (distance === 0) {
    throw new Error('Invalid position: the position must not be at the center of the Earth')
  }

  if (!Number.isFinite(radius)) {
    throw new Error('Invalid radius: the radius must be finite')
  }

  if (radius <= 0) {
    throw new Error('Invalid radius: the radius must be greater than zero')
  }

  // The latitude of the position, e.g., its angle from the plane of the equator, which is taken
  // against the distance from the axis of rotation, and not as the arc sine of the polar
  // component, which is ill-conditioned towards the poles:
  const latitude = degrees(Math.atan2(z, Math.hypot(x, y)))

  // The right ascension of the position, e.g., its angle from the vernal equinox, in the plane of
  // the equator (in degrees):
  const ra = degrees(Math.atan2(y, x))

  // The Earth rotates beneath the equatorial frame, and so the meridian of the position is the
  // angle between it and the meridian of Greenwich, which lies at the Greenwich Sidereal Time,
  // e.g., the hour angle of the vernal equinox at Greenwich (in hours, of 15 degrees each). The
  // longitude is taken the shorter of the two ways about the sphere, e.g., positive towards the
  // east of Greenwich and negative towards the west of it:
  const longitude =
    getNormalizedAzimuthalDegree(ra - getGreenwichSiderealTime(datetime) * 15 + 180) - 180

  return {
    latitude,
    longitude,
    elevation: distance - radius
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertGeographicToGeocentric()
 *
 * Performs the conversion from the geographic coordinate of an observer to their geocentric
 * equatorial cartesian position, e.g., the position of the observer from the center of the Earth,
 * on or above the ellipsoid that is the figure of the Earth.
 *
 * The position is given in the geocentric equatorial frame, e.g., the frame an ephemeris resolves
 * the position of a satellite in, with the x-axis towards the vernal equinox, the z-axis along the
 * rotational axis of the Earth, and the origin at its center (in SI metres).
 *
 * N.B. The latitude is the geodetic latitude, e.g., the angle of the vertical of the observer from
 * the plane of the equator, as a navigation receiver or a map gives it, and the elevation is taken
 * along that vertical above the ellipsoid. An observer of a spherical Earth gives a flattening of
 * zero, for which the conversion is the inverse of convertGeocentricToGeographic().
 *
 * @param datetime - The date and time of the observation, which orients the Earth beneath the position.
 * @param observer - The geographic coordinate of the observer, e.g., { latitude, longitude, elevation }.
 * @param radius - The equatorial radius of the Earth (in SI metres). Defaults to the equatorial radius.
 * @param flattening - The flattening of the Earth. Defaults to the flattening of the WGS84 ellipsoid.
 * @throws An error if the latitude, longitude or elevation of the observer is not finite.
 * @throws An error if the radius is not finite, or is not greater than zero.
 * @throws An error if the flattening is not finite, or is not in the range [0, 1).
 * @returns The geocentric equatorial cartesian position of the observer (in SI metres).
 *
 */
export function convertGeographicToGeocentric(
  datetime: Date,
  observer: GeographicCoordinate,
  radius: number = EARTH_RADIUS,
  flattening: number = EARTH_FLATTENING
): Required<CartesianCoordinate> {
  const { latitude, longitude, elevation = 0 } = observer

  // A coordinate with a component that is not finite is above no one point of the Earth:
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(elevation)) {
    throw new Error(
      'Invalid observer: each of the latitude, longitude and elevation must be finite'
    )
  }

  if (!Number.isFinite(radius)) {
    throw new Error('Invalid radius: the radius must be finite')
  }

  if (radius <= 0) {
    throw new Error('Invalid radius: the radius must be greater than zero')
  }

  // A flattening of one or more has no polar radius, and a flattening below zero is not oblate:
  if (!Number.isFinite(flattening) || flattening < 0 || flattening >= 1) {
    throw new Error('Invalid flattening: the flattening must be finite and in the range [0, 1)')
  }

  const φ = radians(latitude)

  // The square of the ratio of the polar radius to the equatorial radius of the ellipsoid:
  const w = (1 - flattening) ** 2

  // The radius of curvature of the ellipsoid in the prime vertical at the latitude of the observer,
  // e.g., the distance along their vertical from the surface to the axis of rotation (in SI metres):
  const N = radius / Math.sqrt(Math.cos(φ) ** 2 + w * Math.sin(φ) ** 2)

  // The distance of the observer from the axis of rotation of the Earth (in SI metres):
  const ρ = (N + elevation) * Math.cos(φ)

  // The distance of the observer from the plane of the equator (in SI metres):
  const z = (w * N + elevation) * Math.sin(φ)

  // The Earth rotates beneath the equatorial frame, and so the right ascension of the meridian of
  // the observer is the Greenwich Sidereal Time, e.g., the hour angle of the vernal equinox at
  // Greenwich (in hours, of 15 degrees each), carried east by their longitude (in radians):
  const θ = radians(getGreenwichSiderealTime(datetime) * 15 + longitude)

  return {
    x: ρ * Math.cos(θ),
    y: ρ * Math.sin(θ),
    z
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertEquatorialToCartesian()
 *
 * Performs the conversion from an equatorial coordinate to the unit direction vector of it in the
 * equatorial frame, with the x-axis towards the vernal equinox, the y-axis towards a right
 * ascension of 90°, and the z-axis towards the north celestial pole:
 *
 * x = cos δ cos α
 * y = cos δ sin α
 * z = sin δ
 *
 * N.B. The vector is the direction of the target alone, e.g., it is of unit length, and so the
 * epoch and the parallax of the target, where they are given, are not taken into account.
 *
 * @param target - The equatorial coordinate of the target, e.g., { ra, dec } (in degrees).
 * @returns The unit direction vector of the target, e.g., { x, y, z }.
 *
 */
export function convertEquatorialToCartesian(
  target: EquatorialCoordinate
): Required<CartesianCoordinate> {
  const α = radians(target.ra)

  const δ = radians(target.dec)

  return {
    x: Math.cos(δ) * Math.cos(α),
    y: Math.cos(δ) * Math.sin(α),
    z: Math.sin(δ)
  }
}

/*****************************************************************************************************************/

/**
 *
 * convertCartesianToEquatorial()
 *
 * Performs the conversion from a direction vector in the equatorial frame, of any non-zero length,
 * to the equatorial coordinate of it, with the x-axis towards the vernal equinox, the y-axis towards
 * a right ascension of 90°, and the z-axis towards the north celestial pole.
 *
 * N.B. The declination is taken as the angle between the vector and the plane of the equator, e.g.,
 * atan2(z, hypot(x, y)), and not as the arcsine of the z-component, which is ill-conditioned
 * towards the poles, where the sine of the declination flattens out.
 *
 * N.B. The zero vector has no direction, and so both of its angles are NaN.
 *
 * @param vector - The direction vector in the equatorial frame, e.g., { x, y, z }.
 * @returns The equatorial coordinate of the direction, e.g., { ra, dec } (in degrees), with the right ascension in [0, 360).
 *
 */
export function convertCartesianToEquatorial(
  vector: Required<CartesianCoordinate>
): EquatorialCoordinate {
  const { x, y, z } = vector

  // The zero vector has no direction, e.g., atan2(0, 0) would otherwise resolve it to (0°, 0°):
  if (x === 0 && y === 0 && z === 0) {
    return { ra: Number.NaN, dec: Number.NaN }
  }

  // The right ascension of the direction, where a vanishingly small negative angle rounds up to
  // 360° as it is normalised, and so is wrapped back to 0° to keep it within [0, 360):
  const ra = getNormalizedAzimuthalDegree(degrees(Math.atan2(y, x)))

  return {
    ra: ra === 360 ? 0 : ra,
    dec: degrees(Math.atan2(z, Math.hypot(x, y)))
  }
}

/*****************************************************************************************************************/
