/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/sgp4
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

import type { StateVector } from './common'

import { J1970 } from './constants'

import { type GravityModel, WGS72 } from './gravity'

import type { TwoLineElement } from './tle'

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

// Two pi, e.g., a whole turn (in radians):
const TWO_PI = 2 * Math.PI

// Two thirds, e.g., the exponent of Kepler's third law that relates the mean motion to the semi-major
// axis of an orbit:
const TWO_THIRDS = 2 / 3

// The number of minutes in a day per radian, e.g., which converts a mean motion of revolutions per day
// to one of radians per minute:
const MINUTES_PER_DAY_PER_RADIAN = 1440 / TWO_PI

// The Julian date of the epoch the SGP4 theory counts its days from, e.g., 1949 December 31 at 00:00 UT:
const SGP4_EPOCH = 2433281.5

// The minimum period (in minutes) of an orbit that the deep-space terms of the theory resolve, e.g., of
// a semi-synchronous orbit and beyond:
const SGP4_DEEP_SPACE_PERIOD = 225

/*****************************************************************************************************************/

/**
 *
 * The constants of the SGP4 theory that are resolved once, when an element set is initialised, and
 * that every propagation of it is resolved from.
 *
 * N.B. The names of the constants are those of the reference implementation, e.g., cc1, d2 or xmcof,
 * so that each may be traced to the reference implementation, from which they are ported.
 *
 */
type SGP4Record = {
  // The constants of the gravity model, in the canonical units of the theory:
  radius: number
  xke: number
  j2: number
  j3oj2: number
  vkmpersec: number
  // The mean elements of the element set, in radians and radians per minute:
  bstar: number
  ecco: number
  argpo: number
  inclo: number
  mo: number
  nodeo: number
  no: number
  // Whether the orbit is propagated by the simplified drag terms, e.g., a perigee below 220 km:
  isimp: boolean
  // The secular rates and the coefficients of the theory:
  aycof: number
  con41: number
  cc1: number
  cc4: number
  cc5: number
  d2: number
  d3: number
  d4: number
  delmo: number
  eta: number
  argpdot: number
  omgcof: number
  sinmao: number
  t2cof: number
  t3cof: number
  t4cof: number
  t5cof: number
  x1mth2: number
  x7thm1: number
  mdot: number
  nodedot: number
  xlcof: number
  xmcof: number
  nodecf: number
  // The Greenwich sidereal angle at the epoch (in radians):
  gsto: number
}

/*****************************************************************************************************************/

/**
 *
 * Resolves the Greenwich mean sidereal angle (in radians) of a Julian date of UT1, as the reference
 * implementation of the SGP4 theory resolves it, e.g., by the sidereal time of IAU 1982.
 *
 * @param jdut1 - The Julian date of UT1.
 * @returns The Greenwich mean sidereal angle (in radians), in the range [0, 2π).
 *
 */
const getSGP4GreenwichSiderealAngle = (jdut1: number): number => {
  const tut1 = (jdut1 - 2451545.0) / 36525.0

  let temp =
    -6.2e-6 * tut1 * tut1 * tut1 +
    0.093104 * tut1 * tut1 +
    (876600.0 * 3600 + 8640184.812866) * tut1 +
    67310.54841

  // 360° / 86400 s = 1 / 240, from seconds of time to degrees, and then to radians:
  temp = ((temp * Math.PI) / 180 / 240.0) % TWO_PI

  return temp < 0 ? temp + TWO_PI : temp
}

/*****************************************************************************************************************/

/**
 *
 * Initialises the SGP4 theory for an element set, e.g., resolves the constants of the theory from
 * the mean elements, as the initl() and sgp4init() routines of the reference implementation do.
 *
 * @param tle - The two-line element set to initialise.
 * @param gravity - The gravity model to initialise it with.
 * @param mode - The mode of operation of the theory.
 * @throws An SGP4Error if the orbit is of the deep-space theory, which is not yet resolved.
 * @returns The constants of the theory for the element set.
 *
 */
