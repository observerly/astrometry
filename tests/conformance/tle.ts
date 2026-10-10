/*****************************************************************************************************************/

// @author         Michael Roberts <michael@observerly.com>
// @package        @observerly/astrometry/tests/conformance/tle
// @license        Copyright © 2021-2026 observerly

/*****************************************************************************************************************/

// The reference values in this module are generated with the reference implementation of SGP4 of Vallado, D. A.,
// Crawford, P., Hujsak, R., & Kelso, T. S. (2006), "Revisiting Spacetrack Report #3", AIAA 2006-6753, e.g., its C++
// parser of the two-line element set, twoline2rv(), as bound by the sgp4 package (version 2.24).
//
// The element sets are those of the verification set of that paper, e.g., SGP4-VER.TLE, each of which is parsed by
// the reference, and whose elements are converted back from the units of the reference, e.g., radians and radians
// per minute, to the units of the format, e.g., degrees and revolutions per day.
//
// N.B. The second line of each verification element set carries the start, stop and step of its verification run
// beyond its 69th column, which the format does not define, and which the parser therefore ignores.
//
// N.B. The element sets of the satellites 33333, 33334 and 33335 are deliberately corrupted by the verification set,
// e.g., their checksums are not those of their lines, and so they are the references of an element set that must be
// rejected.

/*****************************************************************************************************************/

export interface TwoLineElementReference {
  // The first line of the element set:
  line1: string
  // The second line of the element set:
  line2: string
  // The satellite catalogue number:
  satellite: number
  // The security classification:
  classification: string
  // The international designator:
  designator: string
  // The epoch, as a Julian date in UTC:
  epoch: number
  // The first time derivative of the mean motion divided by two (in revolutions per day²):
  ndot: number
  // The second time derivative of the mean motion divided by six (in revolutions per day³):
  nddot: number
  // The B* drag term (in inverse Earth radii):
  bstar: number
  // The ephemeris type:
  ephemeris: number
  // The element set number:
  element: number
  // The inclination (in degrees):
  i: number
  // The right ascension of the ascending node (in degrees):
  Ω: number
  // The eccentricity:
  e: number
  // The argument of perigee (in degrees):
  ω: number
  // The mean anomaly (in degrees):
  M: number
  // The mean motion (in revolutions per day):
  n: number
  // The revolution number at the epoch:
  revolution: number
}

/*****************************************************************************************************************/

