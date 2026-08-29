/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

export {
  getCorrectionToEquatorialForAberration,
  getCorrectionToEquatorialForAnnualAberration,
  getCorrectionToEquatorialForDiurnalAberration,
  getCorrectionToEquatorialForVelocityAberration
} from './aberration'

/*****************************************************************************************************************/

export { getApparentEquatorialCoordinate } from './apparent'

/*****************************************************************************************************************/

export {
  GAST,
  getAngularSeparation,
  getAntipodeCoordinate,
  getCorrectionToEquatorialForProperMotion,
  getGreenwichApparentSiderealTime,
  getGreenwichSiderealTime,
  getHourAngle,
  getLocalApparentSiderealTime,
  getLocalSiderealTime,
  getNormalisedSphericalCoordinate,
  getParallacticAngle,
  GST,
  LAST,
  LST
} from './astrometry'

/*****************************************************************************************************************/

export {
  type CartesianCoordinate,
  type EclipticCoordinate,
  type EquatorialCoordinate,
  type EquatorialProperMotion,
  type GalacticCoordinate,
  type GeographicCoordinate,
  type GeographicCoordinateAtEpoch,
  type Hemisphere,
  type HorizontalCoordinate,
  type Interval,
  isEquatorialCoordinate,
  isEquatorialProperMotion,
  isHorizontalCoordinate,
  type Maybe,
  type Observer,
  type SphericalCoordinate
} from './common'

/*****************************************************************************************************************/

export {
  type Conjunction,
  findConjunction,
  findConjunctions,
  findPlanetaryConjunction,
  findPlanetaryConjunctions,
  getMidpointEquatorialCoordinate,
  isConjunction,
  isPlanetaryConjunction
} from './conjunction'

/*****************************************************************************************************************/

export {
  AU_IN_METERS,
  c,
  EARTH_ANGULAR_VELOCITY,
  EARTH_RADIUS,
  J1900,
  J1970,
  J2000,
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_YEAR,
  SPEED_OF_LIGHT
} from './constants'

/*****************************************************************************************************************/

export {
  type Constellation,
  type ConstellationName,
  constellations,
  getConstellation
} from './constellations'

/*****************************************************************************************************************/

export { andromeda } from './constellations/andromeda'
export { antlia } from './constellations/antlia'
export { apus } from './constellations/apus'
export { aquarius } from './constellations/aquarius'
export { aquila } from './constellations/aquila'
export { ara } from './constellations/ara'
export { aries } from './constellations/aries'
export { auriga } from './constellations/auriga'
export { bootes } from './constellations/bootes'
export { caelum } from './constellations/caelum'
export { camelopardalis } from './constellations/camelopardalis'
export { cancer } from './constellations/cancer'
export { canesVenatici } from './constellations/canesVenatici'
export { canisMajor } from './constellations/canisMajor'
export { canisMinor } from './constellations/canisMinor'
export { capricornus } from './constellations/capricornus'
export { carina } from './constellations/carina'
export { cassiopeia } from './constellations/cassiopeia'
export { centaurus } from './constellations/centaurus'
export { cepheus } from './constellations/cepheus'
export { cetus } from './constellations/cetus'
export { chamaeleon } from './constellations/chamaeleon'
export { circinus } from './constellations/circinus'
export { columba } from './constellations/columba'
export { comaBerenices } from './constellations/comaBerenices'
export { coronaAustralis } from './constellations/coronaAustralis'
export { coronaBorealis } from './constellations/coronaBorealis'
export { corvus } from './constellations/corvus'
export { crater } from './constellations/crater'
export { crux } from './constellations/crux'
export { cygnus } from './constellations/cygnus'
export { delphinus } from './constellations/delphinus'
export { dorado } from './constellations/dorado'
export { draco } from './constellations/draco'
export { equuleus } from './constellations/equuleus'
export { eridanus } from './constellations/eridanus'
export { fornax } from './constellations/fornax'
export { gemini } from './constellations/gemini'
export { grus } from './constellations/grus'
export { hercules } from './constellations/hercules'
export { horologium } from './constellations/horologium'
export { hydra } from './constellations/hydra'
export { hydrus } from './constellations/hydrus'
export { indus } from './constellations/indus'
export { lacerta } from './constellations/lacerta'
export { leo } from './constellations/leo'
export { leoMinor } from './constellations/leoMinor'
export { lepus } from './constellations/lepus'
export { libra } from './constellations/libra'
export { lupus } from './constellations/lupus'
export { lynx } from './constellations/lynx'
export { lyra } from './constellations/lyra'
export { mensa } from './constellations/mensa'
export { microscopium } from './constellations/microscopium'
export { monoceros } from './constellations/monoceros'
export { musca } from './constellations/musca'
export { norma } from './constellations/norma'
export { octans } from './constellations/octans'
export { ophiuchus } from './constellations/ophiuchus'
export { orion } from './constellations/orion'
export { pavo } from './constellations/pavo'
export { pegasus } from './constellations/pegasus'
export { perseus } from './constellations/perseus'
export { phoenix } from './constellations/phoenix'
export { pictor } from './constellations/pictor'
export { pisces } from './constellations/pisces'
export { piscisAustrinus } from './constellations/piscisAustrinus'
export { puppis } from './constellations/puppis'
export { pyxis } from './constellations/pyxis'
export { reticulum } from './constellations/reticulum'
export { sagitta } from './constellations/sagitta'
export { sagittarius } from './constellations/sagittarius'
export { scorpius } from './constellations/scorpius'
export { sculptor } from './constellations/sculptor'
export { scutum } from './constellations/scutum'
export { serpensCaput, serpensCauda } from './constellations/serpens'
export { sextans } from './constellations/sextans'
export { taurus } from './constellations/taurus'
export { telescopium } from './constellations/telescopium'
export { triangulum } from './constellations/triangulum'
export { triangulumAustrale } from './constellations/triangulumAustrale'
export { tucana } from './constellations/tucana'
export { ursaMajor } from './constellations/ursaMajor'
export { ursaMinor } from './constellations/ursaMinor'
export { vela } from './constellations/vela'
export { virgo } from './constellations/virgo'
export { volans } from './constellations/volans'
export { vulpecula } from './constellations/vulpecula'

