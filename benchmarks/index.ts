/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import { Bench } from 'tinybench'

import { convertEquatorialToHorizontal, type EquatorialCoordinate } from '../src'

/*****************************************************************************************************************/

const bench = new Bench({ time: 100 })

/*****************************************************************************************************************/

// For testing we need to specify a date because most calculations are
// differential w.r.t a time component. We set it to the author's birthday:
export const datetime = new Date('2021-05-14T00:00:00.000+00:00')

// For testing we will fix the latitude to be Manua Kea, Hawaii, US
export const latitude = 19.820611

// For testing we will fix the longitude to be Manua Kea, Hawaii, US:
export const longitude = -155.468094

// For testing
const betelgeuse: EquatorialCoordinate = { ra: 88.7929583, dec: 7.4070639 }

/*****************************************************************************************************************/

bench.add('equatorial coordinate to horizontal coordinate transformation', () => {
  const { alt, az } = convertEquatorialToHorizontal(datetime, { latitude, longitude }, betelgeuse)
})

/*****************************************************************************************************************/

await bench.warmup()

/*****************************************************************************************************************/

await bench.run()

/*****************************************************************************************************************/

console.table(bench.table())

/*****************************************************************************************************************/
