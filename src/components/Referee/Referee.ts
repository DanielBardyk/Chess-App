import { IStateBoard } from "../Board/Board.types";
import { PieceFiller, PieceType, Queen } from "../Pieces/Pieces";

export default class Referee {
	private goodPawn(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passantPos: number | null = null) {
		const passant = passantPos === null ? boardState.passantPos : passantPos;
		const startRow = 8 - Math.floor(start / 8);
		const startCol = (start % 8) + 1;
		const endRow = 8 - Math.floor(end / 8);
		const endCol = (end % 8) + 1;
		const rowDiff = endRow - startRow;
		const colDiff = endCol - startCol;
		const copySquares = [...squares];

		if (rowDiff === 2 || rowDiff === -2) {
			if (copySquares[start].player === "w" && (start < 48 || start > 55))
					return false;
			if (copySquares[start].player === "b" && (start < 8 || start > 15))
					return false;
		}
		if (copySquares[end].id !== null) {
			if (colDiff === 0) return false;
		}

		if (rowDiff === 1 && colDiff === 1) {
			if (copySquares[end].id === null) {
					if (copySquares[start + 1].id !== "P" || passant !== start + 1)
						return false;
			}
		} else if (rowDiff === 1 && colDiff === -1) {
			if (copySquares[end].id === null) {
					if (copySquares[start - 1].id !== "P" || passant !== start - 1)
						return false;
			}
		} else if (rowDiff === -1 && colDiff === 1) {
			if (copySquares[end].id === null) {
					if (copySquares[start + 1].id !== "p" || passant !== start + 1)
						return false;
			}
		} else if (rowDiff === -1 && colDiff === -1) {
			if (copySquares[end].id === null) {
					if (copySquares[start - 1].id !== "p" || passant !== start - 1)
						return false;
			}
		}

		return true;
	}

	private isMoveInvalid(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passantPos: number | null = null) {
		const copySquares: PieceType[] = [...squares];
		const bqrpk =
			copySquares[start].id?.toLowerCase() === "r" ||
			copySquares[start].id?.toLowerCase() === "q" ||
			copySquares[start].id?.toLowerCase() === "b" ||
			copySquares[start].id?.toLowerCase() === "p" ||
			copySquares[start].id?.toLowerCase() === "k";
		let invalid =
			bqrpk === true && this.blockersExist(start, end, copySquares) === true;
		if (invalid) return invalid;

		const pawn = copySquares[start].id?.toLowerCase() === "p";

		invalid =
			pawn === true &&
			this.goodPawn(start, end, copySquares, boardState, passantPos) === false;
		if (invalid) return invalid;
		const king = copySquares[start].id?.toLowerCase() === "k";
		if (king && Math.abs(end - start) === 2)
			invalid = this.isCastlingPossible(start, end, copySquares, boardState) === false;

		return invalid;
	}

	private isCastlingPossible(start: number, end: number, squares: PieceType[], boardState: IStateBoard) {
		const copySquares = [...squares];
		const player = copySquares[start].player;
		const deltaPos = end - start;
		if (start !== (player === "w" ? 60 : 4)) return false;
		if (
			(deltaPos === 2
				? copySquares[end + 1].id
				: copySquares[end - 2].id) !== (player === "w" ? "r" : "R")
		)
			return false;
		if (player === "w" ? boardState.whiteKingHasMoved : boardState.blackKingHasMoved) {
			return false;
		}
		if (player === "w") {
			if (deltaPos === 2 ? boardState.rightWhiteRookHasMoved : boardState.leftWhiteRookHasMoved) {
				return false;
			}
		} else if (player === "b") {
			if (deltaPos === 2 ? boardState.rightBlackRookHasMoved : boardState.leftBlackRookHasMoved) {
				return false;
			}
		}
		return true;
	}

	private blockersExist(start: number, end: number, squares: PieceType[]) {
		const startRow = 8 - Math.floor(start / 8);
		const startCol = (start % 8) + 1;
		const endRow = 8 - Math.floor(end / 8);
		const endCol = (end % 8) + 1;
		const rowDiff = endRow - startRow;
		const colDiff = endCol - startCol;
		let rowCtr = 0;
		let colCtr = 0;
		const copySquares = [...squares];

		while (colCtr !== colDiff || rowCtr !== rowDiff) {
			let position =
				64 - startRow * 8 + -8 * rowCtr + (startCol - 1 + colCtr);
			if (
				copySquares[position].id !== null &&
				copySquares[position] !== copySquares[start]
			)
				return true;
			if (colCtr !== colDiff) {
				if (colDiff > 0) {
					++colCtr;
				} else {
					--colCtr;
				}
			}
			if (rowCtr !== rowDiff) {
				if (rowDiff > 0) {
					++rowCtr;
				} else {
					--rowCtr;
				}
			}
		}
		return false;
	}
	
