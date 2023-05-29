import React from "react";
import { get_piece_value } from "../../helpers/logic/getPeaceValue";
import { shuffle } from "../../helpers/logic/shuffle";
import { calc_squareColor } from "../../helpers/ui/calcSquareColor";
import { clear_check_highlight, clear_highlight, clear_possible_highlight, highlight_mate } from "../../helpers/ui/highLigthings";
import { initializeBoard } from "../../helpers/ui/initializeBoard";
import { Collected } from "../Collected/Collected";
import { Label } from "../Label/Label";
import { Pawn, King, Queen, Bishop, Knight, Rook, filler_piece } from "../Pieces/Pieces";
import { Square } from "../Square/Square";

type SquareType = Pawn | King | Queen | Bishop | Knight | Rook | filler_piece

interface IStateBoard {
	squares: SquareType[],
	source: number,
	turn: "w" | "b",
	true_turn: "w" | "b",
	turn_num: number,
	first_pos: number,
	second_pos: number,
	repetition: number,
	white_king_has_moved: number,
	black_king_has_moved: number,
	left_black_rook_has_moved: number,
	right_black_rook_has_moved: number,
	left_white_rook_has_moved: number,
	right_white_rook_has_moved: number,
	passant_pos: number,
	bot_running: number,
	pieces_collected_by_white: JSX.Element[],
	pieces_collected_by_black: JSX.Element[],
	mated: boolean,
	move_made: boolean,
	capture_made: boolean,
	check_flash: boolean,
	just_clicked: boolean,
};

