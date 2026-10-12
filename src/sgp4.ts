/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sgp4
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { StateVector } from './common'

import { J1970, MINUTES_IN_DAY, SECONDS_IN_DAY, TWO_PI } from './constants'

import { type GravityModel, WGS72 } from './gravity'

import type { TwoLineElement } from './tle'

import { convertDegreesToRadians as radians } from './utilities'

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

// Two thirds, e.g., the exponent of Kepler's third law that relates the mean motion to the semi-major
// axis of an orbit:
const TWO_THIRDS = 2 / 3

// The number of minutes in a day per radian, e.g., which converts a mean motion of revolutions per day
// to one of radians per minute:
const MINUTES_PER_DAY_PER_RADIAN = MINUTES_IN_DAY / TWO_PI

// The minimum period (in minutes) of an orbit that the deep-space terms of the theory resolve, e.g., of
// a semi-synchronous orbit and beyond:
const SGP4_DEEP_SPACE_PERIOD = 225

/*****************************************************************************************************************/

/**
 *
 * The propagation constants of the SGP4 theory, e.g., the mean elements, secular rates and
 * coefficients that are resolved once, when an element set is initialised, and that every
 * propagation of it is resolved from.
 *
 * The constants are in the canonical units of the theory, e.g., distances in Earth radii and times
 * in minutes, and are named by the symbols of Hoots & Roehrich (1980) where the theory gives them
 * one, e.g., C1, D2 or η, and descriptively otherwise.
 *
 * N.B. The name of each constant in the reference implementation of Vallado et al. (2006), from
 * which the theory is ported, is given alongside it, e.g., (cc1), so that each may be traced to it.
 *
 */
type SGP4PropagationConstants = {
  // The equatorial radius of the Earth of the gravity model (in kilometres) (radiusearthkm):
  radius: number
  // The square root of the gravitational parameter of the gravity model, in canonical units (xke):
  xke: number
  // The second zonal harmonic of the gravity model (j2):
  J2: number
  // The ratio of the third to the second zonal harmonic of the gravity model (j3oj2):
  J3OverJ2: number
  // The canonical unit of velocity of the gravity model (in kilometres per second) (vkmpersec):
  velocityUnit: number
  // The drag term of the element set, e.g., B* (in inverse Earth radii) (bstar):
  bstar: number
  // The mean eccentricity at the epoch (ecco):
  e0: number
  // The mean argument of perigee at the epoch (in radians) (argpo):
  ω0: number
  // The mean inclination at the epoch (in radians) (inclo):
  i0: number
  // The mean anomaly at the epoch (in radians) (mo):
  M0: number
  // The mean longitude of the ascending node at the epoch (in radians) (nodeo):
  Ω0: number
  // The Brouwer mean motion at the epoch, e.g., recovered from the Kozai mean motion of the element
  // set (in radians per minute) (no_unkozai):
  n0: number
  // Whether the orbit is propagated by the simplified drag terms, e.g., a perigee below 220 km (isimp):
  isSimplified: boolean
  // The secular rate of the mean anomaly (in radians per minute) (mdot):
  MDot: number
  // The secular rate of the argument of perigee (in radians per minute) (argpdot):
  ωDot: number
  // The secular rate of the longitude of the ascending node (in radians per minute) (nodedot):
  ΩDot: number
  // The coefficients of the secular effects of the atmospheric drag (cc1, cc4, cc5, d2, d3, d4):
  C1: number
  C4: number
  C5: number
  D2: number
  D3: number
  D4: number
  // The coefficients of the secular effects of the atmospheric drag on the mean longitude, e.g.,
  // of the second to the fifth powers of the time since the epoch (t2cof, t3cof, t4cof, t5cof):
  t2Coefficient: number
  t3Coefficient: number
  t4Coefficient: number
  t5Coefficient: number
  // The coefficients of the secular effects of the atmospheric drag on the argument of perigee, the
  // mean anomaly and the longitude of the ascending node (omgcof, xmcof, nodecf):
  ωDragCoefficient: number
  MDragCoefficient: number
  ΩDragCoefficient: number
  // The parameter η of the theory, e.g., a0 e0 ξ (eta):
  η: number
  // The cube of 1 + η cos(M0) (delmo):
  δM0: number
  // The sine of the mean anomaly at the epoch (sinmao):
  sinM0: number
  // The coefficients of the long-period periodic effects of the third zonal harmonic (aycof, xlcof):
  ayNCoefficient: number
  LCoefficient: number
  // The functions of θ = cos(i0) of the short-period periodic effects (con41, x1mth2, x7thm1):
  threeθ2MinusOne: number
  oneMinusθ2: number
  sevenθ2MinusOne: number
}

