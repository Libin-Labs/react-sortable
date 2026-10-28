# @lp-labs/react-sortable

Pointer/touch and keyboard sortable lists. React 18+ peer only; no runtime drag-and-drop framework, CSS import or icon dependency. TypeScript, ESM, CommonJS and browser entries included.

## Installation

```sh
npm install @lp-labs/react-sortable
```

Requires React 18 or later in the host application. Pointer dragging requires a browser with Pointer Events; keyboard sorting is also supported. Server-side rendering is supported. Node.js consumers require Node.js 18 or later.

## Quick Start

```jsx
import { useState } from 'react';
import Sortable from '@lp-labs/react-sortable';

export default function Example() {
  const [items, setItems] = useState([
    { id: 'first', name: 'First task' },
    { id: 'second', name: 'Second task' },
    { id: 'third', name: 'Third task' },
  ]);

  return (
    <Sortable items={items} onChange={setItems}>
      {({ item, handleProps }) => (
        <>
          <button {...handleProps} title={`Move ${item.name}`}>Move</button>
          <span>{item.name}</span>
        </>
      )}
    </Sortable>
  );
}
```

## Items And Renderers

Use controlled `items`/`onChange` or `defaultItems`. `getId(item)` defaults to `item.id` or the primitive item; IDs must be unique nonempty strings or finite numbers. Custom renderers receive `{item,index,dragging,handleProps}`; spread all handle props, including its ref and touch-action style, onto a button. `getLabel` supplies accessible labels. Without a renderer, each item is its own labeled button.

## Sortable API

| Prop | Default | Description |
| --- | --- | --- |
| `items` / `defaultItems` | `[]` | Controlled or initial item order |
| `getId(item)` | `item.id` or primitive item | Stable unique item identifier |
| `getLabel(item)` | label, name, or ID | Accessible item label |
| `onChange(items, { id, from, to })` | none | Committed reorder; indices are zero-based |
| `direction` | `'vertical'` | `'vertical'` or `'horizontal'` |
| `disabled` | `false` | Disable all sorting |
| `disabledIds` | `[]` | Items that cannot be grabbed or targeted |
| `onDragStart(id)` | none | Pickup notification |
| `onDragEnd({ id, from, to })` | none | Completed drop, even if the order is unchanged |
| `onDragCancel(id)` | none | Canceled interaction |
| `label` | `'Sortable list'` | Accessible list label |

`className`, `style`, and `itemStyle` customize the wrapper and rows. Only `onChange` commits a changed order; preview reorders remain local while dragging. Apply `onChange` when supplying controlled `items`. Escape, pointer cancellation, window blur, changed item arrays or disabling the list cancels the draft. `defaultItems` initializes internal state only.

## Keyboard And Pointer Controls

Space/Enter picks up and drops an item; arrows move it along the list's axis; Home/End jump; Escape cancels. Position changes are announced through a live region. Disabled IDs cannot be grabbed or targeted, although their positions can shift when other items move past them. Pointer targets use the nearest row center. Keep IDs and controlled arrays stable during a drag.

## Helpers And Limits

`arrayMove(items, from, to)` returns a reordered array without mutating the input. Indices must refer to existing items; an unchanged move returns the original array.

This is an in-place list sorter, not a general drag-and-drop engine. No cross-list drops, virtualization, drag ghost/portal, automatic edge scrolling, nested-grid collision engine, RTL keyboard inversion or animation is provided. Touch scrolling is suppressed on the handle only. Keep the handle separate from other interactive content.

## Support

Support maintenance with a [PayPal donation](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).