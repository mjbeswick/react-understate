import React from "react";
import styles from "../TrafficLightWidget.module.css";

/**
 * PedestrianSignal
 * A simple pedestrian signal with red and green circles
 */
export default function PedestrianSignal({ 
  isRed, 
  isGreen, 
  className = "" 
}: { 
  isRed: boolean; 
  isGreen: boolean; 
  className?: string; 
}) {
  return (
    <div className={`${styles.pedestrianSignal} ${className}`}>
      {/* Pedestrian Light Housing */}
      <div className={styles.pedestrianHousing}>
        {/* Red Light */}
        <div className={`${styles.light} ${isRed ? styles.lightRed : styles.lightRedOff}`} />
        
        {/* Green Light */}
        <div className={`${styles.light} ${isGreen ? styles.lightGreen : styles.lightGreenOff}`} />
      </div>
    </div>
  );
}
