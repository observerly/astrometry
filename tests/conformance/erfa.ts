/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/erfa
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

// The reference values in this module are generated with ERFA (Essential Routines for Fundamental Astronomy),
// e.g., the open re-licensing of the IAU Standards of Fundamental Astronomy (SOFA) reference implementation, as
// bound by pyerfa (version 2.0.1.5).
//
// The models of each reference are: the nutation of IAU 2000A (nut06a), the mean obliquity of IAU 2006 (obl06),
// the mean and apparent sidereal times of IAU 2006/2000A (gmst06 and gst06a), the precession of IAU 2006 (the
// precession matrix of bp06), e.g., without the frame bias, and the equinox-based apparent place of IAU 2006/2000A
// (atci13, carried from the CIRS to the true equinox of the date by the equation of the origins), for a star
// without proper motion, parallax or radial velocity.
//
// N.B. UT1 is taken as the civil time, e.g., DUT1 is zero, as the library likewise takes it, and so the sidereal
// times compare the two like for like.
//
// N.B. The 2050 epoch is beyond the published leap second table, and so its ΔT carries the 37 leap seconds of the
// present, as the leap seconds of the library likewise do.
//
// N.B. Zavijava is included for its passage within ~2° of the Sun at the 2013 epoch, at which the gravitational
// deflection of light is a few tenths of an arcsecond.

/*****************************************************************************************************************/

import type { Matrix3 } from '../../src/common'

/*****************************************************************************************************************/

export interface ERFAStarReference {
  // The name of the star:
  name: string
  // The catalogue right ascension of the star at J2000.0 (in degrees):
  ra: number
  // The catalogue declination of the star at J2000.0 (in degrees):
  dec: number
  // The mean place of the date, e.g., the catalogue coordinate carried by the precession of IAU 2006 alone (in
  // degrees):
  precessed: { ra: number; dec: number }
  // The equinox-based apparent place of the date, e.g., the catalogue coordinate carried by the frame bias, the
  // precession, the nutation, the annual aberration and the gravitational deflection of light (in degrees):
  apparent: { ra: number; dec: number }
}

/*****************************************************************************************************************/

export interface ERFAInstantReference {
  // The instant the references are resolved at (in UTC):
  datetime: string
  // The nutation in longitude (in degrees):
  Δψ: number
  // The nutation in obliquity (in degrees):
  Δε: number
  // The mean obliquity of the ecliptic (in degrees):
  ε0: number
  // The Greenwich Mean Sidereal Time (in hours):
  GMST: number
  // The Greenwich Apparent Sidereal Time (in hours):
  GAST: number
  // The star references of the instant:
  stars: ERFAStarReference[]
}

/*****************************************************************************************************************/

// The references, across a spread of epochs about J2000.0:
export const erfaInstants: ERFAInstantReference[] = [
  {
    datetime: '1980-04-22T06:00:00.000Z',
    Δψ: -0.002958941230417086,
    Δε: -0.0020688364751678353,
    ε0: 23.4418416753556,
    GMST: 20.030182331156105,
    GAST: 20.03000137559557,
    stars: [
      {
        name: 'Betelgeuse',
        ra: 88.7929583,
        dec: 7.4070639,
        precessed: { ra: 88.52641407193498, dec: 7.404500614890266 },
        apparent: { ra: 88.52047076479681, dec: 7.401054949072764 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 33.028477310314685, dec: 89.17476217562655 },
        apparent: { ra: 32.73275680348897, dec: 89.17254878051578 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 95.8786882489553, dec: -52.68432564185551 },
        apparent: { ra: 95.8737087329289, dec: -52.69117670603191 }
      },
      {
        name: 'Zavijava',
        ra: 177.67382,
        dec: 1.76472,
        precessed: { ra: 177.42137456561275, dec: 1.8742648497985854 },
        apparent: { ra: 177.42289208315427, dec: 1.873534010691882 }
      }
    ]
  },
  {
    datetime: '2000-01-01T12:00:00.000Z',
    Δψ: -0.0038699992790562506,
    Δε: -0.0016026148146560208,
    ε0: 23.439279444179835,
    GMST: 18.697374828702767,
    GAST: 18.697138157369118,
    stars: [
      {
        name: 'Betelgeuse',
        ra: 88.7929583,
        dec: 7.4070639,
        precessed: { ra: 88.79295832752871, dec: 7.407063900238367 },
        apparent: { ra: 88.79493424918059, dec: 7.405153500675564 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 37.954561238249, dec: 89.26410897892804 },
        apparent: { ra: 38.19014820084731, dec: 89.26697201097741 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 95.98787779127697, dec: -52.695661111181344 },
        apparent: { ra: 95.99607377341168, dec: -52.6976350258586 }
      },
      {
        name: 'Zavijava',
        ra: 177.67382,
        dec: 1.76472,
        precessed: { ra: 177.67382002607116, dec: 1.7647199886863745 },
        apparent: { ra: 177.6714133435612, dec: 1.7656073791640294 }
      }
    ]
  },
  {
    datetime: '2013-09-22T04:00:00.000Z',
    Δψ: 0.003032129653478698,
    Δε: -0.0018097009905123358,
    ε0: 23.43749393159948,
    GMST: 4.07882115120361,
    GAST: 4.079006585304891,
    stars: [
      {
        name: 'Betelgeuse',
        ra: 88.7929583,
        dec: 7.4070639,
        precessed: { ra: 88.97872213233384, dec: 7.408548514807365 },
        apparent: { ra: 88.98178296888356, dec: 7.408324302629252 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 42.11599770058753, dec: 89.32264052450584 },
        apparent: { ra: 42.62532626498184, dec: 89.31884399536472 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 96.06397406501026, dec: -52.70368261211285 },
        apparent: { ra: 96.06457030767507, dec: -52.70012792767383 }
      },
      {
        name: 'Zavijava',
        ra: 177.67382,
        dec: 1.76472,
        precessed: { ra: 177.84974219626645, dec: 1.6883766364976287 },
        apparent: { ra: 177.84723121632075, dec: 1.6893980137503908 }
      }
    ]
  },
  {
    datetime: '2026-09-06T00:00:00.000Z',
    Δψ: 0.0025868316548078056,
    Δε: 0.002278236635404076,
    ε0: 23.43580845790843,
    GMST: 23.006759352194003,
    GAST: 23.006917554820852,
    stars: [
      {
        name: 'Betelgeuse',
        ra: 88.7929583,
        dec: 7.4070639,
        precessed: { ra: 89.15409361913667, dec: 7.409722632841929 },
        apparent: { ra: 89.15512510885327, dec: 7.413511637660631 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 46.721332966827916, dec: 89.37418781573976 },
        apparent: { ra: 46.859258180127426, dec: 89.37188546561825 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 96.13581197979498, dec: -52.71134685815221 },
        apparent: { ra: 96.1331324681725, dec: -52.70406869765366 }
      },
      {
        name: 'Zavijava',
        ra: 177.67382,
        dec: 1.76472,
        precessed: { ra: 178.0158118713948, dec: 1.6163064362495931 },
        apparent: { ra: 178.01322321828965, dec: 1.617558244759716 }
      }
    ]
  },
  {
    datetime: '2050-03-20T12:00:00.000Z',
    Δψ: 0.0040121463555880706,
    Δε: -0.0013268783255276561,
    ε0: 23.432746433263173,
    GMST: 23.881268432496594,
    GAST: 23.881513811197685,
    stars: [
      {
        name: 'Betelgeuse',
        ra: 88.7929583,
        dec: 7.4070639,
        precessed: { ra: 89.47273378343822, dec: 7.411290813206474 },
        apparent: { ra: 89.47666557460991, dec: 7.408398749099676 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 57.13220943325691, dec: 89.4552900677245 },
        apparent: { ra: 57.05986710861914, dec: 89.45946743244222 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 96.2663343221582, dec: -52.72549970641269 },
        apparent: { ra: 96.26921855598269, dec: -52.7325128287388 }
      },
      {
        name: 'Zavijava',
        ra: 177.67382,
        dec: 1.76472,
        precessed: { ra: 178.3175273426459, dec: 1.4853659404024722 },
        apparent: { ra: 178.32642688615098, dec: 1.481465962419012 }
      }
    ]
  }
]

