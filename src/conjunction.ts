/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/conjunction
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

import { getAngularSeparation } from './astrometry'

import { type GeographicCoordinate, type Interval } from './common'

import { convertEclipticToEquatorial, convertEquatorialToHorizontal } from './coordinates'

import {
  type Planet,
  getPlanetaryGeocentricEclipticCoordinate,
  getPlanetaryPositions
} from './planets'

/*****************************************************************************************************************/

export type Conjunction = {
  datetime: Date
  planets: [Planet, Planet]
  angularSeparation: number
  ra: number
  dec: number
}

/*****************************************************************************************************************/

const ANGULAR_SEPARATION_THRESHOLD = 3 // in degrees

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
  params: {
    horizon?: number // six degrees above the horizon
    angularSeparationThreshold?: number // three degrees of separation
  } = {
    horizon: 6,
    angularSeparationThreshold: ANGULAR_SEPARATION_THRESHOLD
  }
): Conjunction | false => {
  const [from, to] = planets

  const { horizon = 6, angularSeparationThreshold = ANGULAR_SEPARATION_THRESHOLD } = params

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

/**
 * findPlanetaryConjunction
 *
 * Finds the next conjunction of two planets within a given time interval.
 *
 * @param startDate - The start date and time of the interval to search for conjunction.
 * @param endDate - The end date and time of the interval to search for conjunction.
 * @param observer - The geographic coordinate of the observer.
 * @param planets - The two planets to test for conjunction.
 * @param horizon - The minimum altitude of the planets above the horizon.
 * @param angularSeparationThreshold - The minimum angular separation of the planets.
 * @param stepMinutes - The step size in minutes for checking conjunction.
 * @returns The conjunction of the two planets if they are in conjunction, otherwise null.
 */
export const findPlanetaryConjunction = (
  interval: Interval,
  observer: GeographicCoordinate,
  planets: [Planet, Planet],
  params: {
    horizon?: number // six degrees above the horizon
    angularSeparationThreshold?: number // three degrees of separation
    stepMinutes?: number // check every 1/3 hour
  } = {
    horizon: 6,
    angularSeparationThreshold: 3,
    stepMinutes: 20
  }
): Conjunction | undefined => {
  /*eslint prefer-const: ["error", {"destructuring": "all"}]*/
  let { from, to } = interval

  const {
    horizon = 6,
    angularSeparationThreshold = ANGULAR_SEPARATION_THRESHOLD,
    stepMinutes = 20
  } = params

  while (from <= to) {
    const conjunction = isPlanetaryConjunction(from, observer, planets, {
      horizon,
      angularSeparationThreshold
    })

    if (conjunction) {
      return conjunction
    }

    from = new Date(from.getTime() + stepMinutes * 60000)
  }

  return undefined
}

/*****************************************************************************************************************/

/**
 * findPlanetaryConjunctions
 *
 * Finds all conjunctions of the planets within a given time interval, returning only those that are in
 * conjunction with each other (as determined by the angular separation threshold).
 *
 * @param interval - The interval to search for the initial conjunction.
 * @param observer - The geographic coordinate of the observer.
 * @param horizon - The minimum altitude of the planets above the horizon.
 * @param angularSeparationThreshold - The minimum angular separation for conjunction.
 * @param stepMinutes - The step size in minutes for checking conjunction.
 * @returns An array of conjunctions found.
 *
 */
export const findPlanetaryConjunctions = (
  interval: Interval,
  observer: GeographicCoordinate,
  params: {
    horizon?: number // six degrees above the horizon
    angularSeparationThreshold?: number // three degrees of separation
    stepMinutes?: number // check every 1/3 hour
  } = {
    horizon: 6,
    angularSeparationThreshold: ANGULAR_SEPARATION_THRESHOLD,
    stepMinutes: 20
  }
): Map<string, Conjunction> => {
  // A conjunction is a close apparent approach of two celestial objects in the sky.
  const conjunctions = new Map<string, Conjunction>()

  /*eslint prefer-const: ["error", {"destructuring": "all"}]*/
  let { from, to } = interval

  const {
    horizon = 6,
    angularSeparationThreshold = ANGULAR_SEPARATION_THRESHOLD,
    stepMinutes = 20
  } = params

  while (from <= to) {
    // Collate the positions of all planets other than Earth and those below the horizon in the sky:
    // N.B. They may be in conjunction, but they won't be visible to our local observer if they are
    // below the horizon.
    const positions = getPlanetaryPositions(from, observer)

    // Loop over all pairs of planets and check for conjunctions:
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        // If either of the planets is below the horizon, skip this pair:
        if (positions[i].alt < horizon || positions[j].alt < horizon) continue

        // Get the positions of the two planets:
        const alterior = positions[i]
        const ulterior = positions[j]

        // Create a unique key for the conjunction between the two planets, sorted by name:
        const key = [alterior.name, ulterior.name].sort().join('-')

        // Check for a conjunction between the two planets by comparing their angular separation:
        const separation = getAngularSeparation(
          {
            θ: positions[i].alt,
            φ: positions[i].az
          },
          {
            θ: positions[j].alt,
            φ: positions[j].az
          }
        )

        // Update the conjunction if the angular separation is less than the threshold,
        // and the conjunction is the closest one found so far:
        if (
          separation <= angularSeparationThreshold &&
          (!conjunctions.has(key) || conjunctions.get(key)!.angularSeparation > separation)
        ) {
          const conjunction: Conjunction = {
            datetime: from,
            planets: [alterior, ulterior],
            angularSeparation: separation,
            ra: (alterior.ra + ulterior.ra) / 2,
            dec: (alterior.dec + ulterior.dec) / 2
          }

          conjunctions.set(key, conjunction)
        }
      }
    }

    // Increment the from date by the step size:
    from = new Date(from.getTime() + stepMinutes * 60000)
  }

  return conjunctions
}

/*****************************************************************************************************************/