/*****************************************************************************************************************/

/**
 *
 * Initialises the SGP4 theory for an element set, e.g., resolves the propagation constants of the
 * theory from the mean elements, as the initl() and sgp4init() routines of the reference
 * implementation do.
 *
 * @param tle - The two-line element set to initialise.
 * @param gravity - The gravity model to initialise it with.
 * @throws An SGP4Error if the orbit is of the deep-space theory, which is not yet resolved.
 * @returns The propagation constants of the theory for the element set.
 *
 */
const initialiseSGP4 = (tle: TwoLineElement, gravity: GravityModel): SGP4PropagationConstants => {
  const { radius, xke, J2, J4 } = gravity

  const J3OverJ2 = gravity.J3 / gravity.J2

  // The mean elements of the element set, in the units of the theory, e.g., radians and radians per
  // minute:
  const bstar = tle.bstar

  const e0 = tle.e

  const ω0 = radians(tle.ω)

  const i0 = radians(tle.i)

  const M0 = radians(tle.M)

  const Ω0 = radians(tle.Ω)

  // The Kozai mean motion of the element set (in radians per minute) (no_kozai):
  const nKozai = tle.n / MINUTES_PER_DAY_PER_RADIAN

  // The parameter s of the atmospheric density function, e.g., 78 km above the surface, in Earth
  // radii from the centre (ss):
  const s = 78.0 / radius + 1.0

  // The parameter (q0 - s)⁴ of the atmospheric density function, e.g., of q0 at 120 km (qzms2t):
  const q0MinusSDifference = (120.0 - 78.0) / radius

  const q0MinusS4 =
    q0MinusSDifference * q0MinusSDifference * q0MinusSDifference * q0MinusSDifference

  // initl(): recover the Brouwer mean motion from the Kozai mean motion of the element set:
  // e0² (eccsq):
  const e02 = e0 * e0

  // β0² = 1 - e0² (omeosq):
  const β02 = 1.0 - e02

  // β0 = √(1 - e0²) (rteosq):
  const β0 = Math.sqrt(β02)

  // θ = cos(i0) (cosio), and θ² (cosio2):
  const θ = Math.cos(i0)

  const θ2 = θ * θ

  // The semi-major axis of the Kozai mean motion (in Earth radii) (ak):
  const a1 = (xke / nKozai) ** TWO_THIRDS

  // The numerator of the corrections δ1 and δ0 of the semi-major axis (d1):
  const δNumerator = (0.75 * J2 * (3.0 * θ2 - 1.0)) / (β0 * β02)

  // δ1 (del):
  let δ = δNumerator / (a1 * a1)

  // The semi-major axis, corrected by δ1 (in Earth radii) (adel):
  const aδ = a1 * (1.0 - δ * δ - δ * (1.0 / 3.0 + (134.0 * δ * δ) / 81.0))

  // δ0 (del):
  δ = δNumerator / (aδ * aδ)

  // The Brouwer mean motion (in radians per minute) (no_unkozai):
  const n0 = nKozai / (1.0 + δ)

  // The Brouwer semi-major axis (in Earth radii) (ao):
  const a0 = (xke / n0) ** TWO_THIRDS

  // sin(i0) (sinio):
  const sinI0 = Math.sin(i0)

  // The semi-latus rectum (in Earth radii) (po), and its square (posq):
  const p0 = a0 * β02

  const p02 = p0 * p0

  // 1 - 5θ² (con42), and 3θ² - 1 (con41):
  const oneMinusFiveθ2 = 1.0 - 5.0 * θ2

  const threeθ2MinusOne = -oneMinusFiveθ2 - θ2 - θ2

  // The radius of perigee (in Earth radii) (rp):
  const rPerigee = a0 * (1.0 - e0)

  // An orbit of a period of 225 minutes or more is resolved by the deep-space terms of the theory,
  // e.g., the lunar and solar perturbations and the resonances of a geosynchronous or a 12-hour orbit,
  // which are not yet resolved, and so it is not propagated rather than propagated without them:
  if (TWO_PI / n0 >= SGP4_DEEP_SPACE_PERIOD) {
    throw new SGP4Error(
      `The orbit of a period of ${TWO_PI / n0} minutes is of the deep-space theory, which is not yet resolved`
    )
  }

  // sgp4init(): resolve the coefficients of the theory:
  let isSimplified = false

  let C1 = 0

  let C4 = 0

  let C5 = 0

  let D2 = 0

  let D3 = 0

  let D4 = 0

  let t2Coefficient = 0

  let t3Coefficient = 0

  let t4Coefficient = 0

  let t5Coefficient = 0

  let ωDragCoefficient = 0

  let MDragCoefficient = 0

  let ΩDragCoefficient = 0

  let MDot = 0

  let ωDot = 0

  let ΩDot = 0

  let η = 0

  let δM0 = 0

  let sinM0 = 0

  let ayNCoefficient = 0

  let LCoefficient = 0

  let oneMinusθ2 = 0

  let sevenθ2MinusOne = 0

  if (β02 >= 0.0 || n0 >= 0.0) {
    // An orbit of a perigee below 220 km is propagated by the simplified drag terms of the theory:
    isSimplified = rPerigee < 220.0 / radius + 1.0

    // The parameter s* of the atmospheric density function, e.g., s adjusted for a low perigee (sfour):
    let sStar = s

    // The parameter (q0 - s*)⁴ of the atmospheric density function (qzms24):
    let q0MinusSStar4 = q0MinusS4

    // The altitude of perigee (in kilometres) (perige):
    const perigeeAltitude = (rPerigee - 1.0) * radius

    // The atmospheric density parameter is adjusted for an orbit of a perigee below 156 km:
    if (perigeeAltitude < 156.0) {
      sStar = perigeeAltitude - 78.0

      if (perigeeAltitude < 98.0) {
        sStar = 20.0
      }

      const q0MinusSStarDifference = (120.0 - sStar) / radius

      q0MinusSStar4 =
        q0MinusSStarDifference *
        q0MinusSStarDifference *
        q0MinusSStarDifference *
        q0MinusSStarDifference

      sStar = sStar / radius + 1.0
    }

    // 1 / p0² (pinvsq):
    const inverseP02 = 1.0 / p02

    // ξ = 1 / (a0 - s*) (tsi):
    const ξ = 1.0 / (a0 - sStar)

    η = a0 * e0 * ξ

    // η² (etasq), and e0 η (eeta):
    const η2 = η * η

    const e0η = e0 * η

    // ψ² = |1 - η²| (psisq):
    const ψ2 = Math.abs(1.0 - η2)

    // (q0 - s*)⁴ ξ⁴ (coef), and (q0 - s*)⁴ ξ⁴ / ψ⁷ (coef1):
    const q0MinusSStar4ξ4 = q0MinusSStar4 * ξ ** 4.0

    const q0MinusSStar4ξ4OverΨ7 = q0MinusSStar4ξ4 / ψ2 ** 3.5

    // C2 (cc2):
    const C2 =
      q0MinusSStar4ξ4OverΨ7 *
      n0 *
      (a0 * (1.0 + 1.5 * η2 + e0η * (4.0 + η2)) +
        ((0.375 * J2 * ξ) / ψ2) * threeθ2MinusOne * (8.0 + 3.0 * η2 * (8.0 + η2)))

    C1 = bstar * C2

    // C3 (cc3):
    let C3 = 0.0

    if (e0 > 1.0e-4) {
      C3 = (-2.0 * q0MinusSStar4ξ4 * ξ * J3OverJ2 * n0 * sinI0) / e0
    }

    oneMinusθ2 = 1.0 - θ2

    C4 =
      2.0 *
      n0 *
      q0MinusSStar4ξ4OverΨ7 *
      a0 *
      β02 *
      (η * (2.0 + 0.5 * η2) +
        e0 * (0.5 + 2.0 * η2) -
        ((J2 * ξ) / (a0 * ψ2)) *
          (-3.0 * threeθ2MinusOne * (1.0 - 2.0 * e0η + η2 * (1.5 - 0.5 * e0η)) +
            0.75 * oneMinusθ2 * (2.0 * η2 - e0η * (1.0 + η2)) * Math.cos(2.0 * ω0)))

    C5 = 2.0 * q0MinusSStar4ξ4OverΨ7 * a0 * β02 * (1.0 + 2.75 * (η2 + e0η) + e0η * η2)

    // θ⁴ (cosio4):
    const θ4 = θ2 * θ2

    // The terms of the secular rates of the second and fourth zonal harmonics (temp1, temp2, temp3):
    const J2Term = 1.5 * J2 * inverseP02 * n0

    const J2SquaredTerm = 0.5 * J2Term * J2 * inverseP02

    const J4Term = -0.46875 * J4 * inverseP02 * inverseP02 * n0

    MDot =
      n0 +
      0.5 * J2Term * β0 * threeθ2MinusOne +
      0.0625 * J2SquaredTerm * β0 * (13.0 - 78.0 * θ2 + 137.0 * θ4)

    ωDot =
      -0.5 * J2Term * oneMinusFiveθ2 +
      0.0625 * J2SquaredTerm * (7.0 - 114.0 * θ2 + 395.0 * θ4) +
      J4Term * (3.0 - 36.0 * θ2 + 49.0 * θ4)

    // The secular rate of the longitude of the ascending node of the second zonal harmonic (xhdot1):
    const ΩDotJ2 = -J2Term * θ

    ΩDot = ΩDotJ2 + (0.5 * J2SquaredTerm * (4.0 - 19.0 * θ2) + 2.0 * J4Term * (3.0 - 7.0 * θ2)) * θ

    ωDragCoefficient = bstar * C3 * Math.cos(ω0)

    if (e0 > 1.0e-4) {
      MDragCoefficient = (-TWO_THIRDS * q0MinusSStar4ξ4 * bstar) / e0η
    }

    ΩDragCoefficient = 3.5 * β02 * ΩDotJ2 * C1

    t2Coefficient = 1.5 * C1

    // The long-period coefficient is singular for an orbit of an inclination of 180°, and so it is
    // resolved against a small divisor there, as the reference implementation resolves it:
    LCoefficient =
      Math.abs(θ + 1.0) > 1.5e-12
        ? (-0.25 * J3OverJ2 * sinI0 * (3.0 + 5.0 * θ)) / (1.0 + θ)
        : (-0.25 * J3OverJ2 * sinI0 * (3.0 + 5.0 * θ)) / 1.5e-12

    ayNCoefficient = -0.5 * J3OverJ2 * sinI0

    // 1 + η cos(M0) (delmotemp):
    const onePlusηCosM0 = 1.0 + η * Math.cos(M0)

    δM0 = onePlusηCosM0 * onePlusηCosM0 * onePlusηCosM0

    sinM0 = Math.sin(M0)

    sevenθ2MinusOne = 7.0 * θ2 - 1.0

    if (!isSimplified) {
      // C1² (cc1sq):
      const C12 = C1 * C1

      D2 = 4.0 * a0 * ξ * C12

      // D2 ξ C1 / 3 (temp):
      const D2ξC1OverThree = (D2 * ξ * C1) / 3.0

      D3 = (17.0 * a0 + sStar) * D2ξC1OverThree

      D4 = 0.5 * D2ξC1OverThree * a0 * ξ * (221.0 * a0 + 31.0 * sStar) * C1

      t3Coefficient = D2 + 2.0 * C12

      t4Coefficient = 0.25 * (3.0 * D3 + C1 * (12.0 * D2 + 10.0 * C12))

      t5Coefficient =
        0.2 * (3.0 * D4 + 12.0 * C1 * D3 + 6.0 * D2 * D2 + 15.0 * C12 * (2.0 * D2 + C12))
    }
  }

  return {
    radius,
    xke,
    J2,
    J3OverJ2,
    velocityUnit: (radius * xke) / 60.0,
    bstar,
    e0,
    ω0,
    i0,
    M0,
    Ω0,
    n0,
    isSimplified,
    MDot,
    ωDot,
    ΩDot,
    C1,
    C4,
    C5,
    D2,
    D3,
    D4,
    t2Coefficient,
    t3Coefficient,
    t4Coefficient,
    t5Coefficient,
    ωDragCoefficient,
    MDragCoefficient,
    ΩDragCoefficient,
    η,
    δM0,
    sinM0,
    ayNCoefficient,
    LCoefficient,
    threeθ2MinusOne,
    oneMinusθ2,
    sevenθ2MinusOne
  }
}

