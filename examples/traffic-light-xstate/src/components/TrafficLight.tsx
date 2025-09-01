import React from 'react';
import styles from '../TrafficLightWidget.module.css';

type LightState = 'red' | 'amber' | 'green' | 'redAmber' | 'off';

/**
 * TrafficLight
 * A simple 3-aspect traffic signal with colored circles
 */
export default function TrafficLight({
  lightState = 'off',
  className = '',
}: {
  lightState: LightState;
  className?: string;
}) {
  const getLightClasses = () => {
    const redClass =
      lightState === 'red' ? styles.lightRed : styles.lightRedOff;
    const amberClass =
      lightState === 'amber'
        ? styles.lightAmber
        : lightState === 'redAmber'
          ? styles.lightRedAmber
          : styles.lightAmberOff;
    const greenClass =
      lightState === 'green' ? styles.lightGreen : styles.lightGreenOff;

    return { redClass, amberClass, greenClass };
  };

  const { redClass, amberClass, greenClass } = getLightClasses();

  return (
    <div className={`${styles.trafficLightContainer} ${className}`}>
      {/* Traffic Light Housing */}
      <div className={styles.trafficLightHousing}>
        {/* Red Light */}
        <div className={`${styles.light} ${redClass}`} />

        {/* Amber Light */}
        <div className={`${styles.light} ${amberClass}`} />

        {/* Green Light */}
        <div className={`${styles.light} ${greenClass}`} />
      </div>
    </div>
  );
}
