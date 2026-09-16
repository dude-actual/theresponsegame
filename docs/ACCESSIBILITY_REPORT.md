# Accessibility Report — Resource Run v13 RC1

## Target

The release candidate is designed around WCAG 2.2 AA practices with additional focus-appearance and game-interface considerations.

## Implemented controls

- Native semantic buttons for gameplay actions.
- Keyboard answer shortcuts A/B/C and 1/2/3 remain supported.
- Visible 3px high-contrast focus indicator with offset.
- Primary interactive controls are designed for a minimum 44px target height, exceeding WCAG 2.2 AA 2.5.8's 24×24 CSS-pixel minimum.
- Dialog focus is trapped while open and returned to the invoking control when closed.
- Escape closes dialogs.
- Live regions announce decision feedback and Operational Intelligence updates.
- State is communicated with text and labels, not color alone.
- Reduced-motion preference disables nonessential scan and transition behavior.
- Mobile layouts preserve browser zoom and do not disable user scaling.
- Higher-contrast user preference receives stronger component borders.
- The first-use tutorial is contextual and dismissible.

## Known validation boundary

Source-level implementation does not equal a completed accessibility conformance audit. A formal external release should still run:

- VoiceOver and NVDA test passes;
- 200% and 400% browser zoom / text scaling checks;
- contrast measurements against deployed computed colors;
- keyboard sequence review for every modal and dynamic screen;
- orientation / reflow checks on representative devices.

## Reference criteria emphasized

- WCAG 2.2 2.5.8 Target Size (Minimum)
- 2.4.7 Focus Visible
- 1.4.11 Non-text Contrast
- reduced-motion support as a usability safeguard
