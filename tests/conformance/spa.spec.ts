/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/spa
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import { describe, expect, it } from 'vitest'

import { getAngularSeparation } from '../../src/astrometry'

import { getGeneralizedSolarTransit, getSolarTransit } from '../../src/night'

import { getSolarEquatorialCoordinate, getSolarNoon, getSunrise, getSunset } from '../../src/sun'

import { geocentricSolarCoordinates, solarTransitInstances } from './spa'

/*****************************************************************************************************************/

// The tolerances below are the error envelope of the library as it stands, measured against
// the SPA references, and pinned with a modest headroom so that a regression beyond the
// current envelope fails. They are a baseline, and not a target: each is to be tightened as
// the corrections that dominate it are resolved.

/*****************************************************************************************************************/

// The angular separation of the geocentric apparent place of the Sun from the reference (in
// degrees), e.g., ~0.36 arcseconds. The residual is that of the lower accuracy series for the
// nutation against the full series of the SPA, the truncation of the VSOP87 terms, and the up
// to ~0.9 seconds between UT1 and the civil time the leap seconds hold the two within:
const GEOCENTRIC_SEPARATION_TOLERANCE = 0.0001

/*****************************************************************************************************************/

// The displacement of the geocentric apparent declination of the Sun from the reference (in
// degrees), e.g., ~0.18 arcseconds:
const GEOCENTRIC_DEC_TOLERANCE = 0.00005

/*****************************************************************************************************************/

// The transit of the Sun across the local meridian (in seconds). The transit is resolved by
// the lower accuracy generalized method, and its error carries the date-dependent bias of
// the apparent solar right ascension against the sidereal time:
const TRANSIT_TOLERANCE = 12

/*****************************************************************************************************************/

// The solar noon of getSolarTransit(), e.g., the refined meridian transit of the Sun (in
// seconds). The residual carries the equation of the equinoxes, e.g., the hour angle of the
// Sun is taken against the mean sidereal time, while its right ascension carries the
// nutation in longitude:
const MERIDIAN_TRANSIT_TOLERANCE = 2

/*****************************************************************************************************************/

// The solar noon of getSolarNoon(), e.g., the meridian transit of the Sun resolved against
// the apparent hour angle (in seconds). The equation of the equinoxes is balanced, and so the
// residual is that of the bisection resolution and of the apparent place of the Sun against
// the full series of the SPA:
const APPARENT_MERIDIAN_TRANSIT_TOLERANCE = 0.1

/*****************************************************************************************************************/

// The sunrise and sunset of the standard almanac convention, e.g., the crossings of the
// geometric altitude of the centre of the Sun through the standard altitude of -0.8333° (in
// seconds). The residual carries the equation of the equinoxes, as the meridian transit does:
const STANDARD_RISE_AND_SET_TOLERANCE = 2

/*****************************************************************************************************************/

// The rise and set of the Sun for a horizon given at the standard almanac altitude of
// -0.8333° (in seconds). The horizon is compared against the apparent altitude of the Sun,
// e.g., an altitude that is itself corrected for refraction, and so the refraction within
// the almanac altitude is counted twice, which advances the rise and delays the set by up
// to ~85 seconds:
const HORIZON_CROSSING_TOLERANCE = 100

/*****************************************************************************************************************/

