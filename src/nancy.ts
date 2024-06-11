/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/nancy
// @license        Copyright © 2021-2023 observerly

/*****************************************************************************************************************/

export interface NancyRomanRecord {
  ral: number
  rau: number
  decl: number
  name: string
}

/*****************************************************************************************************************/

export const isNancyRomanRecord = (record: unknown): record is NancyRomanRecord => {
  return (
    !!record &&
    record !== null &&
    typeof record === 'object' &&
    'ral' in record &&
    'rau' in record &&
    'decl' in record &&
    'name' in record &&
    typeof (record as NancyRomanRecord).ral === 'number' &&
    typeof (record as NancyRomanRecord).rau === 'number' &&
    typeof (record as NancyRomanRecord).decl === 'number' &&
    typeof (record as NancyRomanRecord).name === 'string'
  )
}

/*****************************************************************************************************************/

/**
 *
 * @description Constellation Boundary Lookup Table
 * @see https://iopscience.iop.org/article/10.1086/132034/pdf
 *
 * A table permits rapid determination of the constellation in which an object is
 * located from its J1875.0 position.
 *
 * @citation Nancy G. Roman 1987 The Astronomical Society of the Pacific 99 695
 *
 */
export const NANCY_ROMAN_TABLE_I: NancyRomanRecord[] = [
  {
    ral: 0,
    rau: 24,
    decl: 88,
    name: 'Ursa Minor'
  },
  {
    ral: 8,
    rau: 14.5,
    decl: 86.5,
    name: 'Ursa Minor'
  },
  {
    ral: 21,
    rau: 23,
    decl: 86.1667,
    name: 'Ursa Minor'
  },
  {
    ral: 18,
    rau: 21,
    decl: 86,
    name: 'Ursa Minor'
  },
  {
    ral: 0,
    rau: 8,
    decl: 85,
    name: 'Cepheus'
  },
  {
    ral: 9.1667,
    rau: 10.6667,
    decl: 82,
    name: 'Camelopardalis'
  },
  {
    ral: 0,
    rau: 5,
    decl: 80,
    name: 'Cepheus'
  },
  {
    ral: 10.6667,
    rau: 14.5,
    decl: 80,
    name: 'Camelopardalis'
  },
  {
    ral: 17.5,
    rau: 18,
    decl: 80,
    name: 'Ursa Minor'
  },
  {
    ral: 20.1667,
    rau: 21,
    decl: 80,
    name: 'Draco'
  },
  {
    ral: 0,
    rau: 3.5083,
    decl: 77,
    name: 'Cepheus'
  },
  {
    ral: 11.5,
    rau: 13.5833,
    decl: 77,
    name: 'Camelopardalis'
  },
  {
    ral: 16.5333,
    rau: 17.5,
    decl: 75,
    name: 'Ursa Minor'
  },
  {
    ral: 20.1667,
    rau: 20.6667,
    decl: 75,
    name: 'Cepheus'
  },
  {
    ral: 7.9667,
    rau: 9.1667,
    decl: 73.5,
    name: 'Camelopardalis'
  },
  {
    ral: 9.1667,
    rau: 11.3333,
    decl: 73.5,
    name: 'Draco'
  },
  {
    ral: 13,
    rau: 16.5333,
    decl: 70,
    name: 'Ursa Minor'
  },
  {
    ral: 3.1,
    rau: 3.4167,
    decl: 68,
    name: 'Cassiopeia'
  },
  {
    ral: 20.4167,
    rau: 20.6667,
    decl: 67,
    name: 'Draco'
  },
  {
    ral: 11.3333,
    rau: 12,
    decl: 66.5,
    name: 'Draco'
  },
  {
    ral: 0,
    rau: 0.3333,
    decl: 66,
    name: 'Cepheus'
  },
  {
    ral: 14,
    rau: 15.6667,
    decl: 66,
    name: 'Ursa Minor'
  },
  {
    ral: 23.5833,
    rau: 24,
    decl: 66,
    name: 'Cepheus'
  },
  {
    ral: 12,
    rau: 13.5,
    decl: 64,
    name: 'Draco'
  },
  {
    ral: 13.5,
    rau: 14.4167,
    decl: 63,
    name: 'Draco'
  },
  {
    ral: 23.1667,
    rau: 23.5833,
    decl: 63,
    name: 'Cepheus'
  },
  {
    ral: 6.1,
    rau: 7,
    decl: 62,
    name: 'Camelopardalis'
  },
  {
    ral: 20,
    rau: 20.4167,
    decl: 61.5,
    name: 'Draco'
  },
  {
    ral: 20.5367,
    rau: 20.6,
    decl: 60.9167,
    name: 'Cepheus'
  },
  {
    ral: 7,
    rau: 7.9667,
    decl: 60,
    name: 'Camelopardalis'
  },
  {
    ral: 7.9667,
    rau: 8.4167,
    decl: 60,
    name: 'Ursa Major'
  },
  {
    ral: 19.7667,
    rau: 20,
    decl: 59.5,
    name: 'Draco'
  },
  {
    ral: 20,
    rau: 20.5367,
    decl: 59.5,
    name: 'Cepheus'
  },
  {
    ral: 22.8667,
    rau: 23.1667,
    decl: 59.0833,
    name: 'Cepheus'
  },
  {
    ral: 0,
    rau: 2.4333,
    decl: 58.5,
    name: 'Cassiopeia'
  },
  {
    ral: 19.4167,
    rau: 19.7667,
    decl: 58,
    name: 'Draco'
  },
  {
    ral: 1.7,
    rau: 1.9083,
    decl: 57.5,
    name: 'Cassiopeia'
  },
  {
    ral: 2.4333,
    rau: 3.1,
    decl: 57,
    name: 'Cassiopeia'
  },
  {
    ral: 3.1,
    rau: 3.1667,
    decl: 57,
    name: 'Camelopardalis'
  },
  {
    ral: 22.3167,
    rau: 22.8667,
    decl: 56.25,
    name: 'Cepheus'
  },
  {
    ral: 5,
    rau: 6.1,
    decl: 56,
    name: 'Camelopardalis'
  },
  {
    ral: 14.0333,
    rau: 14.4167,
    decl: 55.5,
    name: 'Ursa Major'
  },
  {
    ral: 14.4167,
    rau: 19.4167,
    decl: 55.5,
    name: 'Draco'
  },
  {
    ral: 3.1667,
    rau: 3.3333,
    decl: 55,
    name: 'Camelopardalis'
  },
  {
    ral: 22.1333,
    rau: 22.3167,
    decl: 55,
    name: 'Cepheus'
  },
  {
    ral: 20.6,
    rau: 21.9667,
    decl: 54.8333,
    name: 'Cepheus'
  },
  {
    ral: 0,
    rau: 1.7,
    decl: 54,
    name: 'Cassiopeia'
  },
  {
    ral: 6.1,
    rau: 6.5,
    decl: 54,
    name: 'Lynx'
  },
  {
    ral: 12.0833,
    rau: 13.5,
    decl: 53,
    name: 'Ursa Major'
  },
  {
    ral: 15.25,
    rau: 15.75,
    decl: 53,
    name: 'Draco'
  },
  {
    ral: 21.9667,
    rau: 22.1333,
    decl: 52.75,
    name: 'Cepheus'
  },
  {
    ral: 3.3333,
    rau: 5,
    decl: 52.5,
    name: 'Camelopardalis'
  },
  {
    ral: 22.8667,
    rau: 23.3333,
    decl: 52.5,
    name: 'Cassiopeia'
  },
  {
    ral: 15.75,
    rau: 17,
    decl: 51.5,
    name: 'Draco'
  },
  {
    ral: 2.0417,
    rau: 2.5167,
    decl: 50.5,
    name: 'Perseus'
  },
  {
    ral: 17,
    rau: 18.2333,
    decl: 50.5,
    name: 'Draco'
  },
  {
    ral: 0,
    rau: 1.3667,
    decl: 50,
    name: 'Cassiopeia'
  },
  {
    ral: 1.3667,
    rau: 1.6667,
    decl: 50,
    name: 'Perseus'
  },
  {
    ral: 6.5,
    rau: 6.8,
    decl: 50,
    name: 'Lynx'
  },
  {
    ral: 23.3333,
    rau: 24,
    decl: 50,
    name: 'Cassiopeia'
  },
  {
    ral: 13.5,
    rau: 14.0333,
    decl: 48.5,
    name: 'Ursa Major'
  },
  {
    ral: 0,
    rau: 1.1167,
    decl: 48,
    name: 'Cassiopeia'
  },
  {
    ral: 23.5833,
    rau: 24,
    decl: 48,
    name: 'Cassiopeia'
  },
  {
    ral: 18.175,
    rau: 18.2333,
    decl: 47.5,
    name: 'Hercules'
  },
  {
    ral: 18.2333,
    rau: 19.0833,
    decl: 47.5,
    name: 'Draco'
  },
  {
    ral: 19.0833,
    rau: 19.1667,
    decl: 47.5,
    name: 'Cygnus'
  },
  {
    ral: 1.6667,
    rau: 2.0417,
    decl: 47,
    name: 'Perseus'
  },
  {
    ral: 8.4167,
    rau: 9.1667,
    decl: 47,
    name: 'Ursa Major'
  },
  {
    ral: 0.1667,
    rau: 0.8667,
    decl: 46,
    name: 'Cassiopeia'
  },
  {
    ral: 12,
    rau: 12.0833,
    decl: 45,
    name: 'Ursa Major'
  },
  {
    ral: 6.8,
    rau: 7.3667,
    decl: 44.5,
    name: 'Lynx'
  },
  {
    ral: 21.9083,
    rau: 21.9667,
    decl: 44,
    name: 'Cygnus'
  },
  {
    ral: 21.875,
    rau: 21.9083,
    decl: 43.75,
    name: 'Cygnus'
  },
  {
    ral: 19.1667,
    rau: 19.4,
    decl: 43.5,
    name: 'Cygnus'
  },
  {
    ral: 9.1667,
    rau: 10.1667,
    decl: 42,
    name: 'Ursa Major'
  },
  {
    ral: 10.1667,
    rau: 10.7833,
    decl: 40,
    name: 'Ursa Major'
  },
  {
    ral: 15.4333,
    rau: 15.75,
    decl: 40,
    name: 'Boötes'
  },
  {
    ral: 15.75,
    rau: 16.3333,
    decl: 40,
    name: 'Hercules'
  },
  {
    ral: 9.25,
    rau: 9.5833,
    decl: 39.75,
    name: 'Lynx'
  },
  {
    ral: 0,
    rau: 2.5167,
    decl: 36.75,
    name: 'Andromeda'
  },
  {
    ral: 2.5167,
    rau: 2.5667,
    decl: 36.75,
    name: 'Perseus'
  },
  {
    ral: 19.3583,
    rau: 19.4,
    decl: 36.5,
    name: 'Lyra'
  },
  {
    ral: 4.5,
    rau: 4.6917,
    decl: 36,
    name: 'Perseus'
  },
  {
    ral: 21.7333,
    rau: 21.875,
    decl: 36,
    name: 'Cygnus'
  },
  {
    ral: 21.875,
    rau: 22,
    decl: 36,
    name: 'Lacerta'
  },
  {
    ral: 6.5333,
    rau: 7.3667,
    decl: 35.5,
    name: 'Auriga'
  },
  {
    ral: 7.3667,
    rau: 7.75,
    decl: 35.5,
    name: 'Lynx'
  },
  {
    ral: 0,
    rau: 2,
    decl: 35,
    name: 'Andromeda'
  },
  {
    ral: 22,
    rau: 22.8167,
    decl: 35,
    name: 'Lacerta'
  },
  {
    ral: 22.8167,
    rau: 22.8667,
    decl: 34.5,
    name: 'Lacerta'
  },
  {
    ral: 22.8667,
    rau: 23.5,
    decl: 34.5,
    name: 'Andromeda'
  },
  {
    ral: 2.5667,
    rau: 2.7167,
    decl: 34,
    name: 'Perseus'
  },
  {
    ral: 10.7833,
    rau: 11,
    decl: 34,
    name: 'Ursa Major'
  },
  {
    ral: 12,
    rau: 12.3333,
    decl: 34,
    name: 'Canes Venatici'
  },
  {
    ral: 7.75,
    rau: 9.25,
    decl: 33.5,
    name: 'Lynx'
  },
  {
    ral: 9.25,
    rau: 9.8833,
    decl: 33.5,
    name: 'Leo Minor'
  },
  {
    ral: 0.7167,
    rau: 1.4083,
    decl: 33,
    name: 'Andromeda'
  },
  {
    ral: 15.1833,
    rau: 15.4333,
    decl: 33,
    name: 'Boötes'
  },
  {
    ral: 23.5,
    rau: 23.75,
    decl: 32.0833,
    name: 'Andromeda'
  },
  {
    ral: 12.3333,
    rau: 13.25,
    decl: 32,
    name: 'Canes Venatici'
  },
  {
    ral: 23.75,
    rau: 24,
    decl: 31.3333,
    name: 'Andromeda'
  },
  {
    ral: 13.9583,
    rau: 14.0333,
    decl: 30.75,
    name: 'Canes Venatici'
  },
  {
    ral: 2.4167,
    rau: 2.7167,
    decl: 30.6667,
    name: 'Triangulum'
  },
  {
    ral: 2.7167,
    rau: 4.5,
    decl: 30.6667,
    name: 'Perseus'
  },
  {
    ral: 4.5,
    rau: 4.75,
    decl: 30,
    name: 'Auriga'
  },
  {
    ral: 18.175,
    rau: 19.3583,
    decl: 30,
    name: 'Lyra'
  },
  {
    ral: 11,
    rau: 12,
    decl: 29,
    name: 'Ursa Major'
  },
  {
    ral: 19.6667,
    rau: 20.9167,
    decl: 29,
    name: 'Cygnus'
  },
  {
    ral: 4.75,
    rau: 5.8833,
    decl: 28.5,
    name: 'Auriga'
  },
  {
    ral: 9.8833,
    rau: 10.5,
    decl: 28.5,
    name: 'Leo Minor'
  },
  {
    ral: 13.25,
    rau: 13.9583,
    decl: 28.5,
    name: 'Canes Venatici'
  },
  {
    ral: 0,
    rau: 0.0667,
    decl: 28,
    name: 'Andromeda'
  },
  {
    ral: 1.4083,
    rau: 1.6667,
    decl: 28,
    name: 'Triangulum'
  },
  {
    ral: 5.8833,
    rau: 6.5333,
    decl: 28,
    name: 'Auriga'
  },
  {
    ral: 7.8833,
    rau: 8,
    decl: 28,
    name: 'Gemini'
  },
  {
    ral: 20.9167,
    rau: 21.7333,
    decl: 28,
    name: 'Cygnus'
  },
  {
    ral: 19.2583,
    rau: 19.6667,
    decl: 27.5,
    name: 'Cygnus'
  },
  {
    ral: 1.9167,
    rau: 2.4167,
    decl: 27.25,
    name: 'Triangulum'
  },
  {
    ral: 16.1667,
    rau: 16.3333,
    decl: 27,
    name: 'Corona Borealis'
  },
  {
    ral: 15.0833,
    rau: 15.1833,
    decl: 26,
    name: 'Boötes'
  },
  {
    ral: 15.1833,
    rau: 16.1667,
    decl: 26,
    name: 'Corona Borealis'
  },
  {
    ral: 18.3667,
    rau: 18.8667,
    decl: 26,
    name: 'Lyra'
  },
  {
    ral: 10.75,
    rau: 11,
    decl: 25.5,
    name: 'Leo Minor'
  },
  {
    ral: 18.8667,
    rau: 19.2583,
    decl: 25.5,
    name: 'Lyra'
  },
  {
    ral: 1.6667,
    rau: 1.9167,
    decl: 25,
    name: 'Triangulum'
  },
  {
    ral: 0.7167,
    rau: 0.85,
    decl: 23.75,
    name: 'Pisces'
  },
  {
    ral: 10.5,
    rau: 10.75,
    decl: 23.5,
    name: 'Leo Minor'
  },
  {
    ral: 21.25,
    rau: 21.4167,
    decl: 23.5,
    name: 'Vulpecula'
  },
  {
    ral: 5.7,
    rau: 5.8833,
    decl: 22.8333,
    name: 'Taurus'
  },
  {
    ral: 0.0667,
    rau: 0.1417,
    decl: 22,
    name: 'Andromeda'
  },
  {
    ral: 15.9167,
    rau: 16.0333,
    decl: 22,
    name: 'Serpens'
  },
  {
    ral: 5.8833,
    rau: 6.2167,
    decl: 21.5,
    name: 'Gemini'
  },
  {
    ral: 19.8333,
    rau: 20.25,
    decl: 21.25,
    name: 'Vulpecula'
  },
  {
    ral: 18.8667,
    rau: 19.25,
    decl: 21.0833,
    name: 'Vulpecula'
  },
  {
    ral: 0.1417,
    rau: 0.85,
    decl: 21,
    name: 'Andromeda'
  },
  {
    ral: 20.25,
    rau: 20.5667,
    decl: 20.5,
    name: 'Vulpecula'
  },
  {
    ral: 7.8083,
    rau: 7.8833,
    decl: 20,
    name: 'Gemini'
  },
  {
    ral: 20.5667,
    rau: 21.25,
    decl: 19.5,
    name: 'Vulpecula'
  },
  {
    ral: 19.25,
    rau: 19.8333,
    decl: 19.1667,
    name: 'Vulpecula'
  },
  {
    ral: 3.2833,
    rau: 3.3667,
    decl: 19,
    name: 'Aries'
  },
  {
    ral: 18.8667,
    rau: 19,
    decl: 18.5,
    name: 'Sagitta'
  },
  {
    ral: 5.7,
    rau: 5.7667,
    decl: 18,
    name: 'Orion'
  },
  {
    ral: 6.2167,
    rau: 6.3083,
    decl: 17.5,
    name: 'Gemini'
  },
  {
    ral: 19,
    rau: 19.8333,
    decl: 16.1667,
    name: 'Sagitta'
  },
  {
    ral: 4.9667,
    rau: 5.3333,
    decl: 16,
    name: 'Taurus'
  },
  {
    ral: 15.9167,
    rau: 16.0833,
    decl: 16,
    name: 'Hercules'
  },
  {
    ral: 19.8333,
    rau: 20.25,
    decl: 15.75,
    name: 'Sagitta'
  },
  {
    ral: 4.6167,
    rau: 4.9667,
    decl: 15.5,
    name: 'Taurus'
  },
  {
    ral: 5.3333,
    rau: 5.6,
    decl: 15.5,
    name: 'Taurus'
  },
  {
    ral: 12.8333,
    rau: 13.5,
    decl: 15,
    name: 'Coma Berenices'
  },
  {
    ral: 17.25,
    rau: 18.25,
    decl: 14.3333,
    name: 'Hercules'
  },
  {
    ral: 11.8667,
    rau: 12.8333,
    decl: 14,
    name: 'Coma Berenices'
  },
  {
    ral: 7.5,
    rau: 7.8083,
    decl: 13.5,
    name: 'Gemini'
  },
  {
    ral: 16.75,
    rau: 17.25,
    decl: 12.8333,
    name: 'Hercules'
  },
  {
    ral: 0,
    rau: 0.1417,
    decl: 12.5,
    name: 'Pegasus'
  },
  {
    ral: 5.6,
    rau: 5.7667,
    decl: 12.5,
    name: 'Taurus'
  },
  {
    ral: 7,
    rau: 7.5,
    decl: 12.5,
    name: 'Gemini'
  },
  {
    ral: 21.1167,
    rau: 21.3333,
    decl: 12.5,
    name: 'Pegasus'
  },
  {
    ral: 6.3083,
    rau: 6.9333,
    decl: 12,
    name: 'Gemini'
  },
  {
    ral: 18.25,
    rau: 18.8667,
    decl: 12,
    name: 'Hercules'
  },
  {
    ral: 20.875,
    rau: 21.05,
    decl: 11.8333,
    name: 'Delphinus'
  },
  {
    ral: 21.05,
    rau: 21.1167,
    decl: 11.8333,
    name: 'Pegasus'
  },
  {
    ral: 11.5167,
    rau: 11.8667,
    decl: 11,
    name: 'Leo'
  },
  {
    ral: 6.2417,
    rau: 6.3083,
    decl: 10,
    name: 'Orion'
  },
  {
    ral: 6.9333,
    rau: 7,
    decl: 10,
    name: 'Gemini'
  },
  {
    ral: 7.8083,
    rau: 7.925,
    decl: 10,
    name: 'Cancer'
  },
  {
    ral: 23.8333,
    rau: 24,
    decl: 10,
    name: 'Pegasus'
  },
  {
    ral: 1.6667,
    rau: 3.2833,
    decl: 9.9167,
    name: 'Aries'
  },
  {
    ral: 20.1417,
    rau: 20.3,
    decl: 8.5,
    name: 'Delphinus'
  },
  {
    ral: 13.5,
    rau: 15.0833,
    decl: 8,
    name: 'Boötes'
  },
  {
    ral: 22.75,
    rau: 23.8333,
    decl: 7.5,
    name: 'Pegasus'
  },
  {
    ral: 7.925,
    rau: 9.25,
    decl: 7,
    name: 'Cancer'
  },
  {
    ral: 9.25,
    rau: 10.75,
    decl: 7,
    name: 'Leo'
  },
  {
    ral: 18.25,
    rau: 18.6622,
    decl: 6.25,
    name: 'Ophiuchus'
  },
  {
    ral: 18.6622,
    rau: 18.8667,
    decl: 6.25,
    name: 'Aquila'
  },
  {
    ral: 20.8333,
    rau: 20.875,
    decl: 6,
    name: 'Delphinus'
  },
  {
    ral: 7,
    rau: 7.0167,
    decl: 5.5,
    name: 'Canis Minor'
  },
  {
    ral: 18.25,
    rau: 18.425,
    decl: 4.5,
    name: 'Serpens'
  },
  {
    ral: 16.0833,
    rau: 16.75,
    decl: 4,
    name: 'Hercules'
  },
  {
    ral: 18.25,
    rau: 18.425,
    decl: 3,
    name: 'Ophiuchus'
  },
  {
    ral: 21.4667,
    rau: 21.6667,
    decl: 2.75,
    name: 'Pegasus'
  },
  {
    ral: 0,
    rau: 2,
    decl: 2,
    name: 'Pisces'
  },
  {
    ral: 18.5833,
    rau: 18.8667,
    decl: 2,
    name: 'Serpens'
  },
  {
    ral: 20.3,
    rau: 20.8333,
    decl: 2,
    name: 'Delphinus'
  },
  {
    ral: 20.8333,
    rau: 21.3333,
    decl: 2,
    name: 'Equuleus'
  },
  {
    ral: 21.3333,
    rau: 21.4667,
    decl: 2,
    name: 'Pegasus'
  },
  {
    ral: 22,
    rau: 22.75,
    decl: 2,
    name: 'Pegasus'
  },
  {
    ral: 21.6667,
    rau: 22,
    decl: 1.75,
    name: 'Pegasus'
  },
  {
    ral: 7.0167,
    rau: 7.2,
    decl: 1.5,
    name: 'Canis Minor'
  },
  {
    ral: 3.5833,
    rau: 4.6167,
    decl: 0,
    name: 'Taurus'
  },
  {
    ral: 4.6167,
    rau: 4.6667,
    decl: 0,
    name: 'Orion'
  },
  {
    ral: 7.2,
    rau: 8.0833,
    decl: 0,
    name: 'Canis Minor'
  },
  {
    ral: 14.6667,
    rau: 15.0833,
    decl: 0,
    name: 'Virgo'
  },
  {
    ral: 17.8333,
    rau: 18.25,
    decl: 0,
    name: 'Ophiuchus'
  },
  {
    ral: 2.65,
    rau: 3.2833,
    decl: -1.75,
    name: 'Cetus'
  },
  {
    ral: 3.2833,
    rau: 3.5833,
    decl: -1.75,
    name: 'Taurus'
  },
  {
    ral: 15.0833,
    rau: 16.2667,
    decl: -3.25,
    name: 'Serpens'
  },
  {
    ral: 4.6667,
    rau: 5.0833,
    decl: -4,
    name: 'Orion'
  },
  {
    ral: 5.8333,
    rau: 6.2417,
    decl: -4,
    name: 'Orion'
  },
  {
    ral: 17.8333,
    rau: 17.9667,
    decl: -4,
    name: 'Serpens'
  },
  {
    ral: 18.25,
    rau: 18.5833,
    decl: -4,
    name: 'Serpens'
  },
  {
    ral: 18.5833,
    rau: 18.8667,
    decl: -4,
    name: 'Aquila'
  },
  {
    ral: 22.75,
    rau: 23.8333,
    decl: -4,
    name: 'Pisces'
  },
  {
    ral: 10.75,
    rau: 11.5167,
    decl: -6,
    name: 'Leo'
  },
  {
    ral: 11.5167,
    rau: 11.8333,
    decl: -6,
    name: 'Virgo'
  },
  {
    ral: 0,
    rau: 0.3333,
    decl: -7,
    name: 'Pisces'
  },
  {
    ral: 23.8333,
    rau: 24,
    decl: -7,
    name: 'Pisces'
  },
  {
    ral: 14.25,
    rau: 14.6667,
    decl: -8,
    name: 'Virgo'
  },
  {
    ral: 15.9167,
    rau: 16.2667,
    decl: -8,
    name: 'Ophiuchus'
  },
  {
    ral: 20,
    rau: 20.5333,
    decl: -9,
    name: 'Aquila'
  },
  {
    ral: 21.3333,
    rau: 21.8667,
    decl: -9,
    name: 'Aquarius'
  },
  {
    ral: 17.1667,
    rau: 17.9667,
    decl: -10,
    name: 'Ophiuchus'
  },
  {
    ral: 5.8333,
    rau: 8.0833,
    decl: -11,
    name: 'Monoceros'
  },
  {
    ral: 4.9167,
    rau: 5.0833,
    decl: -11,
    name: 'Eridanus'
  },
  {
    ral: 5.0833,
    rau: 5.8333,
    decl: -11,
    name: 'Orion'
  },
  {
    ral: 8.0833,
    rau: 8.3667,
    decl: -11,
    name: 'Hydra'
  },
  {
    ral: 9.5833,
    rau: 10.75,
    decl: -11,
    name: 'Sextans'
  },
  {
    ral: 11.8333,
    rau: 12.8333,
    decl: -11,
    name: 'Virgo'
  },
  {
    ral: 17.5833,
    rau: 17.6667,
    decl: -11.6667,
    name: 'Ophiuchus'
  },
  {
    ral: 18.8667,
    rau: 20,
    decl: -12.0333,
    name: 'Aquila'
  },
  {
    ral: 4.8333,
    rau: 4.9167,
    decl: -14.5,
    name: 'Eridanus'
  },
  {
    ral: 20.5333,
    rau: 21.3333,
    decl: -15,
    name: 'Aquarius'
  },
  {
    ral: 17.1667,
    rau: 18.25,
    decl: -16,
    name: 'Serpens'
  },
  {
    ral: 18.25,
    rau: 18.8667,
    decl: -16,
    name: 'Scutum'
  },
  {
    ral: 8.3667,
    rau: 8.5833,
    decl: -17,
    name: 'Hydra'
  },
  {
    ral: 16.2667,
    rau: 16.375,
    decl: -18.25,
    name: 'Ophiuchus'
  },
  {
    ral: 8.5833,
    rau: 9.0833,
    decl: -19,
    name: 'Hydra'
  },
  {
    ral: 10.75,
    rau: 10.8333,
    decl: -19,
    name: 'Crater'
  },
  {
    ral: 16.2667,
    rau: 16.375,
    decl: -19.25,
    name: 'Scorpius'
  },
  {
    ral: 15.6667,
    rau: 15.9167,
    decl: -20,
    name: 'Libra'
  },
  {
    ral: 12.5833,
    rau: 12.8333,
    decl: -22,
    name: 'Corvus'
  },
  {
    ral: 12.8333,
    rau: 14.25,
    decl: -22,
    name: 'Virgo'
  },
  {
    ral: 9.0833,
    rau: 9.75,
    decl: -24,
    name: 'Hydra'
  },
  {
    ral: 1.6667,
    rau: 2.65,
    decl: -24.3833,
    name: 'Cetus'
  },
  {
    ral: 2.65,
    rau: 3.75,
    decl: -24.3833,
    name: 'Eridanus'
  },
  {
    ral: 10.8333,
    rau: 11.8333,
    decl: -24.5,
    name: 'Crater'
  },
  {
    ral: 11.8333,
    rau: 12.5833,
    decl: -24.5,
    name: 'Corvus'
  },
  {
    ral: 14.25,
    rau: 14.9167,
    decl: -24.5,
    name: 'Libra'
  },
  {
    ral: 16.2667,
    rau: 16.75,
    decl: -24.5833,
    name: 'Ophiuchus'
  },
  {
    ral: 0,
    rau: 1.6667,
    decl: -25.5,
    name: 'Cetus'
  },
  {
    ral: 21.3333,
    rau: 21.8667,
    decl: -25.5,
    name: 'Capricornus'
  },
  {
    ral: 21.8667,
    rau: 23.8333,
    decl: -25.5,
    name: 'Aquarius'
  },
  {
    ral: 23.8333,
    rau: 24,
    decl: -25.5,
    name: 'Cetus'
  },
  {
    ral: 9.75,
    rau: 10.25,
    decl: -26.5,
    name: 'Hydra'
  },
  {
    ral: 4.7,
    rau: 4.8333,
    decl: -27.25,
    name: 'Eridanus'
  },
  {
    ral: 4.8333,
    rau: 6.1167,
    decl: -27.25,
    name: 'Lepus'
  },
  {
    ral: 20,
    rau: 21.3333,
    decl: -28,
    name: 'Capricornus'
  },
  {
    ral: 10.25,
    rau: 10.5833,
    decl: -29.1667,
    name: 'Hydra'
  },
  {
    ral: 12.5833,
    rau: 14.9167,
    decl: -29.5,
    name: 'Hydra'
  },
  {
    ral: 14.9167,
    rau: 15.6667,
    decl: -29.5,
    name: 'Libra'
  },
  {
    ral: 15.6667,
    rau: 16,
    decl: -29.5,
    name: 'Scorpius'
  },
  {
    ral: 4.5833,
    rau: 4.7,
    decl: -30,
    name: 'Eridanus'
  },
  {
    ral: 16.75,
    rau: 17.6,
    decl: -30,
    name: 'Ophiuchus'
  },
  {
    ral: 17.6,
    rau: 17.8333,
    decl: -30,
    name: 'Sagittarius'
  },
  {
    ral: 10.5833,
    rau: 10.8333,
    decl: -31.1667,
    name: 'Hydra'
  },
  {
    ral: 6.1167,
    rau: 7.3667,
    decl: -33,
    name: 'Canis Major'
  },
  {
    ral: 12.25,
    rau: 12.5833,
    decl: -33,
    name: 'Hydra'
  },
  {
    ral: 10.8333,
    rau: 12.25,
    decl: -35,
    name: 'Hydra'
  },
  {
    ral: 3.5,
    rau: 3.75,
    decl: -36,
    name: 'Fornax'
  },
  {
    ral: 8.3667,
    rau: 9.3667,
    decl: -36.75,
    name: 'Pyxis'
  },
  {
    ral: 4.2667,
    rau: 4.5833,
    decl: -37,
    name: 'Eridanus'
  },
  {
    ral: 17.8333,
    rau: 19.1667,
    decl: -37,
    name: 'Sagittarius'
  },
  {
    ral: 21.3333,
    rau: 23,
    decl: -37,
    name: 'Piscis Austrinus'
  },
  {
    ral: 23,
    rau: 23.3333,
    decl: -37,
    name: 'Sculptor'
  },
  {
    ral: 3,
    rau: 3.5,
    decl: -39.5833,
    name: 'Fornax'
  },
  {
    ral: 9.3667,
    rau: 11,
    decl: -39.75,
    name: 'Antlia'
  },
  {
    ral: 0,
    rau: 1.6667,
    decl: -40,
    name: 'Sculptor'
  },
  {
    ral: 1.6667,
    rau: 3,
    decl: -40,
    name: 'Fornax'
  },
  {
    ral: 3.8667,
    rau: 4.2667,
    decl: -40,
    name: 'Eridanus'
  },
  {
    ral: 23.3333,
    rau: 24,
    decl: -40,
    name: 'Sculptor'
  },
  {
    ral: 14.1667,
    rau: 14.9167,
    decl: -42,
    name: 'Centaurus'
  },
  {
    ral: 15.6667,
    rau: 16,
    decl: -42,
    name: 'Lupus'
  },
  {
    ral: 16,
    rau: 16.4208,
    decl: -42,
    name: 'Scorpius'
  },
  {
    ral: 4.8333,
    rau: 5,
    decl: -43,
    name: 'Caelum'
  },
  {
    ral: 5,
    rau: 6.5833,
    decl: -43,
    name: 'Columba'
  },
  {
    ral: 8,
    rau: 8.3667,
    decl: -43,
    name: 'Puppis'
  },
  {
    ral: 3.4167,
    rau: 3.8667,
    decl: -44,
    name: 'Eridanus'
  },
  {
    ral: 16.4208,
    rau: 17.8333,
    decl: -45.5,
    name: 'Scorpius'
  },
  {
    ral: 17.8333,
    rau: 19.1667,
    decl: -45.5,
    name: 'Corona Australis'
  },
  {
    ral: 19.1667,
    rau: 20.3333,
    decl: -45.5,
    name: 'Sagittarius'
  },
  {
    ral: 20.3333,
    rau: 21.3333,
    decl: -45.5,
    name: 'Microscopium'
  },
  {
    ral: 3,
    rau: 3.4167,
    decl: -46,
    name: 'Eridanus'
  },
  {
    ral: 4.5,
    rau: 4.8333,
    decl: -46.5,
    name: 'Caelum'
  },
  {
    ral: 15.3333,
    rau: 15.6667,
    decl: -48,
    name: 'Lupus'
  },
  {
    ral: 0,
    rau: 2.3333,
    decl: -48.1667,
    name: 'Phoenix'
  },
  {
    ral: 2.6667,
    rau: 3,
    decl: -49,
    name: 'Eridanus'
  },
  {
    ral: 4.0833,
    rau: 4.2667,
    decl: -49,
    name: 'Horologium'
  },
  {
    ral: 4.2667,
    rau: 4.5,
    decl: -49,
    name: 'Caelum'
  },
  {
    ral: 21.3333,
    rau: 22,
    decl: -50,
    name: 'Grus'
  },
  {
    ral: 6,
    rau: 8,
    decl: -50.75,
    name: 'Puppis'
  },
  {
    ral: 8,
    rau: 8.1667,
    decl: -50.75,
    name: 'Vela'
  },
  {
    ral: 2.4167,
    rau: 2.6667,
    decl: -51,
    name: 'Eridanus'
  },
  {
    ral: 3.8333,
    rau: 4.0833,
    decl: -51,
    name: 'Horologium'
  },
  {
    ral: 0,
    rau: 1.8333,
    decl: -51.5,
    name: 'Phoenix'
  },
  {
    ral: 6,
    rau: 6.1667,
    decl: -52.5,
    name: 'Carina'
  },
  {
    ral: 8.1667,
    rau: 8.45,
    decl: -53,
    name: 'Vela'
  },
  {
    ral: 3.5,
    rau: 3.8333,
    decl: -53.1667,
    name: 'Horologium'
  },
  {
    ral: 3.8333,
    rau: 4,
    decl: -53.1667,
    name: 'Dorado'
  },
  {
    ral: 0,
    rau: 1.5833,
    decl: -53.5,
    name: 'Phoenix'
  },
  {
    ral: 2.1667,
    rau: 2.4167,
    decl: -54,
    name: 'Eridanus'
  },
  {
    ral: 4.5,
    rau: 5,
    decl: -54,
    name: 'Pictor'
  },
  {
    ral: 15.05,
    rau: 15.3333,
    decl: -54,
    name: 'Lupus'
  },
  {
    ral: 8.45,
    rau: 8.8333,
    decl: -54.5,
    name: 'Vela'
  },
  {
    ral: 6.1667,
    rau: 6.5,
    decl: -55,
    name: 'Carina'
  },
  {
    ral: 11.8333,
    rau: 12.8333,
    decl: -55,
    name: 'Centaurus'
  },
  {
    ral: 14.1667,
    rau: 15.05,
    decl: -55,
    name: 'Lupus'
  },
  {
    ral: 15.05,
    rau: 15.3333,
    decl: -55,
    name: 'Norma'
  },
  {
    ral: 4,
    rau: 4.3333,
    decl: -56.5,
    name: 'Dorado'
  },
  {
    ral: 8.8333,
    rau: 11,
    decl: -56.5,
    name: 'Vela'
  },
  {
    ral: 11,
    rau: 11.25,
    decl: -56.5,
    name: 'Centaurus'
  },
  {
    ral: 17.5,
    rau: 18,
    decl: -57,
    name: 'Ara'
  },
  {
    ral: 18,
    rau: 20.3333,
    decl: -57,
    name: 'Telescopium'
  },
  {
    ral: 22,
    rau: 23.3333,
    decl: -57,
    name: 'Grus'
  },
  {
    ral: 3.2,
    rau: 3.5,
    decl: -57.5,
    name: 'Horologium'
  },
  {
    ral: 5,
    rau: 5.5,
    decl: -57.5,
    name: 'Pictor'
  },
  {
    ral: 6.5,
    rau: 6.8333,
    decl: -58,
    name: 'Carina'
  },
  {
    ral: 0,
    rau: 1.3333,
    decl: -58.5,
    name: 'Phoenix'
  },
  {
    ral: 1.3333,
    rau: 2.1667,
    decl: -58.5,
    name: 'Eridanus'
  },
  {
    ral: 23.3333,
    rau: 24,
    decl: -58.5,
    name: 'Phoenix'
  },
  {
    ral: 4.3333,
    rau: 4.5833,
    decl: -59,
    name: 'Dorado'
  },
  {
    ral: 15.3333,
    rau: 16.4208,
    decl: -60,
    name: 'Norma'
  },
  {
    ral: 20.3333,
    rau: 21.3333,
    decl: -60,
    name: 'Indus'
  },
  {
    ral: 5.5,
    rau: 6,
    decl: -61,
    name: 'Pictor'
  },
  {
    ral: 15.1667,
    rau: 15.3333,
    decl: -61,
    name: 'Circinus'
  },
  {
    ral: 16.4208,
    rau: 16.5833,
    decl: -61,
    name: 'Ara'
  },
  {
    ral: 14.9167,
    rau: 15.1667,
    decl: -63.5833,
    name: 'Circinus'
  },
  {
    ral: 16.5833,
    rau: 16.75,
    decl: -63.5833,
    name: 'Ara'
  },
  {
    ral: 6,
    rau: 6.8333,
    decl: -64,
    name: 'Pictor'
  },
  {
    ral: 6.8333,
    rau: 9.0333,
    decl: -64,
    name: 'Carina'
  },
  {
    ral: 11.25,
    rau: 11.8333,
    decl: -64,
    name: 'Centaurus'
  },
  {
    ral: 11.8333,
    rau: 12.8333,
    decl: -64,
    name: 'Crux'
  },
  {
    ral: 12.8333,
    rau: 14.5333,
    decl: -64,
    name: 'Centaurus'
  },
  {
    ral: 13.5,
    rau: 13.6667,
    decl: -65,
    name: 'Circinus'
  },
  {
    ral: 16.75,
    rau: 16.8333,
    decl: -65,
    name: 'Ara'
  },
  {
    ral: 2.1667,
    rau: 3.2,
    decl: -67.5,
    name: 'Horologium'
  },
  {
    ral: 3.2,
    rau: 4.5833,
    decl: -67.5,
    name: 'Reticulum'
  },
  {
    ral: 14.75,
    rau: 14.9167,
    decl: -67.5,
    name: 'Circinus'
  },
  {
    ral: 16.8333,
    rau: 17.5,
    decl: -67.5,
    name: 'Ara'
  },
  {
    ral: 17.5,
    rau: 18,
    decl: -67.5,
    name: 'Pavo'
  },
  {
    ral: 22,
    rau: 23.3333,
    decl: -67.5,
    name: 'Tucana'
  },
  {
    ral: 4.5833,
    rau: 6.5833,
    decl: -70,
    name: 'Dorado'
  },
  {
    ral: 13.6667,
    rau: 14.75,
    decl: -70,
    name: 'Circinus'
  },
  {
    ral: 14.75,
    rau: 17,
    decl: -70,
    name: 'Triangulum Australe'
  },
  {
    ral: 0,
    rau: 1.3333,
    decl: -75,
    name: 'Tucana'
  },
  {
    ral: 3.5,
    rau: 4.5833,
    decl: -75,
    name: 'Hydrus'
  },
  {
    ral: 6.5833,
    rau: 9.0333,
    decl: -75,
    name: 'Volans'
  },
  {
    ral: 9.0333,
    rau: 11.25,
    decl: -75,
    name: 'Carina'
  },
  {
    ral: 11.25,
    rau: 13.6667,
    decl: -75,
    name: 'Musca'
  },
  {
    ral: 18,
    rau: 21.3333,
    decl: -75,
    name: 'Pavo'
  },
  {
    ral: 21.3333,
    rau: 23.3333,
    decl: -75,
    name: 'Indus'
  },
  {
    ral: 23.3333,
    rau: 24,
    decl: -75,
    name: 'Tucana'
  },
  {
    ral: 0.75,
    rau: 1.3333,
    decl: -76,
    name: 'Tucana'
  },
  {
    ral: 0,
    rau: 3.5,
    decl: -82.5,
    name: 'Hydrus'
  },
  {
    ral: 7.6667,
    rau: 13.6667,
    decl: -82.5,
    name: 'Chamaeleon'
  },
  {
    ral: 13.6667,
    rau: 18,
    decl: -82.5,
    name: 'Apus'
  },
  {
    ral: 3.5,
    rau: 7.6667,
    decl: -85,
    name: 'Mensa'
  },
  {
    ral: 0,
    rau: 24,
    decl: -90,
    name: 'Octans'
  }
]

/*****************************************************************************************************************/
