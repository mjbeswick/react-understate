import React from 'react';
import styles from '../TrafficLightWidget.module.css';

/** Lens wrapper with subtle bezel & inner diffusion */
export default function Lens({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.lens}>
      {/* Bezel */}
      <div className={styles.lensBezel} />
      {/* Diffuser */}
      <div className={styles.lensDiffuser} />
      {/* Icon */}
      <div className={styles.lensIcon}>{children}</div>
    </div>
  );
}
