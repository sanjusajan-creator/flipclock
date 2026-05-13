# Flip Clock Specification

## Components
1. **`FlipClock`**: 
   - State: `time` (Date object).
   - Interval: Updates `time` every second.
   - Render: Displays `FlipUnit` for Hours, Minutes, and Seconds, plus a date display.
2. **`FlipUnit`**:
   - Props: `value` (0-59 or 0-23), `label` ("Hours", "Minutes", etc.).
   - Logic: Splits the value into two digits (tens and ones).
   - Render: Two `FlipCard` components.
3. **`FlipCard`**:
   - Props: `currentDigit`, `nextDigit`.
   - Logic: Triggers animation when `currentDigit` changes.
   - Render: 4 layers for the flip effect.

## Styles
- Deep dark background for the cards (#333).
- Bold white typography.
- CSS 3D transforms for the flip animation (`rotateX`).
- Shadow effects for depth.

## File Structure
- `src/main.jsx`
- `src/App.jsx`
- `src/components/FlipClock.jsx`
- `src/components/FlipUnit.jsx`
- `src/components/FlipCard.jsx`
- `src/styles/FlipClock.css`
- `src/App.css`
