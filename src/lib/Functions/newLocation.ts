import { Location, GridColumn, GridRow } from "../../core";

// just a helper, much quicker than newLocation()!
// 只是一个辅助函数，比newLocation()更快！
export const newLocation = (row: GridRow, column: GridColumn): Location => ({
  row,
  column,
});