/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sgp4
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { GravityModel } from './gravity'

/*****************************************************************************************************************/

/**
 *
 * SGP4Error
 *
 * The error of a propagation by the SGP4 theory, e.g., an element set whose orbit the theory can no
 * longer resolve at the time it is propagated to, such as one that has decayed, or one that the
 * theory cannot propagate at all.
 *
 * Each failure the theory reports is raised as an error of its own, e.g., a subclass of this one,
 * so that a caller may handle a failure by its class, e.g., with instanceof, or handle every
 * failure of the theory alike by this class.
 *
 * The code of the error is that of the reference implementation, e.g., the error code that the
 * sgp4init() and sgp4() routines of Vallado et al. report, where the failure is one that it reports:
 *
 * - 1: the mean eccentricity is not within [0, 1).
 * - 2: the mean motion is not greater than zero.
 * - 3: the perturbed eccentricity is not within [0, 1].
 * - 4: the semi-latus rectum is less than zero.
 * - 6: the orbit has decayed, e.g., its radius is less than that of the Earth.
 *
 * N.B. The code 5 of the reference implementation is no longer in use, and a failure that the
 * reference implementation does not report, e.g., an element set of an ephemeris type the theory
 * does not propagate, carries no code.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export class SGP4Error extends Error {
  // The name of the error, which is given explicitly, rather than taken from the name of the class,
  // which a minifier may rename:
  public name = 'SGP4Error'

  // The error code of the reference implementation, where the failure is one that it reports, e.g.,
  // one of the codes it reports, and no other, so that a caller may switch over them exhaustively:
  public readonly code: 1 | 2 | 3 | 4 | 6 | undefined

  constructor(message: string, code?: 1 | 2 | 3 | 4 | 6) {
    super(message)

    this.code = code
  }
}

/*****************************************************************************************************************/

/**
 *
 * SGP4MeanEccentricityError
 *
 * The error of a propagation in which the mean eccentricity of the orbit, e.g., the eccentricity
 * of the element set carried to the time of the propagation by the secular effect of drag, is no
 * longer within [0, 1), e.g., an eccentric orbit whose drag has carried its eccentricity to unity,
 * at which the orbit is no longer bound.
 *
 * N.B. It is the error code 1 of the reference implementation.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export class SGP4MeanEccentricityError extends SGP4Error {
  public name = 'SGP4MeanEccentricityError'

  // The mean eccentricity of the orbit at the time it was propagated to (dimensionless):
  public readonly eccentricity: number

  constructor(eccentricity: number) {
    super(`The mean eccentricity ${eccentricity} is not within [0, 1)`, 1)

    this.eccentricity = eccentricity
  }
}

/*****************************************************************************************************************/

/**
 *
 * SGP4MeanMotionError
 *
 * The error of a propagation in which the mean motion of the orbit, e.g., as the integration of
 * the resonance terms of the deep-space theory carries it to the time of the propagation, is no
 * longer greater than zero, at which the semi-major axis of the orbit is no longer defined.
 *
 * N.B. It is the error code 2 of the reference implementation.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export class SGP4MeanMotionError extends SGP4Error {
  public name = 'SGP4MeanMotionError'

  // The mean motion of the orbit at the time it was propagated to (in radians per minute):
  public readonly n: number

  constructor(n: number) {
    super(`The mean motion ${n} is not greater than zero`, 2)

    this.n = n
  }
}

/*****************************************************************************************************************/

/**
 *
 * SGP4PerturbedEccentricityError
 *
 * The error of a propagation in which the perturbed eccentricity of the orbit, e.g., the mean
 * eccentricity displaced by the long-period perturbations of the Moon and the Sun of the
 * deep-space theory, is no longer within [0, 1].
 *
 * N.B. It is the error code 3 of the reference implementation, and it is raised for an orbit of
 * the deep-space theory alone, e.g., of a period of 225 minutes or more.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export class SGP4PerturbedEccentricityError extends SGP4Error {
  public name = 'SGP4PerturbedEccentricityError'

  // The perturbed eccentricity of the orbit at the time it was propagated to (dimensionless):
  public readonly eccentricity: number

  constructor(eccentricity: number) {
    super(`The perturbed eccentricity ${eccentricity} is not within [0, 1]`, 3)

    this.eccentricity = eccentricity
  }
}

/*****************************************************************************************************************/