/*****************************************************************************************************************/

/*****************************************************************************************************************/

// The gravitational deflection of light by the Sun alone, resolved with eraLdsun for the heliocentric position of
// the Earth of eraEpv00 at the Terrestrial Time of each instant, for targets placed about the geometric direction
// of the Sun, e.g., at its limb, within a few degrees of it, at right angles to it and nearly behind the Earth.
//
// N.B. eraLdsun is applied within the BCRS, and the library within the mean equator and equinox of J2000.0, and so
// the two differ by the frame bias of ~23 milliarcseconds, which displaces the deflection by ~0.04
// milliarcseconds at the limb of the Sun, and is held within the tolerance.

/*****************************************************************************************************************/

export interface ERFALightDeflectionTargetReference {
  // The right ascension of the target (in degrees):
  ra: number
  // The declination of the target (in degrees):
  dec: number
  // The displacement of the target by the gravitational deflection of light by the Sun (in degrees):
  deflection: { ra: number; dec: number }
}

/*****************************************************************************************************************/

export interface ERFALightDeflectionReference {
  // The instant the references are resolved at (in UTC):
  datetime: string
  // The target references of the instant:
  targets: ERFALightDeflectionTargetReference[]
}

/*****************************************************************************************************************/

// The references, across the same spread of epochs about J2000.0:
export const erfaLightDeflections: ERFALightDeflectionReference[] = [
  {
    datetime: '1980-04-22T06:00:00.000Z',
    targets: [
      {
        ra: 30.61560183425332,
        dec: 12.357648405423138,
        deflection: { ra: 0.0005067742954452115, dec: -2.469492947909657e-7 }
      },
      {
        ra: 30.082401834253318,
        dec: 12.357648405423138,
        deflection: { ra: -0.0005067742954736332, dec: -2.469492947909657e-7 }
      },
      {
        ra: 30.34900183425332,
        dec: 12.624248405423138,
        deflection: { ra: 0.0, dec: 0.0004835631673962837 }
      },
      {
        ra: 30.84900183425332,
        dec: 12.357648405423138,
        deflection: { ra: 0.00027021082703981847, dec: -2.466139665813216e-7 }
      },
      {
        ra: 31.34900183425332,
        dec: 12.357648405423138,
        deflection: { ra: 0.0001351028412841515, dec: -2.4651406427267375e-7 }
      },
      {
        ra: 28.34900183425332,
        dec: 12.357648405423138,
        deflection: { ra: -6.754627605687347e-5, dec: -2.4648908691915494e-7 }
      },
      {
        ra: 30.34900183425332,
        dec: 7.357648405423138,
        deflection: { ra: 0.0, dec: -2.576726972680632e-5 }
      },
      {
        ra: 60.349001834253315,
        dec: 12.357648405423138,
        deflection: { ra: 4.400179847152685e-6, dec: -2.4648080021449914e-7 }
      },
      {
        ra: 120.34900183425331,
        dec: 12.357648405423138,
        deflection: { ra: 1.1790246503551316e-6, dec: -2.464807664637192e-7 }
      },
      {
        ra: 210.24900183425333,
        dec: 12.357648405423138,
        deflection: { ra: 1.028865881380625e-9, dec: -2.4648076468736235e-7 }
      }
    ]
  },
  {
    datetime: '2000-01-01T12:00:00.000Z',
    targets: [
      {
        ra: 281.5555837543444,
        dec: -23.03325054094835,
        deflection: { ra: 0.0005837848976852911, dec: 4.901188574990556e-7 }
      },
      {
        ra: 281.02238375434445,
        dec: -23.03325054094835,
        deflection: { ra: -0.0005837848976852911, dec: 4.901188539463419e-7 }
      },
      {
        ra: 281.28898375434443,
        dec: -22.76665054094835,
        deflection: { ra: 0.0, dec: 0.0004944141427571935 }
      },
      {
        ra: 281.78898375434443,
        dec: -23.03325054094835,
        deflection: { ra: 0.00031127269363651067, dec: 4.893524199189869e-7 }
      },
      {
        ra: 282.28898375434443,
        dec: -23.03325054094835,
        deflection: { ra: 0.00015563338365609525, dec: 4.891240799054231e-7 }
      },
      {
        ra: 279.28898375434443,
        dec: -23.03325054094835,
        deflection: { ra: -7.781076544688403e-5, dec: 4.890669949020321e-7 }
      },
      {
        ra: 281.28898375434443,
        dec: -28.03325054094835,
        deflection: { ra: 0.0, dec: -2.6345477557754293e-5 }
      },
      {
        ra: 311.28898375434443,
        dec: -23.03325054094835,
        deflection: { ra: 5.068841403499391e-6, dec: 4.890480518326967e-7 }
      },
      {
        ra: 11.288983754344429,
        dec: -23.03325054094835,
        deflection: { ra: 1.3581919517946517e-6, dec: 4.890479736729958e-7 }
      },
      {
        ra: 101.18898375434446,
        dec: -23.03325054094835,
        deflection: { ra: 1.185242126666708e-9, dec: 4.890479701202821e-7 }
      }
    ]
  },
  {
    datetime: '2013-09-22T04:00:00.000Z',
    targets: [
      {
        ra: 179.4673839943058,
        dec: 0.3465409753201726,
        deflection: { ra: 0.00048439860597682127, dec: -6.82843098731567e-9 }
      },
      {
        ra: 178.93418399430578,
        dec: 0.3465409753201726,
        deflection: { ra: -0.00048439860597682127, dec: -6.828431042826821e-9 }
      },
      {
        ra: 179.2007839943058,
        dec: 0.6131409753201726,
        deflection: { ra: 0.0, dec: 0.0004843808860653942 }
      },
      {
        ra: 179.7007839943058,
        dec: 0.3465409753201726,
        deflection: { ra: 0.0002582801636208387, dec: -6.819567521798575e-9 }
      },
      {
        ra: 180.2007839943058,
        dec: 0.3465409753201726,
        deflection: { ra: 0.00012913762310517996, dec: -6.816926800823353e-9 }
      },
      {
        ra: 177.2007839943058,
        dec: 0.3465409753201726,
        deflection: { ra: -6.456389411368946e-5, dec: -6.81626660670176e-9 }
      },
      {
        ra: 179.2007839943058,
        dec: -4.653459024679828,
        deflection: { ra: 0.0, dec: -2.581084289321467e-5 }
      },
      {
        ra: 209.2007839943058,
        dec: 0.3465409753201726,
        deflection: { ra: 4.205897994324914e-6, dec: -6.816047559699001e-9 }
      },
      {
        ra: 269.20078399430577,
        dec: 0.3465409753201726,
        deflection: { ra: 1.1269669357716339e-6, dec: -6.816046671520581e-9 }
      },
      {
        ra: 359.1007839943058,
        dec: 0.3465409753201726,
        deflection: { ra: 9.834479897108395e-10, dec: -6.816046671520581e-9 }
      }
    ]
  },
  {
    datetime: '2026-09-06T00:00:00.000Z',
    targets: [
      {
        ra: 164.65897576110913,
        dec: 6.652696977808226,
        deflection: { ra: 0.0004888158606206616, dec: -1.3110335750354807e-7 }
      },
      {
        ra: 164.1257757611091,
        dec: 6.652696977808226,
        deflection: { ra: -0.0004888158606206616, dec: -1.311033583917265e-7 }
      },
      {
        ra: 164.39237576110912,
        dec: 6.9192969778082265,
        deflection: { ra: 0.0, dec: 0.00048225527026080073 }
      },
      {
        ra: 164.89237576110912,
        dec: 6.652696977808226,
        deflection: { ra: 0.0002606354330794147, dec: -1.3093163264699115e-7 }
      },
      {
        ra: 165.39237576110912,
        dec: 6.652696977808226,
        deflection: { ra: 0.00013031523545237178, dec: -1.3088047001730274e-7 }
      },
      {
        ra: 162.39237576110912,
        dec: 6.652696977808226,
        deflection: { ra: -6.515265542361703e-5, dec: -1.3086768113623748e-7 }
      },
      {
        ra: 164.39237576110912,
        dec: 1.652696977808226,
        deflection: { ra: 0.0, dec: -2.5697576789385224e-5 }
      },
      {
        ra: 194.39237576110912,
        dec: 6.652696977808226,
        deflection: { ra: 4.244251726959192e-6, dec: -1.308634356433913e-7 }
      },
      {
        ra: 254.39237576110912,
        dec: 6.652696977808226,
        deflection: { ra: 1.137243827997736e-6, dec: -1.3086341876800134e-7 }
      },
      {
        ra: 344.29237576110916,
        dec: 6.652696977808226,
        deflection: { ra: 9.923724064719863e-10, dec: -1.308634169916445e-7 }
      }
    ]
  },
  {
    datetime: '2050-03-20T12:00:00.000Z',
    targets: [
      {
        ra: 359.6881811698921,
        dec: -0.25118899068799144,
        deflection: { ra: 0.0004882262886667377, dec: 4.98880425858772e-9 }
      },
      {
        ra: 359.15498116989215,
        dec: -0.25118899068799144,
        deflection: { ra: -0.0004882262886667377, dec: 4.98880425858772e-9 }
      },
      {
        ra: 359.42158116989214,
        dec: 0.015411009312008561,
        deflection: { ra: 0.0, dec: 0.0004882169049684158 }
      },
      {
        ra: 359.92158116989214,
        dec: -0.25118899068799144,
        deflection: { ra: 0.00026032107473383803, dec: 4.982277534981705e-9 }
      },
      {
        ra: 0.4215811698921357,
        dec: -0.25118899068799144,
        deflection: { ra: 0.00013015805927807378, dec: 4.9803330903763765e-9 }
      },
      {
        ra: 357.42158116989214,
        dec: -0.25118899068799144,
        deflection: { ra: -6.507407334765958e-5, dec: 4.979846923713893e-9 }
      },
      {
        ra: 359.42158116989214,
        dec: -5.251188990687991,
        deflection: { ra: 0.0, dec: -2.601524997025706e-5 }
      },
      {
        ra: 29.421581169892136,
        dec: -0.25118899068799144,
        deflection: { ra: 4.239132664451972e-6, dec: 4.979685608308415e-9 }
      },
      {
        ra: 89.42158116989214,
        dec: -0.25118899068799144,
        deflection: { ra: 1.1358721963006246e-6, dec: 4.9796849976857516e-9 }
      },
      {
        ra: 179.32158116989217,
        dec: -0.25118899068799144,
        deflection: { ra: 9.912355380947702e-10, dec: 4.9796849421746e-9 }
      }
    ]
  }
]