describe('conformance of the geocentric apparent solar coordinate to the NREL SPA', () => {
  it.each(geocentricSolarCoordinates)(
    'should be within the pinned envelope of the reference at $datetime',
    reference => {
      const { ra, dec } = getSolarEquatorialCoordinate(new Date(reference.datetime))

      // The angular separation of the computed place from the reference (in degrees).
      //
      // N.B. Per ISO 80000-2, the polar angle, θ, is the declination of the coordinate, and
      // the azimuthal angle, φ, is its right ascension:
      const separation = getAngularSeparation(
        { θ: dec, φ: ra },
        { θ: reference.dec, φ: reference.ra }
      )

      // The displacement in declination (in degrees):
      const Δdec = dec - reference.dec

      expect(separation).toBeLessThan(GEOCENTRIC_SEPARATION_TOLERANCE)

      expect(Math.abs(Δdec)).toBeLessThan(GEOCENTRIC_DEC_TOLERANCE)
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the solar transit to the NREL SPA', () => {
  it.each(solarTransitInstances)(
    'should be within the pinned envelope of the reference at $name on $date',
    reference => {
      const observer = {
        latitude: reference.latitude,
        longitude: reference.longitude,
        elevation: reference.elevation
      }

      const midnight = new Date(`${reference.date}T00:00:00.000Z`)

      // The generalized transit is resolved for every observer, including an observer in a
      // polar day or night, for whom the Sun still crosses the local meridian:
      const { noon } = getGeneralizedSolarTransit(midnight, observer)

      expect(noon).not.toBeNull()

      const Δnoon = ((noon as Date).getTime() - new Date(reference.transit).getTime()) / 1000

      expect(Math.abs(Δnoon)).toBeLessThan(TRANSIT_TOLERANCE)
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the solar rise and set to the NREL SPA', () => {
  it.each(solarTransitInstances.filter(reference => reference.sunrise !== null))(
    'should be within the pinned envelope of the reference at $name on $date',
    reference => {
      const observer = {
        latitude: reference.latitude,
        longitude: reference.longitude,
        elevation: reference.elevation
      }

      const midnight = new Date(`${reference.date}T00:00:00.000Z`)

      // The events are resolved at the standard almanac altitude the references are stated
      // at, e.g., the geometric altitude of the upper limb of the Sun at the horizon under
      // a fixed ~34 arcminute refraction:
      const { sunrise, noon, sunset } = getSolarTransit(midnight, observer, -0.8333)

      expect(sunrise).not.toBeNull()

      expect(noon).not.toBeNull()

      expect(sunset).not.toBeNull()

      const Δnoon = ((noon as Date).getTime() - new Date(reference.transit).getTime()) / 1000

      expect(Math.abs(Δnoon)).toBeLessThan(MERIDIAN_TRANSIT_TOLERANCE)

      const Δsunrise =
        ((sunrise as Date).getTime() - new Date(reference.sunrise as string).getTime()) / 1000

      const Δsunset =
        ((sunset as Date).getTime() - new Date(reference.sunset as string).getTime()) / 1000

      expect(Math.abs(Δsunrise)).toBeLessThan(HORIZON_CROSSING_TOLERANCE)

      expect(Math.abs(Δsunset)).toBeLessThan(HORIZON_CROSSING_TOLERANCE)
    }
  )

  it.each(solarTransitInstances.filter(reference => reference.sunrise === null))(
    'should not resolve a rise or a set at $name on $date',
    reference => {
      const observer = {
        latitude: reference.latitude,
        longitude: reference.longitude,
        elevation: reference.elevation
      }

      const midnight = new Date(`${reference.date}T00:00:00.000Z`)

      // The Sun does not cross the horizon for an observer in a polar day or a polar night:
      const { sunrise, sunset } = getSolarTransit(midnight, observer, -0.8333)

      expect(sunrise).toBeNull()

      expect(sunset).toBeNull()
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the almanac solar noon to the NREL SPA', () => {
  it.each(solarTransitInstances)(
    'should be within the pinned envelope of the reference at $name on $date',
    reference => {
      const observer = {
        latitude: reference.latitude,
        longitude: reference.longitude,
        elevation: reference.elevation
      }

      const midnight = new Date(`${reference.date}T00:00:00.000Z`)

      // The solar noon is resolved for every observer, including an observer in a polar day
      // or night, for whom the Sun still crosses the local meridian:
      const noon = getSolarNoon(midnight, observer)

      const Δnoon = (noon.getTime() - new Date(reference.transit).getTime()) / 1000

      expect(Math.abs(Δnoon)).toBeLessThan(APPARENT_MERIDIAN_TRANSIT_TOLERANCE)
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the almanac sunrise to the NREL SPA', () => {
  it.each(solarTransitInstances.filter(reference => reference.sunrise !== null))(
    'should be within the pinned envelope of the reference at $name on $date',
    reference => {
      const observer = {
        latitude: reference.latitude,
        longitude: reference.longitude,
        elevation: reference.elevation
      }

      const midnight = new Date(`${reference.date}T00:00:00.000Z`)

      const sunrise = getSunrise(midnight, observer)

      expect(sunrise).not.toBeNull()

      const Δsunrise =
        ((sunrise as Date).getTime() - new Date(reference.sunrise as string).getTime()) / 1000

      expect(Math.abs(Δsunrise)).toBeLessThan(STANDARD_RISE_AND_SET_TOLERANCE)
    }
  )

  it.each(solarTransitInstances.filter(reference => reference.sunrise === null))(
    'should not resolve a sunrise at $name on $date',
    reference => {
      const observer = {
        latitude: reference.latitude,
        longitude: reference.longitude,
        elevation: reference.elevation
      }

      const midnight = new Date(`${reference.date}T00:00:00.000Z`)

      // The Sun does not cross the horizon for an observer in a polar day or a polar night:
      expect(getSunrise(midnight, observer)).toBeNull()
    }
  )
})

/*****************************************************************************************************************/

describe('conformance of the almanac sunset to the NREL SPA', () => {
  it.each(solarTransitInstances.filter(reference => reference.sunset !== null))(
    'should be within the pinned envelope of the reference at $name on $date',
    reference => {
      const observer = {
        latitude: reference.latitude,
        longitude: reference.longitude,
        elevation: reference.elevation
      }

      const midnight = new Date(`${reference.date}T00:00:00.000Z`)

      const sunset = getSunset(midnight, observer)

      expect(sunset).not.toBeNull()

      const Δsunset =
        ((sunset as Date).getTime() - new Date(reference.sunset as string).getTime()) / 1000

      expect(Math.abs(Δsunset)).toBeLessThan(STANDARD_RISE_AND_SET_TOLERANCE)
    }
  )

  it.each(solarTransitInstances.filter(reference => reference.sunset === null))(
    'should not resolve a sunset at $name on $date',
    reference => {
      const observer = {
        latitude: reference.latitude,
        longitude: reference.longitude,
        elevation: reference.elevation
      }

      const midnight = new Date(`${reference.date}T00:00:00.000Z`)

      // The Sun does not cross the horizon for an observer in a polar day or a polar night:
      expect(getSunset(midnight, observer)).toBeNull()
    }
  )
})

/*****************************************************************************************************************/