/*****************************************************************************************************************/

export {
  AirmassConstraint,
  type AirmassConstraintParameters,
  Constraint,
  type ConstraintContext,
  type ConstraintParameters,
  type ConstraintScore,
  EarthLimbConstraint,
  type EarthLimbConstraintParameters,
  IsAstronomicalTwilight,
  IsMoonDown,
  type IsMoonDownParameters,
  IsNight,
  MoonAltitudeConstraint,
  type MoonAltitudeConstraintParameters,
  MoonAvoidanceConstraint,
  type MoonAvoidanceConstraintParameters,
  MoonIlluminationConstraint,
  type MoonIlluminationConstraintParameters,
  MoonSeparationConstraint,
  type MoonSeparationConstraintParameters,
  SunAltitudeConstraint,
  type SunAltitudeConstraintParameters,
  SunAvoidanceConstraint,
  type SunAvoidanceConstraintParameters,
  TargetAltitudeConstraint,
  type TargetAltitudeConstraintParameters
} from './constraints'

/*****************************************************************************************************************/

export {
  convertEclipticToEquatorial,
  convertEquatorialToHorizontal,
  convertGalacticToEquatorial,
  convertGeocentricToGeographic,
  convertHorizontalToEquatorial
} from './coordinates'

/*****************************************************************************************************************/

export {
  B,
  earth,
  getCoefficientOfEccentricity,
  getEccentricityOfOrbit,
  getObliquityOfEcliptic,
  L,
  R
} from './earth'

/*****************************************************************************************************************/

export {
  type Eclipse,
  EclipseType,
  getLunarEclipse,
  getSolarEclipse,
  isLunarEclipse,
  isSolarEclipse
} from './eclipse'

/*****************************************************************************************************************/

export {
  getEclipticPlane,
  getObliquityOfTheEcliptic
} from './ecliptic'

/*****************************************************************************************************************/

export {
  getJulianDate,
  getModifiedJulianDate,
  getNumberOfCenturiesSinceJ2000
} from './epoch'

/*****************************************************************************************************************/

export {} from './galactic'

/*****************************************************************************************************************/

export {
  formatDegreeToDMSHumanized,
  formatDegreeToHMSHumanized
} from './humanize'

/*****************************************************************************************************************/

export {
  CURRENT_EXPIRY_UNIX_TIMESTAMP,
  LEAP_SECONDS
} from './iers'

/*****************************************************************************************************************/

export {
  interpolate,
  interpolateGeodesic,
  interpolateRank2DArray,
  interpolateRank2DGeodesicCoordinateArray
} from './maths'

/*****************************************************************************************************************/

export {
  type AlgonquinMoonNames,
  type AnishinaabegMoonNames,
  type ColloquialMoonNames,
  getLunarAge,
  getLunarAngularDiameter,
  getLunarAnnualEquationCorrection,
  getLunarArgumentOfLatitude,
  getLunarBrownLunationNumber,
  getLunarCorrectedEclipticLongitudeOfTheAscendingNode,
  getLunarDistance,
  getLunarEclipticCoordinate,
  getLunarEclipticLatitude,
  getLunarEclipticLongitude,
  getLunarElongation,
  getLunarEquatorialCoordinate,
  getLunarEvectionCorrection,
  getLunarIllumination,
  getLunarMeanAnomaly,
  getLunarMeanAnomalyCorrection,
  getLunarMeanEclipticLongitude,
  getLunarMeanEclipticLongitudeOfTheAscendingNode,
  getLunarMeanGeometricLongitude,
  getLunarPhase,
  getLunarPhaseAngle,
  getLunarTrueAnomaly,
  getLunarTrueEclipticLongitude,
  getNextFullMoon,
  getNextNewMoon,
  isBlueMoon,
  isFullMoon,
  isNewMoon,
  LUNAR_SYNODIC_MONTH,
  LUNATION_BASE_JULIAN_DAY,
  names,
  type Phase,
  Phases
} from './moon'