/*****************************************************************************************************************/

// The corrections for the nutation, the annual aberration and the annual parallax alone, each resolved with ERFA
// for targets spread over the sphere, e.g., up to within 0.01° of either celestial pole:
//
// - the nutation is the rotation of eraNumat, for the mean obliquity of obl06 and the nutation of nut06a, of a
//   target referred to the mean equator and equinox of the date.
// - the annual aberration is that of eraAb, for the barycentric velocity of the Earth of eraEpv00, of a target
//   referred to the BCRS.
// - the annual parallax is that of eraPmpx, for the barycentric position of the Earth of eraEpv00, of a target of
//   a parallax of 0.768 arcseconds, e.g., of Proxima Centauri, referred to the BCRS.
//
// N.B. The library resolves the aberration and the parallax within the mean equator and equinox of J2000.0, and so
// the two differ from those of the BCRS by the frame bias of ~23 milliarcseconds, which displaces each by ~1e-7
// of itself, and is held within the tolerances.

/*****************************************************************************************************************/

export interface ERFACorrectionTargetReference {
  // The right ascension of the target (in degrees):
  ra: number
  // The declination of the target (in degrees):
  dec: number
  // The target rotated by the nutation (in degrees):
  nutated: { ra: number; dec: number }
  // The target displaced by the annual aberration (in degrees):
  aberrated: { ra: number; dec: number }
  // The target displaced by the annual parallax (in degrees):
  parallaxed: { ra: number; dec: number }
}

