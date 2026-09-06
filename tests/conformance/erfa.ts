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
// the mean and apparent sidereal times of IAU 2006/2000A (gmst06 and gst06a), the precession of IAU 2006 (pmat06),
// e.g., without the frame bias, and the equinox-based apparent place of IAU 2006/2000A (atci13, carried from the
// CIRS to the true equinox of the date by the equation of the origins), for a star without proper motion, parallax
// or radial velocity.
//
// N.B. UT1 is taken as the civil time, e.g., DUT1 is zero, as the library likewise takes it, and so the sidereal
// times compare the two like for like.
//
// N.B. The 2050 epoch is beyond the published leap second table, and so its ΔT carries the 37 leap seconds of the
// present, as the leap seconds of the library likewise do.

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
        precessed: { ra: 88.52641753663326, dec: 7.404498630534777 },
        apparent: { ra: 88.52047076479681, dec: 7.401054949072764 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 33.028415005720575, dec: 89.17475728163461 },
        apparent: { ra: 32.73275680348897, dec: 89.17254878051578 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 95.87869859362291, dec: -52.68432702448202 },
        apparent: { ra: 95.8737087329289, dec: -52.69117670603191 }
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
        precessed: { ra: 88.79296178838017, dec: 7.407061909258079 },
        apparent: { ra: 88.79493424918059, dec: 7.405153500675564 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 37.95446055022232, dec: 89.26410417433758 },
        apparent: { ra: 38.19014820084731, dec: 89.26697201097741 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 95.98788813141529, dec: -52.69566251349377 },
        apparent: { ra: 95.99607377341168, dec: -52.6976350258586 }
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
        precessed: { ra: 88.97872559049458, dec: 7.408546519214833 },
        apparent: { ra: 88.98178296888356, dec: 7.408324302629252 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 42.11586032690731, dec: 89.3226358214265 },
        apparent: { ra: 42.62532626498184, dec: 89.31884399536472 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 96.06398440195993, dec: -52.70368402813513 },
        apparent: { ra: 96.06457030767507, dec: -52.70012792767383 }
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
        precessed: { ra: 89.15409707474988, dec: 7.409720632898854 },
        apparent: { ra: 89.15512510885327, dec: 7.413511637660631 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 46.721151393031384, dec: 89.37418325248461 },
        apparent: { ra: 46.859258180127426, dec: 89.37188546561825 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 96.13582231371025, dec: -52.71134828710983 },
        apparent: { ra: 96.1331324681725, dec: -52.70406869765366 }
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
        precessed: { ra: 89.47273723440462, dec: 7.411288805367971 },
        apparent: { ra: 89.47666557460991, dec: 7.408398749099676 }
      },
      {
        name: 'Polaris',
        ra: 37.95456067,
        dec: 89.26410897,
        precessed: { ra: 57.13191980926527, dec: 89.45528592344151 },
        apparent: { ra: 57.05986710861914, dec: 89.45946743244222 }
      },
      {
        name: 'Canopus',
        ra: 95.98787778,
        dec: -52.69566111,
        precessed: { ra: 96.26634465050002, dec: -52.72550115885435 },
        apparent: { ra: 96.26921855598269, dec: -52.7325128287388 }
      }
    ]
  }
]

/*****************************************************************************************************************/
