/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/constellations
// @license        Copyright © 2021-2024 observerly

/*****************************************************************************************************************/

import type { Feature, FeatureCollection } from 'geojson'

import type { EquatorialCoordinate } from '../common'

import { interpolateRank2DArray } from '../maths'

/*****************************************************************************************************************/

export function createConstellationAsGeoJSON(
  name: string,
  meaning: string,
  centrum: EquatorialCoordinate,
  aster: number[][][],
  boundary: number[][][]
): FeatureCollection {
  // Create the constellation aster feature:
  const asterFeature: Feature = {
    type: 'Feature',
    properties: {
      name,
      meaning,
      centrum
    },
    geometry: {
      type: 'MultiLineString',
      coordinates: aster
    }
  }

  // Create the constellation boundary feature, with interpolated
  // coordinates for a smoother boundary:
  const boundaryFeature: Feature = {
    type: 'Feature',
    properties: {
      name: `${name} Boundary`
    },
    geometry: {
      type: 'Polygon',
      coordinates: boundary.map(coordinate => interpolateRank2DArray(coordinate))
    }
  }

  return {
    type: 'FeatureCollection',
    features: [asterFeature, boundaryFeature]
  }
}

/*****************************************************************************************************************/
