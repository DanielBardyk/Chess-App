import React from "react";
import Label from "../Label/Label";
import { Pawn, King, Queen, Bishop, Knight, Rook, PieceFiller } from "../Pieces/Pieces"
import Saver from "../Saver/Saver";
import BoardManager from "../BoardManager/BoardManager";
import Highlighter from "../Highlighter/Highlighter";
import SquareRenderer from "../SquareRenderer/SquareRenderer";
import Referee from "../Referee/Referee";
import Bot from "../Bot/Bot";
import Player from "../Player/Player";

export type PieceType = Pawn | King | Queen | Bishop | Knight | Rook | PieceFiller

export interface IStateBoard {
	squares: PieceType[],
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
	game_started: boolean,
	bot_mode: boolean,
	mated: boolean,
	move_made: boolean,
	capture_made: boolean,
	check_flash: boolean,
	just_clicked: boolean,
	key: number
};

interface IBoardProps {
	squareRenderer: SquareRenderer;
	saver: Saver;
}

interface ISquaresSerialized {
	name: string, player: 'w' | 'b' | null
}

// Omit це службовий тип для перетворення одного інтерфейсу в інший, другим параметром якого передається властивість, яку треба видалити
export interface IStateSerialized extends Omit<IStateBoard, "squares"> {
	squares: ISquaresSerialized[]
}

export default class Board extends React.Component<any, IStateBoard> {
	private boardManager: BoardManager = new BoardManager();
	private referee: Referee;
	private saver: Saver;
	private squareRenderer: SquareRenderer;
	private bot: Bot;
	private highlighter: Highlighter = new Highlighter();
	constructor(props: IBoardProps) {
		super(props);
		this.squareRenderer = props.squareRenderer
		this.saver = props.saver;
		this.state = {
			squares: this.boardManager.initializeBoard(),
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
			game_started: false,
			bot_mode: false,
			mated: false,
			move_made: false,
			capture_made: false,
			check_flash: false,
			just_clicked: false,
			key: 0
		};
		this.referee = new Referee(this.state)
		this.bot = new Bot(this.referee, this.state)
	}

	reset() {
		if (
			this.state.bot_mode
			&& this.state.turn === "b"
			&& !this.state.mated
		)
			return "cannot reset";

		this.setState({
			squares: this.boardManager.initializeBoard(),
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
			game_started: false,
			bot_mode: false,
			mated: false,
			move_made: false,
			capture_made: false,
			check_flash: false,
			just_clicked: false,
			key: 0
		});
	}

