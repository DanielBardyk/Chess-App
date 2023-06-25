import { PieceFiller, PieceType, Queen } from "../Pieces/Pieces";

export default class Player {
	public makePossibleMove(squares: PieceType[], start: number, end: number, statePassantPos: number, passantPos: number | null = null) {
		const copySquares = [...squares];
		// рокіровка
		const isKing = copySquares[start].id === "k" || copySquares[start].id === "K";

		if (isKing && Math.abs(end - start) === 2) {
			if (end === (copySquares[start].id === "k" ? 62 : 6)) {
				copySquares[end - 1] = copySquares[end + 1];
				copySquares[end - 1].highlight = 1;
				copySquares[end + 1] = new PieceFiller();
				copySquares[end + 1].highlight = 1;
			} else if (end === (copySquares[start].id === "k" ? 58 : 2)) {
				copySquares[end + 1] = copySquares[end - 2];
				copySquares[end + 1].highlight = 1;
				copySquares[end - 2] = new PieceFiller();
				copySquares[end - 2].highlight = 1;
			}
		}

		const passant = passantPos === null ? statePassantPos : passantPos;
		if (copySquares[start].id?.toLowerCase() === "p") {
			if (end - start === -7 || end - start === 9) {
				if (start + 1 === passant)
					copySquares[start + 1] = new PieceFiller();
			} else if (end - start === -9 || end - start === 7) {
				if (start - 1 === passant)
					copySquares[start - 1] = new PieceFiller();
			}
		}

		copySquares[end] = copySquares[start];
		copySquares[end].highlight = 1;
		copySquares[start] = new PieceFiller();
		copySquares[start].highlight = 1;

		if (copySquares[end].id === "p" && end >= 0 && end <= 7) {
			copySquares[end] = new Queen("w");
			copySquares[end].highlight = 1;
		}
		if (copySquares[end].id === "P" && end >= 56 && end <= 63) {
			copySquares[end] = new Queen("b");
			copySquares[end].highlight = 1;
		}

		return copySquares;
	}
}