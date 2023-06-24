import { IStateBoard, PieceType } from "../Board/Board";
import { PieceCleaner } from "../PieceCleaner/PieceCleaner";
import { Pawn, King, Queen, Bishop, Knight, Rook, PieceFiller } from "../Pieces/Pieces"
import Label from "../Label/Label";

export type PanelType = King | Queen | Bishop | Knight | Rook | PieceCleaner

export default class BoardManager {

	public initializeEmptyBoard() {
		const squares = Array(64).fill(null);
		for (let i = 0; i < 64; i++) {
			squares[i] = new PieceFiller();
		}
		return squares;
	}

	public initializeBoard() {
		const squares = Array(64).fill(null);

		for (let i = 8; i < 16; i++) {
			squares[i] = new Pawn("b");
		}

		for (let i = 8 * 6; i < 8 * 6 + 8; i++) {
			squares[i] = new Pawn("w");
		}

		squares[3] = new Queen("b");
		squares[4] = new King("b");

		squares[56 + 3] = new Queen("w");
		squares[56 + 4] = new King("w");

		squares[2] = new Bishop("b");
		squares[5] = new Bishop("b");

		squares[56 + 2] = new Bishop("w");
		squares[56 + 5] = new Bishop("w");

		squares[1] = new Knight("b");
		squares[6] = new Knight("b");

		squares[56 + 1] = new Knight("w");
		squares[56 + 6] = new Knight("w");

		squares[0] = new Rook("b");
		squares[7] = new Rook("b");

		squares[56 + 0] = new Rook("w");
		squares[56 + 7] = new Rook("w");

		for (let i = 0; i < 64; i++) {
			if (squares[i] == null) squares[i] = new PieceFiller();
		}

		return squares;
	}

	public generateLabels(boardState: IStateBoard) {
		const rowNums = Array.from({ length: 8 }, (_, i) => {
		  const value = 8 - i;
		  return (
			 <Label
				key={i} 
				value={value} 
				size={boardState.piecesSelection ? "label_piece_selection" : "label"} 
			 />
		  );
		});
	 
		const colLetters = Array.from({ length: 8 }, (_, i) => {
		  const letter = String.fromCharCode(65 + i);
		  return (
			 <Label
				key={letter}
				value={letter}
				size={boardState.piecesSelection ? "label_piece_selection" : "label"}
			 />
		  );
		});
	 
		return {
			rowNums,
			colLetters
		};
	}

	public createTrainingPiecesArray(player: "w" | "b") {
		const panelElements: PanelType[] = [new King(player), new Queen(player), new Rook(player), new Bishop(player), 
			new Knight(player), new Pawn(player), new PieceCleaner(player)];
			
		return panelElements;
	}

	private isEven(value: number) {
		return value % 2;
	}

	public calcSquareColor(i: number, j: number, squares: PieceType[]) {
		let squareColor =
			(this.isEven(i) && this.isEven(j)) || (!this.isEven(i) && !this.isEven(j))
			? "white_square"
			: "black_square";
		if (squares[i * 8 + j].highlight === 1) {
			squareColor =
			(this.isEven(i) && this.isEven(j)) || (!this.isEven(i) && !this.isEven(j))
				? "selected_white_square"
				: "selected_black_square";
		}
		if (squares[i * 8 + j].possible === 1) {
			squareColor =
			(this.isEven(i) && this.isEven(j)) || (!this.isEven(i) && !this.isEven(j))
				? "highlighted_white_square"
				: "highlighted_black_square";
		}
		if (
			squares[i * 8 + j].id != null &&
			(squares[i * 8 + j].id as string).toLowerCase() === "k"
		) {
			if ((squares[i * 8 + j] as King).inCheck === 1) {
			squareColor =
				(this.isEven(i) && this.isEven(j)) || (!this.isEven(i) && !this.isEven(j))
					? "in_check_square_white"
					: "in_check_square_black";
			}
			if ((squares[i * 8 + j] as King).checked >= 1) {
				squareColor = (squares[i * 8 + j] as King).checked === 1 ? "checked_square" : "stale_square";
			}
		}
		return squareColor;
	}

	public calcColorTrainingPiece(piece: PanelType, boardState: IStateBoard) {
		if(boardState.selectedPiece === piece) {
			return "selected_white_square "
		} else {
			return "training_piece_square "
		}
	}
}