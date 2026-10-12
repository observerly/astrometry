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
  // The propagation constants of the deep-space theory, for an orbit of a period of 225 minutes or more:
  deepSpace: SGP4DeepSpacePropagationConstants | undefined
}

/*****************************************************************************************************************/

// The Julian date of the epoch the SGP4 theory counts its days from, e.g., 1950 January 0.0 UT, or 1949 December
// 31 at 00:00 UT:
const SGP4_EPOCH = 2433281.5

// The rate of rotation of the Earth of the deep-space theory (in radians per minute), e.g., the reference
// implementation's 4.37526908801129966e-3, written as the nearest double it resolves to.
//
// N.B. It is that of the theory, and not EARTH_ANGULAR_VELOCITY, from which it differs in its seventh digit, so that
// a propagation conforms to the reference implementation:
const SGP4_EARTH_ROTATION_RATE = 0.0043752690880113

// The mean motion (in radians per minute) and the eccentricity of the orbit of the Sun about the Earth, and of the
// Moon about the Earth, of the deep-space theory:
const SGP4_SUN = { n: 1.19459e-5, e: 0.01675 }

const SGP4_MOON = { n: 1.5835218e-4, e: 0.0549 }

/*****************************************************************************************************************/

/**
 *
 * The coefficients of the long-period perturbations of the gravity of the Sun or of the Moon of the
 * deep-space theory, e.g., of the eccentricity (e), the inclination (i), and the Delaunay variables
 * of the mean anomaly (l), the argument of perigee and the longitude of the ascending node together
 * (gh), and the longitude of the ascending node (h), as functions of the position of the body in its
 * orbit, together with the mean anomaly of the body at the epoch (M0).
 *
 * N.B. The name of each coefficient in the reference implementation is given alongside it, of the
 * Sun and of the Moon in turn, e.g., (se2, ee2), so that each may be traced to it.
 *
 */
type SGP4LunisolarCoefficients = {
  // (se2, ee2), (se3, e3):
  e2: number
  e3: number
  // (si2, xi2), (si3, xi3):
  i2: number
  i3: number
  // (sl2, xl2), (sl3, xl3), (sl4, xl4):
  l2: number
  l3: number
  l4: number
  // (sgh2, xgh2), (sgh3, xgh3), (sgh4, xgh4):
  gh2: number
  gh3: number
  gh4: number
  // (sh2, xh2), (sh3, xh3):
  h2: number
  h3: number
  // The mean anomaly of the body at the epoch (in radians) (zmos, zmol):
  M0: number
}

/*****************************************************************************************************************/

/**
 *
 * The resonance of an orbit with the tesseral harmonics of the gravity of the Earth, e.g., of a
 * geosynchronous orbit of a period of ~24 hours, or of a 12-hour orbit of an eccentricity of 0.5 or
 * more, together with the coefficients of its integration (irez).
 *
 */
type SGP4Resonance =
  | {
      // The resonance of a geosynchronous orbit, e.g., of the 22, 31 and 33 tesseral harmonics (irez = 1):
      kind: 'synchronous'
      // The coefficients of the resonance (del1, del2, del3):
      δ1: number
      δ2: number
      δ3: number
      // The resonance angle at the epoch (in radians) (xlamo):
      λ0: number
      // The rate of the resonance angle less the mean motion (in radians per minute) (xfact):
      λDotMinusN: number
    }
  | {
      // The resonance of a 12-hour orbit of an eccentricity of 0.5 or more (irez = 2):
      kind: 'half-day'
      // The coefficients of the resonance (d2201, d2211, d3210, d3222, d4410, d4422, d5220, d5232,
      // d5421, d5433):
      D2201: number
      D2211: number
      D3210: number
      D3222: number
      D4410: number
      D4422: number
      D5220: number
      D5232: number
      D5421: number
      D5433: number
      // The resonance angle at the epoch (in radians) (xlamo):
      λ0: number
      // The rate of the resonance angle less the mean motion (in radians per minute) (xfact):
      λDotMinusN: number
    }

/*****************************************************************************************************************/

/**
 *
 * The propagation constants of the deep-space theory of SGP4, for an orbit of a period of 225
 * minutes or more, e.g., the coefficients of the long-period perturbations of the Sun and of the
 * Moon, the secular rates of their gravity, and any resonance of the orbit.
 *
 */
type SGP4DeepSpacePropagationConstants = {
  // The mode of operation of the theory:
  mode: 'improved' | 'afspc'
  // The Greenwich sidereal angle at the epoch (in radians) (gsto):
  θ0: number
  // The coefficients of the long-period perturbations of the Sun and of the Moon:
  sun: SGP4LunisolarCoefficients
  moon: SGP4LunisolarCoefficients
  // The secular rates of the gravity of the Sun and of the Moon on the eccentricity, the inclination,
  // the mean anomaly, the argument of perigee and the longitude of the ascending node (in radians per
  // minute) (dedt, didt, dmdt, domdt, dnodt):
  eDot: number
  iDot: number
  MDot: number
  ωDot: number
  ΩDot: number
  // The resonance of the orbit, if any:
  resonance: SGP4Resonance | undefined
}

/*****************************************************************************************************************/

/**
 *
 * Resolves the Greenwich sidereal angle (in radians) at the epoch of an element set, as the reference
 * implementation of the SGP4 theory resolves it, e.g., by the sidereal time of IAU 1982 in the improved
 * mode of operation, and by that of the operational implementation of the Air Force Space Command in
 * its mode of operation.
 *
 * N.B. It is resolved from the days since the epoch of the theory, rather than from a Date, as a Date
 * resolves the epoch of an element set to the millisecond alone, and so that a propagation conforms
 * to the reference implementation.
 *
 * @param days - The days since the epoch of the theory, e.g., 1950 January 0.0 UT.
 * @param mode - The mode of operation of the theory.
 * @returns The Greenwich sidereal angle (in radians), in the range [0, 2π).
 *
 */
