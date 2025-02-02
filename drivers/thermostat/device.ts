import Homey from "homey";
import { EmsEspClient } from "../../lib/ems-esp-client";
import { capitalize, polling, setCapabilityValues } from "../../lib/utils";
import { ThermostatData } from "../../lib/types";

class ThermostatDevice extends Homey.Device {
  private stopPolling: (() => void) | null = null;
  private oldData: ThermostatData | null = null;
/*
  private hpoperatingstateChangedTrigger:
    | Homey.FlowCardTriggerDevice
    | undefined;
*/
  private get intervalMs() {
    return Number(this.getSetting("poll_interval") || 10000);
  }

  private get client() {
    return new EmsEspClient(
      this.getSetting("network_address"),
      this.getSetting("access_token")
    );
  }

  private startPolling() {
    this.stopPolling = this.stopPolling = polling(
      Number(this.getSetting("poll_interval") || 10000),
      () => this.client.getThermostatData(),
      async (err, res) => {
        if (err) {
          this.error(err);
          await this.setUnavailable(`${err}`).catch(this.error);
        } else if (res) {
          await this.updateCapabilityValues(res).catch(this.error);
          await this.setAvailable().catch(this.error);
/*          
          await this.triggerFlows(res).catch(this.error);
*/
        }
      }
    );
  }

/*
  private async triggerFlows(newData: ThermostatData) {
    const newHc1 = newData.hc1;
    const oldHc1 = this.oldData?.hc1;
    if (
      oldHc1 &&
      newHc1 &&
      oldHc1.hpoperatingstate !== newHc1.hpoperatingstate
    ) {
      return this.hpoperatingstateChangedTrigger?.trigger(
        this,
        {
          old_value: capitalize(oldHc1.hpoperatingstate),
          new_value: capitalize(newHc1.hpoperatingstate),
        },
        undefined
      );
    }
    this.oldData = newData;
  }
*/

  private async updateCapabilityValues(data: ThermostatData) {
    if (!data.hc1) {
      this.log("No thermostat hc1 data");
      return;
    }
/*
    // Init target_temperature to the actual value from the thermostat
    if (this.getCapabilityValue("target_temperature") === null) {
      await this.setCapabilityValue("target_temperature", data.hc1.seltemp);
    }
*/
    const {
      /*dampedoutdoortemp,*/
      hc1: { currtemp, seltemp  }, /*, hpoperatingstate*/
    } = data;
    await setCapabilityValues(this, [
     /* ["thermostat_dampedoutdoortemp", dampedoutdoortemp],
      ["thermostat_hc1_hpoperatingstate", capitalize(hpoperatingstate)],
      */
      ["target_temperature", seltemp],
      ["measure_temperature", currtemp],

      ["target_temperature.nighttemp",data.hc1.nighttemp],
      ["target_temperature.daytemp",data.hc1.daytemp],

     
      ["thermostat_hc1_nighttemp",data.hc1.nighttemp],
      ["thermostat_hc1_daytemp",data.hc1.daytemp],
     
      ["thermostat_hc1_program", data.hc1.program],
      ["thermostat_hc1_mode",data.hc1.mode],
     
      ["thermostat_hc1_nighttemp_change", data.hc1.nighttemp.toString()],
      ["thermostat_hc1_daytemp_change", data.hc1.daytemp.toString()],
    ]);

  }


  async onInit() {
    /*
    this.hpoperatingstateChangedTrigger = this.homey.flow.getDeviceTriggerCard(
      "thermostat_hc1_hpoperatingstate_changed"
    );
    */
    this.registerCapabilityListener("thermostat_hc1_mode", async (value) => {
      this.log(`thermostat_hc1_mode ${value}`);
      this.client.setThermostatText("mode",value).catch(this.error);
    }
    );

    this.registerCapabilityListener("thermostat_hc1_program", async (value) => {
      this.log(`thermostat_hc1_program ${value}`);
      this.client.setThermostatText("program",value).catch(this.error);
    }
    );
/*
    this.registerCapabilityListener("thermostat_hc1_nighttemp_change", async (value) => {
      this.log(`thermostat_hc1_nighttemp_change ${value}`);
      this.client.setThermostatText("nighttemp",value);
    }
    );
    
    this.registerCapabilityListener("thermostat_hc1_daytemp_change", async (value) => {
      this.log(`thermostat_hc1_daytemp_change ${value}`);
      this.client.setThermostatText("daytemp",value);
    }
    );
*/
    this.registerCapabilityListener("target_temperature.nighttemp", async (value) => {
      this.log(`target_temperature.nighttemp ${value}`);
      this.client.setThermostatText("nighttemp",value).catch(this.error);
    }
    );
    
    this.registerCapabilityListener("target_temperature.daytemp", async (value) => {
      this.log(`target_temperature.daytemp ${value}`);
      this.client.setThermostatText("daytemp",value).catch(this.error);
    }
    );
    
    this.registerCapabilityListener("target_temperature", async (value) => {
      this.log(`Updating selected temperature to ${value}°C`);
      try {
        this.setCapabilityValue("target_temperature", value).catch(this.error);
        if (this.oldData?.hc1?.seltemp === value) {
          this.log(`Don't update selected temperature, is already ${value}°C`);
          return;
        }
        this.stopPolling?.();
        await this.client.setSelectedTemp(value).catch(this.error);
        this.log(`Selected temperature updated to ${value}°C`);
      } catch (err) {
        this.error("Failed to update selected temperature", err);
        this.setUnavailable(`${err}`).catch(this.error);
      } finally {
        // Don't start polling until the thermostat has been updated
        setTimeout(() => this.startPolling(), this.intervalMs);
      }
    });


    /*
    this.homey.flow
      .getConditionCard("outdoor-temp-less-than")
      .registerRunListener(async (args: { temp: number }, state) => {
        const temp = this.oldData?.dampedoutdoortemp;
        return temp && temp < args.temp;
      });

    this.homey.flow
      .getConditionCard("outdoor-temp-greater-than")
      .registerRunListener(async (args: { temp: number }, state) => {
        const temp = this.oldData?.dampedoutdoortemp;
        return temp && temp > args.temp;
      });
    */
    this.startPolling();
  }

  onDeleted() {
    this.stopPolling?.();
  }
}

module.exports = ThermostatDevice;
