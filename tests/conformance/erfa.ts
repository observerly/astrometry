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
      { ra: 30.61560183425332, dec: 12.357648405423138, deflection: { ra: 0.0005067742954452115, dec: -2.469492947909657e-07 } },
      { ra: 30.082401834253318, dec: 12.357648405423138, deflection: { ra: -0.0005067742954736332, dec: -2.469492947909657e-07 } },
      { ra: 30.34900183425332, dec: 12.624248405423138, deflection: { ra: 0.0, dec: 0.0004835631673962837 } },
      { ra: 30.84900183425332, dec: 12.357648405423138, deflection: { ra: 0.00027021082703981847, dec: -2.466139665813216e-07 } },
      { ra: 31.34900183425332, dec: 12.357648405423138, deflection: { ra: 0.0001351028412841515, dec: -2.4651406427267375e-07 } },
      { ra: 28.34900183425332, dec: 12.357648405423138, deflection: { ra: -6.754627605687347e-05, dec: -2.4648908691915494e-07 } },
      { ra: 30.34900183425332, dec: 7.357648405423138, deflection: { ra: 0.0, dec: -2.576726972680632e-05 } },
      { ra: 60.349001834253315, dec: 12.357648405423138, deflection: { ra: 4.400179847152685e-06, dec: -2.4648080021449914e-07 } },
      { ra: 120.34900183425331, dec: 12.357648405423138, deflection: { ra: 1.1790246503551316e-06, dec: -2.464807664637192e-07 } },
      { ra: 210.24900183425333, dec: 12.357648405423138, deflection: { ra: 1.028865881380625e-09, dec: -2.4648076468736235e-07 } }
    ]
  },
  {
    datetime: '2000-01-01T12:00:00.000Z',
    targets: [
      { ra: 281.5555837543444, dec: -23.03325054094835, deflection: { ra: 0.0005837848976852911, dec: 4.901188574990556e-07 } },
      { ra: 281.02238375434445, dec: -23.03325054094835, deflection: { ra: -0.0005837848976852911, dec: 4.901188539463419e-07 } },
      { ra: 281.28898375434443, dec: -22.76665054094835, deflection: { ra: 0.0, dec: 0.0004944141427571935 } },
      { ra: 281.78898375434443, dec: -23.03325054094835, deflection: { ra: 0.00031127269363651067, dec: 4.893524199189869e-07 } },
      { ra: 282.28898375434443, dec: -23.03325054094835, deflection: { ra: 0.00015563338365609525, dec: 4.891240799054231e-07 } },
      { ra: 279.28898375434443, dec: -23.03325054094835, deflection: { ra: -7.781076544688403e-05, dec: 4.890669949020321e-07 } },
      { ra: 281.28898375434443, dec: -28.03325054094835, deflection: { ra: 0.0, dec: -2.6345477557754293e-05 } },
      { ra: 311.28898375434443, dec: -23.03325054094835, deflection: { ra: 5.068841403499391e-06, dec: 4.890480518326967e-07 } },
      { ra: 11.288983754344429, dec: -23.03325054094835, deflection: { ra: 1.3581919517946517e-06, dec: 4.890479736729958e-07 } },
      { ra: 101.18898375434446, dec: -23.03325054094835, deflection: { ra: 1.185242126666708e-09, dec: 4.890479701202821e-07 } }
    ]
  },
  {
    datetime: '2013-09-22T04:00:00.000Z',
    targets: [
      { ra: 179.4673839943058, dec: 0.3465409753201726, deflection: { ra: 0.00048439860597682127, dec: -6.82843098731567e-09 } },
      { ra: 178.93418399430578, dec: 0.3465409753201726, deflection: { ra: -0.00048439860597682127, dec: -6.828431042826821e-09 } },
      { ra: 179.2007839943058, dec: 0.6131409753201726, deflection: { ra: 0.0, dec: 0.0004843808860653942 } },
      { ra: 179.7007839943058, dec: 0.3465409753201726, deflection: { ra: 0.0002582801636208387, dec: -6.819567521798575e-09 } },
      { ra: 180.2007839943058, dec: 0.3465409753201726, deflection: { ra: 0.00012913762310517996, dec: -6.816926800823353e-09 } },
      { ra: 177.2007839943058, dec: 0.3465409753201726, deflection: { ra: -6.456389411368946e-05, dec: -6.81626660670176e-09 } },
      { ra: 179.2007839943058, dec: -4.653459024679828, deflection: { ra: 0.0, dec: -2.581084289321467e-05 } },
      { ra: 209.2007839943058, dec: 0.3465409753201726, deflection: { ra: 4.205897994324914e-06, dec: -6.816047559699001e-09 } },
      { ra: 269.20078399430577, dec: 0.3465409753201726, deflection: { ra: 1.1269669357716339e-06, dec: -6.816046671520581e-09 } },
      { ra: 359.1007839943058, dec: 0.3465409753201726, deflection: { ra: 9.834479897108395e-10, dec: -6.816046671520581e-09 } }
    ]
  },
  {
    datetime: '2026-09-06T00:00:00.000Z',
    targets: [
      { ra: 164.65897576110913, dec: 6.652696977808226, deflection: { ra: 0.0004888158606206616, dec: -1.3110335750354807e-07 } },
      { ra: 164.1257757611091, dec: 6.652696977808226, deflection: { ra: -0.0004888158606206616, dec: -1.311033583917265e-07 } },
      { ra: 164.39237576110912, dec: 6.9192969778082265, deflection: { ra: 0.0, dec: 0.00048225527026080073 } },
      { ra: 164.89237576110912, dec: 6.652696977808226, deflection: { ra: 0.0002606354330794147, dec: -1.3093163264699115e-07 } },
      { ra: 165.39237576110912, dec: 6.652696977808226, deflection: { ra: 0.00013031523545237178, dec: -1.3088047001730274e-07 } },
      { ra: 162.39237576110912, dec: 6.652696977808226, deflection: { ra: -6.515265542361703e-05, dec: -1.3086768113623748e-07 } },
      { ra: 164.39237576110912, dec: 1.652696977808226, deflection: { ra: 0.0, dec: -2.5697576789385224e-05 } },
      { ra: 194.39237576110912, dec: 6.652696977808226, deflection: { ra: 4.244251726959192e-06, dec: -1.308634356433913e-07 } },
      { ra: 254.39237576110912, dec: 6.652696977808226, deflection: { ra: 1.137243827997736e-06, dec: -1.3086341876800134e-07 } },
      { ra: 344.29237576110916, dec: 6.652696977808226, deflection: { ra: 9.923724064719863e-10, dec: -1.308634169916445e-07 } }
    ]
  },
  {
    datetime: '2050-03-20T12:00:00.000Z',
    targets: [
      { ra: 359.6881811698921, dec: -0.25118899068799144, deflection: { ra: 0.0004882262886667377, dec: 4.98880425858772e-09 } },
      { ra: 359.15498116989215, dec: -0.25118899068799144, deflection: { ra: -0.0004882262886667377, dec: 4.98880425858772e-09 } },
      { ra: 359.42158116989214, dec: 0.015411009312008561, deflection: { ra: 0.0, dec: 0.0004882169049684158 } },
      { ra: 359.92158116989214, dec: -0.25118899068799144, deflection: { ra: 0.00026032107473383803, dec: 4.982277534981705e-09 } },
      { ra: 0.4215811698921357, dec: -0.25118899068799144, deflection: { ra: 0.00013015805927807378, dec: 4.9803330903763765e-09 } },
      { ra: 357.42158116989214, dec: -0.25118899068799144, deflection: { ra: -6.507407334765958e-05, dec: 4.979846923713893e-09 } },
      { ra: 359.42158116989214, dec: -5.251188990687991, deflection: { ra: 0.0, dec: -2.601524997025706e-05 } },
      { ra: 29.421581169892136, dec: -0.25118899068799144, deflection: { ra: 4.239132664451972e-06, dec: 4.979685608308415e-09 } },
      { ra: 89.42158116989214, dec: -0.25118899068799144, deflection: { ra: 1.1358721963006246e-06, dec: 4.9796849976857516e-09 } },
      { ra: 179.32158116989217, dec: -0.25118899068799144, deflection: { ra: 9.912355380947702e-10, dec: 4.9796849421746e-09 } }
    ]
  }
]

/*****************************************************************************************************************/
