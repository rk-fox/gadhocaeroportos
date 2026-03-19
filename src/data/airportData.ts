export interface AirportRunwayData {
  aerodrome: string;
  runway: string;
  taxiway_dep: string;
  taxiway_arr: string;
  dist_dep_cab: number;
  dist_dep_int: number;
  dist_arr_cab: number;
  dist_arr_int: number;
  rot_dep_cab: number;
  rot_dep_int: number;
  rot_arr_cab: number;
  rot_arr_int: number;
  taxi_dep_cab: number;
  taxi_dep_int: number;
  taxi_arr_cab: number;
  taxi_arr_int: number;
  omni_old: number;
  omni_opt: number;
}

export const AIRPORT_DATA: AirportRunwayData[] = [
  { 
    aerodrome: 'SBBR', runway: '11L', taxiway_dep: 'C', taxiway_arr: 'F', 
    dist_dep_cab: 3200, dist_dep_int: 2193, 
    dist_arr_cab: 3200, dist_arr_int: 1956, 
    rot_dep_cab: 51, rot_dep_int: 45, 
    rot_arr_cab: 86, rot_arr_int: 51, 
    taxi_dep_cab: 670, taxi_dep_int: 410, 
    taxi_arr_cab: 1280, taxi_arr_int: 275, 
    omni_old: 2002, omni_opt: 502 
  },
  { 
    aerodrome: 'SBBR', runway: '11R', taxiway_dep: 'BB', taxiway_arr: 'EE', 
    dist_dep_cab: 3300, dist_dep_int: 2188, 
    dist_arr_cab: 3300, dist_arr_int: 2161, 
    rot_dep_cab: 54, rot_dep_int: 46, 
    rot_arr_cab: 89, rot_arr_int: 52, 
    taxi_dep_cab: 890, taxi_dep_int: 300, 
    taxi_arr_cab: 815, taxi_arr_int: 440, 
    omni_old: 2002, omni_opt: 502 
  },
  { 
    aerodrome: 'SBBR', runway: '29R', taxiway_dep: 'F', taxiway_arr: 'C', 
    dist_dep_cab: 3200, dist_dep_int: 1956, 
    dist_arr_cab: 3200, dist_arr_int: 2193, 
    rot_dep_cab: 45, rot_dep_int: 36, 
    rot_arr_cab: 58, rot_arr_int: 58, 
    taxi_dep_cab: 1450, taxi_dep_int: 290, 
    taxi_arr_cab: 0, taxi_arr_int: 0, 
    omni_old: 2002, omni_opt: 502 
  },
  { 
    aerodrome: 'SBBR', runway: '29L', taxiway_dep: 'EE', taxiway_arr: 'BB', 
    dist_dep_cab: 3300, dist_dep_int: 2161, 
    dist_arr_cab: 3300, dist_arr_int: 2188, 
    rot_dep_cab: 55, rot_dep_int: 46, 
    rot_arr_cab: 58, rot_arr_int: 58, 
    taxi_dep_cab: 950, taxi_dep_int: 420, 
    taxi_arr_cab: 0, taxi_arr_int: 0, 
    omni_old: 2002, omni_opt: 502 
  },
  { 
    aerodrome: 'SBCF', runway: '16', taxiway_dep: 'C1', taxiway_arr: 'F1', 
    dist_dep_cab: 3600, dist_dep_int: 2720, 
    dist_arr_cab: 3600, dist_arr_int: 1765, 
    rot_dep_cab: 61, rot_dep_int: 47, 
    rot_arr_cab: 87, rot_arr_int: 49, 
    taxi_dep_cab: 860, taxi_dep_int: 0, 
    taxi_arr_cab: 1020, taxi_arr_int: 315, 
    omni_old: 579, omni_opt: 579 
  },
  { 
    aerodrome: 'SBCF', runway: '34', taxiway_dep: 'H', taxiway_arr: 'C1', 
    dist_dep_cab: 3600, dist_dep_int: 2987, 
    dist_arr_cab: 3600, dist_arr_int: 2700, 
    rot_dep_cab: 57, rot_dep_int: 48, 
    rot_arr_cab: 81, rot_arr_int: 61, 
    taxi_dep_cab: 550, taxi_dep_int: 0, 
    taxi_arr_cab: 860, taxi_arr_int: 0, 
    omni_old: 579, omni_opt: 579 
  }
];