/*****************************************************************************************************************/

export interface ERFACorrectionReference {
  // The instant the references are resolved at (in UTC):
  datetime: string
  // The parallax of each target (in arcseconds):
  parallax: number
  // The target references of the instant:
  targets: ERFACorrectionTargetReference[]
}

/*****************************************************************************************************************/

// The references, across the same spread of epochs about J2000.0:
export const erfaCorrections: ERFACorrectionReference[] = [
  {
    datetime: '1980-04-22T06:00:00.000Z',
    parallax: 0.768,
    targets: [
      {
        ra: 0,
        dec: 0,
        nutated: { ra: 359.997285234394, dec: -0.0011770220518378055 },
        aberrated: { ra: 359.9955811322818, dec: -0.001916275075585351 },
        parallaxed: { ra: 0.00010579752305868757, dec: 4.593214446009517e-5 }
      },
      {
        ra: 45,
        dec: -60,
        nutated: { ra: 44.99619288792842, dec: -60.00229518228101 },
        aberrated: { ra: 44.98954650223041, dec: -60.001843566589066 },
        parallaxed: { ra: 44.99989641776768, dec: -59.99980260590907 }
      },
      {
        ra: 90,
        dec: 23.4,
        nutated: { ra: 89.9967759419279, dec: 23.39793113040906 },
        aberrated: { ra: 89.99676106916175, dec: 23.39999624005491 },
        parallaxed: { ra: 89.99980491331533, dec: 23.400000137054025 }
      },
      {
        ra: 135,
        dec: 60,
        nutated: { ra: 134.99330996133136, dec: 59.99936929263427 },
        aberrated: { ra: 135.00204604662724, dec: 60.00356824522138 },
        parallaxed: { ra: 134.99959717479214, dec: 60.00006781825202 }
      },
      {
        ra: 180,
        dec: -20,
        nutated: { ra: 179.99803823380944, dec: -19.998822964353323 },
        aberrated: { ra: 180.00470275468194, dec: -20.00281737392603 },
        parallaxed: { ra: 179.99988741190137, dec: -20.000018073783977 }
      },
      {
        ra: 225,
        dec: 85,
        nutated: { ra: 224.990073833051, dec: 85.00229514860624 },
        aberrated: { ra: 225.05995422169343, dec: 84.99881125584106 },
        parallaxed: { ra: 225.00059426456212, dec: 85.00020464869979 }
      },
      {
        ra: 270,
        dec: -89.99,
        nutated: { ra: 264.4271008606645, dec: -89.9878738766366 },
        aberrated: { ra: 281.6482691879966, dec: -89.98527823885094 },
        parallaxed: { ra: 271.03669151233197, dec: -89.99010417010977 }
      },
      {
        ra: 315,
        dec: 89.99,
        nutated: { ra: 328.7618094774522, dec: 89.99035360037477 },
        aberrated: { ra: 311.156844293712, dec: 89.98473874983945 },
        parallaxed: { ra: 316.1479075438716, dec: 89.98994619888933 }
      }
    ]
  },
  {
    datetime: '2000-01-01T12:00:00.000Z',
    parallax: 0.768,
    targets: [
      {
        ra: 0,
        dec: 0,
        nutated: { ra: 359.99644930171, dec: -0.0015392972670463783 },
        aberrated: { ra: 359.99903860683304, dec: -0.00041681094139862446 },
        parallaxed: { ra: 359.999811247201, dec: -8.188132980320258e-5 }
      },
      {
        ra: 45,
        dec: -60,
        nutated: { ra: 44.996371710900426, dec: -60.002221701034685 },
        aberrated: { ra: 45.00669174776483, dec: -60.00428288948072 },
        parallaxed: { ra: 44.99967746348598, dec: -60.00013245254695 }
      },
      {
        ra: 90,
        dec: 23.4,
        nutated: { ra: 89.9957832394199, dec: 23.398397328542007 },
        aberrated: { ra: 90.00620261954042, dec: 23.39999916275733 },
        parallaxed: { ra: 89.99995716270278, dec: 23.39999981580014 }
      },
      {
        ra: 135,
        dec: 60,
        nutated: { ra: 134.99260123020218, dec: 59.999955119400006 },
        aberrated: { ra: 135.0094088694158, dec: 59.99689411962407 },
        parallaxed: { ra: 135.0002113397681, dec: 60.000098721291586 }
      },
      {
        ra: 180,
        dec: -20,
        nutated: { ra: 179.99703261745577, dec: -19.998460694574778 },
        aberrated: { ra: 180.00102298328363, dec: -19.9984448003203 },
        parallaxed: { ra: 180.0002008668176, dec: -20.000090389410442 }
      },
      {
        ra: 225,
        dec: 85,
        nutated: { ra: 224.99593696043894, dec: 85.0022217008647 },
        aberrated: { ra: 224.96165217804833, dec: 84.99527553229586 },
        parallaxed: { ra: 225.00185029975714, dec: 84.99988759364533 }
      },
      {
        ra: 270,
        dec: -89.99,
        nutated: { ra: 262.43928733565895, dec: -89.98829567544091 },
        aberrated: { ra: 242.55622965982525, dec: -89.98764876713781 },
        parallaxed: { ra: 270.22107851207295, dec: -89.98981118578781 }
      },
      {
        ra: 315,
        dec: 89.99,
        nutated: { ra: 327.57699700217137, dec: 89.98979990964324 },
        aberrated: { ra: 279.739172581898, dec: 89.99185007546231 },
        parallaxed: { ra: 314.4041898814211, dec: 89.98983816839372 }
      }
    ]
  },
  {
    datetime: '2013-09-22T04:00:00.000Z',
    parallax: 0.768,
    targets: [
      {
        ra: 0,
        dec: 0,
        nutated: { ra: 0.0027820004889183413, dec: 0.0012059367795641642 },
        aberrated: { ra: 0.005201772612388169, dec: 0.002255233561168985 },
        parallaxed: { ra: 3.4605971064846035e-6, dec: 1.5188934834087454e-6 }
      },
      {
        ra: 45,
        dec: -60,
        nutated: { ra: 44.99908850308463, dec: -60.00042687773881 },
        aberrated: { ra: 45.00735955995165, dec: -59.99568852514197 },
        parallaxed: { ra: 45.00030778527437, dec: -60.00012827627525 }
      },
      {
        ra: 90,
        dec: 23.4,
        nutated: { ra: 90.00330381071078, dec: 23.3981902642409 },
        aberrated: { ra: 90.00000315460113, dec: 23.400003877824112 },
        parallaxed: { ra: 90.00023336883135, dec: 23.40000001942938 }
      },
      {
        ra: 135,
        dec: 60,
        nutated: { ra: 135.00204254407683, dec: 59.99786759862612 },
        aberrated: { ra: 134.9926483784732, dec: 59.99794028560807 },
        parallaxed: { ra: 135.00029799406266, dec: 59.99986748504925 }
      },
      {
        ra: 180,
        dec: -20,
        nutated: { ra: 180.00344069348444, dec: -20.001205926376908 },
        aberrated: { ra: 179.99446442677768, dec: -19.997879683304067 },
        parallaxed: { ra: 179.9999963173379, dec: -19.999925320693954 }
      },
      {
        ra: 225,
        dec: 85,
        nutated: { ra: 224.97840647110917, dec: 85.00042649287333 },
        aberrated: { ra: 224.95774198768257, dec: 85.00385731211115 },
        parallaxed: { ra: 224.998234341877, dec: 84.99985169920515 }
      },
      {
        ra: 270,
        dec: -89.99,
        nutated: { ra: 275.83326413778616, dec: -89.98812885799549 },
        aberrated: { ra: 269.96542864202706, dec: -89.99520148032333 },
        parallaxed: { ra: 268.7726286655359, dec: -89.99000116623455 }
      },
      {
        ra: 315,
        dec: 89.99,
        nutated: { ra: 318.10897143357903, dec: 89.99212082270928 },
        aberrated: { ra: 345.1871102026549, dec: 89.99268913569132 },
        parallaxed: { ra: 314.13302847581923, dec: 89.99015276479315 }
      }
    ]
  },
  {
    datetime: '2026-09-06T00:00:00.000Z',
    parallax: 0.768,
    targets: [
      {
        ra: 0,
        dec: 0,
        nutated: { ra: 0.0023733932708873058, dec: 0.0010289326472749743 },
        aberrated: { ra: 0.004978312364912433, dec: 0.0021580956641018318 },
        parallaxed: { ra: 5.849973262834601e-5, dec: 2.5337755966530075e-5 }
      },
      {
        ra: 45,
        dec: -60,
        nutated: { ra: 45.00390334009632, dec: -59.997661481448716 },
        aberrated: { ra: 45.004819050676126, dec: -59.994910662667394 },
        parallaxed: { ra: 45.00037327188001, dec: -60.00007731462912 }
      },
      {
        ra: 90,
        dec: 23.4,
        nutated: { ra: 90.00281870076266, dec: 23.402278211325925 },
        aberrated: { ra: 89.99828910114245, dec: 23.40000346659969 },
        parallaxed: { ra: 90.00022385326437, dec: 23.40000002063784 }
      },
      {
        ra: 135,
        dec: 60,
        nutated: { ra: 135.0064239524318, dec: 60.00088329359173 },
        aberrated: { ra: 134.9907393548319, dec: 59.998991726268784 },
        parallaxed: { ra: 135.00020780753508, dec: 59.99985103808996 }
      },
      {
        ra: 180,
        dec: -20,
        nutated: { ra: 180.00154418528575, dec: -20.00102891616164 },
        aberrated: { ra: 179.9947020658742, dec: -19.99850897854435 },
        parallaxed: { ra: 179.9999377463456, dec: -19.999905925168328 }
      },
      {
        ra: 225,
        dec: 85,
        nutated: { ra: 225.01246572416784, dec: 84.99766141544205 },
        aberrated: { ra: 224.972323352128, dec: 85.00480040714315 },
        parallaxed: { ra: 224.99785864506654, dec: 84.99989869585264 }
      },
      {
        ra: 270,
        dec: -89.99,
        nutated: { ra: 277.59236069740575, dec: -89.99220996399478 },
        aberrated: { ra: 287.363843907737, dec: -89.9947383166534 },
        parallaxed: { ra: 268.816142625015, dec: -89.99005637260024 }
      },
      {
        ra: 315,
        dec: 89.99,
        nutated: { ra: 302.87563454908246, dec: 89.98886822150571 },
        aberrated: { ra: 346.38729039055767, dec: 89.9911092157716 },
        parallaxed: { ra: 314.39337180700426, dec: 89.99018608954275 }
      }
    ]
  },
  {
    datetime: '2050-03-20T12:00:00.000Z',
    parallax: 0.768,
    targets: [
      {
        ra: 0,
        dec: 0,
        nutated: { ra: 0.003681291535417765, dec: 0.0015954344278053868 },
        aberrated: { ra: 359.99475595713045, dec: -0.0022728768506748427 },
        parallaxed: { ra: 359.9999984748142, dec: -6.644299872857014e-7 }
      },
      {
        ra: 45,
        dec: -60,
        nutated: { ra: 45.00010214670258, dec: -59.99981007385834 },
        aberrated: { ra: 44.99280179426065, dec: -60.00444234719459 },
        parallaxed: { ra: 44.99969779309455, dec: -59.99987133990096 }
      },
      {
        ra: 90,
        dec: 23.4,
        nutated: { ra: 90.0043716537955, dec: 23.398673060808843 },
        aberrated: { ra: 90.00016869903214, dec: 23.39999671706691 },
        parallaxed: { ra: 89.99976881786046, dec: 23.399999995770603 }
      },
      {
        ra: 135,
        dec: 60,
        nutated: { ra: 135.00401009903277, dec: 59.99793357604874 },
        aberrated: { ra: 135.0076358383501, dec: 60.00197990544899 },
        parallaxed: { ra: 134.99970210384478, dec: 60.0001305277309 }
      },
      {
        ra: 180,
        dec: -20,
        nutated: { ra: 180.00416425930027, dec: -20.00159542883521 },
        aberrated: { ra: 180.00558061521363, dec: -20.002082748203915 },
        parallaxed: { ra: 180.00000162308118, dec: -20.00007319050778 }
      },
      {
        ra: 225,
        dec: 85,
        nutated: { ra: 224.98006284478097, dec: 84.9998097124907 },
        aberrated: { ra: 225.041257307037, dec: 84.9959975096843 },
        parallaxed: { ra: 225.00173377841443, dec: 85.00014832035126 }
      },
      {
        ra: 270,
        dec: -89.99,
        nutated: { ra: 278.02123173658333, dec: -89.98856126122877 },
        aberrated: { ra: 269.418123364289, dec: -89.98475567890986 },
        parallaxed: { ra: 271.21526814931286, dec: -89.98999622474798 }
      },
      {
        ra: 315,
        dec: 89.99,
        nutated: { ra: 313.632774706397, dec: 89.99206415190464 },
        aberrated: { ra: 299.3190987558557, dec: 89.985875212786 },
        parallaxed: { ra: 315.8406414384508, dec: 89.98984780295228 }
      }
    ]
  }
]

