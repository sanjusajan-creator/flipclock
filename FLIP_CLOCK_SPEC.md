# Flip Clock Specification

## Components
1. **`FlipClock`**: 
   - State: `time` (Date), `is24Hour` (boolean).
   - Interval: Updates `time` every second.
   - Render: Brand header with 12H/24H toggle, date display, timezone info, three `FlipUnit` digits (Hours, Minutes, Seconds), optional AM/PM indicator, and a footer.
2. **`FlipUnit`**:
   - Props: `value` (0-59 or 0-23), `label` ("Hours", "Minutes", etc.).
   - Logic: Pads the value to two digits (tens and ones).
   - Render: Two `FlipCard` components.
3. **`FlipCard`**:
   - Props: `digit` (single character 0-9).
   - Logic: Detects prop change via `useEffect` + `useRef`, triggers flip animation, reads `--flip-speed` CSS var for animation duration.
   - Render: 4 layers (card-top, card-bottom, leaf-front, leaf-back) for the flip effect.

## Styles
- Deep dark background for the cards (#333).
- Bold white typography.
- CSS 3D transforms for the flip animation (`rotateX`).
- Shadow effects for depth.
- Glassmorphism design with backdrop-filter blur, carbon-fibre texture overlay, ambient glow animation.

## File Structure
- `src/main.jsx`
- `src/App.jsx`
- `src/components/FlipClock.jsx`
- `src/components/FlipUnit.jsx`
- `src/components/FlipCard.jsx`
- `src/App.css`
