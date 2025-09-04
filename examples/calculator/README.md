# React Understate Calculator Example

A modern, macOS-style calculator built with React Understate, demonstrating reactive state management and CSS modules.

## Features

- **Modern Design**: Clean, macOS-inspired interface
- **Reactive State**: Built with React Understate signals and computed values
- **CSS Modules**: Scoped styling with TypeScript support
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Support**: Full keyboard navigation support

## Calculator Operations

- **Basic Operations**: `+`, `-`, `×`, `÷`
- **Clear**: `C` - Resets the calculator
- **Delete**: `⌫` - Removes the last digit
- **Percentage**: `%` - Converts current value to percentage
- **Decimal**: `.` - Adds decimal point
- **Equals**: `=` - Calculates the result

## Technical Implementation

### State Management

The calculator uses React Understate's reactive primitives:

```typescript
type CalculatorState = {
  currentValue: string;
  previousValue: string | null;
  operation: string | null;
  waitingForOperand: boolean;
};

const calculatorState = state<CalculatorState>({
  currentValue: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
});
```

### Computed Values

Display values are automatically updated using computed signals:

```typescript
const displayValue = computed(() => calculatorState.get().currentValue);
const expression = computed(() => {
  const state = calculatorState.get();
  if (state.previousValue && state.operation) {
    return `${state.previousValue} ${state.operation}`;
  }
  return '';
});
```

### CSS Modules

The calculator uses CSS modules for scoped styling:

```typescript
import styles from './styles.module.css';

// Usage
div({ className: styles.calculator }, ...)
button({ className: `${styles.btn} ${styles.operator}` }, ...)
```

## Running the Example

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:

   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

## Project Structure

```
examples/calculator/
├── main.ts              # Main application logic
├── styles.module.css    # CSS modules styles
├── css.d.ts            # TypeScript CSS module declarations
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
└── README.md           # This file
```

## Key Concepts Demonstrated

### Reactive Programming

- **Signals**: For mutable state (`calculatorState`)
- **Computed**: For derived values (`displayValue`, `expression`)
- **Effects**: Automatic UI updates when state changes

### Component Architecture

- **Functional Components**: Pure functions returning DOM elements
- **Event Handling**: Clean separation of logic and UI
- **State Updates**: Immutable state updates with spread operator

### CSS Modules

- **Scoped Styles**: No CSS conflicts with other components
- **Type Safety**: TypeScript support for CSS class names
- **Modern CSS**: Flexbox, Grid, CSS custom properties

## Browser Support

- Modern browsers with ES2020 support
- CSS Grid and Flexbox support required
- Backdrop-filter support for glassmorphism effects

## Customization

The calculator can be easily customized by:

1. **Modifying Colors**: Update CSS custom properties in `styles.module.css`
2. **Adding Operations**: Extend the `performOperation` function
3. **Changing Layout**: Modify the grid layout in CSS
4. **Adding Features**: Implement memory functions, scientific operations, etc.

## Performance Features

- **Efficient Updates**: Only affected DOM elements are updated
- **Minimal Re-renders**: Computed values prevent unnecessary updates
- **Optimized State**: Immutable updates with proper change detection

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **High Contrast**: Clear visual hierarchy and contrast ratios
- **Responsive**: Works on all screen sizes