	public pieceCanMoveThere(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passantPos: number | null = null) {
		const copySquares = [...squares];
		if (start === end)
			return false;

		const player = copySquares[start].player;
		if (
			player === copySquares[end].player ||
			copySquares[start].pieceCanMove(start, end) === false
		)
			return false;

		if (this.isMoveInvalid(start, end, copySquares, boardState, passantPos) === true)
			return false;

		const cantCastle =
			copySquares[start].id === (player === "w" ? "k" : "K") &&
			Math.abs(end - start) === 2 &&
			this.inCheck(player as "w" | "b", copySquares, boardState);
		if (cantCastle) return false;


		if (
			copySquares[start].id === (player === "w" ? "k" : "K") &&
			Math.abs(end - start) === 2
		) {
			const deltaPos = end - start;
			const testSquares = [...squares];
			testSquares[start + (deltaPos === 2 ? 1 : -1)] = testSquares[start];
			testSquares[start] = new PieceFiller();
			if (this.inCheck(player as "w" | "b", testSquares, boardState)) return false;
		}

		const checkSquares = [...squares];
		checkSquares[end] = checkSquares[start];
		checkSquares[start] = new PieceFiller();
		if (checkSquares[end].id === "p" && end >= 0 && end <= 7) {
			checkSquares[end] = new Queen("w");
		} else if (checkSquares[end].id === "P" && end >= 56 && end <= 63) {
			checkSquares[end] = new Queen("b");
		}
		if (this.inCheck(player as "w" | "b", checkSquares, boardState) === true) return false;

		return true;
	}

	public checkMoveForPassant(player: "w" | "b", squares: PieceType[], start: number, end: number) {
		const passantTrue =
			 player === "w"
				? squares[end].id === "p" && start >= 48 && start <= 55 && end - start === -16
				: squares[end].id === "P" && start >= 8 && start <= 15 && end - start === 16;
		return passantTrue ? end : 65;
	}

	public checkForMateStatus(squares: PieceType[], player: "w" | "b", boardState: IStateBoard) {
		const checkMated =
			this.checkmate("w", squares, boardState) || this.checkmate("b", squares, boardState);
		const staleMated =
			(this.stalemate("w", squares, boardState) && player === "b") ||
			(this.stalemate("b", squares, boardState) && player === "w");
		return { checkMated, staleMated };
	}

	public stalemate(player: "w" | "b", squares: PieceType[], boardState: IStateBoard) {
		if (this.inCheck(player, squares, boardState)) return false;

		for (let i = 0; i < 64; i++) {
			if (squares[i].player === player) {
				for (let j = 0; j < 64; j++) {
					if (this.pieceCanMoveThere(i, j, squares, boardState)) return false;
				}
			}
		}
		return true;
	}
	
	public checkmate(player: "w" | "b", squares: PieceType[], boardState: IStateBoard) {
		if (!this.inCheck(player, squares, boardState)) return false;
		for (let i = 0; i < 64; i++) {
			if (squares[i].player === player) {
				for (let j = 0; j < 64; j++) {
					if (this.pieceCanMoveThere(i, j, squares, boardState)) return false;
				}
			}
		}
		return true;
	}

	public inCheck(player: "w" | "b", squares: PieceType[], boardState: IStateBoard) {
		let king = player === "w" ? "k" : "K";
		let positionOfKing = -1;
		const copySquares = [...squares];
		for (let i = 0; i < 64; i++) {
			if (copySquares[i].id === king) {
					positionOfKing = i;
					break;
			}
		}

		if (positionOfKing === -1)
			return false;

		for (let i = 0; i < 64; i++) {
			if (copySquares[i].player !== player) {
					if (
						copySquares[i].pieceCanMove(i, positionOfKing) === true &&
						this.isMoveInvalid(i, positionOfKing, copySquares, boardState) === false
					)
						return true;
			}
		}
		return false;
	}

	public kingSettedCorrectly(squares: PieceType[], index: number) {
		const numbers: number[] = [1, 7, 8, 9];

		for (let num of numbers) {
			if (index+num > 64 || index-num < 0) {
				continue;
			}

			if(squares[index+num]?.id?.toLowerCase() === "k"
				|| squares[index-num]?.id?.toLowerCase() === "k")
			{
				return false
			}
		}
		return true
	}

	public boardHasTwoKings(squares: PieceType[]) {
		const kings = squares.filter(s => s.id?.toLowerCase() === "k");
		if (kings.length === 2) return true
		else return false
	}

	public isPieceNumValid(square: PieceType[], boardState: IStateBoard) {
		return (
			this.pieceCount("q", square, boardState) < 9 && 
			this.pieceCount("b", square, boardState) < 10 && 
			this.pieceCount("n", square, boardState) < 10 && 
			this.pieceCount("r", square, boardState) < 10 && 
			this.pieceCount("p", square, boardState) < 8
		)
	}

	private pieceCount(id: string, squares: PieceType[], boardState: IStateBoard) {
		return (
			squares.filter(
				(p) => 
					p.id?.toLowerCase() === id && 
					p.player === boardState.selectedPiece?.player && 
					p.id === boardState.selectedPiece.id
				).length
		);
	}
}