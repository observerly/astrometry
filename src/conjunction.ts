/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/conjunction
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getAngularSeparation } from './astrometry'

import { type GeographicCoordinate } from './common'

import { convertEclipticToEquatorial, convertEquatorialToHorizontal } from './coordinates'

import { type Planet, getPlanetaryGeocentricEclipticCoordinate } from './planets'

/*****************************************************************************************************************/

export type Conjunction = {
  datetime: Date
  planets: [Planet, Planet]
  angularSeparation: number
  ra: number
  dec: number
}

/*****************************************************************************************************************/

/**
 *
 * isConjunction()
 *
 * Technically, a conjunction is a
 *
 * @param datetime - The date and time of the observation to test for conjunction.
 * @param observer - The geographic coordinate of the observer.
 * @param planets - The two planets to test for conjunction.
 * @param horizon - The minimum altitude of the planets above the horizon.
 * @param angularSeparationThreshold - The minimum angular separation of the planets.
 * @returns The conjunction of the two planets if they are in conjunction, otherwise false.
 *
 */
export const isPlanetaryConjunction = (
  datetime: Date,
  observer: GeographicCoordinate,
  planets: [Planet, Planet],
  horizon: number = 6,
  angularSeparationThreshold: number = 3 // one degree of separation
): Conjunction | false => {
  const [from, to] = planets

  // Get the equatorial coordinates of the target planet:
  const here = convertEclipticToEquatorial(
    datetime,
    getPlanetaryGeocentricEclipticCoordinate(datetime, from)
  )

  // Get the equatorial coordinates of the target planet:
  const there = convertEclipticToEquatorial(
    datetime,
    getPlanetaryGeocentricEclipticCoordinate(datetime, to)
  )

  // Get the horizontal coordinates of the target planet:
  const hither = convertEquatorialToHorizontal(datetime, observer, here)

  // Get the horizontal coordinates of the target planet:
  const tither = convertEquatorialToHorizontal(datetime, observer, there)

  // If either here or there is below the horizon, return false:
  if (hither.alt < horizon || tither.alt < horizon) return false

  // Get the angular separation between the two planets:
  const separation = getAngularSeparation(
    {
      θ: hither.alt,
      φ: hither.az
    },
    {
      θ: tither.alt,
      φ: tither.az
    }
  )

  if (separation > angularSeparationThreshold) return false

  return {
    datetime,
    planets,
    angularSeparation: separation,
    ra: (here.ra + there.ra) / 2,
    dec: (here.dec + there.dec) / 2
  }
}

/*****************************************************************************************************************/