	movePiece(player: "w" | "b", squares: PieceType[], start: number, end: number) {
		let copy_squares = squares.slice();

		// clear highlights
		copy_squares = this.highlighter.clearHighlight(copy_squares).slice();
		if (!(this.state.bot_mode && player === "b")) {
			copy_squares = this.highlighter.clearPossibleMoveHighlight(copy_squares).slice();
			for (let j = 0; j < 64; j++) {
				// user has heeded warning
				if (copy_squares[start].id === (player === "w" ? "k" : "K")) {
					let king = copy_squares[j] as King;
					king.inCheck = 0;
					copy_squares[j] = king;
					break;
				}
			}
		}

		if (copy_squares[start].id === (player === "w" ? "k" : "K")) {
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

		if (copy_squares[start].id === (player === "w" ? "r" : "R")) {
			// якщо походила ліва тура, то змінюємо пропс, який буде вказувати, що рокіровку через ферзевий фланг більше зробити не можна
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
				// якщо походила права тура, то змінюємо пропс, який буде вказувати, що рокіровку через королівський фланг більше зробити не можна
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

		const playerComponent = new Player()
		copy_squares = playerComponent.makePossibleMove(copy_squares, start, end, this.state.passant_pos).slice();

		var passant_true =
			player === "w"
				? copy_squares[end].id === "p" &&
				start >= 48 &&
				start <= 55 &&
				end - start === -16
				: copy_squares[end].id === "P" &&
				start >= 8 &&
				start <= 15 &&
				end - start === 16;
		let passant = passant_true ? end : 65;

		if (player === "w") {
			copy_squares = this.highlighter.highlightMate(
				"b",
				copy_squares,
				this.referee.checkmate("b", copy_squares),
				this.referee.stalemate("b", copy_squares)
			).slice();
		} else {
			copy_squares = this.highlighter.highlightMate(
				"w",
				copy_squares,
				this.referee.checkmate("w", copy_squares),
				this.referee.stalemate("w", copy_squares)
			).slice();
		}

		let check_mated =
			this.referee.checkmate("w", copy_squares) || this.referee.checkmate("b", copy_squares);
		let stale_mated =
			(this.referee.stalemate("w", copy_squares) && player === "b") ||
			(this.referee.stalemate("b", copy_squares) && player === "w");

		this.setState({
			passant_pos: passant,
			squares: copy_squares,
			source: -1,
			turn_num: this.state.turn_num + 1,
			mated: check_mated || stale_mated ? true : false,
			turn: player === "b" ? "w" : "b",
			true_turn: player === "b" ? "w" : "b",
			bot_running: (this.state.bot_mode && player === "w") ? 1 : 0,
			move_made: true,
		});
	}
	
	// обробка натиснення гравця на поле на дошці
	handleClick(i: number) {

		let copy_squares = this.state.squares.slice();

		// кінець гри
		if (this.state.mated) return "game-over";

		// Перевірка, чи це перший хід, а не другий. Якщо ніякого поля не обрано або бот не робить хід, то
		if (this.state.source === -1 && this.state.bot_running === 0) {
			// no source has been selected yet
			// якщо гравець першим натиcканням обрав фігуру опонента, то не перерендерювати нічого, вийти просто
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
				copy_squares = this.highlighter.clearCheckHighlight(copy_squares, this.state.turn).slice();
				// і підсвічуємо фігуру, що взята
				copy_squares[i].highlight = 1;

				// підсвічуємо куди можна піти
				for (let j = 0; j < 64; j++) {
					if (this.referee.pieceCanMoveThere(i, j, copy_squares))
						copy_squares[j].possible = 1;
				}

				// встановлюємо source як поле, на яке натиснув гравець і копіюмо поточний стан дошки
				this.setState({
					source: i,
					squares: copy_squares,
				});
			}
		}

		// Перевірка, чи це другий хід, а не перший
		// this.state.source > -1 означає, що перше натиснення відбулось, бо source вказує на обране поле
		if (this.state.source > -1) {

			// ця змінна true, якщо гравець на другому натисканні вибрав його фігуру
			var isPlayerPiece = copy_squares[i].player === this.state.turn;

			// this.state.source !== i перевіряє чи не натиснув гравець на його ж фігуру ще раз (інакше рокіровка, або може є ще щось, не знаю)
			if (isPlayerPiece === true && this.state.source !== i) {
				// підсвічуємо нове обране поле
				copy_squares[i].highlight = 1;
				// прибираємо підсвітку з поля, яке було вибране спочатку
				copy_squares[this.state.source].highlight = 0;
				// прибираємо підсвітку для всіх полів, куди можна зробити хід, бо після ходу вони зміняться
				copy_squares = this.highlighter.clearPossibleMoveHighlight(copy_squares).slice();
				// підсвічуємо ходи, які тепер можна зробити, після цього ходу
				for (let j = 0; j < 64; j++) {
					if (this.referee.pieceCanMoveThere(i, j, copy_squares))
						copy_squares[j].possible = 1;
				}
				// встановлюємо source на поле, на яке було натиснуто
				this.setState({
					source: i,
					squares: copy_squares,
				});
				// рокіровка (або може є ще щось, не знаю)
			} else {
				// Якщо не можна зробити рокіровку (або може є ще щось, не знаю) то треба додати підсвітку і змінити певні пропси
				if (!this.referee.pieceCanMoveThere(this.state.source, i, copy_squares)) {
					// не підсвічуати поля, якщо обрано неможливий хід
					copy_squares[this.state.source].highlight = 0;
					copy_squares = this.highlighter.clearPossibleMoveHighlight(copy_squares).slice();
					// якщо користувач під шахом, виділіть короля червоним кольором, якщо користувач намагається зробити хід, який не виведе його з шаху
					if (
						// означає, що друге натиснення і король під шахом
						i !== this.state.source &&
						this.referee.inCheck(this.state.turn, copy_squares) === true
					) {
						for (let j = 0; j < 64; j++) {
							if ((this.state.turn === "w" && copy_squares[j].id === "k")
								|| (this.state.turn === "b" && copy_squares[j].id === "K")) {
								let king = copy_squares[j] as King;
								king.inCheck = 1;
								copy_squares[j] = king;
								break;
							}
						}
						// індикує що шах підсвічено
						this.setState({
							check_flash: true,
						});
					}
					// source: -1 відміняє попередні натискання, через те що рокіровка неможлива. Тепер користувач повинен знову зробити два натискання
					this.setState({
						source: -1,
						squares: copy_squares,
					});
					return "invalid move";
				}

				// функція реалізує переміщення фігури
				this.movePiece(this.state.turn, copy_squares, this.state.source, i);

				setTimeout(() => {
					this.setState({
						move_made: false,
						capture_made: false,
					});
				}, 200);

				// виклик бота
				if (this.state.bot_mode) {
					let search_depth = 3;
					setTimeout(() => {
						this.bot.execute_bot(
							search_depth, 
							this.state.squares, 
							this.state.mated,
							this.state.first_pos,
							this.state.second_pos, 
							this.movePiece.bind(this));
					}, 700);
				}
			}
		}
	}
	
	loadState(state: IStateSerialized) {
		const deserializedSquares = state.squares.map((classSquare) => {
			if (classSquare.player) {
				if (classSquare.name === 'Pawn') return new Pawn(classSquare.player)
				else if (classSquare.name === 'King') return new King(classSquare.player)
				else if (classSquare.name === 'Queen') return new Queen(classSquare.player)
				else if (classSquare.name === 'Bishop') return new Bishop(classSquare.player)
				else if (classSquare.name === 'Knight') return new Knight(classSquare.player)
				else return new Rook(classSquare.player)
			}
			else return new PieceFiller()
		})
		this.setState({ ...state, squares: deserializedSquares })
	}

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
				let square_color = this.boardManager.calc_squareColor(i, j, copy_squares);
				let square_cursor = "pointer";
				if (this.state.turn === copy_squares[i * 8 + j].player && !this.state.bot_running) square_cursor = "pointer"
				else square_cursor = "default"
				if (this.state.bot_running === 1 && !this.state.mated)
					square_cursor = "bot_running";
				if (this.state.mated) square_cursor = "default";

				squareRows.push(
					this.squareRenderer.showSquare({
						key: i * 8 + j,
						value: copy_squares[i * 8 + j],
						color: square_color,
						corner: square_corner,
						cursor: square_cursor,
						onClick: () => {
							this.state.game_started &&
							this.handleClick(i * 8 + j)
						}})
				);
			}
			board.push(<div key={i}>{squareRows}</div>);
		}

		return (
			<div>
				<div className="main_container">
					<div className="left_screen bounceInDown">
						<div className="row_label"> {row_nums} </div>
						<div className="table"> {board} </div>
						<div className="col_label"> {col_nums} </div>
					</div>

					<div className="right_screen bounceInDown">
						<div className="side_box">
							<div className="content">
								<p className="header_font">Chess</p>
							</div>
						</div>

						<div className="side_box">
							<div className="wrapper">
								<div className="player_box">
									<p className="medium_font">White</p>
								</div>
								<div className="player_box black_player_color">
									<p className="medium_font">Black</p>
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
								<div className="mode_restart">
									{!this.state.game_started &&
										<>
											<button
												className="button mode_bot"
												onClick={() => {
													this.setState({
														game_started: true,
														bot_mode: true
													})
												}}
											>
												<p className="button_font">Against Bot</p>
											</button>
											<button
												className="button mode_two"
												onClick={() => {
													this.setState({
														game_started: true,
														bot_mode: false
													})
												}}
											>
												<p className="button_font">Two players</p>
											</button>
										</>
									}
									{this.state.game_started && <button
										className="button restart"
										onClick={() => this.reset()}>
										<p className="button_font">Restart Game</p>
									</button>}
								</div>
								<div className="load_save">
								<button
									className="button save"
									onClick={() => this.saver.handleSaveFile(this.state)}
								>
									<p className="button_font">Save</p>
								</button>
								<label htmlFor="file-upload" className="button load">
									<p className="button_font">Load</p>
								</label>
								<input id="file-upload" style={{ display: "none" }} className="button" key={this.state.key} type="file" onChange={(e) => {
									this.setState((prevState) => ({
										key: prevState.key + 1,
									}));

									this.saver.handleLoadFile(e, this.loadState.bind(this))
								}} />
								</div>
							</div>

							<div className="mate_wrapper">
								<p className="small_font">
									{this.referee.inCheck("w", this.state.squares) &&
										!this.referee.checkmate("w", this.state.squares) === true
										? "White player is in check!"
										: ""}
								</p>
								<p className="small_font">
									{this.referee.inCheck("b", this.state.squares) &&
										!this.referee.checkmate("b", this.state.squares) === true
										? "Black player is in check."
										: ""}
								</p>
								<p className="small_font">
									{this.referee.checkmate("b", this.state.squares) === true
										? "White player won by checkmate!"
										: ""}
								</p>
								<p className="small_font">
									{this.referee.checkmate("w", this.state.squares) === true
										? "Black player won by checkmate."
										: ""}
								</p>
								<p className="small_font">
									{(this.referee.stalemate("w", this.state.squares) &&
										this.state.turn === "w") === true
										? "White player is in stalemate. Game over."
										: ""}
								</p>
								<p className="small_font">
									{(this.referee.stalemate("b", this.state.squares) &&
										this.state.turn === "b") === true
										? "Black player is in stalemate. Game over."
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