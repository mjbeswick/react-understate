# Traffic Light Example

A React application demonstrating a UK-style traffic light system using XState for state management.

## Features

- **Realistic Traffic Light Behavior**: Implements UK traffic light sequence (Green → Amber → Red → Walk → Red+Amber → Green)
- **Pedestrian Crossing**: Pedestrian button queuing system with walk phase
- **Emergency Mode**: Emergency override with flashing amber
- **Configurable Timings**: Adjustable durations for all light phases
- **Interactive Controls**: Buttons for pedestrian requests, emergency mode, and power cycling
- **Real-time State Display**: Live view of current machine state and context

## State Machine

The traffic light system is built using XState with the following states:

- **Normal Operation**:
  - `green`: Traffic flows
  - `amber`: Warning phase
  - `red`: Stop phase with pedestrian walk support
  - `redAmber`: Prepare to go phase

- **Emergency Mode**: Flashing amber for emergency vehicles

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local development URL

## Usage

- **Pedestrian Button**: Press to queue a pedestrian crossing request
- **Emergency ON/OFF**: Toggle emergency mode for emergency vehicles
- **Power Cycle**: Reset the system to a safe state
- **Duration Configuration**: Adjust timing for each light phase in real-time

## Technologies Used

- React 18
- XState 5
- TypeScript
- CSS Modules
- Vite

## Project Structure

```
src/
├── trafficLight.machine.ts        # XState state machine definition
├── TrafficLightWidget.tsx         # Main React component
├── TrafficLightWidget.module.css  # CSS module styles
├── main.tsx                       # Application entry point
└── index.css                      # Base styles and custom animations
```

## State Machine Events

- `PED_BUTTON`: Pedestrian crossing request
- `EMERGENCY_ON`: Activate emergency mode
- `EMERGENCY_OFF`: Deactivate emergency mode
- `POWER_CYCLE`: Reset system
- `SET_DURATIONS`: Update timing configuration

## Context

The state machine maintains context for:

- Light phase durations (configurable)
- Pedestrian queue status
- Emergency mode status
