import type { ButtonHTMLAttributes, CSSProperties, ReactElement, ReactNode, Ref } from 'react';
export type ItemId = string | number;
export interface Reorder { id: ItemId; from: number; to: number }
export interface SortableProps<T> { items?: readonly T[]; defaultItems?: readonly T[]; getId?: (item: T) => ItemId; onChange?: (items: T[], change: Reorder) => void; children?: (props: { item: T; index: number; dragging: boolean; handleProps: ButtonHTMLAttributes<HTMLButtonElement> & { ref: Ref<HTMLButtonElement> } }) => ReactNode; direction?: 'vertical' | 'horizontal'; disabled?: boolean; disabledIds?: readonly ItemId[]; onDragStart?: (id: ItemId) => void; onDragEnd?: (change: Reorder) => void; onDragCancel?: (id: ItemId) => void; label?: string; getLabel?: (item: T) => string; className?: string; style?: CSSProperties; itemStyle?: CSSProperties }
export function Sortable<T = { id: ItemId; name?: string }>(props: SortableProps<T>): ReactElement;
export default Sortable;
export function arrayMove<T>(items: readonly T[], from: number, to: number): readonly T[];