/*****************************************************************************************************************/

// The frame bias matrix of IAU 2000, e.g., the fixed rotation from the ICRS to the mean equator and equinox of
// J2000.0, as resolved by bp00 (the rb matrix of iauBp00), in row-major order.
//
// N.B. The frame bias of bp06 is resolved through the Fukushima-Williams angles at J2000.0, and differs from that
// of bp00 by less than 1e-12, e.g., ~0.2 µas:
export const ERFAFrameBiasMatrix: Matrix3 = [
  [0.9999999999999942, -7.078279744199198e-8, 8.056217146976134e-8],
  [7.078279477857338e-8, 0.9999999999999969, 3.3060414542221364e-8],
  [-8.056217380986972e-8, -3.3060408839805523e-8, 0.9999999999999962]
]

/*****************************************************************************************************************/

export interface ERFAPrecessionMatrixReference {
  // The instant the reference is resolved at (in UTC):
  datetime: string
  // The precession matrix of the instant, in row-major order:
  P: Matrix3
}

/*****************************************************************************************************************/

// The precession matrix of IAU 2006, e.g., the rotation from the mean equator and equinox of
// J2000.0 to the mean equator and equinox of the date, without the frame bias, as resolved by bp06
// (the rp matrix of iauBp06) at the Terrestrial Time of each instant, in row-major order.
//
// N.B. The precession of bp06 is resolved through the Fukushima-Williams angles, and differs from
// that of the equatorial precession angles ζ, z and θ of P03 by less than ~1.2e-12, e.g.,
// ~0.25 µas, across the instants:
export const ERFAPrecessionMatrices: ERFAPrecessionMatrixReference[] = [
  {
    datetime: '1980-04-22T06:00:00.000Z',
    P: [
      [0.9999884739772481, 0.004403385327454104, 0.0019136641064850075],
      [-0.004403385280679611, 0.9999903050430595, -4.237766833235412e-6],
      [-0.0019136642141141913, -4.188882370052434e-6, 0.999998168934188]
    ]
  },
  {
    datetime: '2000-01-01T12:00:00.000Z',
    P: [
      [0.9999999999999997, -4.5478075916621784e-10, -1.976227698918473e-10],
      [4.547807591662298e-10, 0.9999999999999998, 2.619391090634409e-15],
      [1.976227698918794e-10, -2.621569145004254e-15, 0.9999999999999999]
    ]
  },
  {
    datetime: '2013-09-22T04:00:00.000Z',
    P: [
      [0.999994402021335, -0.003068846100776346, -0.00133345776154276],
      [0.0030688461235642197, 0.9999952910785894, -2.029004757289468e-6],
      [0.0013334577090982945, -2.0631832834733517e-6, 0.9999991109427454]
    ]
  },
  {
    datetime: '2026-09-06T00:00:00.000Z',
    P: [
      [0.9999788438690885, -0.0059659626888672905, -0.002592123345029163],
      [0.0059659627743144025, 0.9999822034560891, -7.699373345041933e-6],
      [0.0025921231483663344, -7.765300926763711e-6, 0.9999966404129985]
    ]
  },
  {
    datetime: '2050-03-20T12:00:00.000Z',
    P: [
      [0.9999250443899979, -0.011229670481594064, -0.004878534875895114],
      [0.011229670776060137, 0.9999369448856149, -2.733283736523236e-5],
      [0.00487853419807742, -2.7453551910142475e-5, 0.9999880995043794]
    ]
  }
]