const getSGP4GreenwichSiderealAngle = (days: number, mode: 'improved' | 'afspc'): number => {
  if (mode === 'afspc') {
    // The days since 1970 January 0.0 UT (ts70), and the whole days (ds70) and the fraction of a day
    // (tfrac) of them:
    const daysSince1970 = days - 7305.0

    const wholeDaysSince1970 = Math.floor(daysSince1970 + 1.0e-8)

    const fractionOfDay = daysSince1970 - wholeDaysSince1970

    // N.B. The constants are those of the reference implementation, e.g., 1.72027916940703639e-2,
    // 1.7321343856509374 and 5.07551419432269442e-15, written as the nearest double each resolves to:

    // The rate of the sidereal angle beyond a whole turn (in radians per day) (c1):
    const siderealRate = 0.017202791694070362

    // The Greenwich sidereal angle at 1970 January 0.0 UT (in radians) (thgr70):
    const θ1970 = 1.7321343856509375

    // The correction of the sidereal angle of the FK5 catalogue (in radians per day squared) (fk5r):
    const fk5Correction = 5.075514194322695e-15

    // The rate of the sidereal angle, including a whole turn (in radians per day) (c1p2p):
    const siderealRatePlusTwoPi = siderealRate + TWO_PI

    let θ =
      (θ1970 +
        siderealRate * wholeDaysSince1970 +
        siderealRatePlusTwoPi * fractionOfDay +
        daysSince1970 * daysSince1970 * fk5Correction) %
      TWO_PI

    if (θ < 0.0) {
      θ += TWO_PI
    }

    return θ
  }

  // The Julian centuries of UT1 since J2000 (tut1):
  const T = (days + SGP4_EPOCH - 2451545.0) / 36525.0

  // The Greenwich mean sidereal time of IAU 1982 (in seconds of time):
  const seconds =
    -6.2e-6 * T * T * T + 0.093104 * T * T + (876600.0 * 3600 + 8640184.812866) * T + 67310.54841

  // 360° / 86400 s = 1 / 240, from seconds of time to degrees, and then to radians:
  const θ = ((seconds * Math.PI) / 180 / 240.0) % TWO_PI

  return θ < 0 ? θ + TWO_PI : θ
}

/*****************************************************************************************************************/

/**
 *
 * Resolves the lunar or solar terms of the deep-space theory for an element set at its epoch, e.g.,
 * the terms Z1 to Z33 and S1 to S7 of Hoots & Roehrich (1980) of the geometry of the body, as each
 * pass of the dscom() routine of the reference implementation does.
 *
 * @param body - The geometry of the orbit of the body, e.g., the cosines and sines of its argument of perigee (g), inclination (i) and node (h), and its coefficient (C).
 * @param orbit - The mean elements of the orbit at the epoch.
 * @returns The terms of the body.
 *
 */
const getSGP4LunisolarTerms = (
  body: {
    cosG: number
    sinG: number
    cosI: number
    sinI: number
    cosH: number
    sinH: number
    C: number
  },
  orbit: {
    e0: number
    e02: number
    β02: number
    β0: number
    n0: number
    sinI0: number
    cosI0: number
    sinω0: number
    cosω0: number
  }
) => {
  const { cosG, sinG, cosI, sinI, cosH, sinH, C } = body

  const { e0, e02, β02, β0, n0, sinI0, cosI0, sinω0, cosω0 } = orbit

  // The direction cosines of the orbit of the body in the frame of the orbit of the object, e.g., the
  // terms a1 to a10 of Hoots & Roehrich (1980), of its node and inclination:
  const a1 = cosG * cosH + sinG * cosI * sinH

  const a3 = -sinG * cosH + cosG * cosI * sinH

  const a7 = -cosG * sinH + sinG * cosI * cosH

  const a8 = sinG * sinI

  const a9 = sinG * sinH + cosG * cosI * cosH

  const a10 = cosG * sinI

  const a2 = cosI0 * a7 + sinI0 * a8

  const a4 = cosI0 * a9 + sinI0 * a10

  const a5 = -sinI0 * a7 + cosI0 * a8

  const a6 = -sinI0 * a9 + cosI0 * a10

  // The direction cosines carried to the argument of perigee of the object, e.g., the terms x1 to x8:
  const x1 = a1 * cosω0 + a2 * sinω0

  const x2 = a3 * cosω0 + a4 * sinω0

  const x3 = -a1 * sinω0 + a2 * cosω0

  const x4 = -a3 * sinω0 + a4 * cosω0

  const x5 = a5 * sinω0

  const x6 = a6 * sinω0

  const x7 = a5 * cosω0

  const x8 = a6 * cosω0

  const Z31 = 12.0 * x1 * x1 - 3.0 * x3 * x3

  const Z32 = 24.0 * x1 * x2 - 6.0 * x3 * x4

  const Z33 = 12.0 * x2 * x2 - 3.0 * x4 * x4

  let Z1 = 3.0 * (a1 * a1 + a2 * a2) + Z31 * e02

  let Z2 = 6.0 * (a1 * a3 + a2 * a4) + Z32 * e02

  let Z3 = 3.0 * (a3 * a3 + a4 * a4) + Z33 * e02

  const Z11 = -6.0 * a1 * a5 + e02 * (-24.0 * x1 * x7 - 6.0 * x3 * x5)

  const Z12 =
    -6.0 * (a1 * a6 + a3 * a5) + e02 * (-24.0 * (x2 * x7 + x1 * x8) - 6.0 * (x3 * x6 + x4 * x5))

  const Z13 = -6.0 * a3 * a6 + e02 * (-24.0 * x2 * x8 - 6.0 * x4 * x6)

  const Z21 = 6.0 * a2 * a5 + e02 * (24.0 * x1 * x5 - 6.0 * x3 * x7)

  const Z22 =
    6.0 * (a4 * a5 + a2 * a6) + e02 * (24.0 * (x2 * x5 + x1 * x6) - 6.0 * (x4 * x7 + x3 * x8))

  const Z23 = 6.0 * a4 * a6 + e02 * (24.0 * x2 * x6 - 6.0 * x4 * x8)

  Z1 = Z1 + Z1 + β02 * Z31

  Z2 = Z2 + Z2 + β02 * Z32

  Z3 = Z3 + Z3 + β02 * Z33

  const S3 = C * (1.0 / n0)

  const S2 = (-0.5 * S3) / β0

  const S4 = S3 * β0

  const S1 = -15.0 * e0 * S4

  const S5 = x1 * x3 + x2 * x4

  const S6 = x2 * x3 + x1 * x4

  const S7 = x2 * x4 - x1 * x3

  return { S1, S2, S3, S4, S5, S6, S7, Z1, Z2, Z3, Z11, Z12, Z13, Z21, Z22, Z23, Z31, Z32, Z33 }
}