/*****************************************************************************************************************/

export {
  getGeneralizedSolarTransit,
  getNight,
  getSolarTransit,
  isNight
} from './night'

/*****************************************************************************************************************/

export {
  getCorrectionToEquatorialForNutation,
  getNutation
} from './nutation'

/*****************************************************************************************************************/

export { Observation } from './observation'

/*****************************************************************************************************************/

export {
  getGeocentricRotationalVelocity,
  getGeographicCoordinate,
  getLocalHorizon
} from './observer'

/*****************************************************************************************************************/

export {
  getEarthLimbAngularRadius,
  isBodyOccultedByEarth
} from './occultation'

/*****************************************************************************************************************/

export {
  getAiryDiskDiameter,
  getFieldOfView,
  getFocalRatio
} from './optics'

/*****************************************************************************************************************/

export { getFOrbitalParameter } from './orbit'

/*****************************************************************************************************************/

export { getCorrectionToEquatorialForAnnualParallax } from './parallax'

/*****************************************************************************************************************/

export {
  getPlanetaryEquationOfCenter,
  getPlanetaryGeocentricEclipticCoordinate,
  getPlanetaryHeliocentricDistance,
  getPlanetaryHeliocentricEclipticLatitude,
  getPlanetaryHeliocentricEclipticLongitude,
  getPlanetaryMeanAnomaly,
  getPlanetaryPositions,
  getPlanetaryTrueAnomaly,
  jupiter,
  mars,
  mercury,
  neptune,
  type Planet,
  planets,
  saturn,
  uranus,
  venus
} from './planets'

/*****************************************************************************************************************/

export { getCorrectionToEquatorialForPrecessionOfEquinoxes } from './precession'

/*****************************************************************************************************************/

export {
  convertHorizontalToPolar,
  convertHorizontalToStereo,
  convertPolarToHorizontal,
  convertStereoToHorizontal
} from './projection'

/*****************************************************************************************************************/

export {
  type ConstraintEvaluation,
  getObservationalQuality,
  getObservationalQualityRanking,
  getObservationalQualityWindows,
  type ObservationalQuality,
  type ObservationalQualityRank,
  type ObservationalQualityWindow
} from './quality'

/*****************************************************************************************************************/

export {
  DEFAULT_SURFACE_HUMIDITY,
  DEFAULT_SURFACE_PRESSURE,
  DEFAULT_SURFACE_TEMPERATURE,
  getAirmass,
  getAirRefractiveIndex,
  getCorrectionToHorizontalForRefraction,
  getRefraction
} from './refraction'

/*****************************************************************************************************************/

export { getAirmassPickering } from './seeing'

/*****************************************************************************************************************/

export {
  getBarycentricJulianDate,
  getHeliocentricJulianDate,
  getSolarAngularDiameter,
  getSolarDistance,
  getSolarEclipticCoordinate,
  getSolarEclipticLongitude,
  getSolarEquationOfCenter,
  getSolarEquatorialCoordinate,
  getSolarMeanAnomaly,
  getSolarMeanGeometricLongitude,
  getSolarTrueAnomaly,
  getSolarTrueGeometricLongitude,
  SOLAR_TROPICAL_YEAR
} from './sun'

/*****************************************************************************************************************/

export {
  convertGreenwichSiderealTimeToUniversalTime,
  convertJulianDateToUTC,
  convertLocalSiderealTimeToGreenwichSiderealTime
} from './temporal'

/*****************************************************************************************************************/

export { DateTime } from './time'

/*****************************************************************************************************************/

export {
  doesBodyRiseOrSet,
  getBodyNextRise,
  getBodyNextSet,
  getBodyTransit,
  isBodyAboveHorizon,
  isBodyCircumpolar,
  isBodyVisible,
  isBodyVisibleForNight,
  isTransitInstance,
  type Parameters,
  type Transit,
  type TransitInstance
} from './transit'

/*****************************************************************************************************************/

export {
  getTwilightBandsForDay,
  Twilight,
  type TwilightBand
} from './twilight'

/*****************************************************************************************************************/

export {
  convertDegreesToRadians,
  convertDegreeToDMS,
  convertDegreeToHMS,
  convertRadiansToDegrees,
  getNormalizedAzimuthalDegree,
  getNormalizedInclinationDegree
} from './utilities'

/*****************************************************************************************************************/

export {
  convertPixelToWorldCoordinateSystem,
  parseSIPTerm,
  type SIP2DParameters,
  type WCS
} from './wcs'

/*****************************************************************************************************************/
