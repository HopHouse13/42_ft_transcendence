import type { Cell, ServerCell } from "../types/gameTypes";

export function toServCell(cell: Cell): ServerCell {
    if (cell)
        return cell;
    return ('EMPTY');
}

export function toClientCell(cell: ServerCell): Cell {
    if (cell === 'EMPTY')
        return null;
    return (cell);
}