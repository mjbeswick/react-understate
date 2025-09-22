import { state, derived, useUnderstate } from 'react-understate';

const radius = state(5);
const pi = 3.14159;

// Multiple derived values
const diameter = derived(() => radius.value * 2);
const circumference = derived(() => 2 * pi * radius.value);
const area = derived(() => pi * Math.pow(radius.value, 2));

function CircleCalculator() {
  const { radius: r, diameter: d, circumference: c, area: a } = useUnderstate({
    radius,
    diameter,
    circumference,
    area
  });
  
  return (
    <div>
      <h3>Circle Calculator</h3>
      <label>
        Radius: 
        <input 
          type="number"
          value={r}
          onChange={(e) => radius.value = Number(e.target.value)}
        />
      </label>
      
      <p>Diameter: {d.toFixed(2)}</p>
      <p>Circumference: {c.toFixed(2)}</p>
      <p>Area: {a.toFixed(2)}</p>
    </div>
  );
}