/*****************************************************************************************************************/

export interface ERFANutationMatrixReference {
  // The instant the reference is resolved at (in UTC):
  datetime: string
  // The nutation matrix of the instant, in row-major order:
  N: Matrix3
}

/*****************************************************************************************************************/

// The nutation matrix of IAU 2006/2000A, e.g., the rotation from the mean equator and equinox of
// the date to the true equator and equinox of the date, as resolved by num06a (the rmatn matrix of
// iauNum06a), e.g., numat for the mean obliquity of obl06 and the nutation of nut06a, at the
// Terrestrial Time of each instant, in row-major order:
export const ERFANutationMatrices: ERFANutationMatrixReference[] = [
  {
    datetime: '1980-04-22T06:00:00.000Z',
    N: [
      [0.9999999986664865, 4.738085642262819e-5, 2.0544621013447875e-5],
      [-4.738159821708427e-5, 0.9999999982256156, 3.610752145064353e-5],
      [-2.0542910171704187e-5, -3.610849483951182e-5, 0.9999999991370827]
    ]
  },
  {
    datetime: '2000-01-01T12:00:00.000Z',
    N: [
      [0.9999999977188885, 6.197062435822248e-5, 2.6867538858644296e-5],
      [-6.197137584336158e-5, 0.9999999976886118, 2.797007264416488e-5],
      [-2.686580547367788e-5, -2.797173759872011e-5, 0.9999999992479052]
    ]
  },
  {
    datetime: '2013-09-22T04:00:00.000Z',
    N: [
      [0.9999999985997027, -4.855440347718055e-5, -2.1049100985760882e-5],
      [4.855506829388327e-5, 0.9999999983224052, 3.158472973551022e-5],
      [2.1047567372737724e-5, -3.158575173179018e-5, 0.9999999992796702]
    ]
  },
  {
    datetime: '2026-09-06T00:00:00.000Z',
    N: [
      [0.9999999989807961, -4.1424241039940044e-5, -1.7956615348511633e-5],
      [4.142352700313733e-5, 0.9999999983514936, -3.9763102330114514e-5],
      [1.7958262475245457e-5, 3.9762358463247885e-5, 0.9999999990482279]
    ]
  },
  {
    datetime: '2050-03-20T12:00:00.000Z',
    N: [
      [0.9999999975482382, -6.425001307344309e-5, -2.7847071695958655e-5],
      [6.425065794971538e-5, 0.9999999976677915, 2.315750095542432e-5],
      [2.7845583761274348e-5, -2.315929009131798e-5, 0.9999999993441353]
    ]
  }
]

