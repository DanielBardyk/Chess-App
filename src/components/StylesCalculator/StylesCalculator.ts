import { IStateBoard } from "../Board/BoardTypes";
import { PanelType } from "../BoardManager/BoardManager.types";
import { King, PieceType } from "../Pieces/Pieces";

export default class StylesCalculator {
	public calcSquareColor(i: number, j: number, squares: PieceType[]) {
		let squareColor =
			(this.isEven(i) && this.isEven(j)) || (!this.isEven(i) && !this.isEven(j))
			? "white_square"
			: "black_square";

		if (squares[i * 8 + j].highlight === 1 || squares[i * 8 + j].possible === 1) {
			squareColor = "highlighted_square";
		}

		if (
			squares[i * 8 + j].id != null &&
			(squares[i * 8 + j].id as string).toLowerCase() === "k"
		) {
			if ((squares[i * 8 + j] as King).inCheck === 1) {
				squareColor = "in_check_square";
			}
			if ((squares[i * 8 + j] as King).checked >= 1) {
				squareColor = (squares[i * 8 + j] as King).checked === 1 ? "check_mate_square" : "stale_square";
			}
		}
		return squareColor;
	}

	public calcColorTrainingPiece(piece: PanelType, boardState: IStateBoard) {
		if(boardState.selectedPiece === piece) {
			return "selected_square "
		} else {
			return "training_piece_square "
		}
	}

	public calcSquareCorner(i: number, j: number) {
		if (i === 0 && j === 0) return " top_left_square ";
		if (i === 0 && j === 7) return " top_right_square ";
		if (i === 7 && j === 0) return " bottom_left_square ";
		if (i === 7 && j === 7) return " bottom_right_square ";
		return " ";
	}

	public calcSquareCursor(i: number, j: number, copySquares: PieceType[], boardState: IStateBoard) {
		let squareCursor = (boardState.turn === copySquares[i * 8 + j].player && !boardState.botRunning) ? "pointer_cursor" : "default_cursor";
		if (boardState.botRunning && !boardState.mated) squareCursor = "default_cursor";
		if (boardState.mated) squareCursor = "default_cursor";
		if(boardState.piecesSelection) squareCursor = "pointer_cursor";

		return squareCursor;
	}

	public calcPanelSquareCorner(i: number, player: "w" | "b") {
		if (i === 0 && player === "w") return " bottom_left_square ";
			else if (i === 6 && player === "w") return " bottom_right_square ";
			else if (i === 0 && player === "b") return " top_left_square ";
			else if (i === 6 && player === "b") return " top_right_square ";
			else return " "
	}

	private isEven(value: number) {
		return value % 2;
	}
}