// Helper Functions to Handle Square Highlighting ===========
// highlight king if in checkmate/stalemate
export function highlight_mate(player: "w" | "b", squares: any[], check_mated: boolean, stale_mated: boolean) {
    const copy_squares = squares.slice();
    if (check_mated || stale_mated) {
        for (let j = 0; j < 64; j++) {
            if (copy_squares[j].ascii === (player === "w" ? "k" : "K")) {
                copy_squares[j].checked = check_mated === true ? 1 : 2;
                break;
            }
        }
    }
    return copy_squares;
}
// clear highlights for squares that are selected
export function clear_highlight(squares: any[]) {
    const copy_squares = squares.slice();
    for (let j = 0; j < 64; j++) {
        if (copy_squares[j].highlight === 1) copy_squares[j].highlight = 0;
    }
    return copy_squares;
}
// clear highlights for possible destination squares
export function clear_possible_highlight(squares: any[]) {
    const copy_squares = squares.slice();
    for (let j = 0; j < 64; j++) {
        if (copy_squares[j].possible === 1) copy_squares[j].possible = 0;
    }
    return copy_squares;
}
// clear the red higlight for checked king
export function clear_check_highlight(squares: any[], player: "w" | "b") {
    const copy_squares = squares.slice();
    for (let j = 0; j < 64; j++) {
        if (copy_squares[j].ascii === (player === "w" ? "k" : "K")) {
            copy_squares[j].in_check = 0; // user has heeded warning
            break;
        }
    }
    return copy_squares;
}
