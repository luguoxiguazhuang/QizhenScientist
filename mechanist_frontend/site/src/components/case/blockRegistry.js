import Prose from './blocks/Prose.jsx'
import TableBlock from './blocks/TableBlock.jsx'
import Callout from './blocks/Callout.jsx'
import Figure from './blocks/Figure.jsx'
import FigureGrid from './blocks/FigureGrid.jsx'
import Arms from './blocks/Arms.jsx'
import RunSheet from './blocks/RunSheet.jsx'

/* Type to component. A map rather than a switch inside the renderer, so
   adding a block type is one import and one line, and so nothing in
   CaseSections.jsx has to know what the types are.

   `chapter` is deliberately absent: consecutive chapters are collected into a
   single numbered list by the renderer before dispatch, and that list is not
   addressable one block at a time. */
const BLOCKS = {
  prose: Prose,
  table: TableBlock,
  callout: Callout,
  figure: Figure,
  figureGrid: FigureGrid,
  arms: Arms,
  runSheet: RunSheet,
}

export default BLOCKS
