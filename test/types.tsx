import Sortable from '../src/index.js';
export const sample = <Sortable items={[{ id: 'one', name: 'One' }]}>{({ item, handleProps }) => <button {...handleProps}>{item.name}</button>}</Sortable>;