import { PieceCleaner } from "../PieceCleaner/PieceCleaner";
import { Pawn, King, Queen, Bishop, Knight, Rook, PieceFiller } from "../Pieces/Pieces"
import Label from "../Label/Label";
import { PanelType } from "./BoardManager.types";
import { IStateBoard } from "../Board/Board.types";
	
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

	public copyPanelPiece(selectedPiece: PanelType) {
		const player = selectedPiece.player as "w" | "b";
		
		if (selectedPiece.id) {
			if (selectedPiece.id.toLowerCase() === "k") return new King(player);
			else if (selectedPiece.id.toLowerCase() === "q") return new Queen(player);
			else if (selectedPiece.id.toLowerCase() === "b") return new Bishop(player);
			else if (selectedPiece.id.toLowerCase() === "n") return new Knight(player);
			else if (selectedPiece.id.toLowerCase() === "r") return new Rook(player);
			else return new Pawn(player);
		}
	}

	public createTrainingPiecesArray(player: "w" | "b") {
		const panelElements: PanelType[] = [new King(player), new Queen(player), new Rook(player), new Bishop(player), 
			new Knight(player), new Pawn(player), new PieceCleaner(player)];
			
		return panelElements;
	}
}