/*****************************************************************************************************************/

export interface ERFABiasPrecessionNutationMatrixReference {
  // The instant the reference is resolved at (in UTC):
  datetime: string
  // The bias-precession-nutation matrix of the instant, in row-major order:
  NPB: Matrix3
}

/*****************************************************************************************************************/

// The bias-precession-nutation matrix of IAU 2006/2000A, e.g., the rotation from the ICRS to the
// true equator and equinox of the date, as resolved by pnm06a (the rbpn matrix of iauPnm06a),
// e.g., the nutation matrix of num06a and the bias-precession matrix of bp06, at the Terrestrial
// Time of each instant, in row-major order:
export const ERFABiasPrecessionNutationMatrices: ERFABiasPrecessionNutationMatrixReference[] = [
  {
    datetime: '1980-04-22T06:00:00.000Z',
    NPB: [
      [0.9999882248512901, 0.004450694785790439, 0.0019342891948699163],
      [-0.004450764642208042, 0.9999900947920005, 3.181171658699477e-5],
      [-0.0019341284510919694, -4.0420407955642184e-5, 0.9999981287549119]
    ]
  },
  {
    datetime: '2000-01-01T12:00:00.000Z',
    NPB: [
      [0.9999999977211381, 6.189938499979681e-5, 2.6947905424166223e-5],
      [-6.190013962362179e-5, 0.9999999976920988, 2.800312710384142e-5],
      [-2.694617198562732e-5, -2.8004795119140943e-5, 0.9999999992448176]
    ]
  },
  {
    datetime: '2013-09-22T04:00:00.000Z',
    NPB: [
      [0.9999942234354219, -0.0031174709663907047, -0.0013544262848153917],
      [0.0031175138127680305, 0.9999951401061632, 2.952426119288702e-5],
      [0.0013543276614203649, -3.374653329542077e-5, 0.9999990823284574]
    ]
  },
  {
    datetime: '2026-09-06T00:00:00.000Z',
    NPB: [
      [0.999978548953711, -0.006007456743063327, -0.002609999216657405],
      [0.006007353130504989, 0.99998195456152, -4.753617416589703e-5],
      [0.00261023768958714, 3.185596750040774e-5, 0.9999965928163962]
    ]
  },
  {
    datetime: '2050-03-20T12:00:00.000Z',
    NPB: [
      [0.999924184174872, -0.011293986267463032, -0.00490629966543951],
      [0.011294100346066992, 0.9999362196047933, -4.455093807288406e-6],
      [0.004906037055476125, -5.095748470861984e-5, 0.9999879640294402]
    ]
  }
]

