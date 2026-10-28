'use client';
import { createElement, useEffect, useId, useRef, useState } from 'react';

export function arrayMove(items, from, to) {
  if (![from, to].every((index) => Number.isSafeInteger(index) && index >= 0 && index < items.length)) throw new RangeError('Move indices must refer to existing items.');
  if (from === to) return items;
  const next = items.slice(); const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
}
const defaultId = (item) => typeof item === 'object' && item !== null ? item.id : item;

export function Sortable({ items: controlledItems, defaultItems = [], getId = defaultId, onChange, children,
  direction = 'vertical', disabled = false, disabledIds = [], onDragStart, onDragEnd, onDragCancel,
  label = 'Sortable list', getLabel = (item) => String(item?.label ?? item?.name ?? defaultId(item)), className, style, itemStyle,
}) {
  if (!['vertical', 'horizontal'].includes(direction)) throw new TypeError('direction must be vertical or horizontal.');
  const [internalItems, setItems] = useState(defaultItems);
  const items = controlledItems ?? internalItems;
  const ids = items.map(getId);
  if (ids.some((id) => !['string', 'number'].includes(typeof id) || id === '' || (typeof id === 'number' && !Number.isFinite(id))) || new Set(ids).size !== ids.length) throw new TypeError('Items require unique nonempty string or finite numeric ids.');
  const blocked = new Set(disabledIds);
  const rows = useRef(new Map());
  const handles = useRef(new Map());
  const session = useRef(null);
  const [draft, setDraft] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [announcement, announce] = useState('');
  const helpId = useId();
  const current = draft ?? items;

  function finish(cancelled) {
    const active = session.current;
    if (!active) return;
    session.current = null;
    const to = active.draft.findIndex((item) => getId(item) === active.id);
    if (!cancelled && active.from !== to) {
      if (controlledItems === undefined) setItems(active.draft);
      onChange?.(active.draft, { id: active.id, from: active.from, to });
    }
    setDraft(null); setDraggingId(null);
    announce(cancelled ? 'Reorder canceled' : `Dropped at position ${to + 1}`);
    if (cancelled) onDragCancel?.(active.id);
    else onDragEnd?.({ id: active.id, from: active.from, to });
    handles.current.get(active.id)?.focus({ preventScroll: true });
  }

  function start(item, index, mode, pointerId) {
    const id = getId(item);
    if (disabled || blocked.has(id) || session.current) return;
    session.current = { id, from: index, draft: items.slice(), source: items, mode, pointerId };
    setDraft(items.slice()); setDraggingId(id); announce(`Picked up ${getLabel(item)}, position ${index + 1}`); onDragStart?.(id);
  }

  function moveTo(index) {
    const active = session.current;
    if (!active || !Number.isSafeInteger(index) || index < 0 || index >= active.draft.length || blocked.has(getId(active.draft[index]))) return;
    const from = active.draft.findIndex((item) => getId(item) === active.id);
    active.draft = arrayMove(active.draft, from, index);
    setDraft(active.draft); announce(`Moved to position ${index + 1}`);
  }

  useEffect(() => {
    if (session.current && (disabled || session.current.source !== items)) finish(true);
  }, [items, disabled]);

  useEffect(() => {
    if (draggingId === null) return;
    const pointerMove = (event) => {
      const active = session.current;
      if (!active || active.mode !== 'pointer' || event.pointerId !== active.pointerId) return;
      event.preventDefault();
      let closest = -1; let distance = Infinity;
      active.draft.forEach((item, index) => {
        const id = getId(item); const row = rows.current.get(id);
        if (!row || blocked.has(id)) return;
        const rect = row.getBoundingClientRect();
        const center = direction === 'vertical' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
        const next = Math.abs((direction === 'vertical' ? event.clientY : event.clientX) - center);
        if (next < distance) { distance = next; closest = index; }
      });
      moveTo(closest);
    };
    const pointerEnd = (event) => { if (session.current?.mode === 'pointer' && event.pointerId === session.current.pointerId) finish(event.type === 'pointercancel'); };
    const escape = (event) => { if (event.key === 'Escape') { event.preventDefault(); finish(true); } };
    const blur = () => finish(true);
    document.addEventListener('pointermove', pointerMove, { passive: false }); document.addEventListener('pointerup', pointerEnd); document.addEventListener('pointercancel', pointerEnd); document.addEventListener('keydown', escape); window.addEventListener('blur', blur);
    return () => { document.removeEventListener('pointermove', pointerMove); document.removeEventListener('pointerup', pointerEnd); document.removeEventListener('pointercancel', pointerEnd); document.removeEventListener('keydown', escape); window.removeEventListener('blur', blur); };
  }, [draggingId, direction, disabledIds, getId, items]);

  function handleKey(event, item, index) {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); if (session.current) finish(false); else start(item, index, 'keyboard'); return; }
    const active = session.current;
    if (!active || active.mode !== 'keyboard') return;
    const step = direction === 'vertical' ? { ArrowDown: 1, ArrowUp: -1 } : { ArrowRight: 1, ArrowLeft: -1 };
    if (step[event.key]) {
      event.preventDefault(); let next = index + step[event.key];
      while (next >= 0 && next < current.length && blocked.has(getId(current[next]))) next += step[event.key];
      moveTo(next);
    }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); const candidates = current.map((entry, position) => ({ entry, position })).filter(({ entry }) => !blocked.has(getId(entry))); moveTo(event.key === 'Home' ? candidates[0]?.position : candidates.at(-1)?.position); }
  }
  const content = current.map((item, index) => {
    const id = getId(item); const dragging = id === draggingId;
    const handleProps = { type: 'button', ref: (node) => { if (node) handles.current.set(id, node); else handles.current.delete(id); }, disabled: disabled || blocked.has(id), 'aria-label': `Move ${getLabel(item)}`, 'aria-pressed': dragging, 'aria-describedby': helpId,
      onPointerDown: (event) => { if (event.button !== 0 || event.isPrimary === false) return; event.preventDefault(); event.currentTarget.focus(); start(item, index, 'pointer', event.pointerId); },
      onKeyDown: (event) => handleKey(event, item, index), style: { cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' },
    };
    return createElement('div', { key: `${typeof id}:${id}`, role: 'listitem', ref: (node) => { if (node) rows.current.set(id, node); else rows.current.delete(id); }, 'data-dragging': dragging || undefined,
      style: { display: 'flex', alignItems: 'center', gap: 8, padding: 8, border: '1px solid #d5d9de', outline: dragging ? '2px solid Highlight' : undefined, minWidth: 0, boxSizing: 'border-box', ...itemStyle },
    }, children ? children({ item, index, dragging, handleProps }) : createElement('button', handleProps, getLabel(item)));
  });
  const hidden = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' };
  return createElement('div', { className, style: { position: 'relative', letterSpacing: 0, ...style } },
    createElement('div', { role: 'list', 'aria-label': label, style: { display: 'flex', flexDirection: direction === 'vertical' ? 'column' : 'row', gap: 6, overflow: 'auto' } }, content),
    createElement('span', { id: helpId, style: hidden }, 'Press Space to pick up, arrow keys to move, Space to drop, or Escape to cancel.'),
    createElement('span', { role: 'status', 'aria-live': 'polite', style: hidden }, announcement));
}
export default Sortable;