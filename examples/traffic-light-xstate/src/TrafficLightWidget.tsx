import { useActorRef, useSelector } from '@xstate/react';
import { trafficLightMachine } from './trafficLight.machine';
import styles from './TrafficLightWidget.module.css';
import TrafficLight from './components/TrafficLight';
import PedestrianSignal from './components/PedestrianSignal';

export default function TrafficLightWidget() {
  const actorRef = useActorRef(trafficLightMachine);
  const state = useSelector(actorRef, (state) => state);
  const send = actorRef.send;

  const top = Object.keys(state.value)[0]; // 'normal' or 'emergency'
  const sub =
    typeof state.value === 'object' ? (state.value as any)[top] : state.value;

  const isGreen = sub === 'green';
  const isAmber = sub === 'amber';
  const isRedAmber = sub === 'redAmber';
  const isRed =
    sub?.red ||
    sub === 'red' ||
    sub?.pedestrianWalk ||
    sub?.hold ||
    sub?.allRed ||
    top === 'emergency'; // treat emergency as "not green"

  const isEmergency = top === 'emergency';

  // Check for pedestrian walk state in the nested structure
  // The pedestrianWalk state is nested under sub.red.pedestrianWalk
  const isPedestrianWalk =
    sub?.pedestrianWalk ||
    (sub?.red && typeof sub.red === 'object' && sub.red.pedestrianWalk) ||
    sub?.red === 'pedestrianWalk';

  // Debug: Log the state to see what's happening
  console.log('State:', { top, sub, isPedestrianWalk, subRed: sub?.red });

  // Pedestrian light states (when walk phase is active, pedestrian sees green)
  const isPedestrianRed = !isPedestrianWalk;
  const isPedestrianGreen = isPedestrianWalk;

  // Determine the current light state from the machine
  const getLightState = () => {
    if (top === 'emergency') return 'red';

    if (sub === 'green') return 'green';
    if (sub === 'amber') return 'amber';
    if (sub === 'redAmber') return 'redAmber';

    // If we're in a red state (including nested states)
    if (
      sub?.red ||
      sub === 'red' ||
      sub?.pedestrianWalk ||
      sub?.hold ||
      sub?.allRed
    ) {
      return 'red';
    }

    return 'off';
  };

  const lightState = getLightState();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Traffic Light System</h1>
        <table className={styles.rulesTable}>
          <thead>
            <tr>
              <th>Light State</th>
              <th>Rule</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className={styles.steadyRed}>Steady Red</span>
              </td>
              <td>Stop and wait for the lights to change.</td>
            </tr>
            <tr>
              <td>
                <span className={styles.flashingAmber}>Flashing Amber</span>
              </td>
              <td>
                You must give way to any pedestrians still on the crossing. If
                the crossing is clear and it is safe to do so, you may proceed.
              </td>
            </tr>
            <tr>
              <td>
                <span className={styles.green}>Green</span>
              </td>
              <td>Go.</td>
            </tr>
            <tr>
              <td>
                <span className={styles.steadyAmber}>Steady Amber</span>
              </td>
              <td>
                A solid amber light indicates that the lights are about to
                change to red, so stop behind the line if you are able to do so
                safely.
              </td>
            </tr>
            <tr>
              <td>
                <span className={styles.red}>Red</span>
              </td>
              <td>The sequence returns to red.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Traffic Light Display */}
      <div className={styles.trafficLightRow}>
        {/* Traffic Light Display */}
        <TrafficLight lightState={lightState} />

        {/* Emergency Indicator */}
        {isEmergency && (
          <div className={styles.emergencyIndicator}>EMERGENCY</div>
        )}

        {/* Pedestrian Walk Indicator */}
        {isPedestrianWalk && (
          <div className={styles.pedestrianIndicator}>WALK</div>
        )}

        {/* Pedestrian Light Display */}
        <PedestrianSignal isRed={isPedestrianRed} isGreen={isPedestrianGreen} />
      </div>

      {/* Control Buttons */}
      <div className={styles.controlsContainer}>
        <h3 className={styles.controlsTitle}>Traffic Light Controls</h3>
        <p className={styles.controlsDescription}>
          Use these buttons to control the traffic light system and test
          different scenarios
        </p>

        <div className={styles.buttonGrid}>
          <div className={styles.buttonRow}>
            <button
              className={styles.button}
              onClick={() => send({ type: 'PED_BUTTON' })}
            >
              Pedestrian Button
            </button>
            <span className={styles.buttonLabel}>
              Press to request pedestrian crossing
            </span>
          </div>

          <div className={styles.buttonRow}>
            <button
              className={styles.button}
              onClick={() => send({ type: 'EMERGENCY_ON' })}
            >
              Emergency ON
            </button>
            <span className={styles.buttonLabel}>
              Activates emergency mode (flashing amber)
            </span>
          </div>

          <div className={styles.buttonRow}>
            <button
              className={styles.button}
              onClick={() => send({ type: 'EMERGENCY_OFF' })}
            >
              Emergency OFF
            </button>
            <span className={styles.buttonLabel}>
              Deactivates emergency mode
            </span>
          </div>

          <div className={styles.buttonRow}>
            <button
              className={styles.button}
              onClick={() => send({ type: 'POWER_CYCLE' })}
            >
              Power Cycle
            </button>
            <span className={styles.buttonLabel}>
              Resets the system to initial state
            </span>
          </div>
        </div>
      </div>

      {/* Duration Configuration */}
      <div className={styles.durationConfig}>
        <h3 className={styles.durationTitle}>Duration Configuration</h3>
        <div className={styles.durationGrid}>
          {Object.entries(state.context.durations).map(([key, value]) => (
            <div key={key} className={styles.durationField}>
              <label className={styles.durationLabel}>
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              <input
                type="number"
                value={String(value)}
                onChange={(e) =>
                  send({
                    type: 'SET_DURATIONS',
                    durations: { [key]: parseInt(e.target.value) || 0 },
                  })
                }
                className={styles.durationInput}
                min="100"
                step="100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