/*****************************************************************************************************************/

export interface ERFAEquatorialToEclipticMatrixReference {
  // The instant the reference is resolved at (in UTC):
  datetime: string
  // The equatorial to ecliptic matrix of the instant, in row-major order:
  E: Matrix3
}

/*****************************************************************************************************************/

// The rotation from the true equator and equinox of the date to the true ecliptic and equinox of
// the date, e.g., R1(ε) of the true obliquity of the ecliptic, as resolved by rx for the mean
// obliquity of obl06 corrected for the nutation in obliquity of nut06a, at the Terrestrial Time of
// each instant, in row-major order.
//
// N.B. ERFA has no routine for the true ecliptic of the date. The rotation of the mean obliquity
// alone agrees with that of ecm06, e.g., the ecliptic of IAU 2006, to within 1e-15:
export const ERFAEquatorialToEclipticMatrices: ERFAEquatorialToEclipticMatrixReference[] = [
  {
    datetime: '1980-04-22T06:00:00.000Z',
    E: [
      [1, 0, 0],
      [0, 0.9174787176315696, 0.3977848698645167],
      [0, -0.3977848698645167, 0.9174787176315696]
    ]
  },
  {
    datetime: '2000-01-01T12:00:00.000Z',
    E: [
      [1, 0, 0],
      [0, 0.9174932688900481, 0.39775130614676046],
      [0, -0.39775130614676046, 0.9174932688900481]
    ]
  },
  {
    datetime: '2013-09-22T04:00:00.000Z',
    E: [
      [1, 0, 0],
      [0, 0.9175071010950469, 0.39771939786759647],
      [0, -0.39771939786759647, 0.9175071010950469]
    ]
  },
  {
    datetime: '2026-09-06T00:00:00.000Z',
    E: [
      [1, 0, 0],
      [0, 0.9174904235538546, 0.3977578694217986],
      [0, -0.3977578694217986, 0.9174904235538546]
    ]
  },
  {
    datetime: '2050-03-20T12:00:00.000Z',
    E: [
      [1, 0, 0],
      [0, 0.9175367018550039, 0.3976511042975257],
      [0, -0.3976511042975257, 0.9175367018550039]
    ]
  }
]

/*****************************************************************************************************************/

// The rotation from the ICRS to the galactic frame of the Hipparcos catalogue, e.g., as is defined
// in ESA (1997), Vol. 1, §1.5.3, as resolved by icrs2g for each of the unit axes of the ICRS, in
// row-major order:
export const ERFAEquatorialToGalacticMatrix: Matrix3 = [
  [-0.05487556041621537, -0.8734370902348852, -0.48383501554871305],
  [0.4941094278755836, -0.44482962996001096, 0.746982244497219],
  [-0.8676661490190047, -0.19807637343120157, 0.4559837761750669]
]

/*****************************************************************************************************************/