/*****************************************************************************************************************/

/**
 *
 * Initialises the deep-space theory for an element set, e.g., resolves the coefficients of the
 * long-period perturbations of the Sun and of the Moon, the secular rates of their gravity, and the
 * coefficients of any resonance of the orbit, as the dscom() and dsinit() routines of the reference
 * implementation do.
 *
 * @param days - The days since the epoch of the theory, e.g., 1950 January 0.0 UT, of the epoch of the element set.
 * @param mode - The mode of operation of the theory.
 * @param orbit - The mean elements and the propagation constants of the near-Earth theory at the epoch.
 * @returns The propagation constants of the deep-space theory for the element set.
 *
 */
const initialiseSGP4DeepSpace = (
  days: number,
  mode: 'improved' | 'afspc',
  orbit: {
    xke: number
    e0: number
    ω0: number
    i0: number
    M0: number
    Ω0: number
    n0: number
    MDot: number
    ωDot: number
    ΩDot: number
  }
): SGP4DeepSpacePropagationConstants => {
  const { xke, e0, ω0, i0, M0, Ω0, n0, MDot, ωDot, ΩDot } = orbit

  // The Greenwich sidereal angle at the epoch (in radians) (gsto):
  const θ0 = getSGP4GreenwichSiderealAngle(days, mode)

  // dscom(): the lunar and solar terms at the epoch:
  const sinΩ0 = Math.sin(Ω0)

  const cosΩ0 = Math.cos(Ω0)

  const sinω0 = Math.sin(ω0)

  const cosω0 = Math.cos(ω0)

  const sinI0 = Math.sin(i0)

  const cosI0 = Math.cos(i0)

  // e0² (emsq), β0² = 1 - e0² (betasq), and β0 (rtemsq):
  const e02 = e0 * e0

  const β02 = 1.0 - e02

  const β0 = Math.sqrt(β02)

  // The days since 1900 January 0.5, e.g., of the epoch of the lunar and solar ephemerides (day):
  const daysSince1900 = days + 18261.5

  // The longitude of the ascending node of the orbit of the Moon (in radians) (xnodce):
  const ΩMoon = (4.523602 - 9.2422029e-4 * daysSince1900) % TWO_PI

  const sinΩMoon = Math.sin(ΩMoon)

  const cosΩMoon = Math.cos(ΩMoon)

  // The inclination of the orbit of the Moon to the equator (zcosil, zsinil):
  const cosIMoon = 0.91375164 - 0.03568096 * cosΩMoon

  const sinIMoon = Math.sqrt(1.0 - cosIMoon * cosIMoon)

  // The node of the orbit of the Moon on the equator (zsinhl, zcoshl):
  const sinHMoon = (0.089683511 * sinΩMoon) / sinIMoon

  const cosHMoon = Math.sqrt(1.0 - sinHMoon * sinHMoon)

  // The longitude of the perigee of the orbit of the Moon (in radians) (gam):
  const ΓMoon = 5.8351514 + 0.001944368 * daysSince1900

  // The argument of perigee of the orbit of the Moon from its node on the equator (in radians) (zx):
  const gMoon =
    ΓMoon +
    Math.atan2(
      (0.39785416 * sinΩMoon) / sinIMoon,
      cosHMoon * cosΩMoon + 0.91744867 * sinHMoon * sinΩMoon
    ) -
    ΩMoon

  // The mean elements of the orbit at the epoch, from which the terms of each body are resolved:
  const elements = { e0, e02, β02, β0, n0, sinI0, cosI0, sinω0, cosω0 }

  // The terms of the Sun, e.g., of its geometry (zcosgs, zsings, zcosis, zsinis) and of its
  // coefficient (c1ss):
  const sun = getSGP4LunisolarTerms(
    {
      cosG: 0.1945905,
      sinG: -0.98088458,
      cosI: 0.91744867,
      sinI: 0.39785416,
      cosH: cosΩ0,
      sinH: sinΩ0,
      C: 2.9864797e-6
    },
    elements
  )

  // The terms of the Moon, e.g., of its geometry and of its coefficient (c1l):
  const moon = getSGP4LunisolarTerms(
    {
      cosG: Math.cos(gMoon),
      sinG: Math.sin(gMoon),
      cosI: cosIMoon,
      sinI: sinIMoon,
      cosH: cosHMoon * cosΩ0 + sinHMoon * sinΩ0,
      sinH: sinΩ0 * cosHMoon - cosΩ0 * sinHMoon,
      C: 4.7968065e-7
    },
    elements
  )

  // The coefficients of the long-period perturbations of a body, from its terms and the eccentricity
  // of its orbit:
  const getCoefficients = (
    { S1, S2, S3, S4, S6, S7, Z1, Z2, Z3, Z11, Z12, Z13, Z21, Z22, Z23, Z31, Z32, Z33 }: typeof sun,
    e: number,
    M0: number
  ): SGP4LunisolarCoefficients => ({
    e2: 2.0 * S1 * S6,
    e3: 2.0 * S1 * S7,
    i2: 2.0 * S2 * Z12,
    i3: 2.0 * S2 * (Z13 - Z11),
    l2: -2.0 * S3 * Z2,
    l3: -2.0 * S3 * (Z3 - Z1),
    l4: -2.0 * S3 * (-21.0 - 9.0 * e02) * e,
    gh2: 2.0 * S4 * Z32,
    gh3: 2.0 * S4 * (Z33 - Z31),
    gh4: -18.0 * S4 * e,
    h2: -2.0 * S2 * Z22,
    h3: -2.0 * S2 * (Z23 - Z21),
    M0
  })

  // The mean anomalies of the Moon (zmol) and of the Sun (zmos) at the epoch (in radians):
  const MMoon = (4.7199672 + 0.2299715 * daysSince1900 - ΓMoon) % TWO_PI

  const MSun = (6.2565837 + 0.017201977 * daysSince1900) % TWO_PI

  // dsinit(): the secular rates of the gravity of the Sun and of the Moon, and any resonance:

  // The node of an orbit of an inclination within 3° of the equator is not resolved:
  const isEquatorial = i0 < 5.2359877e-2 || i0 > Math.PI - 5.2359877e-2

  // The secular rates of the gravity of a body, from its terms and its mean motion, e.g., on the
  // eccentricity (ses), the inclination (sis), the mean anomaly (sls), the argument of perigee and
  // the node together (sghs) and the node (shs):
  const getSecularRates = (
    { S1, S2, S3, S4, S5, Z1, Z3, Z11, Z13, Z21, Z23, Z31, Z33 }: typeof sun,
    n: number
  ) => ({
    eDot: S1 * n * S5,
    iDot: S2 * n * (Z11 + Z13),
    lDot: -n * S3 * (Z1 + Z3 - 14.0 - 6.0 * e02),
    ghDot: S4 * n * (Z31 + Z33 - 6.0),
    hDot: isEquatorial ? 0.0 : -n * S2 * (Z21 + Z23)
  })

  const sunRates = getSecularRates(sun, SGP4_SUN.n)

  const moonRates = getSecularRates(moon, SGP4_MOON.n)

  let hDotSun = sunRates.hDot

  if (sinI0 !== 0.0) {
    hDotSun = hDotSun / sinI0
  }

  const eDot = sunRates.eDot + moonRates.eDot

  const iDot = sunRates.iDot + moonRates.iDot

  const MDotLunisolar = sunRates.lDot + moonRates.lDot

  let ωDotLunisolar = sunRates.ghDot - cosI0 * hDotSun + moonRates.ghDot

  let ΩDotLunisolar = hDotSun

  if (sinI0 !== 0.0) {
    ωDotLunisolar = ωDotLunisolar - (cosI0 / sinI0) * moonRates.hDot

    ΩDotLunisolar = ΩDotLunisolar + moonRates.hDot / sinI0
  }

  // A geosynchronous orbit, e.g., of a period of ~24 hours, or a 12-hour orbit of an eccentricity of
  // 0.5 or more, is resonant with the tesseral harmonics of the gravity of the Earth:
  let resonance: SGP4Resonance | undefined

  // The Greenwich sidereal angle at the epoch, reduced to a whole turn (theta):
  const θ = θ0 % TWO_PI

  // The inverse of the semi-major axis of the orbit (in inverse Earth radii) (aonv):
  const inverseA = (n0 / xke) ** TWO_THIRDS

  if (0.0034906585 < n0 && n0 < 0.0052359877) {
    // The resonance of a geosynchronous orbit, e.g., of the 22, 31 and 33 tesseral harmonics:
    const G200 = 1.0 + e02 * (-2.5 + 0.8125 * e02)

    const G310 = 1.0 + 2.0 * e02

    const G300 = 1.0 + e02 * (-6.0 + 6.60937 * e02)

    const F220 = 0.75 * (1.0 + cosI0) * (1.0 + cosI0)

    const F311 = 0.9375 * sinI0 * sinI0 * (1.0 + 3.0 * cosI0) - 0.75 * (1.0 + cosI0)

    const onePlusCosI0 = 1.0 + cosI0

    const F330 = 1.875 * onePlusCosI0 * onePlusCosI0 * onePlusCosI0

    // The coefficients of the 22, 31 and 33 tesseral harmonics (q22, q31, q33):
    const Q22 = 1.7891679e-6

    const Q31 = 2.1460748e-6

    const Q33 = 2.2123015e-7

    const δ = 3.0 * n0 * n0 * inverseA * inverseA

    resonance = {
      kind: 'synchronous',
      δ1: δ * F311 * G310 * Q31 * inverseA,
      δ2: 2.0 * δ * F220 * G200 * Q22,
      δ3: 3.0 * δ * F330 * G300 * Q33 * inverseA,
      λ0: (M0 + Ω0 + ω0 - θ) % TWO_PI,
      λDotMinusN:
        MDot +
        (ωDot + ΩDot) -
        SGP4_EARTH_ROTATION_RATE +
        MDotLunisolar +
        ωDotLunisolar +
        ΩDotLunisolar -
        n0
    }
  }

  if (8.26e-3 <= n0 && n0 <= 9.24e-3 && e0 >= 0.5) {
    // The resonance of a 12-hour orbit, e.g., of the second and the higher tesseral harmonics:
    const cosI02 = cosI0 * cosI0

    const e03 = e0 * e02

    const G201 = -0.306 - (e0 - 0.64) * 0.44

    let G211: number

    let G310: number

    let G322: number

    let G410: number

    let G422: number

    let G520: number

    let G521: number

    let G532: number

    let G533: number

    if (e0 <= 0.65) {
      G211 = 3.616 - 13.247 * e0 + 16.29 * e02

      G310 = -19.302 + 117.39 * e0 - 228.419 * e02 + 156.591 * e03

      G322 = -18.9068 + 109.7927 * e0 - 214.6334 * e02 + 146.5816 * e03

      G410 = -41.122 + 242.694 * e0 - 471.094 * e02 + 313.953 * e03

      G422 = -146.407 + 841.88 * e0 - 1629.014 * e02 + 1083.435 * e03

      G520 = -532.114 + 3017.977 * e0 - 5740.032 * e02 + 3708.276 * e03
    } else {
      G211 = -72.099 + 331.819 * e0 - 508.738 * e02 + 266.724 * e03

      G310 = -346.844 + 1582.851 * e0 - 2415.925 * e02 + 1246.113 * e03

      G322 = -342.585 + 1554.908 * e0 - 2366.899 * e02 + 1215.972 * e03

      G410 = -1052.797 + 4758.686 * e0 - 7193.992 * e02 + 3651.957 * e03

      G422 = -3581.69 + 16178.11 * e0 - 24462.77 * e02 + 12422.52 * e03

      G520 =
        e0 > 0.715
          ? -5149.66 + 29936.92 * e0 - 54087.36 * e02 + 31324.56 * e03
          : 1464.74 - 4664.75 * e0 + 3763.64 * e02
    }

    if (e0 < 0.7) {
      G533 = -919.2277 + 4988.61 * e0 - 9064.77 * e02 + 5542.21 * e03

      G521 = -822.71072 + 4568.6173 * e0 - 8491.4146 * e02 + 5337.524 * e03

      G532 = -853.666 + 4690.25 * e0 - 8624.77 * e02 + 5341.4 * e03
    } else {
      G533 = -37995.78 + 161616.52 * e0 - 229838.2 * e02 + 109377.94 * e03

      G521 = -51752.104 + 218913.95 * e0 - 309468.16 * e02 + 146349.42 * e03

      G532 = -40023.88 + 170470.89 * e0 - 242699.48 * e02 + 115605.82 * e03
    }

    const sinI02 = sinI0 * sinI0

    const F220 = 0.75 * (1.0 + 2.0 * cosI0 + cosI02)

    const F221 = 1.5 * sinI02

    const F321 = 1.875 * sinI0 * (1.0 - 2.0 * cosI0 - 3.0 * cosI02)

    const F322 = -1.875 * sinI0 * (1.0 + 2.0 * cosI0 - 3.0 * cosI02)

    const F441 = 35.0 * sinI02 * F220

    const F442 = 39.375 * sinI02 * sinI02

    const F522 =
      9.84375 *
      sinI0 *
      (sinI02 * (1.0 - 2.0 * cosI0 - 5.0 * cosI02) +
        0.33333333 * (-2.0 + 4.0 * cosI0 + 6.0 * cosI02))

    const F523 =
      sinI0 *
      (4.92187512 * sinI02 * (-2.0 - 4.0 * cosI0 + 10.0 * cosI02) +
        6.56250012 * (1.0 + 2.0 * cosI0 - 3.0 * cosI02))

    const F542 =
      29.53125 * sinI0 * (2.0 - 8.0 * cosI0 + cosI02 * (-12.0 + 8.0 * cosI0 + 10.0 * cosI02))

    const F543 =
      29.53125 * sinI0 * (-2.0 - 8.0 * cosI0 + cosI02 * (12.0 + 8.0 * cosI0 - 10.0 * cosI02))

    // The coefficients of the tesseral harmonics (root22, root32, root44, root52, root54):
    const ROOT22 = 1.7891679e-6

    const ROOT32 = 3.7393792e-7

    const ROOT44 = 7.3636953e-9

    const ROOT52 = 1.1428639e-7

    const ROOT54 = 2.1765803e-9

    // The scale of the coefficients of each harmonic, e.g., 3n²/a² carried by a further 1/a for each
    // degree of the harmonic (temp1), and that of each harmonic itself (temp):
    let scale = 3.0 * (n0 * n0) * (inverseA * inverseA)

    const D22 = scale * ROOT22

    scale = scale * inverseA

    const D32 = scale * ROOT32

    scale = scale * inverseA

    const D44 = 2.0 * scale * ROOT44

    scale = scale * inverseA

    const D52 = scale * ROOT52

    const D54 = 2.0 * scale * ROOT54

    resonance = {
      kind: 'half-day',
      D2201: D22 * F220 * G201,
      D2211: D22 * F221 * G211,
      D3210: D32 * F321 * G310,
      D3222: D32 * F322 * G322,
      D4410: D44 * F441 * G410,
      D4422: D44 * F442 * G422,
      D5220: D52 * F522 * G520,
      D5232: D52 * F523 * G532,
      D5421: D54 * F542 * G521,
      D5433: D54 * F543 * G533,
      λ0: (M0 + Ω0 + Ω0 - θ - θ) % TWO_PI,
      λDotMinusN:
        MDot + MDotLunisolar + 2.0 * (ΩDot + ΩDotLunisolar - SGP4_EARTH_ROTATION_RATE) - n0
    }
  }

  return {
    mode,
    θ0,
    sun: getCoefficients(sun, SGP4_SUN.e, MSun),
    moon: getCoefficients(moon, SGP4_MOON.e, MMoon),
    eDot,
    iDot,
    MDot: MDotLunisolar,
    ωDot: ωDotLunisolar,
    ΩDot: ΩDotLunisolar,
    resonance
  }
}