class Board extends React.Component<any, IStateBoard> {
	// initialize the board
	constructor(props: any) {
		super(props);
		this.state = {
			squares: initializeBoard(),
			source: -1,
			turn: "w",
			true_turn: "w",
			turn_num: 0,
			first_pos: 0,
			second_pos: 0,
			repetition: 0,
			white_king_has_moved: 0,
			black_king_has_moved: 0,
			left_black_rook_has_moved: 0,
			right_black_rook_has_moved: 0,
			left_white_rook_has_moved: 0,
			right_white_rook_has_moved: 0,
			passant_pos: 65,
			bot_running: 0,
			pieces_collected_by_white: [],
			pieces_collected_by_black: [],
			mated: false,
			move_made: false,
			capture_made: false,
			check_flash: false,
			just_clicked: false,
		};
	}
	// reset the board
	///first_pos: null,
	///second_pos: null,
	///
	reset() {
		if (
			this.state.turn === "b" &&
			!this.state.mated
		)
			return "cannot reset";
		this.setState({
			squares: initializeBoard(),
			source: -1,
			turn: "w",
			true_turn: "w",
			turn_num: 0,
			first_pos: 0,
			second_pos: 0,
			repetition: 0,
			white_king_has_moved: 0,
			black_king_has_moved: 0,
			left_black_rook_has_moved: 0,
			right_black_rook_has_moved: 0,
			left_white_rook_has_moved: 0,
			right_white_rook_has_moved: 0,
			passant_pos: 65,
			bot_running: 0,
			pieces_collected_by_white: [],
			pieces_collected_by_black: [],
			mated: false,
			move_made: false,
			capture_made: false,
			check_flash: false,
			just_clicked: false,
		});
	}
	// full function for executing a move
	move_piece(player: "w" | "b", squares: SquareType[], start: number, end: number) {
		let copy_squares = squares.slice();

		// clear highlights
		copy_squares = clear_highlight(copy_squares).slice();
		if (player === "w") {
			copy_squares = clear_possible_highlight(copy_squares).slice();
			for (let j = 0; j < 64; j++) {
					// user has heeded warning
					if (copy_squares[j].ascii === "k") {
						let king = copy_squares[j] as King;
						king.in_check = 0;
						copy_squares[j] = king;
						break;
					}
			}
		}

		// note if king or rook has moved (castling not allowed if these have moved)
		if (copy_squares[start].ascii === (player === "w" ? "k" : "K")) {
			if (player === "w") {
					this.setState({
						white_king_has_moved: 1,
					});
			} else {
					this.setState({
						black_king_has_moved: 1,
					});
			}
		}
		if (copy_squares[start].ascii === (player === "w" ? "r" : "R")) {
			if (start === (player === "w" ? 56 : 0)) {
					if (player === "w") {
						this.setState({
							left_white_rook_has_moved: 1,
						});
					} else {
						this.setState({
							left_black_rook_has_moved: 1,
						});
					}
			} else if (start === (player === "w" ? 63 : 7)) {
					if (player === "w") {
						this.setState({
							right_white_rook_has_moved: 1,
						});
					} else {
						this.setState({
							right_black_rook_has_moved: 1,
						});
					}
			}
		}

		// add captured pieces to collection
		const collection: JSX.Element[] =
			player === "w"
					? this.state.pieces_collected_by_white.slice()
					: this.state.pieces_collected_by_black.slice();
		if (copy_squares[end].ascii !== null) {
			collection.push(<Collected value={copy_squares[end]} />);
			this.setState({
					capture_made: true,
			});
		}
		if (copy_squares[start].ascii === (player === "w" ? "p" : "P")) {
			if (end - start === (player === "w" ? -9 : 7)) {
					// black going down to the left OR white going up to the left
					if (start - 1 === this.state.passant_pos)
						collection.push(<Collected value={copy_squares[start - 1]} />);
			} else if (end - start === (player === "w" ? -7 : 9)) {
					// black going down to the right OR white going up to the right
					if (start + 1 === this.state.passant_pos)
						collection.push(<Collected value={copy_squares[start + 1]} />);
			}
		}

		// make the move
		copy_squares = this.make_possible_move(copy_squares, start, end).slice();

		// en passant helper
		var passant_true =
			player === "w"
					? copy_squares[end].ascii === "p" &&
					start >= 48 &&
					start <= 55 &&
					end - start === -16
					: copy_squares[end].ascii === "P" &&
					start >= 8 &&
					start <= 15 &&
					end - start === 16;
		let passant = passant_true ? end : 65;

		// highlight mate
		if (player === "w") {
			copy_squares = highlight_mate(
					"b",
					copy_squares,
					this.checkmate("b", copy_squares),
					this.stalemate("b", copy_squares)
			).slice();
		} else {
			copy_squares = highlight_mate(
					"w",
					copy_squares,
					this.checkmate("w", copy_squares),
					this.stalemate("w", copy_squares)
			).slice();
		}

		let check_mated =
			this.checkmate("w", copy_squares) || this.checkmate("b", copy_squares);
		let stale_mated =
			(this.stalemate("w", copy_squares) && player === "b") ||
			(this.stalemate("b", copy_squares) && player === "w");

		this.setState({
			passant_pos: passant,
			squares: copy_squares,
			source: -1,
			turn_num: this.state.turn_num + 1,
			mated: check_mated || stale_mated ? true : false,
			turn: player === "b" ? "w" : "b",
			true_turn: player === "b" ? "w" : "b",
			bot_running: player === "b" ? 0 : 1,
			move_made: true,
		});

		// set state
		if (player === "b") {
			this.setState({
					first_pos: start,
					second_pos: end,
					pieces_collected_by_black: collection,
			});
		} else {
			this.setState({
					pieces_collected_by_white: collection,
			});
		}
	}
	// зробити хід. Повертає стан дошки після зробленого ходу
	make_possible_move(squares: SquareType[], start: number, end: number, passant_pos=null) {
		const copy_squares = squares.slice();
		// рокіровка
		var isKing =
			copy_squares[start].ascii === "k" || copy_squares[start].ascii === "K";
			
		if (isKing && Math.abs(end - start) === 2) {
			if (end === (copy_squares[start].ascii === "k" ? 62 : 6)) {
					copy_squares[end - 1] = copy_squares[end + 1];
					copy_squares[end - 1].highlight = 1;
					copy_squares[end + 1] = new filler_piece(null);
					copy_squares[end + 1].highlight = 1;
			} else if (end === (copy_squares[start].ascii === "k" ? 58 : 2)) {
					copy_squares[end + 1] = copy_squares[end - 2];
					copy_squares[end + 1].highlight = 1;
					copy_squares[end - 2] = new filler_piece(null);
					copy_squares[end - 2].highlight = 1;
			}
		}

		// en passant
		var passant = passant_pos === null ? this.state.passant_pos : passant_pos;
		if (copy_squares[start].ascii?.toLowerCase() === "p") {
			if (end - start === -7 || end - start === 9) {
					// white going up to the right
					if (start + 1 === passant)
						copy_squares[start + 1] = new filler_piece(null);
			} else if (end - start === -9 || end - start === 7) {
					// white going up to the left
					if (start - 1 === passant)
						copy_squares[start - 1] = new filler_piece(null);
			}
		}

		// make the move
		copy_squares[end] = copy_squares[start];
		copy_squares[end].highlight = 1;
		copy_squares[start] = new filler_piece(null);
		copy_squares[start].highlight = 1;

		// pawn promotion
		if (copy_squares[end].ascii === "p" && end >= 0 && end <= 7) {
			copy_squares[end] = new Queen("w");
			copy_squares[end].highlight = 1;
		}
		if (copy_squares[end].ascii === "P" && end >= 56 && end <= 63) {
			copy_squares[end] = new Queen("b");
			copy_squares[end].highlight = 1;
		}

		return copy_squares;
	}
	// returns true if castling is allowed
	is_castling_possible(start: number, end: number, squares: SquareType[]) {
		const copy_squares = squares.slice();
		var player = copy_squares[start].player;
		var delta_pos = end - start;
		if (start !== (player === "w" ? 60 : 4)) return false;
		if (
			(delta_pos === 2
					? copy_squares[end + 1].ascii
					: copy_squares[end - 2].ascii) !== (player === "w" ? "r" : "R")
		)
			return false;
		if (
			(player === "w"
					? this.state.white_king_has_moved
					: this.state.black_king_has_moved) !== 0
		)
			return false;
		if (player === "w") {
			if (
					(delta_pos === 2
						? this.state.right_white_rook_has_moved
						: this.state.left_white_rook_has_moved) !== 0
			)
					return false;
		} else if (player === "b") {
			if (
					(delta_pos === 2
						? this.state.right_black_rook_has_moved
						: this.state.left_black_rook_has_moved) !== 0
			)
					return false;
		}

		return true;
	}
	// returns true if a piece is trying to skip over another piece
	blockers_exist(start: number, end: number, squares: SquareType[]) {
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;
		let row_diff = end_row - start_row;
		let col_diff = end_col - start_col;
		let row_ctr = 0;
		let col_ctr = 0;
		const copy_squares = squares.slice();

		// return true if the piece in question is skipping over a piece
		while (col_ctr !== col_diff || row_ctr !== row_diff) {
			let position =
					64 - start_row * 8 + -8 * row_ctr + (start_col - 1 + col_ctr);
			if (
					copy_squares[position].ascii !== null &&
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
	// return true if pawn is not breaking any of its rules
	good_pawn(start: number, end: number, squares: SquareType[], passant_pos=null) {
		var passant = passant_pos === null ? this.state.passant_pos : passant_pos;
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;
		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;
		const copy_squares = squares.slice();

		// only allow 2 space move if the pawn is in the start position
		if (row_diff === 2 || row_diff === -2) {
			if (copy_squares[start].player === "w" && (start < 48 || start > 55))
					return false;
			if (copy_squares[start].player === "b" && (start < 8 || start > 15))
					return false;
		}
		// cannot move up/down if there is a piece
		if (copy_squares[end].ascii !== null) {
			if (col_diff === 0) return false;
		}
		// cannot move diagonally if there is no piece to capture UNLESS it's en passant
		if (row_diff === 1 && col_diff === 1) {
			// white going up and right
			if (copy_squares[end].ascii === null) {
					if (copy_squares[start + 1].ascii !== "P" || passant !== start + 1)
						return false;
			}
		} else if (row_diff === 1 && col_diff === -1) {
			// white going up and left
			if (copy_squares[end].ascii === null) {
					if (copy_squares[start - 1].ascii !== "P" || passant !== start - 1)
						return false;
			}
		} else if (row_diff === -1 && col_diff === 1) {
			// black going down and right
			if (copy_squares[end].ascii === null) {
					if (copy_squares[start + 1].ascii !== "p" || passant !== start + 1)
						return false;
			}
		} else if (row_diff === -1 && col_diff === -1) {
			// black going down and left
			if (copy_squares[end].ascii === null) {
					if (copy_squares[start - 1].ascii !== "p" || passant !== start - 1)
						return false;
			}
		}

		return true;
	}
	// return true if move from start to end is illegal
	is_move_invalid(start: number, end: number, squares: SquareType[], passant_pos=null) {
		const copy_squares: SquareType[] = squares.slice();
		// if the piece is a bishop, queen, rook, or pawn,
		// it cannot skip over pieces
		var bqrpk =
			copy_squares[start].ascii?.toLowerCase() === "r" ||
			copy_squares[start].ascii?.toLowerCase() === "q" ||
			copy_squares[start].ascii?.toLowerCase() === "b" ||
			copy_squares[start].ascii?.toLowerCase() === "p" ||
			copy_squares[start].ascii?.toLowerCase() === "k";
		let invalid =
			bqrpk === true && this.blockers_exist(start, end, copy_squares) === true;
		if (invalid) return invalid;
		// checking for certain rules regarding the pawn
		var pawn = copy_squares[start].ascii?.toLowerCase() === "p";
		invalid =
			pawn === true &&
			this.good_pawn(start, end, copy_squares, passant_pos) === false;
		if (invalid) return invalid;
		// checking for if castling is allowed
		var king = copy_squares[start].ascii?.toLowerCase() === "k";
		if (king && Math.abs(end - start) === 2)
			invalid = this.is_castling_possible(start, end, copy_squares) === false;

		return invalid;
	}
	// returns true if there are any possible moves
	can_move_there(start: number, end: number, squares: SquareType[], passant_pos=null) {
		const copy_squares = squares.slice();
		if (start === end)
			// cannot move to the position you're already sitting in
			return false;

		// player cannot capture her own piece
		// and piece must be able to physically move from start to end
		var player = copy_squares[start].player;
		if (
			player === copy_squares[end].player ||
			copy_squares[start].can_move(start, end) === false
		)
			return false;
		// player cannot make an invalid move
		if (this.is_move_invalid(start, end, copy_squares, passant_pos) === true)
			return false;

		// cannot castle if in check
		var cant_castle =
			copy_squares[start].ascii === (player === "w" ? "k" : "K") &&
			Math.abs(end - start) === 2 &&
			this.in_check(player as "w" | "b", copy_squares);
		if (cant_castle) return false;

		// king cannot castle through check
		if (
			copy_squares[start].ascii === (player === "w" ? "k" : "K") &&
			Math.abs(end - start) === 2
		) {
			var delta_pos = end - start;
			const test_squares = squares.slice();
			test_squares[start + (delta_pos === 2 ? 1 : -1)] = test_squares[start];
			test_squares[start] = new filler_piece(null);
			if (this.in_check(player as "w" | "b", test_squares)) return false;
		}

		// player cannot put or keep himself in check
		const check_squares = squares.slice();
		check_squares[end] = check_squares[start];
		check_squares[start] = new filler_piece(null);
		if (check_squares[end].ascii === "p" && end >= 0 && end <= 7) {
			check_squares[end] = new Queen("w");
		} else if (check_squares[end].ascii === "P" && end >= 56 && end <= 63) {
			check_squares[end] = new Queen("b");
		}
		if (this.in_check(player as "w" | "b", check_squares) === true) return false;

		return true;
	}
/////////////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////let position_of_king = null;
	// returns true if player is in check
	in_check(player: "w" | "b", squares: SquareType[]) {
		let king = player === "w" ? "k" : "K";
		let position_of_king = 0;
		const copy_squares = squares.slice();
		for (let i = 0; i < 64; i++) {
			if (copy_squares[i].ascii === king) {
					position_of_king = i;
					break;
			}
		}

		// traverse through the board and determine
		// any of the opponent's pieces can legally take the player's king
		for (let i = 0; i < 64; i++) {
			if (copy_squares[i].player !== player) {
					if (
						copy_squares[i].can_move(i, position_of_king) === true &&
						this.is_move_invalid(i, position_of_king, copy_squares) === false
					)
						return true;
			}
		}
		return false;
	}
	// return true if player is in stalemate
	stalemate(player: "w" | "b", squares: SquareType[]) {
		if (this.in_check(player, squares)) return false;

		// if there is even only 1 way to move her piece,
		// the player is not in stalemate
		for (let i = 0; i < 64; i++) {
			if (squares[i].player === player) {
					for (let j = 0; j < 64; j++) {
						if (this.can_move_there(i, j, squares)) return false;
					}
			}
		}
		return true;
	}
	// return true if player is in checkmate
	checkmate(player: "w" | "b", squares: SquareType[]) {
		if (!this.in_check(player, squares)) return false;
		// if there is even only 1 way to move her piece,
		// the player is not in checkmate
		for (let i = 0; i < 64; i++) {
			if (squares[i].player === player) {
					for (let j = 0; j < 64; j++) {
						if (this.can_move_there(i, j, squares)) return false;
					}
			}
		}
		return true;
	}
	// helper function for minimax: calculate black's status using piece values
	evaluate_black(squares: SquareType[]) {
		let total_eval = 0;
		for (let i = 0; i < 64; i++) total_eval += get_piece_value(squares[i], i);
		return total_eval;
	}
	// мінімакс алгоритм для визначення ходу бота
	minimax(
		depth: number,
		is_black_player: boolean,
		alpha: number, // поточне найкраще значення, яке може досягти чорний гравець, який максимізує (для альфа-бета відсікання)
		beta: number, // поточне найкраще значення, яке може досягти білий гравець, який мінімізує (для альфа-бета відсікання)
		squares: any[], // приймаємо стан шахової дошки після виконання ходу
		RA_of_starts: any[],
		RA_of_ends: any[],
		passant_pos: any
	) {
		const copy_squares = squares.slice();

		// коли depth = 0, то ми на вершині дерева (тобто знайшли усі можливі розвитки партії на 3 ходи вперед). Тепер для них усіх треба зробити оцінку (ця оцінка робиться за к-стю чорних фігур на дошці). Коли depth = 0, ми досягли глибини рекурсії, тепер робимо рекурсивне повернення й кожен раз повертаємо оцінку стану шахового поля для чорного гравця в даному виклику ф-ії. Після повернення цієї функції, ми будемо на рівень вище у дереві (тобто depth = depth + 1). Тому після цього код нижче виконається, в якому знову викличеться minimax, і знову depth = 0. Вже на третій раз не викличеться. Тобто викличеться аж коли на два рівні вгорі буде.
		if (depth === 0) {
			return this.evaluate_black(copy_squares);
		}

		let best_value = is_black_player ? -9999 : 9999;
		// пройти по всіх можливих початкових позиціях
		for (let i = 0; i < 64; i++) {
			let start = RA_of_starts[i];
			// перевірка, чи є на полі фігура
			let isPlayerPiece =
					copy_squares[start].ascii !== null && copy_squares[start].player === (is_black_player ? "b" : "w");

			// якщо поле не пусте, то
			if (isPlayerPiece) {
				/* iterate through the possible end positions for each possible start position
				* and use recursion to see what the value of each possible move will be a few moves
				* down the road. if the move being analyzed is black's turn, the value will maximize
				* best_value; but if the move being analyzed is white's turn, the value will minimize
				* best_value
				*/
				// для кожної можливої кінцевої позиції
				for (let j = 0; j < 64; j++) {
					let end = RA_of_ends[j];
					if ( // якщо можна зробити хід з поля start на поле end
						this.can_move_there(start, end, copy_squares, passant_pos) === true
					) { // робимо хід. Метод make_possible_move повертає стан дошки після зробленого ходу
						const test_squares = squares.slice()
						const test_squares_2 = this.make_possible_move(
								test_squares,
								start,
								end,
								passant_pos
						).slice()
						// перевіряє, чи зроблений хід є взяттям на проході. Це треба для ф-ії can_move_there (без цього вона б оцінювала взяття на прохід як неможливий хід).
						// якщо це значення не зміниться, то ф-ія can_move_there буде знати, що даний рух, який перевіряється, не є взяттям на проході
						var passant = 65;
						// якщо цей хід був взяттям на проході, то passant = end
						if (
								test_squares[end].ascii === (is_black_player ? "P" : "p") &&
								start >= (is_black_player ? 8 : 48) &&
								start <= (is_black_player ? 15 : 55) &&
								end - start === (is_black_player ? 16 : -16)
						) {
								passant = end;
						}

						// визиваємо ф-ію мінімакс, але вже для іншого гравця
						let value = this.minimax(
								depth - 1,
								!is_black_player,
								alpha,
								beta,
								test_squares_2,
								RA_of_starts,
								RA_of_ends,
								passant
						);
						// чорний гравець максимізує значення, білий гравець мінімізує значення
						if (is_black_player) {
								// якщо отримане значення (яке повернулось на минулій ітерації ф-ією мінімакс) більше (так як чорний гравець максимізує значення) за попереднє значення (яке було повернуте ще раніше ніж на минулій ітерації), то best_value дорівнює цьому значенню
								best_value = Math.max(value, best_value);
								// для альфа-бета відсікання. Обирає найкраще значення (а тобто, найбільше, бо чорний гравець максимізує) для чорного гравця
								alpha = Math.max(alpha, best_value);
								// якщо для білих вже був кращий хід, то інша гілка відсікається (тобто не буде робитись оцінка на рівень нижче для білого гравця, бо вже краще для білого на рівень вижче не буде). beta показує найкраще значення для білого гравця, а alpha для чорного, тому якщо на рівень (або декілька рівнів) вижче у білого вже є краща (менша) оцінка beta, то так як чорний вибере на цьому рівні більшу оцінку (alpha), то кращої оцінки вже для білого не буде.
								if (beta <= alpha) return best_value;
						} else {
								// якщо отримане значення (яке повернулось на минулій ітерації ф-ією мінімакс) менше (так як білий гравець мінімізує значення) за попереднє значення (яке було повернуте ще раніше ніж на минулій ітерації), то best_value дорівнює цьому значення
								best_value = Math.min(value, best_value);
								// для альфа-бета відсікання. Обирає найкраще значення (а тобто, найменше, бо білий гравець мінімізує) для чорного гравця
								beta = Math.min(beta, best_value);
								// якщо для чорних вже був кращий хід, то інша гілка відсікається (тобто не буде робитись оцінка на рівень нижче для чорного гравця гравця, бо вже краще для чорного на рівень (або декілька рівнів) вижче не буде). beta показує найкраще значення для білого гравця, а alpha для чорного, тому якщо на рівень вижче у чорного вже є краща (більша) оцінка beta, то так як білий вибере на цьому рівні більшу оцінку (alpha), то кращої оцінки вже для чорного не буде.
								if (beta <= alpha) return best_value;
						}
					}
				}
			}
		}

		return best_value;
	}
	// Шаховий бот для чорного гравця. Викликається з ф-ії handle click, яка передає depth = 3.
	execute_bot(depth: number, passed_in_squares: any[]) {
		// якщо мат, то виходимо
		if (this.state.mated) return "bot cannot run";
		const copy_squares = passed_in_squares.slice();

		let rand_start = 100;
		let rand_end = 100;

		// ініціалізуємо масиви, які будуть містити можливі початкові і кінцеві позиції для кожної фігури відповідно, значеннями від 1 до 63 
		let RA_of_starts = [];
		let RA_of_ends = [];
		for (let i = 0; i < 64; i++) {
			RA_of_starts.push(i);
			RA_of_ends.push(i);
		}
		// перемішуємо в них значення (для того, щоб бот не починав завжди з верхнього лівого поля на дошці, бо тоді в minimax алгоритмі він на початку буде перевіряти ходи (далі масив moves), які починаються з цього поля, а потім порівнювати чи є кращий хід за цей. Але найкращі ходи невідомо з якого поля починаються і закінчуються, тому рандомно задати ефективніше)
		RA_of_starts = shuffle(RA_of_starts);
		RA_of_ends = shuffle(RA_of_ends);

		// створюємо масив з можливих ходів (масив буде виглядати так: [початок1, перший кінець для початок1, початок1, другий кінець для початок1, третій кінець для початок1....., початок63, перший кінець для початок63, початок63, другий кінець для початок63....])
		let moves = [];
		// у цьому циклі спочатку беремо початкове поле (поле "A")
		for (let i = 0; i < 64; i++) {
			// беремо початкове поле
			let start = RA_of_starts[i];
			// ця зміння true, якщо на цьому полі стоїть фігура бота, інакше false
			let isBlackPiece =
				copy_squares[start].ascii !== null && copy_squares[start].player === "b";
			// якщо фігура бота, то
			if (isBlackPiece) {
				// для кожного кінцевого поля (поля "B")
				for (let j = 0; j < 64; j++) {
					// беремо кінцеве поле (квадрат)
					let end = RA_of_ends[j];
					// перевіряємо чи можна походити з поля "A" на поле "B"
					if (this.can_move_there(start, end, copy_squares) === true) {
						// якщо можна, додаємо поля "A" та "B"
						moves.push(start);
						moves.push(end);
					}
				}
			}
		}

		// це значення треба буде для того, щоб порівняти його з оцінкою дошки. Цю оцінку дошки поверне ф-ія minimax. Після порівняння, якщо minimax поверне значення менше ніж це, не зміниться значення rand_end, що означатиме що бот отримав мат, інакше все ок й найкращий хід знайдено
		let best_value = -9999;
		/* iterate through the possible movements and choose the movement from start to end that results in the best
		* position for black in terms of value calculated by evaluate_black; minimax algo lets bot look ahead a few
		* moves and thereby pick the move that results in the best value in the long run
		*/
		// для кожного можливого ходу. Тут ми беремо кожен хід, це завжди верхній рівень дерева, для якого ми визначаємо оцінку, а в мінімакс спочатку оцінюються майбутні ходи після цього ходу, і після цього повертається оцінка цього ходу.
		for (let i = 0; i < moves.length; i += 2) {
			// початкова позиція
			let start = moves[i];
			// кінцева позиція
			let end = moves[i + 1];
			// повторення ходів для нічиї (3 рази один і той самий хід) боту не дозволено, якщо він два рази повторив хід, тоді на третій раз оберається якийсь інший
			if ( // якщо є якийсь інший хід, беремо його (не точно, зовсім зрозумів)
					moves.length > 2 &&
					this.state.repetition >= 2 &&
					start === this.state.second_pos &&
					end === this.state.first_pos
			) { // не поняв
					this.setState({
						repetition: 0,
					});
			} else {
					const test_squares = passed_in_squares.slice();
					// робимо хід
					const test_squares_2 = this.make_possible_move(test_squares, start, end).slice();
					// для взяття на проході
					var passant_pos = 65;
					if (
						test_squares[start].ascii === "P" &&
						start >= 8 &&
						start <= 15 &&
						end - start === 16
					)
						passant_pos = end;
						// оцінюємо цей хід. Для цього в мінімаксі оцінюються всі майбутні ходи, і після цього мінімакс повертає оцінку цього ходу.
						let board_eval = this.minimax(
							depth - 1,
							false, // тому перший виклик функції minimax буде для білого гравця
							-1000, // передаємо найгіршу оцінку для alpha (бо воно зберігає максимальне значення). Це значення буде передаватися до макимальної глибини.
							1000, // передаємо найгіршу оцінку для beta(бо воно зберігає мінімальне значення). Це значення буде передаватися до макимальної глибини.
							test_squares_2, // передаємо стан шахової дошки після виконання ходу
							RA_of_starts,
							RA_of_ends,
							passant_pos
					);
					// якщо цей хід краще ніж попередні, то best_value дорівнює цьому ходу й беремо його початкові й кінцеву позиції
					if (board_eval >= best_value) {
						best_value = board_eval;
						rand_start = start;
						rand_end = end;
					}
			}
		}

		if (rand_end !== 100) {
			// rand_end === 100 indicates that black is in checkmate/stalemate
			// increment this.state.repetition if black keeps moving a piece back and forth consecutively
			if (
					rand_start === this.state.second_pos &&
					rand_end === this.state.first_pos
			) {
					let reps = this.state.repetition + 1;
					this.setState({
						repetition: reps,
					});
			} else {
					this.setState({
						repetition: 0,
					});
			}

			this.move_piece("b", copy_squares, rand_start, rand_end);
		}
	}
	// обробка натиснення гравця на поле на дошці
	handleClick(i: number) {
		let copy_squares = this.state.squares.slice();

		// кінець гри
		if (this.state.mated) return "game-over";

		// Якщо ніякого поля не обрано (не зрозумів як воно може бути обраним до першого ходу) або бот не робить хід, то
		if (this.state.source === -1 && this.state.bot_running === 0) {
			// no source has been selected yet
			// якщо гравець натиснув на фігуру бота, то не перерендерювати нічого, вийти просто
			if (copy_squares[i].player !== this.state.turn) return -1;

			// якщо не намагається взяти щось з поля, де нема фігури. То заходимо в if
			if (copy_squares[i].player !== null) {
					this.setState({
						check_flash: false,
						just_clicked: false,
						move_made: false,
						capture_made: false,
					});
					
					// бере фігуру, тому прибираємо підсвітку, що позначає "шах"
					copy_squares = clear_check_highlight(copy_squares, "w").slice();
					// і підсвічуємо фігуру, що взята
					copy_squares[i].highlight = 1;

					// підсвічуємо куди можна піти
					for (let j = 0; j < 64; j++) {
						if (this.can_move_there(i, j, copy_squares))
							copy_squares[j].possible = 1;
					}
					
					// встановлюємо source як поле, на яке натиснув гравець і копіюмо поточний стан дошки
					this.setState({
						source: i,
						squares: copy_squares,
					});
			}
		}

		// друге натиснення, щоб переставити фігуру
		// this.state.source > -1 означає, що перше натиснення відбулось, бо source вказує на обране поле
		if (this.state.source > -1) {

			// ця змінна true, якщо гравець вибрав його фігуру (але мабуть канібалізм тут означає, що буде їсти фігуру суперника, не знаю як тут)
			var cannibalism = copy_squares[i].player === this.state.turn;

			// this.state.source !== i не поняв
			if (cannibalism === true && this.state.source !== i) {
					// підсвічуємо нове обране поле
					copy_squares[i].highlight = 1;
					// прибираємо підсвітку з поля, яке було вибране спочатку
					copy_squares[this.state.source].highlight = 0;
					// прибираємо підсвітку для всіх полів, куди можна зробити хід, бо після ходу вони зміняться
					copy_squares = clear_possible_highlight(copy_squares).slice();
					// підсвічуємо ходи, які тепер можна зробити, після цього ходу
					for (let j = 0; j < 64; j++) {
						if (this.can_move_there(i, j, copy_squares))
							copy_squares[j].possible = 1;
					}
					// встановлюємо source на поле, на яке було натиснуто
					this.setState({
						source: i,
						squares: copy_squares,
					});
			} else {
					// Перевірка чи можна зробити такий хід
					if (!this.can_move_there(this.state.source, i, copy_squares)) {
						// не підсвічуати поля, якщо обрано неможливий хід
						copy_squares[this.state.source].highlight = 0;
						copy_squares = clear_possible_highlight(copy_squares).slice();
						// якщо користувач під шахом, виділіть короля червоним кольором, якщо користувач намагається зробити хід, який не виведе його з шаху
						if (
							i !== this.state.source &&
							this.in_check("w", copy_squares) === true
						) {
							for (let j = 0; j < 64; j++) {
									if (copy_squares[j].ascii === "k") {
										let king = copy_squares[j] as King;
										king.in_check = 1;
										copy_squares[j] = king;
										break;
									}
							}
							this.setState({
									check_flash: true,
							});
						}
						this.setState({
							source: -1,
							squares: copy_squares,
						});
						return "invalid move";
					}

					// функція реалізує переміщення фігури
					this.move_piece("w", copy_squares, this.state.source, i);

					setTimeout(() => {
						this.setState({
							move_made: false,
							capture_made: false,
						});
					}, 200);

					// Після того, як походив гравець, викликаємо бота, щоб той робив свій хід, передаємо глибину (execute_bot передає в minimax  depth - 1, щоб кожен раз змінювалась глибина, тому взагалі бот ходить на глибині 3, а шукає майбутні ходи до depth = 2 (тобто 2, 1, 0, тому дивиться на три ходи вперед)), до якої за допомогою minimax алгоритму буде робитися оцінка. Тобто бот дивиться на три ходи вперед
					let search_depth = 3;
					setTimeout(() => {
						this.execute_bot(search_depth, this.state.squares);
					}, 700);
			}
		}
	}
	// Render the page
	render() {
		const row_nums = [];
		for (let i = 8; i > 0; i--) {
			row_nums.push(<Label key={i} value={i} />);
		}
		const col_nums = [];
		for (let i = 1; i < 9; i++) {
			let letter;
			switch (i) {
					case 1:
						letter = "A";
						break;
					case 2:
						letter = "B";
						break;
					case 3:
						letter = "C";
						break;
					case 4:
						letter = "D";
						break;
					case 5:
						letter = "E";
						break;
					case 6:
						letter = "F";
						break;
					case 7:
						letter = "G";
						break;
					case 8:
						letter = "H";
						break;
			}
			col_nums.push(<Label key={letter} value={letter} />);
		}

		const board = [];
		for (let i = 0; i < 8; i++) {
			const squareRows = [];
			for (let j = 0; j < 8; j++) {
					let square_corner = null;
					if (i === 0 && j === 0) {
						square_corner = " top_left_square ";
					} else if (i === 0 && j === 7) {
						square_corner = " top_right_square ";
					} else if (i === 7 && j === 0) {
						square_corner = " bottom_left_square ";
					} else if (i === 7 && j === 7) {
						square_corner = " bottom_right_square ";
					} else {
						square_corner = " ";
					}

					const copy_squares = this.state.squares.slice();
					let square_color = calc_squareColor(i, j, copy_squares);
					let square_cursor = "pointer";
					if (copy_squares[i * 8 + j].player !== "w") square_cursor = "default";
					if (this.state.bot_running === 1 && !this.state.mated)
						square_cursor = "bot_running";
					if (this.state.mated) square_cursor = "default";

					squareRows.push(
						<Square
							key={i * 8 + j}
							value={copy_squares[i * 8 + j]}
							color={square_color}
							corner={square_corner}
							cursor={square_cursor}
							onClick={() => this.handleClick(i * 8 + j)}
						/>
					);
			}
			board.push(<div key={i}>{squareRows}</div>);
		}

		let black_mated = this.checkmate("b", this.state.squares);
		let white_mated = this.checkmate("w", this.state.squares);
		let stale =
			(this.stalemate("w", this.state.squares) && this.state.turn === "w") ||
			(this.stalemate("b", this.state.squares) && this.state.turn === "b");

		return (
			<div>
					{this.state.move_made && !this.state.capture_made && (
						<div>
							<audio
									ref="audio_tag"
									src="./sfx/Move.mp3"
									controls
									autoPlay
									hidden
							/>{" "}
						</div>
					)}
					{this.state.capture_made && not_history && (
						<div>
							<audio
									ref="audio_tag"
									src="./sfx/Capture.mp3"
									controls
									autoPlay
									hidden
							/>{" "}
						</div>
					)}
					{black_mated && not_history && (
						<div>
							<audio
									ref="audio_tag"
									src="./sfx/Black_Defeat.mp3"
									controls
									autoPlay
									hidden
							/>{" "}
						</div>
					)}
					{white_mated && not_history && (
						<div>
							<audio
									ref="audio_tag"
									src="./sfx/White_Defeat.mp3"
									controls
									autoPlay
									hidden
							/>{" "}
						</div>
					)}
					{stale && not_history && (
						<div>
							<audio
									ref="audio_tag"
									src="./sfx/Stalemate.mp3"
									controls
									autoPlay
									hidden
							/>{" "}
						</div>
					)}
					{this.state.check_flash &&
						!(this.state.history_num - 1 !== this.state.turn_num) &&
						!this.state.just_clicked && (
							<div>
									{" "}
									<audio
										ref="audio_tag"
										src="./sfx/Check_Flash.mp3"
										controls
										autoPlay
										hidden
									/>{" "}
							</div>
						)}

					<div className="main_container">
						<div className="left_screen bounceInDown">
							<div className="row_label"> {row_nums} </div>
							<div className="table"> {board} </div>
							<div className="col_label"> {col_nums} </div>
						</div>

						<div className="right_screen bounceInDown">
							<div className="side_box">
									<div className="content">
										<p className="header_font">ReactJS Chess</p>
										<p className="medium_font">
											Play against our friendly bot!&nbsp;&nbsp;
											<a href="./how_to_play.html" target="_blank">
													How to Play
											</a>
										</p>
									</div>
							</div>

							<div className="side_box">
									<div className="content title">
										<p className="header_2_font">Match Information</p>
									</div>

									<div className="wrapper">
										<div className="player_box">
											<p className="medium_font">White (You)</p>
											{this.state.pieces_collected_by_white}
										</div>
										<div className="player_box black_player_color">
											<p className="medium_font">Black (Bot)</p>
											{this.state.pieces_collected_by_black}
										</div>
									</div>
									<div className="wrapper">
										{this.state.turn === "w" ? (
											<div className="highlight_box"></div>
										) : (
											<div className="highlight_box transparent"></div>
										)}
										{this.state.turn === "b" ? (
											<div className="highlight_box"></div>
										) : (
											<div className="highlight_box transparent"></div>
										)}
									</div>

									<div className="button_wrapper">
										{/* <button
											className="reset_button history"
											onClick={() => this.viewHistory("back_atw")}
										>
											<p className="button_font">&lt;&lt;</p>
										</button>
										<button
											className="reset_button history"
											onClick={() => this.viewHistory("back")}
										>
											<p className="button_font">&lt;</p>
										</button> */}
										<button className="reset_button" onClick={() => this.reset()}>
											<p className="button_font">Restart Game</p>
										</button>
										{/* <button
											className="reset_button history"
											onClick={() => this.viewHistory("next")}
										>
											<p className="button_font">&gt;</p>
										</button>
										<button
											className="reset_button history"
											onClick={() => this.viewHistory("next_atw")}
										>
											<p className="button_font">&gt;&gt;</p>
										</button> */}
									</div>

									<div className="mate_wrapper">
										<p className="small_font">
											{this.in_check("w", this.state.squares) &&
													!this.checkmate("w", this.state.squares) === true
													? "You are in check!"
													: ""}
										</p>
										<p className="small_font">
											{this.in_check("b", this.state.squares) &&
													!this.checkmate("b", this.state.squares) === true
													? "Black player is in check."
													: ""}
										</p>
										<p className="small_font">
											{this.checkmate("w", this.state.squares) === true
													? "You lost by checkmate."
													: ""}
										</p>
										<p className="small_font">
											{this.checkmate("b", this.state.squares) === true
													? "You won by checkmate!"
													: ""}
										</p>
										<p className="small_font">
											{(this.stalemate("w", this.state.squares) &&
													this.state.turn === "w") === true
													? "You are in stalemate. Game over."
													: ""}
										</p>
										<p className="small_font">
											{(this.stalemate("b", this.state.squares) &&
													this.state.turn === "b") === true
													? "Black is in stalemate. Game over."
													: ""}
										</p>
									</div>
							</div>
						</div>
					</div>
			</div>
		);
	}
}

export default Board