/*****************************************************************************************************************/

/**
 *
 * Propagates an element set by the SGP4 theory to a time since its epoch, as the sgp4() routine of
 * the reference implementation does, e.g., resolves the secular effects of the gravity of the
 * Earth and of the atmospheric drag on the mean elements, the long-period and the short-period
 * periodic effects on the osculating elements, and the state vector of the object from them.
 *
 * @param propagationConstants - The propagation constants of the theory for the element set.
 * @param t - The time since the epoch of the element set (in minutes).
 * @throws An SGP4MeanMotionError, an SGP4MeanEccentricityError, an SGP4SemiLatusRectumError or an SGP4DecayedError where the theory fails.
 * @returns The state vector of the object, in the True Equator, Mean Equinox (TEME) frame of the epoch (in kilometres and kilometres per second).
 *
 */
const propagateSGP4 = (propagationConstants: SGP4PropagationConstants, t: number): StateVector => {
  const { xke, J2, isSimplified } = propagationConstants

  // The secular effects of the gravity of the Earth on the mean anomaly, the argument of perigee and
  // the longitude of the ascending node (xmdf, argpdf, nodedf):
  const MSecular = propagationConstants.M0 + propagationConstants.MDot * t

  const ωSecular = propagationConstants.ω0 + propagationConstants.ωDot * t

  const ΩSecular = propagationConstants.Ω0 + propagationConstants.ΩDot * t

  // The mean argument of perigee (argpm), mean anomaly (mm) and longitude of the ascending node (nodem):
  let ω = ωSecular

  let M = MSecular

  const t2 = t * t

  let Ω = ΩSecular + propagationConstants.ΩDragCoefficient * t2

  // The secular effects of the atmospheric drag on the semi-major axis (tempa), the eccentricity
  // (tempe) and the mean longitude (templ):
  let aDragFactor = 1.0 - propagationConstants.C1 * t

  let eDragDecrement = propagationConstants.bstar * propagationConstants.C4 * t

  let LDragIncrement = propagationConstants.t2Coefficient * t2

  if (!isSimplified) {
    // The secular effects of the atmospheric drag on the argument of perigee (delomg) and on the mean
    // anomaly (delm):
    const δω = propagationConstants.ωDragCoefficient * t

    const onePlusηCosM = 1.0 + propagationConstants.η * Math.cos(MSecular)

    const δM =
      propagationConstants.MDragCoefficient *
      (onePlusηCosM * onePlusηCosM * onePlusηCosM - propagationConstants.δM0)

    const δωPlusδM = δω + δM

    M = MSecular + δωPlusδM

    ω = ωSecular - δωPlusδM

    const t3 = t2 * t

    const t4 = t3 * t

    aDragFactor =
      aDragFactor -
      propagationConstants.D2 * t2 -
      propagationConstants.D3 * t3 -
      propagationConstants.D4 * t4

    eDragDecrement =
      eDragDecrement +
      propagationConstants.bstar *
        propagationConstants.C5 *
        (Math.sin(M) - propagationConstants.sinM0)

    LDragIncrement =
      LDragIncrement +
      propagationConstants.t3Coefficient * t3 +
      t4 * (propagationConstants.t4Coefficient + t * propagationConstants.t5Coefficient)
  }

  // The mean motion (nm), eccentricity (em) and inclination (inclm):
  let n = propagationConstants.n0

  let e = propagationConstants.e0

  const i = propagationConstants.i0

  if (n <= 0.0) {
    throw new SGP4MeanMotionError(n)
  }

  // The mean semi-major axis (in Earth radii) (am):
  const a = (xke / n) ** TWO_THIRDS * aDragFactor * aDragFactor

  n = xke / a ** 1.5

  e = e - eDragDecrement

  if (e >= 1.0 || e < -0.001) {
    throw new SGP4MeanEccentricityError(e)
  }

  // The eccentricity is held at a floor, below which the theory is singular:
  if (e < 1.0e-6) {
    e = 1.0e-6
  }

  M = M + propagationConstants.n0 * LDragIncrement

  // The mean longitude (xlm):
  let L = M + ω + Ω

  // N.B. The angles are reduced by the remainder of a whole turn that takes the sign of the angle,
  // e.g., as the fmod() of the reference implementation does, and not into [0, 2π):
  Ω = Ω % TWO_PI

  ω = ω % TWO_PI

  L = L % TWO_PI

  M = (L - ω - Ω) % TWO_PI

  const sinI = Math.sin(i)

  const cosI = Math.cos(i)

  // The long-period periodic effects of the third zonal harmonic, e.g., on the components of the
  // eccentricity vector (axnl, aynl) and on the mean longitude (xl):
  const axN = e * Math.cos(ω)

  // 1 / a(1 - e²) (temp):
  const inverseAβ2 = 1.0 / (a * (1.0 - e * e))

  const ayN = e * Math.sin(ω) + inverseAβ2 * propagationConstants.ayNCoefficient

  const LT = M + ω + Ω + inverseAβ2 * propagationConstants.LCoefficient * axN

  // Solve Kepler's equation for the eccentric longitude E + ω, e.g., by Newton's method, with each
  // step limited to 0.95 radians, as the reference implementation solves it (u, eo1, tem5):
  const U = (LT - Ω) % TWO_PI

  let eccentricLongitude = U

  let Δ = 9999.9

  let sinEccentricLongitude = 0

  let cosEccentricLongitude = 0

  for (let iteration = 1; Math.abs(Δ) >= 1.0e-12 && iteration <= 10; iteration++) {
    sinEccentricLongitude = Math.sin(eccentricLongitude)

    cosEccentricLongitude = Math.cos(eccentricLongitude)

    Δ = 1.0 - cosEccentricLongitude * axN - sinEccentricLongitude * ayN

    Δ = (U - ayN * cosEccentricLongitude + axN * sinEccentricLongitude - eccentricLongitude) / Δ

    if (Math.abs(Δ) >= 0.95) {
      Δ = Δ > 0.0 ? 0.95 : -0.95
    }

    eccentricLongitude = eccentricLongitude + Δ
  }

  // The short-period preliminary quantities, e.g., e cos(E) (ecose), e sin(E) (esine), eL² (el2) and
  // the semi-latus rectum (pl):
  const eCosE = axN * cosEccentricLongitude + ayN * sinEccentricLongitude

  const eSinE = axN * sinEccentricLongitude - ayN * cosEccentricLongitude

  const eL2 = axN * axN + ayN * ayN

  const pL = a * (1.0 - eL2)

  if (pL < 0.0) {
    throw new SGP4SemiLatusRectumError(pL)
  }

  // The radius (rl), the radial rate (rdotl) and the transverse rate (rvdotl):
  const r = a * (1.0 - eCosE)

  const rDot = (Math.sqrt(a) * eSinE) / r

  const rfDot = Math.sqrt(pL) / r

  // βL = √(1 - eL²) (betal):
  const βL = Math.sqrt(1.0 - eL2)

  const eSinEOverOnePlusβL = eSinE / (1.0 + βL)

  // The argument of latitude (su), and its sine and cosine:
  const sinu = (a / r) * (sinEccentricLongitude - ayN - axN * eSinEOverOnePlusβL)

  const cosu = (a / r) * (cosEccentricLongitude - axN + ayN * eSinEOverOnePlusβL)

  let u = Math.atan2(sinu, cosu)

  const sin2u = (cosu + cosu) * sinu

  const cos2u = 1.0 - 2.0 * sinu * sinu

  // 1 / pL (temp):
  const inversePL = 1.0 / pL

  // J2 / 2pL (temp1), and J2 / 2pL² (temp2):
  const J2OverTwoPL = 0.5 * J2 * inversePL

  const J2OverTwoPL2 = J2OverTwoPL * inversePL

  // The short-period periodic effects, e.g., the osculating radius (mrt), argument of latitude (su),
  // longitude of the ascending node (xnode) and inclination (xinc), and the radial (mvt) and
  // transverse (rvdot) rates:
  const rk =
    r * (1.0 - 1.5 * J2OverTwoPL2 * βL * propagationConstants.threeθ2MinusOne) +
    0.5 * J2OverTwoPL * propagationConstants.oneMinusθ2 * cos2u

  u = u - 0.25 * J2OverTwoPL2 * propagationConstants.sevenθ2MinusOne * sin2u

  const Ωk = Ω + 1.5 * J2OverTwoPL2 * cosI * sin2u

  const ik = i + 1.5 * J2OverTwoPL2 * cosI * sinI * cos2u

  const rDotk = rDot - (n * J2OverTwoPL * propagationConstants.oneMinusθ2 * sin2u) / xke

  const rfDotk =
    rfDot +
    (n *
      J2OverTwoPL *
      (propagationConstants.oneMinusθ2 * cos2u + 1.5 * propagationConstants.threeθ2MinusOne)) /
      xke

  // The orientation vectors of the orbit, e.g., the unit vectors along the radius (U) and along the
  // direction of motion (V), in the TEME frame:
  const sinuk = Math.sin(u)

  const cosuk = Math.cos(u)

  const sinΩk = Math.sin(Ωk)

  const cosΩk = Math.cos(Ωk)

  const sinik = Math.sin(ik)

  const cosik = Math.cos(ik)

  const Mx = -sinΩk * cosik

  const My = cosΩk * cosik

  const Ux = Mx * sinuk + cosΩk * cosuk

  const Uy = My * sinuk + sinΩk * cosuk

  const Uz = sinik * sinuk

  const Vx = Mx * cosuk - cosΩk * sinuk

  const Vy = My * cosuk - sinΩk * sinuk

  const Vz = sinik * cosuk

  // An osculating radius less than that of the Earth is an orbit that has decayed:
  if (rk < 1.0) {
    throw new SGP4DecayedError(rk)
  }

  // The osculating radius (in kilometres) (mr):
  const radius = rk * propagationConstants.radius

  return {
    position: {
      x: radius * Ux,
      y: radius * Uy,
      z: radius * Uz
    },
    velocity: {
      x: (rDotk * Ux + rfDotk * Vx) * propagationConstants.velocityUnit,
      y: (rDotk * Uy + rfDotk * Vy) * propagationConstants.velocityUnit,
      z: (rDotk * Uz + rfDotk * Vz) * propagationConstants.velocityUnit
    }
  }
}