/*****************************************************************************************************************/

/**
 *
 * Resolves the secular effects of the gravity of the Sun and of the Moon, and the integration of any
 * resonance of the orbit, on the mean elements at a time since the epoch, as the dspace() routine of
 * the reference implementation does.
 *
 * N.B. The resonance is integrated from the epoch at each propagation, in steps of 720 minutes, as
 * the reference implementation integrates it, e.g., the integration is deterministic, and so the
 * state of a propagation does not depend on the propagations that came before it.
 *
 * @param deepSpace - The propagation constants of the deep-space theory for the element set.
 * @param propagationConstants - The propagation constants of the near-Earth theory for the element set.
 * @param t - The time since the epoch of the element set (in minutes).
 * @param elements - The mean elements carried by the secular effects of the near-Earth theory.
 * @returns The mean elements carried by the secular effects of the deep-space theory.
 *
 */
const getSGP4DeepSpaceSecularEffects = (
  deepSpace: SGP4DeepSpacePropagationConstants,
  propagationConstants: { n0: number; ω0: number; ωDot: number },
  t: number,
  elements: { e: number; i: number; ω: number; Ω: number; M: number; n: number }
): { e: number; i: number; ω: number; Ω: number; M: number; n: number } => {
  let { M, Ω, n } = elements

  // The Greenwich sidereal angle at the time (in radians) (theta):
  const θ = (deepSpace.θ0 + t * SGP4_EARTH_ROTATION_RATE) % TWO_PI

  const e = elements.e + deepSpace.eDot * t

  const i = elements.i + deepSpace.iDot * t

  const ω = elements.ω + deepSpace.ωDot * t

  Ω = Ω + deepSpace.ΩDot * t

  M = M + deepSpace.MDot * t

  const { resonance } = deepSpace

  if (resonance) {
    // The step of the integration (in minutes) (stepp, stepn), and half of its square (step2):
    const STEP = 720.0

    const HALF_STEP_SQUARED = 259200.0

    // The phases of the resonance terms (in radians) (fasx2, fasx4, fasx6, g22, g32, g44, g52, g54):
    const FASX2 = 0.13130908

    const FASX4 = 2.8843198

    const FASX6 = 0.37448087

    const G22 = 5.7686396

    const G32 = 0.95240898

    const G44 = 1.8014998

    const G52 = 1.050833

    const G54 = 4.4108898

    // The integration begins at the epoch, from the mean motion and the resonance angle of it (atime,
    // xni, xli):
    let time = 0.0

    let nIntegrated = propagationConstants.n0

    let λ = resonance.λ0

    const step = t > 0.0 ? STEP : -STEP

    // The rates of the mean motion (xndt) and of the resonance angle (xldot), and the second rate of
    // the mean motion (xnddt), and the remainder of the time beyond the last step (ft):
    let nDot = 0.0

    let λDot = 0.0

    let nDoubleDot = 0.0

    let Δt = 0.0

    for (;;) {
      if (resonance.kind === 'synchronous') {
        const { δ1, δ2, δ3 } = resonance

        nDot =
          δ1 * Math.sin(λ - FASX2) +
          δ2 * Math.sin(2.0 * (λ - FASX4)) +
          δ3 * Math.sin(3.0 * (λ - FASX6))

        λDot = nIntegrated + resonance.λDotMinusN

        nDoubleDot =
          δ1 * Math.cos(λ - FASX2) +
          2.0 * δ2 * Math.cos(2.0 * (λ - FASX4)) +
          3.0 * δ3 * Math.cos(3.0 * (λ - FASX6))

        nDoubleDot = nDoubleDot * λDot
      } else {
        const { D2201, D2211, D3210, D3222, D4410, D4422, D5220, D5232, D5421, D5433 } = resonance

        // The argument of perigee at the time of the step (xomi), and twice it (x2omi), and twice the
        // resonance angle (x2li):
        const ωi = propagationConstants.ω0 + propagationConstants.ωDot * time

        const twoωi = ωi + ωi

        const twoλ = λ + λ

        nDot =
          D2201 * Math.sin(twoωi + λ - G22) +
          D2211 * Math.sin(λ - G22) +
          D3210 * Math.sin(ωi + λ - G32) +
          D3222 * Math.sin(-ωi + λ - G32) +
          D4410 * Math.sin(twoωi + twoλ - G44) +
          D4422 * Math.sin(twoλ - G44) +
          D5220 * Math.sin(ωi + λ - G52) +
          D5232 * Math.sin(-ωi + λ - G52) +
          D5421 * Math.sin(ωi + twoλ - G54) +
          D5433 * Math.sin(-ωi + twoλ - G54)

        λDot = nIntegrated + resonance.λDotMinusN

        nDoubleDot =
          D2201 * Math.cos(twoωi + λ - G22) +
          D2211 * Math.cos(λ - G22) +
          D3210 * Math.cos(ωi + λ - G32) +
          D3222 * Math.cos(-ωi + λ - G32) +
          D5220 * Math.cos(ωi + λ - G52) +
          D5232 * Math.cos(-ωi + λ - G52) +
          2.0 *
            (D4410 * Math.cos(twoωi + twoλ - G44) +
              D4422 * Math.cos(twoλ - G44) +
              D5421 * Math.cos(ωi + twoλ - G54) +
              D5433 * Math.cos(-ωi + twoλ - G54))

        nDoubleDot = nDoubleDot * λDot
      }

      // The integration steps until it is within a step of the time, from which it is then
      // extrapolated to the time itself:
      if (Math.abs(t - time) < STEP) {
        Δt = t - time

        break
      }

      λ = λ + λDot * step + nDot * HALF_STEP_SQUARED

      nIntegrated = nIntegrated + nDot * step + nDoubleDot * HALF_STEP_SQUARED

      time = time + step
    }

    n = nIntegrated + nDot * Δt + nDoubleDot * Δt * Δt * 0.5

    // The resonance angle at the time (xl):
    const λt = λ + λDot * Δt + nDot * Δt * Δt * 0.5

    M = resonance.kind === 'synchronous' ? λt - Ω - ω + θ : λt - 2.0 * Ω + 2.0 * θ

    // N.B. The mean motion is resolved through its rate from that at the epoch, e.g., n0 + (n - n0),
    // rather than taken as it is, as the reference implementation resolves it, which may differ from
    // it in the last bit:
    n = propagationConstants.n0 + (n - propagationConstants.n0)
  }

  return { e, i, ω, Ω, M, n }
}

