import { IStateBoard, PieceType } from "../Board/Board";
import { PieceFiller, Queen } from "../Pieces/Pieces";

export default class Referee {

	private goodPawn(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passantPos: number | null = null) {
		var passant = passantPos === null ? boardState.passantPos : passantPos;
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;
		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;
		const copySquares = [...squares];

		if (row_diff === 2 || row_diff === -2) {
			if (copySquares[start].player === "w" && (start < 48 || start > 55))
					return false;
			if (copySquares[start].player === "b" && (start < 8 || start > 15))
					return false;
		}
		if (copySquares[end].id !== null) {
			if (col_diff === 0) return false;
		}

		if (row_diff === 1 && col_diff === 1) {
			if (copySquares[end].id === null) {
					if (copySquares[start + 1].id !== "P" || passant !== start + 1)
						return false;
			}
		} else if (row_diff === 1 && col_diff === -1) {
			if (copySquares[end].id === null) {
					if (copySquares[start - 1].id !== "P" || passant !== start - 1)
						return false;
			}
		} else if (row_diff === -1 && col_diff === 1) {
			if (copySquares[end].id === null) {
					if (copySquares[start + 1].id !== "p" || passant !== start + 1)
						return false;
			}
		} else if (row_diff === -1 && col_diff === -1) {
			if (copySquares[end].id === null) {
					if (copySquares[start - 1].id !== "p" || passant !== start - 1)
						return false;
			}
		}

		return true;
	}

	private isMoveInvalid(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passantPos: number | null = null) {
		const copySquares: PieceType[] = [...squares];
		var bqrpk =
			copySquares[start].id?.toLowerCase() === "r" ||
			copySquares[start].id?.toLowerCase() === "q" ||
			copySquares[start].id?.toLowerCase() === "b" ||
			copySquares[start].id?.toLowerCase() === "p" ||
			copySquares[start].id?.toLowerCase() === "k";
		let invalid =
			bqrpk === true && this.blockersExist(start, end, copySquares) === true;
		if (invalid) return invalid;

		var pawn = copySquares[start].id?.toLowerCase() === "p";

		invalid =
			pawn === true &&
			this.goodPawn(start, end, copySquares, boardState, passantPos) === false;
		if (invalid) return invalid;
		var king = copySquares[start].id?.toLowerCase() === "k";
		if (king && Math.abs(end - start) === 2)
			invalid = this.isCastlingPossible(start, end, copySquares, boardState) === false;

		return invalid;
	}

	private isCastlingPossible(start: number, end: number, squares: PieceType[], boardState: IStateBoard) {
		const copySquares = [...squares];
		var player = copySquares[start].player;
		var delta_pos = end - start;
		if (start !== (player === "w" ? 60 : 4)) return false;
		if (
			(delta_pos === 2
				? copySquares[end + 1].id
				: copySquares[end - 2].id) !== (player === "w" ? "r" : "R")
		)
			return false;
		if (
			(player === "w"
				? boardState.whiteKingHasMoved
				: boardState.blackKingHasMoved) !== 0
		)
			return false;
		if (player === "w") {
			if (
				(delta_pos === 2
					? boardState.rightWhiteRookHasMoved
					: boardState.leftWhiteRookHasMoved) !== 0
			)
				return false;
		} else if (player === "b") {
			if (
				(delta_pos === 2
					? boardState.rightBlackRookHasMoved
					: boardState.leftBlackRookHasMoved) !== 0
			)
				return false;
		}

		return true;
	}

	private blockersExist(start: number, end: number, squares: PieceType[]) {
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;
		let row_diff = end_row - start_row;
		let col_diff = end_col - start_col;
		let row_ctr = 0;
		let col_ctr = 0;
		const copySquares = [...squares];

		while (col_ctr !== col_diff || row_ctr !== row_diff) {
			let position =
				64 - start_row * 8 + -8 * row_ctr + (start_col - 1 + col_ctr);
			if (
				copySquares[position].id !== null &&
				copySquares[position] !== copySquares[start]
			)
				return true;
			if (col_ctr !== col_diff) {
				if (col_diff > 0) {
					++col_ctr;
				} else {
					--col_ctr;
				}
			}
			if (row_ctr !== row_diff) {
				if (row_diff > 0) {
					++row_ctr;
				} else {
					--row_ctr;
				}
			}
		}
		return false;
	}
	
	public pieceCanMoveThere(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passantPos: number | null = null) {
		const copySquares = [...squares];
		if (start === end)
			return false;

		var player = copySquares[start].player;
		if (
			player === copySquares[end].player ||
			copySquares[start].pieceCanMove(start, end) === false
		)
			return false;

		if (this.isMoveInvalid(start, end, copySquares, boardState, passantPos) === true)
			return false;

		var cant_castle =
			copySquares[start].id === (player === "w" ? "k" : "K") &&
			Math.abs(end - start) === 2 &&
			this.inCheck(player as "w" | "b", copySquares, boardState);
		if (cant_castle) return false;


		if (
			copySquares[start].id === (player === "w" ? "k" : "K") &&
			Math.abs(end - start) === 2
		) {
			var delta_pos = end - start;
			const test_squares = [...squares];
			test_squares[start + (delta_pos === 2 ? 1 : -1)] = test_squares[start];
			test_squares[start] = new PieceFiller();
			if (this.inCheck(player as "w" | "b", test_squares, boardState)) return false;
		}

		const check_squares = [...squares];
		check_squares[end] = check_squares[start];
		check_squares[start] = new PieceFiller();
		if (check_squares[end].id === "p" && end >= 0 && end <= 7) {
			check_squares[end] = new Queen("w");
		} else if (check_squares[end].id === "P" && end >= 56 && end <= 63) {
			check_squares[end] = new Queen("b");
		}
		if (this.inCheck(player as "w" | "b", check_squares, boardState) === true) return false;

		return true;
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
		let position_of_king = -1;
		const copySquares = [...squares];
		for (let i = 0; i < 64; i++) {
			if (copySquares[i].id === king) {
					position_of_king = i;
					break;
			}
		}

		if (position_of_king === -1)
			return false;

		for (let i = 0; i < 64; i++) {
			if (copySquares[i].player !== player) {
					if (
						copySquares[i].pieceCanMove(i, position_of_king) === true &&
						this.isMoveInvalid(i, position_of_king, copySquares, boardState) === false
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

	public pieceCount(id: string, squares: PieceType[], boardState: IStateBoard) {
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