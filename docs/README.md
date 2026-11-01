[![@observerly/astrometry](https://raw.githubusercontent.com/observerly/astrometry/main/.github/assets/banner.png)](https://observerly.com)

[![npm](https://img.shields.io/npm/v/@observerly/astrometry)](https://www.npmjs.com/package/@observerly/astrometry)
[![Tests](https://github.com/observerly/astrometry/actions/workflows/test.yml/badge.svg)](https://github.com/observerly/astrometry/actions/workflows/test.yml)
[![License](https://img.shields.io/npm/l/@observerly/astrometry)](https://github.com/observerly/astrometry/blob/main/LICENSE)

A lightweight, type-safe TypeScript library for positional astronomy: where things are in the sky, and when.

It has no runtime dependencies, works with plain JavaScript `Date` objects, and runs anywhere JavaScript does.

> **Note:** astrometry is pre-1.0. The API may change between minor versions.

## Features

- **Positions** of stars, the Sun, the Moon and the planets, for any observer and time.
- **Corrections** for proper motion, parallax, aberration, precession, nutation and refraction.
- **Rise, transit and set** times for any target, plus sunrise, solar noon and sunset.
- **Twilight** bands and the start and end of the night.
- **Moon** phase, illumination, distance and angular size.
- **Planning** tools that score how good a target is to observe at any moment.
- **Satellites** from two-line elements, propagated with SGP4.
- **Extras** for constellations, eclipses, conjunctions, optics and World Coordinate System (WCS) images.

## Installation

```bash
npm install @observerly/astrometry
```

Or with your package manager of choice:

```bash
pnpm add @observerly/astrometry
```

```bash
yarn add @observerly/astrometry
```

```bash
bun add @observerly/astrometry
```

```bash
nub add @observerly/astrometry
```

## Quick Start

Where is Betelgeuse in the sky above Mauna Kea, Hawaii, at 10pm local time on 28th January 2025?

```ts
import {
  convertEquatorialToHorizontal,
  type EquatorialCoordinate,
  type GeographicCoordinate
} from '@observerly/astrometry'

// The date and time of the observation, i.e., 10pm HST on 28th January 2025:
const datetime = new Date('2025-01-29T08:00:00Z')

// The observer, i.e., Mauna Kea, Hawaii (in degrees):
const observer: GeographicCoordinate = { latitude: 19.820611, longitude: -155.468094 }

// The target, i.e., Betelgeuse (in degrees, J2000):
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

const position = convertEquatorialToHorizontal(datetime, observer, betelgeuse)
// { alt: 76.8207, az: 200.2558 }
```

Betelgeuse is 77° above the horizon, just west of due south.

## Conventions

### Units

- Angles are in **degrees**.
- Equatorial coordinates are in the **ICRS**, at the standard epoch **J2000**.
- Distances are in **metres**, and velocities in **metres per second**.

### Dates

Every function takes a JavaScript `Date`. A `Date` is an instant in time, so your time zone never changes a result.

Functions that work on a whole day, e.g., sunrise, sunset, night and twilight, read that day in **UTC**.

### Observers

An observer is a `latitude` and `longitude` in degrees, east positive. An optional `elevation`, in metres above sea level, lowers the observer's horizon for rise and set times.

### Angles

A few functions take a generic spherical coordinate. These follow [ISO 80000-2](https://www.iso.org/standard/64973.html), with one astronomical twist: θ is measured from the horizon or equator, not from the zenith.

| Angle     | Symbol | Range       | For example                         |
| --------- | ------ | ----------- | ----------------------------------- |
| Polar     | θ      | [-90, 90]   | altitude, declination, latitude     |
| Azimuthal | φ      | [0, 360)    | azimuth, right ascension, longitude |

Both are `number`, so swapping them is silent. Double-check the order:

```ts
import { getAngularSeparation } from '@observerly/astrometry'

const rigel = { ra: 78.6344671, dec: -8.2016383 }

const separation = getAngularSeparation(
  { θ: betelgeuse.dec, φ: betelgeuse.ra },
  { θ: rigel.dec, φ: rigel.ra }
)
// 18.6060
```

## Usage

Every example below reuses `datetime`, `observer`, `betelgeuse` and `position` from [Quick Start](#quick-start). Results are rounded for readability.

### Apparent Place

A catalogue position is where a star sat at J2000. To find where it appears tonight, apply three corrections in order:

```ts
import {
  getApparentEquatorialCoordinate,
  getCorrectionToEquatorialForNutation,
  getCorrectionToEquatorialForPrecessionOfEquinoxes
} from '@observerly/astrometry'

// 1. Proper motion, parallax and annual aberration, still in the frame of J2000:
const displaced = getApparentEquatorialCoordinate(datetime, betelgeuse)

// 2. Precession carries it to the mean equator and equinox of the date:
const precession = getCorrectionToEquatorialForPrecessionOfEquinoxes(datetime, displaced)

const mean = { ra: displaced.ra + precession.ra, dec: displaced.dec + precession.dec }

// 3. Nutation carries it to the true equator and equinox of the date:
const nutation = getCorrectionToEquatorialForNutation(datetime, mean)

const apparent = { ra: mean.ra + nutation.ra, dec: mean.dec + nutation.dec }
// { ra: 89.1373, dec: 7.4111 }

convertEquatorialToHorizontal(datetime, observer, apparent)
// { alt: 76.9329, az: 198.8351 }
```

Pass a proper motion, in arcseconds per year, as the third argument of `getApparentEquatorialCoordinate` for fast-moving stars.

### Atmosphere

The atmosphere bends starlight, lifting targets slightly. Airmass measures how much air you are looking through, where 1 is straight up:

```ts
import { getAirmass, getCorrectionToHorizontalForRefraction } from '@observerly/astrometry'

getCorrectionToHorizontalForRefraction(position)
// { alt: 76.8246, az: 200.2558 }

getAirmass(position)
// 1.0267
```

Refraction assumes standard conditions by default. Pass a temperature (K) and pressure (Pa) to refine it.

### Transits

When does a target next rise and set?

```ts
import { getBodyNextRise, getBodyNextSet, isBodyCircumpolar } from '@observerly/astrometry'

getBodyNextSet(datetime, observer, betelgeuse)
// { datetime: 2025-01-29T13:51:31Z, az: 277.88, … }

getBodyNextRise(datetime, observer, betelgeuse)
// { datetime: 2025-01-30T01:28:08Z, az: 82.12, … }

isBodyCircumpolar(observer, betelgeuse)
// false
```

Both return `false` for a target that never rises or never sets.

### Sun

```ts
import { getSolarNoon, getSunrise, getSunset } from '@observerly/astrometry'

getSunrise(datetime, observer)
// 2025-01-29T16:57:46Z

getSolarNoon(datetime, observer)
// 2025-01-29T22:35:05Z

getSunset(datetime, observer)
// 2025-01-30T04:12:36Z
```

The times are for the solar noon on the UTC date of `datetime`, with sunrise before it and sunset after it. They follow the almanac convention: the Sun's upper limb touching the horizon.

Sunrise and sunset return `null` during a polar day or polar night.

### Twilight

```ts
import { getNight, getTwilightBandsForDay, isNight, Twilight } from '@observerly/astrometry'

isNight(datetime, observer)
// true

// The night after the solar day of `datetime`, with the Sun 12° below the horizon:
getNight(datetime, observer)
// { start: 2025-01-30T05:02:08Z, end: 2025-01-30T16:08:01Z }

// Every band of the UTC day, i.e., Day, Civil, Nautical, Astronomical and Night:
const bands = getTwilightBandsForDay(datetime, observer)

bands.find(({ name }) => name === Twilight.Night)
// { name: 'Night', interval: { from: 2025-01-29T05:28:00Z, to: 2025-01-29T15:42:00Z } }
```

Pass a horizon, e.g., `getNight(datetime, observer, -18)`, for astronomical night.

### Moon

```ts
import { getLunarIllumination, getLunarPhase } from '@observerly/astrometry'

getLunarPhase(datetime)
// 'New'

getLunarIllumination(datetime)
// 0.19 (%)
```

The `moon` module also covers the Moon's position, distance, angular size and age, and finds the next full and new Moon.

### Planets

```ts
import { getPlanetaryPositions } from '@observerly/astrometry'

const planets = getPlanetaryPositions(datetime, observer)

// Each planet carries its ecliptic, equatorial and horizontal coordinates:
planets.filter(({ alt }) => alt > 0).map(({ name }) => name)
// ['Mars', 'Jupiter', 'Uranus']
```

### Constellations

```ts
import { getConstellation } from '@observerly/astrometry'

getConstellation(betelgeuse)?.name
// 'Orion'
```

Every IAU constellation is also exported by name, e.g., `orion`, with its abbreviation, meaning and a GeoJSON feature.

### Planning

How good is it to observe Betelgeuse right now?

```ts
import { getObservationalQuality } from '@observerly/astrometry'

const { quality, observable } = getObservationalQuality(datetime, observer, betelgeuse)
// quality: 0.56, observable: true
```

Quality runs from -1, unobservable, to 1, ideal. By default it weighs the target's altitude, the Sun's altitude and the Moon's separation.

Pass your own constraints as the fourth argument, e.g., `AirmassConstraint`, `MoonIlluminationConstraint` or `SunAvoidanceConstraint`.

### Satellites

Propagate a satellite from its two-line element set (TLE) with SGP4:

```ts
import { parseTwoLineElement, SatelliteRecord } from '@observerly/astrometry'

// The International Space Station, on 20th September 2008:
const tle = parseTwoLineElement(
  '1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927',
  '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537'
)

const iss = new SatelliteRecord(tle)

iss.getStateVector(new Date('2008-09-20T13:00:00Z'))
// position: { x: -1345306.9, y: 5181620.4, z: -4088075.7 } (m)
// velocity: { x: -5080.8, y: -4325.1, z: -3821.7 } (m/s)
```

State vectors are in the True Equator, Mean Equinox (TEME) frame. Near-Earth orbits, with a period under 225 minutes, are supported. Deep-space orbits throw an `SGP4Error` for now.

### Formatting

```ts
import { formatDegreeToDMSHumanized, formatDegreeToHMSHumanized } from '@observerly/astrometry'

formatDegreeToHMSHumanized(betelgeuse.ra)
// '05ʰ 55ᵐ 10.310ˢ'

formatDegreeToDMSHumanized(betelgeuse.dec)
// '+07° 24\' 25.430"'
```

## Modules

Everything is exported from the package root. Each module also has its own entry point, so you can import only what you need:

```ts
import { getSunrise } from '@observerly/astrometry/sun'
```

## Accuracy

Results are checked against trusted references by the [conformance suite](https://github.com/observerly/astrometry/tree/main/tests/conformance), which runs with every test run:

- **Sun**: positions use the full VSOP87 planetary theory, and agree with the [NREL Solar Position Algorithm](https://midcdmz.nrel.gov/spa/) to within 0.22 arcseconds. Sunrise, solar noon and sunset agree to within 0.1 seconds.
- **Earth**: precession, nutation, sidereal time, aberration, light deflection and parallax agree with [ERFA](https://github.com/liberfa/erfa), the open implementation of the IAU's SOFA.
- **Satellites**: SGP4 agrees with the reference implementation of Vallado et al. (2006) to well below a micrometre.

## Compatibility

- No runtime dependencies.
- Ships ES modules, CommonJS and TypeScript types.
- Side-effect free, so bundlers can tree-shake what you don't use.
- Tested on Node.js 22, 24 and 26, and written for Deno, Bun and the browser.

## Contributing

Contributions are welcome. Please read the [contributing guide](https://github.com/observerly/astrometry/blob/main/CONTRIBUTING.md) and our [code of conduct](https://github.com/observerly/astrometry/blob/main/CODE_OF_CONDUCT.md) first.

Before opening an [issue](https://github.com/observerly/astrometry/issues) or pull request, please check whether a similar one already exists.

To work on the library locally:

```bash
pnpm install
```

```bash
pnpm test
```

```bash
pnpm lint
```

```bash
pnpm format
```

```bash
pnpm build
```

## License

@observerly/astrometry is released under the [MIT License](https://github.com/observerly/astrometry/blob/main/LICENSE).
