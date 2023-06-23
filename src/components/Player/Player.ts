import { PieceType } from "../Board/Board";
import { PieceFiller, Queen } from "../Pieces/Pieces";

export default class Player {

	public makePossibleMove(squares: PieceType[], start: number, end: number, statePassantPos: number, passantPos: number | null = null) {
		const copy_squares = [...squares];
		// рокіровка
		var isKing =
			copy_squares[start].id === "k" || copy_squares[start].id === "K";

		if (isKing && Math.abs(end - start) === 2) {
			if (end === (copy_squares[start].id === "k" ? 62 : 6)) {
				copy_squares[end - 1] = copy_squares[end + 1];
				copy_squares[end - 1].highlight = 1;
				copy_squares[end + 1] = new PieceFiller();
				copy_squares[end + 1].highlight = 1;
			} else if (end === (copy_squares[start].id === "k" ? 58 : 2)) {
				copy_squares[end + 1] = copy_squares[end - 2];
				copy_squares[end + 1].highlight = 1;
				copy_squares[end - 2] = new PieceFiller();
				copy_squares[end - 2].highlight = 1;
			}
		}

		var passant = passantPos === null ? statePassantPos : passantPos;
		if (copy_squares[start].id?.toLowerCase() === "p") {
			if (end - start === -7 || end - start === 9) {
				if (start + 1 === passant)
					copy_squares[start + 1] = new PieceFiller();
			} else if (end - start === -9 || end - start === 7) {
				if (start - 1 === passant)
					copy_squares[start - 1] = new PieceFiller();
			}
		}

		copy_squares[end] = copy_squares[start];
		copy_squares[end].highlight = 1;
		copy_squares[start] = new PieceFiller();
		copy_squares[start].highlight = 1;

		if (copy_squares[end].id === "p" && end >= 0 && end <= 7) {
			copy_squares[end] = new Queen("w");
			copy_squares[end].highlight = 1;
		}
		if (copy_squares[end].id === "P" && end >= 56 && end <= 63) {
			copy_squares[end] = new Queen("b");
			copy_squares[end].highlight = 1;
		}

		return copy_squares;
	}
}