/*****************************************************************************************************************/

/**
 *
 * Resolves the long-period perturbations of the gravity of the Sun and of the Moon of the deep-space
 * theory at a time since the epoch, and applies them to the mean elements, as the dpper() routine of
 * the reference implementation does.
 *
 * @param deepSpace - The propagation constants of the deep-space theory for the element set.
 * @param t - The time since the epoch of the element set (in minutes).
 * @param elements - The mean elements to perturb.
 * @returns The perturbed elements.
 *
 */
const getSGP4LunisolarPerturbations = (
  deepSpace: SGP4DeepSpacePropagationConstants,
  t: number,
  elements: { e: number; i: number; Ω: number; ω: number; M: number }
): { e: number; i: number; Ω: number; ω: number; M: number } => {
  let { e, i, Ω, ω, M } = elements

  // The perturbations of a body at the time, from the position of the body in its orbit, e.g., its
  // mean anomaly (zm) and its true anomaly to the first order of its eccentricity (zf):
  const getPerturbations = (
    coefficients: SGP4LunisolarCoefficients,
    body: { n: number; e: number }
  ) => {
    const MBody = coefficients.M0 + body.n * t

    const fBody = MBody + 2.0 * body.e * Math.sin(MBody)

    const sinFBody = Math.sin(fBody)

    const F2 = 0.5 * sinFBody * sinFBody - 0.25

    const F3 = -0.5 * sinFBody * Math.cos(fBody)

    return {
      δe: coefficients.e2 * F2 + coefficients.e3 * F3,
      δi: coefficients.i2 * F2 + coefficients.i3 * F3,
      δl: coefficients.l2 * F2 + coefficients.l3 * F3 + coefficients.l4 * sinFBody,
      δgh: coefficients.gh2 * F2 + coefficients.gh3 * F3 + coefficients.gh4 * sinFBody,
      δh: coefficients.h2 * F2 + coefficients.h3 * F3
    }
  }

  const sun = getPerturbations(deepSpace.sun, SGP4_SUN)

  const moon = getPerturbations(deepSpace.moon, SGP4_MOON)

  // The perturbations of the Sun and of the Moon together (pe, pinc, pl, pgh, ph):
  const δe = sun.δe + moon.δe

  const δi = sun.δi + moon.δi

  const δl = sun.δl + moon.δl

  let δgh = sun.δgh + moon.δgh

  let δh = sun.δh + moon.δh

  i = i + δi

  e = e + δe

  const sinI = Math.sin(i)

  const cosI = Math.cos(i)

  // The perturbations are applied directly for an inclination of 0.2 radians or more, and by the
  // method of Lyddane otherwise, which is not singular for an orbit of a small inclination:
  if (i >= 0.2) {
    δh = δh / sinI

    δgh = δgh - cosI * δh

    ω = ω + δgh

    Ω = Ω + δh

    M = M + δl
  } else {
    const sinΩ = Math.sin(Ω)

    const cosΩ = Math.cos(Ω)

    // The components of the unit vector of the node, e.g., sin(i) sin(Ω) (alfdp) and sin(i) cos(Ω)
    // (betdp), each displaced by its perturbation (dalf, dbet):
    const α = sinI * sinΩ + (δh * cosΩ + δi * cosI * sinΩ)

    const β = sinI * cosΩ + (-δh * sinΩ + δi * cosI * cosΩ)

    Ω = Ω % TWO_PI

    // The operational implementation of the Air Force Space Command keeps the node within [0, 2π):
    if (Ω < 0.0 && deepSpace.mode === 'afspc') {
      Ω = Ω + TWO_PI
    }

    // The mean longitude (xls), and the node before it is perturbed (xnoh):
    const L = M + ω + δl + δgh + (cosI - δi * sinI) * Ω

    const ΩBefore = Ω

    Ω = Math.atan2(α, β)

    if (Ω < 0.0 && deepSpace.mode === 'afspc') {
      Ω = Ω + TWO_PI
    }

    if (Math.abs(ΩBefore - Ω) > Math.PI) {
      Ω = Ω < ΩBefore ? Ω + TWO_PI : Ω - TWO_PI
    }

    M = M + δl

    ω = L - M - cosI * Ω
  }

  return { e, i, Ω, ω, M }
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
 * @param mode - The mode of operation of the theory.
 * @returns The propagation constants of the theory for the element set.
 *
 */
const initialiseSGP4 = (
  tle: TwoLineElement,
  gravity: GravityModel,
  mode: 'improved' | 'afspc'
): SGP4PropagationConstants => {
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

  let deepSpace: SGP4DeepSpacePropagationConstants | undefined

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

    // An orbit of a period of 225 minutes or more is resolved by the deep-space terms of the theory,
    // e.g., the perturbations of the Sun and of the Moon and the resonances of a geosynchronous or a
    // 12-hour orbit, and is propagated by the simplified drag terms:
    if (TWO_PI / n0 >= SGP4_DEEP_SPACE_PERIOD) {
      isSimplified = true

      deepSpace = initialiseSGP4DeepSpace(tle.epoch - SGP4_EPOCH, mode, {
        xke,
        e0,
        ω0,
        i0,
        M0,
        Ω0,
        n0,
        MDot,
        ωDot,
        ΩDot
      })
    }

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
    sevenθ2MinusOne,
    deepSpace
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
 * @throws An SGP4MeanMotionError, an SGP4MeanEccentricityError, an SGP4PerturbedEccentricityError, an SGP4SemiLatusRectumError or an SGP4DecayedError where the theory fails.
 * @returns The state vector of the object, in the True Equator, Mean Equinox (TEME) frame of the epoch (in kilometres and kilometres per second).
 *
 */
const propagateSGP4 = (propagationConstants: SGP4PropagationConstants, t: number): StateVector => {
  const { xke, J2, isSimplified, deepSpace } = propagationConstants

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

  let i = propagationConstants.i0

  // The secular effects of the gravity of the Sun and of the Moon, and of any resonance of the orbit,
  // of the deep-space theory:
  if (deepSpace) {
    ;({ e, i, ω, Ω, M, n } = getSGP4DeepSpaceSecularEffects(deepSpace, propagationConstants, t, {
      e,
      i,
      ω,
      Ω,
      M,
      n
    }))
  }

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

  let sinI = Math.sin(i)

  let cosI = Math.cos(i)

  let { ayNCoefficient, LCoefficient } = propagationConstants

  // The long-period perturbations of the gravity of the Sun and of the Moon of the deep-space theory:
  if (deepSpace) {
    ;({ e, i, Ω, ω, M } = getSGP4LunisolarPerturbations(deepSpace, t, { e, i, Ω, ω, M }))

    // A perturbed inclination that is negative is reflected, together with its node and perigee:
    if (i < 0.0) {
      i = -i

      Ω = Ω + Math.PI

      ω = ω - Math.PI
    }

    if (e < 0.0 || e > 1.0) {
      throw new SGP4PerturbedEccentricityError(e)
    }

    // The long-period coefficients are resolved from the perturbed inclination:
    sinI = Math.sin(i)

    cosI = Math.cos(i)

    ayNCoefficient = -0.5 * propagationConstants.J3OverJ2 * sinI

    LCoefficient =
      Math.abs(cosI + 1.0) > 1.5e-12
        ? (-0.25 * propagationConstants.J3OverJ2 * sinI * (3.0 + 5.0 * cosI)) / (1.0 + cosI)
        : (-0.25 * propagationConstants.J3OverJ2 * sinI * (3.0 + 5.0 * cosI)) / 1.5e-12
  }

  // The long-period periodic effects of the third zonal harmonic, e.g., on the components of the
  // eccentricity vector (axnl, aynl) and on the mean longitude (xl):
  const axN = e * Math.cos(ω)

  // 1 / a(1 - e²) (temp):
  const inverseAβ2 = 1.0 / (a * (1.0 - e * e))

  const ayN = e * Math.sin(ω) + inverseAβ2 * ayNCoefficient

  const LT = M + ω + Ω + inverseAβ2 * LCoefficient * axN

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

  // The functions of the inclination of the short-period periodic effects, which the deep-space
  // theory resolves from the perturbed inclination:
  let { threeθ2MinusOne, oneMinusθ2, sevenθ2MinusOne } = propagationConstants

  if (deepSpace) {
    const θ2 = cosI * cosI

    threeθ2MinusOne = 3.0 * θ2 - 1.0

    oneMinusθ2 = 1.0 - θ2

    sevenθ2MinusOne = 7.0 * θ2 - 1.0
  }

  // The short-period periodic effects, e.g., the osculating radius (mrt), argument of latitude (su),
  // longitude of the ascending node (xnode) and inclination (xinc), and the radial (mvt) and
  // transverse (rvdot) rates:
  const rk =
    r * (1.0 - 1.5 * J2OverTwoPL2 * βL * threeθ2MinusOne) + 0.5 * J2OverTwoPL * oneMinusθ2 * cos2u

  u = u - 0.25 * J2OverTwoPL2 * sevenθ2MinusOne * sin2u

  const Ωk = Ω + 1.5 * J2OverTwoPL2 * cosI * sin2u

  const ik = i + 1.5 * J2OverTwoPL2 * cosI * sinI * cos2u

  const rDotk = rDot - (n * J2OverTwoPL * oneMinusθ2 * sin2u) / xke

  const rfDotk = rfDot + (n * J2OverTwoPL * (oneMinusθ2 * cos2u + 1.5 * threeθ2MinusOne)) / xke

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
 * N.B. An orbit of a period of 225 minutes or more is propagated by the deep-space terms of the
 * theory, e.g., the long-period perturbations of the Sun and of the Moon, and the resonances of a
 * geosynchronous or a 12-hour orbit with the tesseral harmonics of the gravity of the Earth.
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

    this.#propagationConstants = initialiseSGP4(this.tle, gravity, mode)

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