// The element sets of the verification set the reference parses:
export const tleReferences: TwoLineElementReference[] = [
  {
    line1: '1 00005U 58002B   00179.78495062  .00000023  00000-0  28098-4 0  4753',
    line2: '2 00005  34.2682 348.7242 1859667 331.7664  19.3264 10.82419157413667     0.00      4320.0        360.00',
    satellite: 5,
    classification: 'U',
    designator: '58002B',
    epoch: 2451723.28495062,
    ndot: 2.3e-07,
    nddot: 0.0,
    bstar: 2.8098e-05,
    ephemeris: 0,
    element: 475,
    i: 34.2682,
    Ω: 348.7242,
    e: 0.1859667,
    ω: 331.7664,
    M: 19.3264,
    n: 10.82419157,
    revolution: 41366
  },
  {
    line1: '1 04632U 70093B   04031.91070959 -.00000084  00000-0  10000-3 0  9955',
    line2: '2 04632  11.4628 273.1101 1450506 207.6000 143.9350  1.20231981 44145  -5184.0     -4896.0        120.00',
    satellite: 4632,
    classification: 'U',
    designator: '70093B',
    epoch: 2453036.41070959,
    ndot: -8.400000000000001e-07,
    nddot: 0.0,
    bstar: 0.0001,
    ephemeris: 0,
    element: 995,
    i: 11.4628,
    Ω: 273.1101,
    e: 0.1450506,
    ω: 207.6,
    M: 143.935,
    n: 1.20231981,
    revolution: 4414
  },
  {
    line1: '1 06251U 62025E   06176.82412014  .00008885  00000-0  12808-3 0  3985',
    line2: '2 06251  58.0579  54.0425 0030035 139.1568 221.1854 15.56387291  6774      0.0      2880.0        120.00',
    satellite: 6251,
    classification: 'U',
    designator: '62025E',
    epoch: 2453912.32412014,
    ndot: 8.885000000000002e-05,
    nddot: 0.0,
    bstar: 0.00012808,
    ephemeris: 0,
    element: 398,
    i: 58.0579,
    Ω: 54.0425,
    e: 0.0030035,
    ω: 139.1568,
    M: 221.1854,
    n: 15.563872910000002,
    revolution: 677
  },
  {
    line1: '1 08195U 75081A   06176.33215444  .00000099  00000-0  11873-3 0   813',
    line2: '2 08195  64.1586 279.0717 6877146 264.7651  20.2257  2.00491383225656      0.0      2880.0        120.00',
    satellite: 8195,
    classification: 'U',
    designator: '75081A',
    epoch: 2453911.83215444,
    ndot: 9.9e-07,
    nddot: 0.0,
    bstar: 0.00011873000000000001,
    ephemeris: 0,
    element: 81,
    i: 64.1586,
    Ω: 279.0717000000001,
    e: 0.6877146,
    ω: 264.7651,
    M: 20.2257,
    n: 2.00491383,
    revolution: 22565
  },
  {
    line1: '1 09880U 77021A   06176.56157475  .00000421  00000-0  10000-3 0  9814',
    line2: '2 09880  64.5968 349.3786 7069051 270.0229  16.3320  2.00813614112380      0.0      2880.0        120.00',
    satellite: 9880,
    classification: 'U',
    designator: '77021A',
    epoch: 2453912.06157475,
    ndot: 4.21e-06,
    nddot: 0.0,
    bstar: 0.0001,
    ephemeris: 0,
    element: 981,
    i: 64.5968,
    Ω: 349.3786,
    e: 0.7069051,
    ω: 270.0229,
    M: 16.332,
    n: 2.00813614,
    revolution: 11238
  },
  {
    line1: '1 09998U 74033F   05148.79417928 -.00000112  00000-0  00000+0 0  4480',
    line2: '2 09998   9.4958 313.1750 0270971 327.5225  30.8097  1.16186785 45878  -1440.0      -720.00         60.0',
    satellite: 9998,
    classification: 'U',
    designator: '74033F',
    epoch: 2453519.29417928,
    ndot: -1.12e-06,
    nddot: 0.0,
    bstar: 0.0,
    ephemeris: 0,
    element: 448,
    i: 9.4958,
    Ω: 313.175,
    e: 0.0270971,
    ω: 327.5225,
    M: 30.809700000000003,
    n: 1.16186785,
    revolution: 4587
  },
  {
    line1: '1 11801U          80230.29629788  .01431103  00000-0  14311-1      13',
    line2: '2 11801  46.7916 230.4354 7318036  47.4722  10.4117  2.28537848    13      0.0      1440.0        360.00',
    satellite: 11801,
    classification: 'U',
    designator: '',
    epoch: 2444468.79629788,
    ndot: 0.014311030000000002,
    nddot: 0.0,
    bstar: 0.014310999999999999,
    ephemeris: 0,
    element: 1,
    i: 46.79160000000001,
    Ω: 230.4354,
    e: 0.7318036,
    ω: 47.4722,
    M: 10.4117,
    n: 2.28537848,
    revolution: 1
  },
  {
    line1: '1 14128U 83058A   06176.02844893 -.00000158  00000-0  10000-3 0  9627',
    line2: '2 14128  11.4384  35.2134 0011562  26.4582 333.5652  0.98870114 46093      0.0      2880.0        120.00',
    satellite: 14128,
    classification: 'U',
    designator: '83058A',
    epoch: 2453911.52844893,
    ndot: -1.58e-06,
    nddot: 0.0,
    bstar: 0.0001,
    ephemeris: 0,
    element: 962,
    i: 11.438400000000001,
    Ω: 35.2134,
    e: 0.0011562,
    ω: 26.4582,
    M: 333.5652,
    n: 0.9887011399999999,
    revolution: 4609
  },
  {
    line1: '1 16925U 86065D   06151.67415771  .02550794 -30915-6  18784-3 0  4486',
    line2: '2 16925  62.0906 295.0239 5596327 245.1593  47.9690  4.88511875148616      0.0      1440.0        120.00',
    satellite: 16925,
    classification: 'U',
    designator: '86065D',
    epoch: 2453887.17415771,
    ndot: 0.025507940000000007,
    nddot: -3.0915e-07,
    bstar: 0.00018784000000000002,
    ephemeris: 0,
    element: 448,
    i: 62.0906,
    Ω: 295.0239,
    e: 0.5596327,
    ω: 245.1593,
    M: 47.969,
    n: 4.88511875,
    revolution: 14861
  },
  {
    line1: '1 20413U 83020D   05363.79166667  .00000000  00000-0  00000+0 0  7041',
    line2: '2 20413  12.3514 187.4253 7864447 196.3027 356.5478  0.24690082  7978   1440.0      4320.0        120.00',
    satellite: 20413,
    classification: 'U',
    designator: '83020D',
    epoch: 2453734.29166667,
    ndot: 0.0,
    nddot: 0.0,
    bstar: 0.0,
    ephemeris: 0,
    element: 704,
    i: 12.3514,
    Ω: 187.4253,
    e: 0.7864447,
    ω: 196.3027,
    M: 356.5478,
    n: 0.24690082,
    revolution: 797
  },
  {
    line1: '1 21897U 92011A   06176.02341244 -.00001273  00000-0 -13525-3 0  3044',
    line2: '2 21897  62.1749 198.0096 7421690 253.0462  20.1561  2.01269994104880      0.0      2880.0        120.00',
    satellite: 21897,
    classification: 'U',
    designator: '92011A',
    epoch: 2453911.52341244,
    ndot: -1.2729999999999998e-05,
    nddot: 0.0,
    bstar: -0.00013525,
    ephemeris: 0,
    element: 304,
    i: 62.1749,
    Ω: 198.0096,
    e: 0.742169,
    ω: 253.04620000000003,
    M: 20.1561,
    n: 2.01269994,
    revolution: 10488
  },
  {
    line1: '1 22312U 93002D   06094.46235912  .99999999  81888-5  49949-3 0  3953',
    line2: '2 22312  62.1486  77.4698 0308723 267.9229  88.7392 15.95744531 98783  54.2028672   1440.0         20.00',
    satellite: 22312,
    classification: 'U',
    designator: '93002D',
    epoch: 2453829.96235912,
    ndot: 0.99999999,
    nddot: 8.188800000000004e-06,
    bstar: 0.00049949,
    ephemeris: 0,
    element: 395,
    i: 62.1486,
    Ω: 77.46980000000002,
    e: 0.0308723,
    ω: 267.9229,
    M: 88.7392,
    n: 15.957445309999999,
    revolution: 9878
  },
  {
    line1: '1 22674U 93035D   06176.55909107  .00002121  00000-0  29868-3 0  6569',
    line2: '2 22674  63.5035 354.4452 7541712 253.3264  18.7754  1.96679808 93877      0.0      2880.0        120.00',
    satellite: 22674,
    classification: 'U',
    designator: '93035D',
    epoch: 2453912.05909107,
    ndot: 2.1210000000000002e-05,
    nddot: 0.0,
    bstar: 0.00029868,
    ephemeris: 0,
    element: 656,
    i: 63.5035,
    Ω: 354.4452,
    e: 0.7541712,
    ω: 253.32640000000004,
    M: 18.7754,
    n: 1.96679808,
    revolution: 9387
  },
  {
    line1: '1 23177U 94040C   06175.45752052  .00000386  00000-0  76590-3 0    95',
    line2: '2 23177   7.0496 179.8238 7258491 296.0482   8.3061  2.25906668 97438      0.0      1440.0        120.00',
    satellite: 23177,
    classification: 'U',
    designator: '94040C',
    epoch: 2453910.95752052,
    ndot: 3.86e-06,
    nddot: 0.0,
    bstar: 0.0007659,
    ephemeris: 0,
    element: 9,
    i: 7.049600000000001,
    Ω: 179.8238,
    e: 0.7258491,
    ω: 296.0482,
    M: 8.3061,
    n: 2.25906668,
    revolution: 9743
  },
  {
    line1: '1 23333U 94071A   94305.49999999 -.00172956  26967-3  10000-3 0    15',
    line2: '2 23333  28.7490   2.3720 9728298  30.4360   1.3500  0.07309491    70      0.0      1600.0        120.00',
    satellite: 23333,
    classification: 'U',
    designator: '94071A',
    epoch: 2449657.99999999,
    ndot: -0.00172956,
    nddot: 0.00026966999999999996,
    bstar: 0.0001,
    ephemeris: 0,
    element: 1,
    i: 28.749000000000002,
    Ω: 2.372,
    e: 0.9728298,
    ω: 30.436,
    M: 1.35,
    n: 0.07309491,
    revolution: 7
  },
  {
    line1: '1 23599U 95029B   06171.76535463  .00085586  12891-6  12956-2 0  2905',
    line2: '2 23599   6.9327   0.2849 5782022 274.4436  25.2425  4.47796565123555      0.0       720.0         20.00',
    satellite: 23599,
    classification: 'U',
    designator: '95029B',
    epoch: 2453907.26535463,
    ndot: 0.00085586,
    nddot: 1.2890999999999998e-07,
    bstar: 0.0012956,
    ephemeris: 0,
    element: 290,
    i: 6.9327,
    Ω: 0.2849,
    e: 0.5782022,
    ω: 274.4436,
    M: 25.2425,
    n: 4.47796565,
    revolution: 12355
  },
  {
    line1: '1 24208U 96044A   06177.04061740 -.00000094  00000-0  10000-3 0  1600',
    line2: '2 24208   3.8536  80.0121 0026640 311.0977  48.3000  1.00778054 36119      0.0      1440.0        120.00',
    satellite: 24208,
    classification: 'U',
    designator: '96044A',
    epoch: 2453912.5406174,
    ndot: -9.400000000000001e-07,
    nddot: 0.0,
    bstar: 0.0001,
    ephemeris: 0,
    element: 160,
    i: 3.8536000000000006,
    Ω: 80.0121,
    e: 0.002664,
    ω: 311.0977,
    M: 48.3,
    n: 1.00778054,
    revolution: 3611
  },
  {
    line1: '1 25954U 99060A   04039.68057285 -.00000108  00000-0  00000-0 0  6847',
    line2: '2 25954   0.0004 243.8136 0001765  15.5294  22.7134  1.00271289 15615  -1440.0      1440.0        120.00',
    satellite: 25954,
    classification: 'U',
    designator: '99060A',
    epoch: 2453044.18057285,
    ndot: -1.08e-06,
    nddot: 0.0,
    bstar: 0.0,
    ephemeris: 0,
    element: 684,
    i: 0.0004,
    Ω: 243.81360000000004,
    e: 0.0001765,
    ω: 15.5294,
    M: 22.7134,
    n: 1.00271289,
    revolution: 1561
  },
  {
    line1: '1 26900U 01039A   06106.74503247  .00000045  00000-0  10000-3 0  8290',
    line2: '2 26900   0.0164 266.5378 0003319  86.1794 182.2590  1.00273847 16981   9300.00     9400.00        60.00',
    satellite: 26900,
    classification: 'U',
    designator: '01039A',
    epoch: 2453842.24503247,
    ndot: 4.5000000000000003e-07,
    nddot: 0.0,
    bstar: 0.0001,
    ephemeris: 0,
    element: 829,
    i: 0.0164,
    Ω: 266.5378,
    e: 0.0003319,
    ω: 86.1794,
    M: 182.25900000000001,
    n: 1.00273847,
    revolution: 1698
  },
  {
    line1: '1 26975U 78066F   06174.85818871  .00000620  00000-0  10000-3 0  6809',
    line2: '2 26975  68.4714 236.1303 5602877 123.7484 302.5767  2.05657553 67521      0.0      2880.0        120.00',
    satellite: 26975,
    classification: 'U',
    designator: '78066F',
    epoch: 2453910.35818871,
    ndot: 6.2e-06,
    nddot: 0.0,
    bstar: 0.0001,
    ephemeris: 0,
    element: 680,
    i: 68.4714,
    Ω: 236.13030000000003,
    e: 0.5602877,
    ω: 123.74839999999999,
    M: 302.5767,
    n: 2.05657553,
    revolution: 6752
  },
  {
    line1: '1 28057U 03049A   06177.78615833  .00000060  00000-0  35940-4 0  1836',
    line2: '2 28057  98.4283 247.6961 0000884  88.1964 271.9322 14.35478080140550      0.0      2880.0        120.00',
    satellite: 28057,
    classification: 'U',
    designator: '03049A',
    epoch: 2453913.28615833,
    ndot: 6e-07,
    nddot: 0.0,
    bstar: 3.594e-05,
    ephemeris: 0,
    element: 183,
    i: 98.4283,
    Ω: 247.6961,
    e: 8.84e-05,
    ω: 88.1964,
    M: 271.9322,
    n: 14.3547808,
    revolution: 14055
  },
  {
    line1: '1 28129U 03058A   06175.57071136 -.00000104  00000-0  10000-3 0   459',
    line2: '2 28129  54.7298 324.8098 0048506 266.2640  93.1663  2.00562768 18443      0.0      1440.0        120.00',
    satellite: 28129,
    classification: 'U',
    designator: '03058A',
    epoch: 2453911.07071136,
    ndot: -1.04e-06,
    nddot: 0.0,
    bstar: 0.0001,
    ephemeris: 0,
    element: 45,
    i: 54.7298,
    Ω: 324.8098,
    e: 0.0048506,
    ω: 266.264,
    M: 93.1663,
    n: 2.00562768,
    revolution: 1844
  },
  {
    line1: '1 28350U 04020A   06167.21788666  .16154492  76267-5  18678-3 0  8894',
    line2: '2 28350  64.9977 345.6130 0024870 260.7578  99.9590 16.47856722116490      0.0      2880.0        120.00',
    satellite: 28350,
    classification: 'U',
    designator: '04020A',
    epoch: 2453902.71788666,
    ndot: 0.16154492,
    nddot: 7.626700000000002e-06,
    bstar: 0.00018678,
    ephemeris: 0,
    element: 889,
    i: 64.9977,
    Ω: 345.613,
    e: 0.002487,
    ω: 260.7578,
    M: 99.959,
    n: 16.47856722,
    revolution: 11649
  },
  {
    line1: '1 28623U 05006B   06177.81079184  .00637644  69054-6  96390-3 0  6000',
    line2: '2 28623  28.5200 114.9834 6249053 170.2550 212.8965  3.79477162 12753      0.0      1440.0        120.00',
    satellite: 28623,
    classification: 'U',
    designator: '05006B',
    epoch: 2453913.31079184,
    ndot: 0.00637644,
    nddot: 6.9054e-07,
    bstar: 0.0009639,
    ephemeris: 0,
    element: 600,
    i: 28.52,
    Ω: 114.9834,
    e: 0.6249053,
    ω: 170.255,
    M: 212.8965,
    n: 3.7947716199999997,
    revolution: 1275
  },
  {
    line1: '1 28626U 05008A   06176.46683397 -.00000205  00000-0  10000-3 0  2190',
    line2: '2 28626   0.0019 286.9433 0000335  13.7918  55.6504  1.00270176  4891      0.0      1440.0        120.00',
    satellite: 28626,
    classification: 'U',
    designator: '05008A',
    epoch: 2453911.96683397,
    ndot: -2.0500000000000003e-06,
    nddot: 0.0,
    bstar: 0.0001,
    ephemeris: 0,
    element: 219,
    i: 0.0019,
    Ω: 286.9433,
    e: 3.35e-05,
    ω: 13.7918,
    M: 55.6504,
    n: 1.00270176,
    revolution: 489
  },
  {
    line1: '1 28872U 05037B   05333.02012661  .25992681  00000-0  24476-3 0  1534',
    line2: '2 28872  96.4736 157.9986 0303955 244.0492 110.6523 16.46015938 10708      0.0        60.0          5.00',
    satellite: 28872,
    classification: 'U',
    designator: '05037B',
    epoch: 2453703.52012661,
    ndot: 0.25992681,
    nddot: 0.0,
    bstar: 0.00024476,
    ephemeris: 0,
    element: 153,
    i: 96.4736,
    Ω: 157.9986,
    e: 0.0303955,
    ω: 244.0492,
    M: 110.6523,
    n: 16.46015938,
    revolution: 1070
  },
  {
    line1: '1 29141U 85108AA  06170.26783845  .99999999  00000-0  13519-0 0   718',
    line2: '2 29141  82.4288 273.4882 0015848 277.2124  83.9133 15.93343074  6828      0.0       440.0         20.00',
    satellite: 29141,
    classification: 'U',
    designator: '85108AA',
    epoch: 2453905.76783845,
    ndot: 0.99999999,
    nddot: 0.0,
    bstar: 0.13519,
    ephemeris: 0,
    element: 71,
    i: 82.4288,
    Ω: 273.4882,
    e: 0.0015848,
    ω: 277.21240000000006,
    M: 83.9133,
    n: 15.93343074,
    revolution: 682
  },
  {
    line1: '1 29238U 06022G   06177.28732010  .00766286  10823-4  13334-2 0   101',
    line2: '2 29238  51.5595 213.7903 0202579  95.2503 267.9010 15.73823839  1061      0.0      1440.0        120.00',
    satellite: 29238,
    classification: 'U',
    designator: '06022G',
    epoch: 2453912.7873201,
    ndot: 0.0076628600000000005,
    nddot: 1.0823e-05,
    bstar: 0.0013334,
    ephemeris: 0,
    element: 10,
    i: 51.5595,
    Ω: 213.7903,
    e: 0.0202579,
    ω: 95.2503,
    M: 267.901,
    n: 15.73823839,
    revolution: 106
  },
  {
    line1: '1 88888U          80275.98708465  .00073094  13844-3  66816-4 0    87',
    line2: '2 88888  72.8435 115.9689 0086731  52.6988 110.5714 16.05824518  1058      0.0      1440.0        120.00',
    satellite: 88888,
    classification: 'U',
    designator: '',
    epoch: 2444514.48708465,
    ndot: 0.00073094,
    nddot: 0.00013844,
    bstar: 6.6816e-05,
    ephemeris: 0,
    element: 8,
    i: 72.8435,
    Ω: 115.96890000000002,
    e: 0.0086731,
    ω: 52.6988,
    M: 110.5714,
    n: 16.05824518,
    revolution: 105
  }
]

/*****************************************************************************************************************/

// The element sets of the verification set whose checksums are deliberately corrupted:
export const tleCorruptedReferences: Pick<TwoLineElementReference, 'line1' | 'line2'>[] = [
  { line1: '1 33333U 05037B   05333.02012661  .25992681  00000-0  24476-3 0  1534', line2: '2 33333  96.4736 157.9986 9950000 244.0492 110.6523  4.00004038 10708      0.0       150.0          5.00' },
  { line1: '1 33334U 78066F   06174.85818871  .00000620  00000-0  10000-3 0  6809', line2: '2 33334  68.4714 236.1303 5602877 123.7484 302.5767  0.00001000 67521      0.0      1440.0         1.00' },
  { line1: '1 33335U 05008A   06176.46683397 -.00000205  00000-0  10000-3 0  2190', line2: '2 33335   0.0019 286.9433 0000004  13.7918  55.6504  1.00270176  4891      0.0      1440.0         20.00' }
]

/*****************************************************************************************************************/