/*****************************************************************************************************************/

/**
 *
 * SatelliteRecord
 *
 * The record of an Earth-orbiting object for its propagation by the SGP4 theory, e.g., the
 * simplified general perturbations theory of the United States Space Force that two-line element
 * sets are fitted to, as revised by Vallado et al. (2006).
 *
 * The record is initialised once from a two-line element set, e.g., the constants of the theory
 * are resolved from its mean elements, together with the gravity model and the mode of operation
 * of the theory, and each propagation of it is then resolved from those constants, e.g., to the
 * state vector of the object at a time since the epoch of the element set.
 *
 * The state vector is given in the True Equator, Mean Equinox (TEME) frame of the epoch, e.g., the
 * frame the SGP4 theory resolves it in, in SI metres and metres per second.
 *
 * N.B. An element set of ephemeris type 4 is fitted to the extended theory of the United States
 * Space Force, SGP4-XP, and not to SGP4, and so it is rejected, rather than recorded for a
 * propagation to a position that is not that of the object.
 *
 * N.B. An orbit of a period of 225 minutes or more is of the deep-space theory, e.g., the lunar and
 * solar perturbations and the resonances of a geosynchronous or a 12-hour orbit, which is not yet
 * resolved, and so it is rejected, rather than propagated without those terms.
 *
 * @see Hoots, F. R., & Roehrich, R. L. (1980), "Spacetrack Report No. 3: Models for Propagation of NORAD Element Sets".
 * @see Vallado, D. A., Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753.
 *
 */
