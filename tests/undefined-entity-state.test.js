/**
 * Regression tests for undefined entity state handling.
 *
 * After a Home Assistant update, entities that are unavailable or have not
 * yet loaded may be missing from hass.states.  The card must not crash when
 * it encounters such undefined entries.
 *
 * Covers:
 *   - getFormattedLabelName  (accessed .state on undefined)
 *   - handleChangedEntities  (accessed .last_changed on undefined)
 */

describe('Undefined entity state handling', () => {

  // Minimal stub of the card's internal state object.
  // Only the fields touched by the two functions under test are included.
  function createInstance(hassStates) {
    return {
      _hass: { states: hassStates },
      pconfig: {
        roundingPrecision: 1,
        showCurrentValues: true,
        refreshEnabled: false,
      },
      stateMap: new Map(),
      graphs: [],

      // --- methods under test, copied verbatim from the source ---

      getFormattedLabelName(name, entity, unit) {
        let label = name;
        const entityState = this._hass.states[entity];
        if (entityState === undefined) return label;
        const p = 10 ** this.pconfig.roundingPrecision;
        const v = Math.round(entityState.state * p) / p;
        if (!isNaN(v)) {
          label += ' (' + v + (unit ? ' ' + unit : '') + ')';
        }
        return label;
      },

      handleChangedEntities() {
        if (!this.pconfig.showCurrentValues && !this.pconfig.refreshEnabled) return false;

        let changed = false;

        for (let g of this.graphs) {
          let i = 0;
          for (let e of g.entities) {
            const entityState = this._hass.states[e.entity];
            if (entityState === undefined) { i++; continue; }
            const lc = entityState.last_changed;
            if (this.stateMap.has(e.entity) && lc != this.stateMap.get(e.entity)) {
              if (this.pconfig.showCurrentValues) {
                let d = g.chart.data.datasets[i];
                d.label = this.getFormattedLabelName(d.name, e.entity, d.unit);
              }
              changed = true;
            }
            this.stateMap.set(e.entity, lc);
            i++;
          }
        }

        return changed;
      },
    };
  }

  // ---------------------------------------------------------------------------
  // getFormattedLabelName
  // ---------------------------------------------------------------------------

  describe('getFormattedLabelName', () => {

    test('returns label with value when entity exists', () => {
      const inst = createInstance({
        'sensor.temp': { state: '21.456', last_changed: '2025-01-01T00:00:00Z' },
      });

      const result = inst.getFormattedLabelName('Temperature', 'sensor.temp', '°C');
      expect(result).toBe('Temperature (21.5 °C)');
    });

    test('returns plain label when entity is undefined', () => {
      const inst = createInstance({});

      // Must NOT throw – this is the exact regression scenario
      const result = inst.getFormattedLabelName('Temperature', 'sensor.missing', '°C');
      expect(result).toBe('Temperature');
    });

    test('returns plain label when state is non-numeric', () => {
      const inst = createInstance({
        'sensor.text': { state: 'unavailable', last_changed: '2025-01-01T00:00:00Z' },
      });

      const result = inst.getFormattedLabelName('Text Sensor', 'sensor.text', '');
      expect(result).toBe('Text Sensor');
    });

    test('returns label without unit when unit is falsy', () => {
      const inst = createInstance({
        'sensor.temp': { state: '21.456', last_changed: '2025-01-01T00:00:00Z' },
      });

      const result = inst.getFormattedLabelName('Temperature', 'sensor.temp', '');
      expect(result).toBe('Temperature (21.5)');
    });
  });

  // ---------------------------------------------------------------------------
  // handleChangedEntities
  // ---------------------------------------------------------------------------

  describe('handleChangedEntities', () => {

    test('does not throw when an entity is missing from hass.states', () => {
      const inst = createInstance({
        // sensor.missing is NOT in states
        'sensor.present': { state: '10', last_changed: '2025-01-01T00:00:00Z' },
      });

      inst.graphs = [{
        entities: [
          { entity: 'sensor.missing' },
          { entity: 'sensor.present' },
        ],
        chart: {
          data: {
            datasets: [
              { name: 'Missing', label: 'Missing', unit: '' },
              { name: 'Present', label: 'Present', unit: '°C' },
            ],
          },
        },
      }];

      // Must NOT throw
      expect(() => inst.handleChangedEntities()).not.toThrow();
    });

    test('skips undefined entities and processes valid ones', () => {
      const inst = createInstance({
        'sensor.present': { state: '10', last_changed: '2025-01-01T00:00:01Z' },
      });

      inst.graphs = [{
        entities: [
          { entity: 'sensor.missing' },
          { entity: 'sensor.present' },
        ],
        chart: {
          data: {
            datasets: [
              { name: 'Missing', label: 'Missing', unit: '' },
              { name: 'Present', label: 'Present', unit: '°C' },
            ],
          },
        },
      }];

      // First call – seeds the stateMap
      inst.handleChangedEntities();

      // stateMap should only contain the present entity
      expect(inst.stateMap.has('sensor.present')).toBe(true);
      expect(inst.stateMap.has('sensor.missing')).toBe(false);
    });

    test('detects changes on valid entities', () => {
      const inst = createInstance({
        'sensor.temp': { state: '20', last_changed: '2025-01-01T00:00:00Z' },
      });

      inst.graphs = [{
        entities: [{ entity: 'sensor.temp' }],
        chart: {
          data: {
            datasets: [{ name: 'Temp', label: 'Temp', unit: '°C' }],
          },
        },
      }];

      // Seed
      inst.handleChangedEntities();

      // Simulate a state change
      inst._hass.states['sensor.temp'] = { state: '22', last_changed: '2025-01-01T00:01:00Z' };

      const changed = inst.handleChangedEntities();
      expect(changed).toBe(true);
    });

    test('returns false when nothing changed', () => {
      const inst = createInstance({
        'sensor.temp': { state: '20', last_changed: '2025-01-01T00:00:00Z' },
      });

      inst.graphs = [{
        entities: [{ entity: 'sensor.temp' }],
        chart: {
          data: {
            datasets: [{ name: 'Temp', label: 'Temp', unit: '°C' }],
          },
        },
      }];

      // Seed
      inst.handleChangedEntities();

      // Same state – should not report change
      const changed = inst.handleChangedEntities();
      expect(changed).toBe(false);
    });

    test('returns false early when both showCurrentValues and refreshEnabled are false', () => {
      const inst = createInstance({});
      inst.pconfig.showCurrentValues = false;
      inst.pconfig.refreshEnabled = false;

      // Even with graphs referencing missing entities, it should bail early
      inst.graphs = [{
        entities: [{ entity: 'sensor.missing' }],
        chart: { data: { datasets: [{ name: 'X', label: 'X', unit: '' }] } },
      }];

      const result = inst.handleChangedEntities();
      expect(result).toBe(false);
    });
  });
});
