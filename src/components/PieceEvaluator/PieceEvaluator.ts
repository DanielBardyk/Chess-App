import { PieceType } from "../Board/Board";

export default class PieceEvaluator {
	private reverseForBlack(array: number[][]) {
		return [...array].reverse();
	}

	public getPieceValue(piece: PieceType, position: number) {
		let pieceValue = 0;
		if (piece.id === null) return 0;
	 
		const pawnEvalWhite = [
		  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
		  [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
		  [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
		  [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
		  [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
		  [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
		  [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
		  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
		];
		const pawnEvalBlack = this.reverseForBlack(pawnEvalWhite);
	 
		const knightEval = [
		  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
		  [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
		  [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
		  [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
		  [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
		  [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
		  [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
		  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
		];
	 
		const bishopEvalWhite = [
		  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
		  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
		  [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
		  [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
		  [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
		  [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
		  [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
		  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
		];
		const bishopEvalBlack = this.reverseForBlack(bishopEvalWhite);
	 
		const rookEvalWhite = [
		  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
		  [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
		  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
		  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
		  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
		  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
		  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
		  [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
		];
		const rookEvalBlack = this.reverseForBlack(rookEvalWhite);
	 
		const evalQueen = [
		  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
		  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
		  [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
		  [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
		  [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
		  [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
		  [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
		  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
		];
	 
		const kingEvalWhite = [
		  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		  [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
		  [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
		  [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
		  [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
		];
		const kingEvalBlack = this.reverseForBlack(kingEvalWhite);
	 
		let x = Math.floor(position / 8);
		let y = position % 8;
	 
		switch (piece.id.toLowerCase()) {
		  case "p":
			 pieceValue =
				100 +
				10 * (piece.id === "p" ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
			 break;
		  case "r":
			 pieceValue =
				525 +
				10 * (piece.id === "r" ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
			 break;
		  case "n":
			 pieceValue = 350 + 10 * knightEval[y][x];
			 break;
		  case "b":
			 pieceValue =
				350 +
				10 *
				  (piece.id === "b" ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
			 break;
		  case "q":
			 pieceValue = 1000 + 10 * evalQueen[y][x];
			 break;
		  case "k":
			 pieceValue =
				10000 +
				10 * (piece.id === "k" ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
			 break;
		  default:
			 pieceValue = 0;
			 break;
		}
		return piece.player === "b" ? pieceValue : -pieceValue;
	}
}