import { IStateBoard, PieceType } from "../Board/Board";
import { PieceFiller, Queen } from "../Pieces/Pieces";

export default class Referee {

	private goodPawn(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passant_pos: number | null = null) {
		var passant = passant_pos === null ? boardState.passant_pos : passant_pos;
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;
		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;
		const copy_squares = squares.slice();

		if (row_diff === 2 || row_diff === -2) {
			if (copy_squares[start].player === "w" && (start < 48 || start > 55))
					return false;
			if (copy_squares[start].player === "b" && (start < 8 || start > 15))
					return false;
		}
		if (copy_squares[end].id !== null) {
			if (col_diff === 0) return false;
		}

		if (row_diff === 1 && col_diff === 1) {
			if (copy_squares[end].id === null) {
					if (copy_squares[start + 1].id !== "P" || passant !== start + 1)
						return false;
			}
		} else if (row_diff === 1 && col_diff === -1) {
			if (copy_squares[end].id === null) {
					if (copy_squares[start - 1].id !== "P" || passant !== start - 1)
						return false;
			}
		} else if (row_diff === -1 && col_diff === 1) {
			if (copy_squares[end].id === null) {
					if (copy_squares[start + 1].id !== "p" || passant !== start + 1)
						return false;
			}
		} else if (row_diff === -1 && col_diff === -1) {
			if (copy_squares[end].id === null) {
					if (copy_squares[start - 1].id !== "p" || passant !== start - 1)
						return false;
			}
		}

		return true;
	}

	private isMoveInvalid(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passant_pos: number | null = null) {
		const copy_squares: PieceType[] = squares.slice();
		var bqrpk =
			copy_squares[start].id?.toLowerCase() === "r" ||
			copy_squares[start].id?.toLowerCase() === "q" ||
			copy_squares[start].id?.toLowerCase() === "b" ||
			copy_squares[start].id?.toLowerCase() === "p" ||
			copy_squares[start].id?.toLowerCase() === "k";
		let invalid =
			bqrpk === true && this.blockersExist(start, end, copy_squares) === true;
		if (invalid) return invalid;

		var pawn = copy_squares[start].id?.toLowerCase() === "p";

		invalid =
			pawn === true &&
			this.goodPawn(start, end, copy_squares, boardState, passant_pos) === false;
		if (invalid) return invalid;
		var king = copy_squares[start].id?.toLowerCase() === "k";
		if (king && Math.abs(end - start) === 2)
			invalid = this.isCastlingPossible(start, end, copy_squares, boardState) === false;

		return invalid;
	}

	private isCastlingPossible(start: number, end: number, squares: PieceType[], boardState: IStateBoard) {
		const copy_squares = squares.slice();
		var player = copy_squares[start].player;
		var delta_pos = end - start;
		if (start !== (player === "w" ? 60 : 4)) return false;
		if (
			(delta_pos === 2
				? copy_squares[end + 1].id
				: copy_squares[end - 2].id) !== (player === "w" ? "r" : "R")
		)
			return false;
		if (
			(player === "w"
				? boardState.white_king_has_moved
				: boardState.black_king_has_moved) !== 0
		)
			return false;
		if (player === "w") {
			if (
				(delta_pos === 2
					? boardState.right_white_rook_has_moved
					: boardState.left_white_rook_has_moved) !== 0
			)
				return false;
		} else if (player === "b") {
			if (
				(delta_pos === 2
					? boardState.right_black_rook_has_moved
					: boardState.left_black_rook_has_moved) !== 0
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
		const copy_squares = squares.slice();

		while (col_ctr !== col_diff || row_ctr !== row_diff) {
			let position =
				64 - start_row * 8 + -8 * row_ctr + (start_col - 1 + col_ctr);
			if (
				copy_squares[position].id !== null &&
				copy_squares[position] !== copy_squares[start]
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
	
	public pieceCanMoveThere(start: number, end: number, squares: PieceType[], boardState: IStateBoard, passant_pos: number | null = null) {
		const copy_squares = squares.slice();
		if (start === end)
			return false;

		var player = copy_squares[start].player;
		if (
			player === copy_squares[end].player ||
			copy_squares[start].pieceCanMove(start, end) === false
		)
			return false;

		if (this.isMoveInvalid(start, end, copy_squares, boardState, passant_pos) === true)
			return false;

		var cant_castle =
			copy_squares[start].id === (player === "w" ? "k" : "K") &&
			Math.abs(end - start) === 2 &&
			this.inCheck(player as "w" | "b", copy_squares, boardState);
		if (cant_castle) return false;


		if (
			copy_squares[start].id === (player === "w" ? "k" : "K") &&
			Math.abs(end - start) === 2
		) {
			var delta_pos = end - start;
			const test_squares = squares.slice();
			test_squares[start + (delta_pos === 2 ? 1 : -1)] = test_squares[start];
			test_squares[start] = new PieceFiller();
			if (this.inCheck(player as "w" | "b", test_squares, boardState)) return false;
		}

		const check_squares = squares.slice();
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
		let position_of_king = 0;
		const copy_squares = squares.slice();
		for (let i = 0; i < 64; i++) {
			if (copy_squares[i].id === king) {
					position_of_king = i;
					break;
			}
		}

		for (let i = 0; i < 64; i++) {
			if (copy_squares[i].player !== player) {
					if (
						copy_squares[i].pieceCanMove(i, position_of_king) === true &&
						this.isMoveInvalid(i, position_of_king, copy_squares, boardState) === false
					)
						return true;
			}
		}
		return false;
	}
}