/**
 *
 * SGP4SemiLatusRectumError
 *
 * The error of a propagation in which the semi-latus rectum of the orbit, e.g., a(1 - e²), with
 * the eccentricity carried by the long-period perturbations of the theory, is less than zero, at
 * which the eccentricity has passed unity, and the orbit is no longer bound.
 *
 * N.B. It is the error code 4 of the reference implementation.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export class SGP4SemiLatusRectumError extends SGP4Error {
  public name = 'SGP4SemiLatusRectumError'

  // The semi-latus rectum of the orbit at the time it was propagated to (in Earth radii):
  public readonly p: number

  constructor(p: number) {
    super(`The semi-latus rectum ${p} is less than zero`, 4)

    this.p = p
  }
}

/*****************************************************************************************************************/

/**
 *
 * SGP4DecayedError
 *
 * The error of a propagation in which the radius of the orbit, e.g., the distance of the object
 * from the centre of the Earth at the time of the propagation, is less than the equatorial radius
 * of the Earth, e.g., an object whose orbit has decayed, and which has re-entered.
 *
 * N.B. It is the error code 6 of the reference implementation.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export class SGP4DecayedError extends SGP4Error {
  public name = 'SGP4DecayedError'

  // The radius of the orbit at the time it was propagated to (in Earth radii):
  public readonly radius: number

  constructor(radius: number) {
    super(
      `The orbit has decayed, as its radius of ${radius} Earth radii is less than that of the Earth`,
      6
    )

    this.radius = radius
  }
}

/*****************************************************************************************************************/

/**
 *
 * SGP4EphemerisTypeError
 *
 * The error of an element set of an ephemeris type that the SGP4 theory does not propagate, e.g.,
 * an element set of ephemeris type 4, which the United States Space Force publishes for its
 * extended theory, SGP4-XP, and whose elements are fitted to that theory and not to SGP4.
 *
 * Such an element set is of the same two-line format, and so the SGP4 theory would propagate it
 * without any error, to a position that is not that of the object, e.g., the error is raised in
 * its place, so that it is not propagated without notice.
 *
 * N.B. It carries no code, as the reference implementation does not report it, e.g., it
 * propagates an element set of any ephemeris type alike.
 *
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export class SGP4EphemerisTypeError extends SGP4Error {
  public name = 'SGP4EphemerisTypeError'

  // The ephemeris type of the element set that was given to be propagated:
  public readonly ephemeris: number

  constructor(ephemeris: number) {
    super(`The ephemeris type ${ephemeris} is not one that SGP4 propagates`)

    this.ephemeris = ephemeris
  }
}

/*****************************************************************************************************************/

/**
 *
 * The options of a { SatelliteRecord }, e.g., the gravity model and the mode of operation the SGP4
 * theory is resolved with.
 *
 */
export type SatelliteRecordOptions = {
  /**
   *
   * The gravity model the element set is propagated with. Defaults to { WGS72 }, e.g., the model
   * that two-line element sets are fitted with.
   *
   */
  gravity?: GravityModel
  /**
   *
   * The mode of operation of the SGP4 theory, e.g., "improved", which carries the corrections of
   * Vallado et al. (2006), or "afspc", which reproduces the operational implementation of the
   * United States Air Force Space Command, e.g., its resolution of the sidereal angle at the epoch.
   * Defaults to "improved".
   *
   */
  mode?: 'improved' | 'afspc'
}

/*****************************************************************************************************************/
