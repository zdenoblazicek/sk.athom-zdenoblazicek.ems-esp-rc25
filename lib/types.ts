import { Mutex } from "async-mutex";

export type Settings = {
  network_address: string;
  access_token: string;
};

export type DeviceSettings = {
  networkAddress: string;
  accessToken: string;
  pollInterval: number;
  mutex: Mutex;
  timeout: NodeJS.Timeout | null;
};

export type SystemData = {
  "System Info": SystemInfo;
  "Network Info": unknown;
  "NTP Info": unknown;
  "OTA Info": unknown;
  "MQTT Info": unknown;
  "Syslog Info": unknown;
  "Sensor Info": unknown;
  "API Info": unknown;
  "Bus Info": unknown;
  Settings: unknown;
  Devices: Array<DeviceData>;
};

export type SystemInfo = {
  version: string;
  platform: string;
  uptime: string;
  "uptime (seconds)": number;
  "free mem": number;
  "max alloc": number;
  "free app": number;
  "reset reason": string;
};

export type DeviceType =
  | "boiler"
  | "thermostat"
  | "heatpump"
  | "heatsource"
  | "solar"
  | "connect"
  | "mixer"
  | "controller"
  | "switch"
  | "gateway"
  | "alert"
  | "pump";

export type DeviceData = {
  type: DeviceType;
  name: string;
  "device id": string;
  "product id": string;
  version: string;
  entities: number;
  "handlers received": string;
  "handlers fetched": string;
  "handlers pending": string;
  "handlers ignored": string;
};

export type ThermostatData = {
  minexttemp: number;
  hc1:
    | {
        seltemp: number;
        currtemp: number;
        haclimate: "selTemp" | "roomTemp";
        mode:  "night" | "day" | "auto" ;
        modetype: "night" | "day";
        daytemp: number;
        nighttemp: number;
        program: "family" | "morning" | "evening" | "am" | "pm" | "midday" |"singles" | "seniors";
        minflowtemp: number;
        maxflowtemp: number;
        tempautotemp: number;
        summertemp: number;
        summermode: "winter" | "summer" ;

      }
    | undefined;
};

export type BoilerData = {
  wwsettemp: number;
  wwseltemp: number;
  wwtype: "off" | "flow" | "buffered flow" | "buffer" | "layered buffer";
  wwcomfort: "hot" | "eco" | "intelligent";
  wwflowtempoffset: number;
  wwmaxpower: number;
  wwcircpump: "on" | "off";
  wwchargetype: "chargepump" | "3-way valve";
  wwhyston: number;
  wwhystoff: number;
  wwdisinfectiontemp: number;
  wwcircmode:
    | "off"
    | "1x3min"
    | "2x3min"
    | "3x3min"
    | "4x3min"
    | "5x3min"
    | "6x3min"
    | "continuous";
  wwcirc: "on" | "off";
  wwcurtemp: number;
  wwcurtemp2: number;
  wwcurflow: number;
  wwstoragetemp2: number;
  wwactivated: "on" | "off";
  wwonetime: "on" | "off";
  wwdisinfecting: "on" | "off";
  wwcharging: "on" | "off";
  wwrecharging: "on" | "off";
  wwtempok: "on" | "off";
  wwactive: "on" | "off";
  ww3wayvalve: "on" | "off";
  wwsetpumppower: number;
  wwstarts: number;
  wwworkm: number;
  nrgww: number;
  heatingoff: "on" | "off";
  heatingactive: "on" | "off";
  tapwateractive: "on" | "off";
  selflowtemp: number;
  heatingpumpmod: number;
  outdoortemp: number;
  curflowtemp: number;
  burngas: "on" | "off";
  burngas2: "on" | "off";
  flamecurr: number;
  fanwork: "on" | "off";
  ignwork: "on" | "off";
  oilpreheat: "on" | "off";
  burnminpower: number;
  burnmaxpower: number;
  burnminperiod: number;
  boilhyston: number;
  boilhystoff: number;
  heatingactivated: "on" | "off";
  heatingtemp: number;
  heatingpump: "on" | "off";
  pumpmodmax: number;
  pumpmodmin: number;
  pumpmode: "proportional" | "deltaP-1" |"deltaP-2" | "deltaP-3" | "deltaP-4" ;
  pumpdelay: number;
  setflowtemp: number;
  setburnpow: number;
  selburnpow: number;
  curburnpow: number;
  burnstarts: number;
  burnworkmin: number;
  burn2workmin: number;
  heatworkmin: number;
  heatstarts: number;
  ubauptime: number;
  lastcode: string;
  servicecodenumber: number;
  maintenancemessage: string;
  maintenance:  "on" | "off"; 
  maintenancetime: number;
  maintenancedate: string;
  nompower: number;
  nrgtotal: number;
  nrgheat: number;
};
