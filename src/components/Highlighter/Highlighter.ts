import { PieceType } from "../Board/Board";
import { King } from "../Pieces/Pieces";

export default class Highlighter {

	public highlightMate(player: "w" | "b", squares: PieceType[], check_mated: boolean, stale_mated: boolean) {
		const copySquares = [...squares];
		if (check_mated || stale_mated) {
			for (let j = 0; j < 64; j++) {
				if (copySquares[j].id === (player === "w" ? "k" : "K")) {
					const king = copySquares[j] as King;
					king.inCheck = check_mated === true ? 1 : 2;
					copySquares[j] = king;
					break;
				}
			}
		}
		return copySquares;
	}

	public highlightCheck(squares: PieceType[], turn: "w" | "b") {
		for (let j = 0; j < 64; j++) {
			if ((turn === "w" && squares[j].id === "k")
				|| (turn === "b" && squares[j].id === "K")) {
				let king = squares[j] as King;
				king.inCheck = 1;
				squares[j] = king;
				break;
			}
		}
	}

	public clearHighlight(squares: PieceType[]) {
		const copySquares = [...squares];
		for (let j = 0; j < 64; j++) {
			if (copySquares[j].highlight === 1) copySquares[j].highlight = 0;
		}
		return copySquares;
	}

	public clearPossibleMoveHighlight(squares: PieceType[]) {
		const copySquares = [...squares];
		for (let j = 0; j < 64; j++) {
			if (copySquares[j].possible === 1) copySquares[j].possible = 0;
		}
		return copySquares;
	}

	public clearCheckHighlight(squares: PieceType[], player: "w" | "b") {
    const copySquares = [...squares];
    for (let j = 0; j < 64; j++) {
        if (copySquares[j].id === (player === "w" ? "k" : "K")) {
            (copySquares[j] as King).inCheck = 0;
            break;
        }
    }
    return copySquares;
	}
}