const initialiseSGP4 = (
  tle: TwoLineElement,
  gravity: GravityModel,
  mode: 'improved' | 'afspc'
): SGP4Record => {
  const radius = gravity.radius

  const xke = gravity.xke

  const j2 = gravity.J2

  const j3oj2 = gravity.J3 / gravity.J2

  const j4 = gravity.J4

  // The elements of the element set, in the units of the theory, e.g., radians and radians per minute:
  const bstar = tle.bstar

  const ecco = tle.e

  const argpo = (tle.ω * Math.PI) / 180

  const inclo = (tle.i * Math.PI) / 180

  const mo = (tle.M * Math.PI) / 180

  const nodeo = (tle.Ω * Math.PI) / 180

  const noKozai = tle.n / MINUTES_PER_DAY_PER_RADIAN

  // The epoch of the element set, in days from the epoch of the theory:
  const epoch = tle.epoch - SGP4_EPOCH

  const ss = 78.0 / radius + 1.0

  const qzms2ttemp = (120.0 - 78.0) / radius

  const qzms2t = qzms2ttemp * qzms2ttemp * qzms2ttemp * qzms2ttemp

  // initl(): recover the Brouwer mean motion from the Kozai mean motion of the element set:
  const eccsq = ecco * ecco

  const omeosq = 1.0 - eccsq

  const rteosq = Math.sqrt(omeosq)

  const cosio = Math.cos(inclo)

  const cosio2 = cosio * cosio

  const ak = (xke / noKozai) ** TWO_THIRDS

  const d1 = (0.75 * j2 * (3.0 * cosio2 - 1.0)) / (rteosq * omeosq)

  let del = d1 / (ak * ak)

  const adel = ak * (1.0 - del * del - del * (1.0 / 3.0 + (134.0 * del * del) / 81.0))

  del = d1 / (adel * adel)

  const no = noKozai / (1.0 + del)

  const ao = (xke / no) ** TWO_THIRDS

  const sinio = Math.sin(inclo)

  const po = ao * omeosq

  const con42 = 1.0 - 5.0 * cosio2

  const con41 = -con42 - cosio2 - cosio2

  const posq = po * po

  const rp = ao * (1.0 - ecco)

  // The Greenwich sidereal angle at the epoch, e.g., of the operational implementation in the mode
  // of the Air Force Space Command, and of the sidereal time of IAU 1982 otherwise:
  let gsto: number

  if (mode === 'afspc') {
    const ts70 = epoch - 7305.0

    const ds70 = Math.floor(ts70 + 1.0e-8)

    const tfrac = ts70 - ds70

    // N.B. The constants are those of the reference implementation, e.g., 1.72027916940703639e-2,
    // 1.7321343856509374 and 5.07551419432269442e-15, written as the nearest double each resolves to:
    const c1 = 0.017202791694070362

    const thgr70 = 1.7321343856509375

    const fk5r = 5.075514194322695e-15

    const c1p2p = c1 + TWO_PI

    gsto = (thgr70 + c1 * ds70 + c1p2p * tfrac + ts70 * ts70 * fk5r) % TWO_PI

    if (gsto < 0.0) {
      gsto += TWO_PI
    }
  } else {
    gsto = getSGP4GreenwichSiderealAngle(epoch + SGP4_EPOCH)
  }

  // An orbit of a period of 225 minutes or more is resolved by the deep-space terms of the theory,
  // e.g., the lunar and solar perturbations and the resonances of a geosynchronous or a 12-hour orbit,
  // which are not yet resolved, and so it is not propagated rather than propagated without them:
  if (TWO_PI / no >= SGP4_DEEP_SPACE_PERIOD) {
    throw new SGP4Error(
      `The orbit of a period of ${TWO_PI / no} minutes is of the deep-space theory, which is not yet resolved`
    )
  }

  // sgp4init(): resolve the coefficients of the theory:
  let isimp = false

  let aycof = 0

  let cc1 = 0

  let cc4 = 0

  let cc5 = 0

  let d2 = 0

  let d3 = 0

  let d4 = 0

  let delmo = 0

  let eta = 0

  let argpdot = 0

  let omgcof = 0

  let sinmao = 0

  let t2cof = 0

  let t3cof = 0

  let t4cof = 0

  let t5cof = 0

  let x1mth2 = 0

  let x7thm1 = 0

  let mdot = 0

  let nodedot = 0

  let xlcof = 0

  let xmcof = 0

  let nodecf = 0

  if (omeosq >= 0.0 || no >= 0.0) {
    // An orbit of a perigee below 220 km is propagated by the simplified drag terms of the theory:
    isimp = rp < 220.0 / radius + 1.0

    let sfour = ss

    let qzms24 = qzms2t

    const perige = (rp - 1.0) * radius

    // The atmospheric density parameter is adjusted for an orbit of a perigee below 156 km:
    if (perige < 156.0) {
      sfour = perige - 78.0

      if (perige < 98.0) {
        sfour = 20.0
      }

      const qzms24temp = (120.0 - sfour) / radius

      qzms24 = qzms24temp * qzms24temp * qzms24temp * qzms24temp

      sfour = sfour / radius + 1.0
    }

    const pinvsq = 1.0 / posq

    const tsi = 1.0 / (ao - sfour)

    eta = ao * ecco * tsi

    const etasq = eta * eta

    const eeta = ecco * eta

    const psisq = Math.abs(1.0 - etasq)

    const coef = qzms24 * tsi ** 4.0

    const coef1 = coef / psisq ** 3.5

    const cc2 =
      coef1 *
      no *
      (ao * (1.0 + 1.5 * etasq + eeta * (4.0 + etasq)) +
        ((0.375 * j2 * tsi) / psisq) * con41 * (8.0 + 3.0 * etasq * (8.0 + etasq)))

    cc1 = bstar * cc2

    let cc3 = 0.0

    if (ecco > 1.0e-4) {
      cc3 = (-2.0 * coef * tsi * j3oj2 * no * sinio) / ecco
    }

    x1mth2 = 1.0 - cosio2

    cc4 =
      2.0 *
      no *
      coef1 *
      ao *
      omeosq *
      (eta * (2.0 + 0.5 * etasq) +
        ecco * (0.5 + 2.0 * etasq) -
        ((j2 * tsi) / (ao * psisq)) *
          (-3.0 * con41 * (1.0 - 2.0 * eeta + etasq * (1.5 - 0.5 * eeta)) +
            0.75 * x1mth2 * (2.0 * etasq - eeta * (1.0 + etasq)) * Math.cos(2.0 * argpo)))

    cc5 = 2.0 * coef1 * ao * omeosq * (1.0 + 2.75 * (etasq + eeta) + eeta * etasq)

    const cosio4 = cosio2 * cosio2

    const temp1 = 1.5 * j2 * pinvsq * no

    const temp2 = 0.5 * temp1 * j2 * pinvsq

    const temp3 = -0.46875 * j4 * pinvsq * pinvsq * no

    mdot =
      no +
      0.5 * temp1 * rteosq * con41 +
      0.0625 * temp2 * rteosq * (13.0 - 78.0 * cosio2 + 137.0 * cosio4)

    argpdot =
      -0.5 * temp1 * con42 +
      0.0625 * temp2 * (7.0 - 114.0 * cosio2 + 395.0 * cosio4) +
      temp3 * (3.0 - 36.0 * cosio2 + 49.0 * cosio4)

    const xhdot1 = -temp1 * cosio

    nodedot =
      xhdot1 + (0.5 * temp2 * (4.0 - 19.0 * cosio2) + 2.0 * temp3 * (3.0 - 7.0 * cosio2)) * cosio

    omgcof = bstar * cc3 * Math.cos(argpo)

    if (ecco > 1.0e-4) {
      xmcof = (-TWO_THIRDS * coef * bstar) / eeta
    }

    nodecf = 3.5 * omeosq * xhdot1 * cc1

    t2cof = 1.5 * cc1

    // The long-period coefficient is singular for an orbit of an inclination of 180°, and so it is
    // resolved against a small divisor there, as the reference implementation resolves it:
    xlcof =
      Math.abs(cosio + 1.0) > 1.5e-12
        ? (-0.25 * j3oj2 * sinio * (3.0 + 5.0 * cosio)) / (1.0 + cosio)
        : (-0.25 * j3oj2 * sinio * (3.0 + 5.0 * cosio)) / 1.5e-12

    aycof = -0.5 * j3oj2 * sinio

    const delmotemp = 1.0 + eta * Math.cos(mo)

    delmo = delmotemp * delmotemp * delmotemp

    sinmao = Math.sin(mo)

    x7thm1 = 7.0 * cosio2 - 1.0

    if (!isimp) {
      const cc1sq = cc1 * cc1

      d2 = 4.0 * ao * tsi * cc1sq

      const temp = (d2 * tsi * cc1) / 3.0

      d3 = (17.0 * ao + sfour) * temp

      d4 = 0.5 * temp * ao * tsi * (221.0 * ao + 31.0 * sfour) * cc1

      t3cof = d2 + 2.0 * cc1sq

      t4cof = 0.25 * (3.0 * d3 + cc1 * (12.0 * d2 + 10.0 * cc1sq))

      t5cof = 0.2 * (3.0 * d4 + 12.0 * cc1 * d3 + 6.0 * d2 * d2 + 15.0 * cc1sq * (2.0 * d2 + cc1sq))
    }
  }

  return {
    radius,
    xke,
    j2,
    j3oj2,
    vkmpersec: (radius * xke) / 60.0,
    bstar,
    ecco,
    argpo,
    inclo,
    mo,
    nodeo,
    no,
    isimp,
    aycof,
    con41,
    cc1,
    cc4,
    cc5,
    d2,
    d3,
    d4,
    delmo,
    eta,
    argpdot,
    omgcof,
    sinmao,
    t2cof,
    t3cof,
    t4cof,
    t5cof,
    x1mth2,
    x7thm1,
    mdot,
    nodedot,
    xlcof,
    xmcof,
    nodecf,
    gsto
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
 * @param record - The constants of the theory for the element set.
 * @param minutes - The time since the epoch of the element set (in minutes).
 * @throws An SGP4MeanMotionError, an SGP4MeanEccentricityError, an SGP4SemiLatusRectumError or an SGP4DecayedError where the theory fails.
 * @returns The state vector of the object, in the True Equator, Mean Equinox (TEME) frame of the epoch (in kilometres and kilometres per second).
 *
 */
const propagateSGP4 = (record: SGP4Record, minutes: number): StateVector => {
  const { xke, j2, isimp } = record

  const t = minutes

  // The secular effects of the gravity of the Earth and of the atmospheric drag:
  const xmdf = record.mo + record.mdot * t

  const argpdf = record.argpo + record.argpdot * t

  const nodedf = record.nodeo + record.nodedot * t

  let argpm = argpdf

  let mm = xmdf

  const t2 = t * t

  let nodem = nodedf + record.nodecf * t2

  let tempa = 1.0 - record.cc1 * t

  let tempe = record.bstar * record.cc4 * t

  let templ = record.t2cof * t2

  if (!isimp) {
    const delomg = record.omgcof * t

    const delmtemp = 1.0 + record.eta * Math.cos(xmdf)

    const delm = record.xmcof * (delmtemp * delmtemp * delmtemp - record.delmo)

    const temp = delomg + delm

    mm = xmdf + temp

    argpm = argpdf - temp

    const t3 = t2 * t

    const t4 = t3 * t

    tempa = tempa - record.d2 * t2 - record.d3 * t3 - record.d4 * t4

    tempe = tempe + record.bstar * record.cc5 * (Math.sin(mm) - record.sinmao)

    templ = templ + record.t3cof * t3 + t4 * (record.t4cof + t * record.t5cof)
  }

  let nm = record.no

  let em = record.ecco

  const inclm = record.inclo

  if (nm <= 0.0) {
    throw new SGP4MeanMotionError(nm)
  }

  const am = (xke / nm) ** TWO_THIRDS * tempa * tempa

  nm = xke / am ** 1.5

  em = em - tempe

  if (em >= 1.0 || em < -0.001) {
    throw new SGP4MeanEccentricityError(em)
  }

  // The eccentricity is held at a floor, below which the theory is singular:
  if (em < 1.0e-6) {
    em = 1.0e-6
  }

  mm = mm + record.no * templ

  let xlm = mm + argpm + nodem

  // N.B. The angles are reduced by the remainder of a whole turn that takes the sign of the angle,
  // e.g., as the fmod() of the reference implementation does, and not into [0, 2π):
  nodem = nodem % TWO_PI

  argpm = argpm % TWO_PI

  xlm = xlm % TWO_PI

  mm = (xlm - argpm - nodem) % TWO_PI

  const sinip = Math.sin(inclm)

  const cosip = Math.cos(inclm)

  const ep = em

  const xincp = inclm

  const argpp = argpm

  const nodep = nodem

  const mp = mm

  // The long-period periodic effects:
  const axnl = ep * Math.cos(argpp)

  let temp = 1.0 / (am * (1.0 - ep * ep))

  const aynl = ep * Math.sin(argpp) + temp * record.aycof

  const xl = mp + argpp + nodep + temp * record.xlcof * axnl

  // Solve Kepler's equation for the eccentric longitude, e.g., by Newton's method, with each step
  // limited to 0.95 radians, as the reference implementation solves it:
  const u = (xl - nodep) % TWO_PI

  let eo1 = u

  let tem5 = 9999.9

  let sineo1 = 0

  let coseo1 = 0

  for (let ktr = 1; Math.abs(tem5) >= 1.0e-12 && ktr <= 10; ktr++) {
    sineo1 = Math.sin(eo1)

    coseo1 = Math.cos(eo1)

    tem5 = 1.0 - coseo1 * axnl - sineo1 * aynl

    tem5 = (u - aynl * coseo1 + axnl * sineo1 - eo1) / tem5

    if (Math.abs(tem5) >= 0.95) {
      tem5 = tem5 > 0.0 ? 0.95 : -0.95
    }

    eo1 = eo1 + tem5
  }

  // The short-period preliminary quantities:
  const ecose = axnl * coseo1 + aynl * sineo1

  const esine = axnl * sineo1 - aynl * coseo1

  const el2 = axnl * axnl + aynl * aynl

  const pl = am * (1.0 - el2)

  if (pl < 0.0) {
    throw new SGP4SemiLatusRectumError(pl)
  }

  const rl = am * (1.0 - ecose)

  const rdotl = (Math.sqrt(am) * esine) / rl

  const rvdotl = Math.sqrt(pl) / rl

  const betal = Math.sqrt(1.0 - el2)

  temp = esine / (1.0 + betal)

  const sinu = (am / rl) * (sineo1 - aynl - axnl * temp)

  const cosu = (am / rl) * (coseo1 - axnl + aynl * temp)

  let su = Math.atan2(sinu, cosu)

  const sin2u = (cosu + cosu) * sinu

  const cos2u = 1.0 - 2.0 * sinu * sinu

  temp = 1.0 / pl

  const temp1 = 0.5 * j2 * temp

  const temp2 = temp1 * temp

  // The short-period periodic effects, e.g., the osculating radius, argument of latitude, node and
  // inclination, and the radial and transverse rates:
  const mrt = rl * (1.0 - 1.5 * temp2 * betal * record.con41) + 0.5 * temp1 * record.x1mth2 * cos2u

  su = su - 0.25 * temp2 * record.x7thm1 * sin2u

  const xnode = nodep + 1.5 * temp2 * cosip * sin2u

  const xinc = xincp + 1.5 * temp2 * cosip * sinip * cos2u

  const mvt = rdotl - (nm * temp1 * record.x1mth2 * sin2u) / xke

  const rvdot = rvdotl + (nm * temp1 * (record.x1mth2 * cos2u + 1.5 * record.con41)) / xke

  // The orientation vectors of the orbit, e.g., the unit vectors along the radius and along the
  // direction of motion, in the TEME frame:
  const sinsu = Math.sin(su)

  const cossu = Math.cos(su)

  const snod = Math.sin(xnode)

  const cnod = Math.cos(xnode)

  const sini = Math.sin(xinc)

  const cosi = Math.cos(xinc)

  const xmx = -snod * cosi

  const xmy = cnod * cosi

  const ux = xmx * sinsu + cnod * cossu

  const uy = xmy * sinsu + snod * cossu

  const uz = sini * sinsu

  const vx = xmx * cossu - cnod * sinsu

  const vy = xmy * cossu - snod * sinsu

  const vz = sini * cossu

  // An osculating radius less than that of the Earth is an orbit that has decayed:
  if (mrt < 1.0) {
    throw new SGP4DecayedError(mrt)
  }

  const mr = mrt * record.radius

  return {
    position: {
      x: mr * ux,
      y: mr * uy,
      z: mr * uz
    },
    velocity: {
      x: (mvt * ux + rvdot * vx) * record.vkmpersec,
      y: (mvt * uy + rvdot * vy) * record.vkmpersec,
      z: (mvt * uz + rvdot * vz) * record.vkmpersec
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
 * are resolved from its mean elements, and each propagation of it is then resolved from those
 * constants, e.g., to the state vector of the object at a time since the epoch of the element set.
 *
 * The state vector is given in the True Equator, Mean Equinox (TEME) frame of the epoch, e.g., the
 * frame the SGP4 theory resolves it in, in SI metres and metres per second.
 *
 * N.B. An element set of ephemeris type 4 is fitted to the extended theory of the United States
 * Space Force, SGP4-XP, and not to SGP4, and so it is rejected, rather than propagated without notice
 * to a position that is not that of the object.
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
  // The two-line element set the record is initialised from:
  public readonly tle: Readonly<TwoLineElement>

  // The gravity model the record is propagated with:
  public readonly gravity: GravityModel

  // The mode of operation of the theory the record is propagated with:
  public readonly mode: 'improved' | 'afspc'

  // The constants of the theory for the element set:
  readonly #record: SGP4Record

  /**
   *
   * Initialises the record of an element set for its propagation by the SGP4 theory.
   *
   * N.B. The record is propagated to the epoch of the element set as it is initialised, as the
   * reference implementation does, and so an element set the theory fails for at its epoch is
   * rejected as it is initialised.
   *
   * @param tle - The two-line element set to initialise the record from.
   * @param options - The gravity model and the mode of operation of the theory.
   * @throws An SGP4EphemerisTypeError if the element set is of ephemeris type 4, e.g., of SGP4-XP.
   * @throws An SGP4Error if the orbit is of the deep-space theory, which is not yet resolved.
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
    // does not displace the record from the constants it was initialised with:
    this.tle = Object.freeze({ ...tle })

    this.gravity = gravity

    this.mode = mode

    this.#record = initialiseSGP4(this.tle, gravity, mode)

    // Propagate to the epoch, as the reference implementation does as it initialises, so that an
    // element set the theory fails for at its epoch is rejected as it is initialised:
    propagateSGP4(this.#record, 0)
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

    // The time since the epoch of the element set, both of which are of Coordinated Universal Time
    // (UTC). It is resolved in minutes of the Unix epoch, rather than as the difference of two Julian
    // dates, as the Julian date of the datetime would round it to ~40 microseconds a second time,
    // whereas the offset of the epoch from J1970 is resolved exactly:
    const minutes = datetime.getTime() / 60000 - (this.tle.epoch - J1970) * 1440

    return this.getStateVectorAtMinutesSinceEpoch(minutes)
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

    const { position, velocity } = propagateSGP4(this.#record, minutes)

    // The theory resolves the state vector in kilometres and kilometres per second, and so it is
    // converted to SI metres and metres per second:
    return {
      position: { x: position.x * 1000, y: position.y * 1000, z: position.z * 1000 },
      velocity: { x: velocity.x * 1000, y: velocity.y * 1000, z: velocity.z * 1000 }
    }
  }
}

/*****************************************************************************************************************/
