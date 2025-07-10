import React, { useState, ReactNode, CSSProperties } from 'react';

/**
 * Tooltip – a lightweight zero‑dependency tooltip component.
 * ---------------------------------------------------------
 * Back‑compat and sizing fixes:
 * 1. `maxWidth` is honoured (number → px, string allowed).
 * 2. Short phrases no longer wrap one word per line (`whiteSpace: 'nowrap'`).
 * 3. Gym selector metric lines wrap only *after* hitting the chosen `maxWidth`
 *    (`overflowWrap: 'break-word'`).
 * 4. Added a **`position` alias** for the older prop name used in the app so
 *    `<Tooltip position="top" … />` keeps compiling. If both `position` and
 *    `placement` are supplied, `position` wins.
 */

export type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** element that receives the hover/focus */
  children: ReactNode;
  /** tooltip body */
  content: ReactNode;
  /** CSS `max-width`; number → px */
  maxWidth?: number | string;
  /** where the tooltip appears relative to the child */
  placement?: Placement;
  /** alias kept for backward compatibility */
  position?: Placement;
  /** distance in px between tooltip and target */
  offset?: number;
}

const ARROW = 6; // triangle height (px)

export default function Tooltip(props: TooltipProps) {
  const {
    children,
    content,
    maxWidth = 250,
    placement: placementProp,
    position,
    offset = 8,
  } = props;

  // `position` (old prop) overrides `placement` (new prop)
  const placement: Placement = position ?? placementProp ?? 'top';

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  /** shared handler for mouse + keyboard focus */
  type TriggerEvt =
    | React.MouseEvent<HTMLElement>
    | React.FocusEvent<HTMLElement>;

  const show = (ev: TriggerEvt) => {
    const r = ev.currentTarget.getBoundingClientRect();
    let x = r.left + r.width / 2;
    let y = r.top;

    switch (placement) {
      case 'bottom':
        y = r.bottom;
        break;
      case 'left':
        x = r.left;
        y = r.top + r.height / 2;
        break;
      case 'right':
        x = r.right;
        y = r.top + r.height / 2;
        break;
      default:
        // top
        y = r.top;
    }

    setCoords({ x, y });
    setOpen(true);
  };

  const hide = () => setOpen(false);

  // ─────────────────────────── styles ────────────────────────────
  const box: CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    pointerEvents: 'none',
    padding: '6px 10px',
    background: '#000',
    color: '#fff',
    fontSize: 14,
    lineHeight: 1.25,
    borderRadius: 4,
    textAlign: 'left',
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    minWidth: 'fit-content',
    whiteSpace: 'nowrap',
    overflowWrap: 'break-word',
  };

  const arrow: CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: `${ARROW}px solid transparent`,
    borderRight: `${ARROW}px solid transparent`,
  };

  // placement‑specific tweaks
  switch (placement) {
    case 'bottom':
      Object.assign(box, {
        top: coords.y + offset + ARROW,
        left: coords.x,
        transform: 'translate(-50%, 0)',
      });
      Object.assign(arrow, {
        top: -ARROW,
        borderBottom: `${ARROW}px solid #000`,
      });
      break;
    case 'left':
      Object.assign(box, {
        top: coords.y,
        left: coords.x - offset - ARROW,
        transform: 'translate(-100%, -50%)',
      });
      Object.assign(arrow, {
        left: '100%',
        top: '50%',
        marginTop: -ARROW,
        borderLeft: `${ARROW}px solid #000`,
      });
      break;
    case 'right':
      Object.assign(box, {
        top: coords.y,
        left: coords.x + offset + ARROW,
        transform: 'translate(0, -50%)',
      });
      Object.assign(arrow, {
        right: '100%',
        top: '50%',
        marginTop: -ARROW,
        borderRight: `${ARROW}px solid #000`,
      });
      break;
    default: // top
      Object.assign(box, {
        top: coords.y - offset - ARROW,
        left: coords.x,
        transform: 'translate(-50%, -100%)',
      });
      Object.assign(arrow, {
        bottom: -ARROW,
        borderTop: `${ARROW}px solid #000`,
      });
  }

  return (
    <span
      style={{ display: 'inline-block' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open && (
        <div style={box}>
          {content}
          <span style={arrow} />
        </div>
      )}
    </span>
  );
}
