import Requirement from '../Requirement';

class GemsRequirement extends Requirement {
  constructor(options = {}) {
    super({
      name: 'Gear has best gems',
      check: function () { // don't use arrow function or `this` won't be set properly
        const numGemableSlots = Object.keys(this.gemChecker.gemableGear).length;
        return {
          actual: numGemableSlots - (this.gemChecker.slotsMissingGem.length + this.gemChecker.slotsMissingMaxGem.length),
          max: numGemableSlots,
          isLessThan: numGemableSlots,
          style: 'number',
        };
      },
      ...options,
    });
  }
}

export default GemsRequirement;
