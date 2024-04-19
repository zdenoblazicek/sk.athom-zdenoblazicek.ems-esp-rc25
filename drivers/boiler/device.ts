import Homey from "homey";
import { EmsEspClient } from "../../lib/ems-esp-client";
import {
  BooleanToOnOff,
  OnOffToBoolean,
  formatLastCode,
  parseLastCode,
  polling,
  setCapabilityValues,
} from "../../lib/utils";
import { BoilerData } from "../../lib/types";

export class BoilerDevice extends Homey.Device {
  private stopPolling: (() => void) | null = null;

  private get client() {
    return new EmsEspClient(
      this.getSetting("network_address"),
      this.getSetting("access_token")
    );
  }

  /*
  private triggerFlows(newData: BoilerData) {
    // Don't have to explicity triggers that ends with _changed
    // because Homey does that automatically for us
    // https://apps.developer.homey.app/the-basics/flow#custom-capability-changed
    return this.homey.flow
      .getDeviceTriggerCard("boiler_wwcurtemp_less_than")
      ?.trigger(this, { wwcurtemp: newData.wwcurtemp }, newData);
  }
*/

  private async updateCapabilityValues(data: BoilerData) {
    // this.log("wwcirc"  + data.wwcirc);
     
    return setCapabilityValues(this, [
      ["boiler_curflowtemp", data.curflowtemp],
      ["boiler_lastcode", formatLastCode(parseLastCode(data.lastcode))],
      ["boiler_wwcurtemp", data.wwcurtemp],
      ["boiler_wwcurtemp2", data.wwcurtemp2],
      ["boiler_outdoortemp", data.outdoortemp],
      ["boiler_pumpmode",data.pumpmode],

      ["boiler_wwcirc", data.wwcirc],
      ["boiler_wwcirc_change", OnOffToBoolean(data.wwcirc)],

      ["boiler_wwcircmode", data.wwcircmode],
      ["boiler_heatingtemp", data.heatingtemp],
      ["boiler_wwseltemp",data.wwseltemp],

      ["target_temperature.water",data.wwseltemp],
      ["target_temperature.heatingtemp",data.heatingtemp],

    ]);
  }

  async onInit() {

    this.registerCapabilityListener("boiler_wwcirc_change", async (value) => {
      let text=BooleanToOnOff(value);
      this.log(`boiler_wwcirc_change ${value} ${text}`);
      this.client.setBoilerText("wwcirc",text).catch(this.error);
    });

    this.registerCapabilityListener("target_temperature.water", async (value) => {
      this.log(`target_temperature.water ${value}`);
      this.client.setBoilerText("wwseltemp",value).catch(this.error);
    });

    this.registerCapabilityListener("target_temperature.heatingtemp", async (value) => {
      this.log(`target_temperature.heatingtemp ${value}`);
      this.client.setBoilerText("heatingtemp",value).catch(this.error);
    });


    this.stopPolling = polling(
      Number(this.getSetting("poll_interval") || 10000),
      () => this.client.getBoilerData(),
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

  onDeleted() {
    this.stopPolling?.();
  }
}

module.exports = BoilerDevice;
