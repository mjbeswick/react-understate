import { setup } from 'xstate';

type Durations = {
  greenMs: number;
  amberMs: number; // "amber" in the UK
  redMs: number;
  walkMs: number; // pedestrian "walk" interval
  allRedBufferMs: number; // small all-red safety buffer
};

type Ctx = {
  durations: Durations;
  pedestrianQueued: boolean;
  emergencyActive: boolean;
};

type Events =
  | { type: 'PED_BUTTON' }
  | { type: 'EMERGENCY_ON' }
  | { type: 'EMERGENCY_OFF' }
  | { type: 'POWER_CYCLE' }
  | { type: 'SET_DURATIONS'; durations: Partial<Durations> };

export const trafficLightMachine = setup({
  types: {} as {
    context: Ctx;
    events: Events;
  },
  guards: {
    pedestrianIsQueued: ({ context }) => context.pedestrianQueued,
    isEmergencyActive: ({ context }) => context.emergencyActive,
  },
  actions: {
    queuePedestrian: ({ context }) => (context.pedestrianQueued = true),
    clearPedestrian: ({ context }) => (context.pedestrianQueued = false),
    setEmergencyOn: ({ context }) => (context.emergencyActive = true),
    setEmergencyOff: ({ context }) => (context.emergencyActive = false),
    mergeDurations: ({ context, event }) => {
      if (event.type !== 'SET_DURATIONS') return;
      context.durations = { ...context.durations, ...event.durations };
    },
  },
}).createMachine({
  id: 'trafficLight',
  context: {
    durations: {
      greenMs: 7000,
      amberMs: 2000,
      redMs: 2000,
      walkMs: 5000,
      allRedBufferMs: 1000,
    },
    pedestrianQueued: false,
    emergencyActive: false,
  },

  // High-level emergency override
  states: {
    normal: {
      initial: 'green',
      on: {
        EMERGENCY_ON: {
          target: 'emergency',
          actions: 'setEmergencyOn',
        },
        PED_BUTTON: { actions: 'queuePedestrian' },
        SET_DURATIONS: { actions: 'mergeDurations' },
        POWER_CYCLE: { target: 'normal.red.allRed' },
      },
      states: {
        // Standard UK: Green → Amber → Red → (if ped queued) Walk → Red+Amber → Green
        green: {
          after: {
            // If a pedestrian is queued, we'll go through amber then red then walk.
            // If not, still go to amber—walk happens only if queued when we arrive at red.
            // Green duration can be reconfigured at runtime.
            '7000': 'amber',
          },
        },

        amber: {
          after: {
            '2000': 'red',
          },
        },

        red: {
          initial: 'allRed',
          states: {
            // brief all-red safety buffer before either holding red or serving pedestrians
            allRed: {
              after: {
                '1000': [
                  // If pedestrians are waiting, go serve them
                  { guard: 'pedestrianIsQueued', target: 'pedestrianWalk' },
                  // Otherwise, just hold red for a moment (e.g. intergreen)
                  { target: 'hold' },
                ],
              },
            },

            // Pedestrian phase (parallel "signals": cars = red, ped = green)
            pedestrianWalk: {
              entry: 'clearPedestrian',
              after: {
                '5000': 'hold',
              },
            },

            // Hold red for a configurable dwell time before returning to traffic flow
            hold: {
              after: {
                '2000': '#trafficLight.normal.redAmber',
              },
            },
          },
        },

        // UK: Red+Amber (get ready) - flashing amber
        redAmber: {
          id: 'redAmber',
          after: {
            '2000': 'green',
          },
        },
      },
    },

    // Emergency: hold flashing amber for vehicles (yield) until cleared.
    // If you prefer all-red for emergency, change the state action(s) accordingly.
    emergency: {
      entry: 'setEmergencyOn',
      on: {
        EMERGENCY_OFF: {
          target: 'normal.red.allRed', // resume safely at all-red
          actions: 'setEmergencyOff',
        },
        PED_BUTTON: { actions: 'queuePedestrian' }, // still record requests
        SET_DURATIONS: { actions: 'mergeDurations' },
      },
      // In a real system you'd drive IO here (e.g. flash amber).
    },
  },

  initial: 'normal',
});