export class SatelliteRecord {
  // The two-line element set of the record:
  public readonly tle: Readonly<TwoLineElement>

  // The gravity model the record is propagated with:
  public readonly gravity: GravityModel

  // The mode of operation of the theory the record is propagated with:
  public readonly mode: 'improved' | 'afspc'

  // The propagation constants of the SGP4 theory, resolved once from the element set as the record is
  // initialised, and from which every propagation of it is resolved:
  readonly #propagationConstants: SGP4PropagationConstants

  /**
   *
   * Initialises the record of an element set for its propagation by the SGP4 theory.
   *
   * N.B. The record is propagated to the epoch of the element set as it is initialised, as the
   * reference implementation does, and so an element set the theory fails for at its epoch is
   * rejected as it is initialised.
   *
   * @param tle - The two-line element set of the record.
   * @param options - The gravity model and the mode of operation of the theory.
   * @throws An SGP4EphemerisTypeError if the element set is of ephemeris type 4, e.g., of SGP4-XP.
   * @throws An error if the mode of operation is not one of "improved" or "afspc".
   * @throws An SGP4Error if the orbit is of the deep-space theory, which is not yet resolved.
   * @throws An SGP4Error of the failure, where the theory fails for the element set at its epoch.
   *
   */
  constructor(
    tle: TwoLineElement,
    { gravity = WGS72, mode = 'improved' }: SatelliteRecordOptions = {}
  ) {
    if (tle.ephemeris === 4) {
      throw new SGP4EphemerisTypeError(tle.ephemeris)
    }

    if (mode !== 'improved' && mode !== 'afspc') {
      throw new Error(`Invalid mode: "${mode}" is not one of "improved" or "afspc"`)
    }

    // The element set is copied, and frozen, so that a caller who mutates the element set they gave
    // does not displace the record from the element set it was initialised with:
    this.tle = Object.freeze({ ...tle })

    this.gravity = gravity

    this.mode = mode

    this.#propagationConstants = initialiseSGP4(this.tle, gravity)

    // Propagate to the epoch, as the reference implementation does as it initialises, so that an
    // element set the theory fails for at its epoch is rejected as it is initialised:
    propagateSGP4(this.#propagationConstants, 0)
  }

  /**
   *
   * getStateVector()
   *
   * Propagates the record to a datetime, e.g., the state vector of the object at that instant, in
   * the True Equator, Mean Equinox (TEME) frame of the epoch.
   *
   * N.B. The epoch of the element set is carried as a Julian date, whose resolution of ~40
   * microseconds displaces the object by no more than ~0.15 metres in a low Earth orbit, far
   * beneath the accuracy of the theory itself.
   *
   * @param datetime - The date and time to propagate the record to.
   * @throws An error if the datetime is not a valid date.
   * @throws An SGP4Error of the failure, e.g., an SGP4DecayedError, where the theory fails for the record at the datetime.
   * @returns The state vector of the object (in SI metres and metres per second).
   *
   */
  public getStateVector(datetime: Date): StateVector {
    // A Date of an invalid time, e.g., new Date('invalid'), has no time to propagate the record to:
    if (!Number.isFinite(datetime.getTime())) {
      throw new Error('Invalid datetime: the datetime must be a valid date')
    }

    // The time since the epoch of the element set (in days), both of which are of Coordinated
    // Universal Time (UTC). It is resolved in days of the Unix epoch, rather than as the difference
    // of two Julian dates, as the Julian date of the datetime would round it to ~40 microseconds a
    // second time, whereas the offset of the epoch from J1970 is resolved exactly:
    const days = datetime.getTime() / 1000 / SECONDS_IN_DAY - (this.tle.epoch - J1970)

    return this.getStateVectorAtMinutesSinceEpoch(days * MINUTES_IN_DAY)
  }

  /**
   *
   * getStateVectorAtMinutesSinceEpoch()
   *
   * Propagates the record to a time since the epoch of its element set, e.g., the state vector of
   * the object, in the True Equator, Mean Equinox (TEME) frame of the epoch.
   *
   * @param minutes - The time since the epoch of the element set (in minutes), which may be negative.
   * @throws An error if the time is not finite.
   * @throws An SGP4Error of the failure, e.g., an SGP4DecayedError, where the theory fails for the record at the time.
   * @returns The state vector of the object (in SI metres and metres per second).
   *
   */
  public getStateVectorAtMinutesSinceEpoch(minutes: number): StateVector {
    if (!Number.isFinite(minutes)) {
      throw new Error('Invalid time: the minutes since the epoch must be finite')
    }

    const { position, velocity } = propagateSGP4(this.#propagationConstants, minutes)

    // The theory resolves the state vector in kilometres and kilometres per second, and so it is
    // converted to SI metres and metres per second:
    return {
      position: { x: position.x * 1000, y: position.y * 1000, z: position.z * 1000 },
      velocity: { x: velocity.x * 1000, y: velocity.y * 1000, z: velocity.z * 1000 }
    }
  }
}

/*****************************************************************************************************************/
