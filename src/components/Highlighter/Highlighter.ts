import { PieceType } from "../Board/Board";
import { King } from "../Pieces/Pieces";

export default class Highlighter {

	public highlightMate(player: "w" | "b", squares: PieceType[], check_mated: boolean, stale_mated: boolean) {
		const copy_squares = [...squares];
		if (check_mated || stale_mated) {
			for (let j = 0; j < 64; j++) {
				if (copy_squares[j].id === (player === "w" ? "k" : "K")) {
					const king = copy_squares[j] as King;
					king.inCheck = check_mated === true ? 1 : 2;
					copy_squares[j] = king;
					break;
				}
			}
		}
		return copy_squares;
	}

	public clearHighlight(squares: PieceType[]) {
		const copy_squares = [...squares];
		for (let j = 0; j < 64; j++) {
			if (copy_squares[j].highlight === 1) copy_squares[j].highlight = 0;
		}
		return copy_squares;
	}

	public clearPossibleMoveHighlight(squares: PieceType[]) {
		const copy_squares = [...squares];
		for (let j = 0; j < 64; j++) {
			if (copy_squares[j].possible === 1) copy_squares[j].possible = 0;
		}
		return copy_squares;
	}

	public clearCheckHighlight(squares: PieceType[], player: "w" | "b") {
    const copy_squares = [...squares];
    for (let j = 0; j < 64; j++) {
        if (copy_squares[j].id === (player === "w" ? "k" : "K")) {
            (copy_squares[j] as King).inCheck = 0;
            break;
        }
    }
    return copy_squares;
	}
}
