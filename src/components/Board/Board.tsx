import React from "react";
import Label from "../Label/Label";
import { Pawn, King, Queen, Bishop, Knight, Rook, PieceFiller } from "../Pieces/Pieces"
import Saver from "../Saver/Saver";
import BoardManager, { PanelType } from "../BoardManager/BoardManager";
import Highlighter from "../Highlighter/Highlighter";
import SquareRenderer from "../SquareRenderer/SquareRenderer";
import Referee from "../Referee/Referee";
import Bot from "../Bot/Bot";
import Player from "../Player/Player";

export type PieceType = Pawn | King | Queen | Bishop | Knight | Rook | PieceFiller

export interface IStateBoard {
	squares: PieceType[], //
	blackPanel: PanelType[], //
	whitePanel: PanelType[], //
	selectedPiece: PanelType | null; //
	source: number, //
	turn: "w" | "b", //
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
	error: string | null,
	first_render: boolean,
	game_started: boolean,
	pieces_selection: boolean,
	player_selection: boolean,
	setting_way_choosed: boolean,
	against_bot: boolean,
	bot_first_move: boolean,
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
			squares: this.boardManager.initializeEmptyBoard(),
			blackPanel: [],
			whitePanel: [],
			selectedPiece: null,
			source: -1,
			turn: "w",
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
			error: null,
			first_render: true,
			game_started: false,
			pieces_selection: false,
			player_selection: false,
			setting_way_choosed: false,
			against_bot: false,
			bot_first_move: false,
			mated: false,
			move_made: false,
			capture_made: false,
			check_flash: false,
			just_clicked: false,
			key: 0
		};
		this.referee = new Referee()
		this.bot = new Bot(this.referee)
	}

	private reset() {
		if (
			this.state.against_bot
			&& this.state.turn === "b"
			&& !this.state.mated
		)
			return "cannot reset";

		this.setState({
			squares: this.boardManager.initializeEmptyBoard(),
			source: -1,
			turn: "w",
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
			error: null,
			first_render: true,
			game_started: false,
			pieces_selection: false,
			player_selection: false,
			setting_way_choosed: false,
			against_bot: false,
			mated: false,
			move_made: false,
			capture_made: false,
			check_flash: false,
			just_clicked: false,
			key: 0
		});
	}

	// переміщення фігури на дошці
	private movePiece(player: "w" | "b", squares: PieceType[], start: number, end: number) {
		let copy_squares = [...squares];

		copy_squares = [...this.highlighter.clearHighlight(copy_squares)];
		if (!(this.state.against_bot && player === "b")) {
			copy_squares = [...this.highlighter.clearPossibleMoveHighlight(copy_squares)];
			for (let j = 0; j < 64; j++) {
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
		copy_squares = [...playerComponent.makePossibleMove(copy_squares, start, end, this.state.passant_pos)];

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
			copy_squares = [...this.highlighter.highlightMate(
				"b",
				copy_squares,
				this.referee.checkmate("b", copy_squares, this.state),
				this.referee.stalemate("b", copy_squares, this.state)
			)];
		} else {
			copy_squares = [...this.highlighter.highlightMate(
				"w",
				copy_squares,
				this.referee.checkmate("w", copy_squares, this.state),
				this.referee.stalemate("w", copy_squares, this.state)
			)];
		}

		let check_mated =
			this.referee.checkmate("w", copy_squares, this.state) || this.referee.checkmate("b", copy_squares, this.state);
		let stale_mated =
			(this.referee.stalemate("w", copy_squares, this.state) && player === "b") ||
			(this.referee.stalemate("b", copy_squares, this.state) && player === "w");

		this.setState({
			passant_pos: passant,
			squares: copy_squares,
			source: -1,
			mated: check_mated || stale_mated ? true : false,
			turn: player === "b" ? "w" : "b",
			// true_turn: player === "b" ? "w" : "b",
			bot_running: (this.state.against_bot && player === "w") ? 1 : 0,
			move_made: true,
		});
	}

	// завантаження збереженої гри
	private loadState(state: IStateSerialized) {
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

	// перевірка двох королей на дошці
	private checkTwoKings() {
		const isTwoKings = this.referee.boardHasTwoKings(this.state.squares);

		if(!isTwoKings) {
			this.setState({
				error: "Must be two kings"
			})
			setTimeout(() => {
				this.setState({
					error: null
				})
			}, 2000)
		}

		return isTwoKings
	}

	// обробка вибору фігури на панелі
	private handlePanelPieceChoose(piece: PanelType) {
		if (this.state.selectedPiece === piece) {
			this.setState({
				selectedPiece: null
			})
		} else {
			this.setState({
				selectedPiece: piece
			})
		}
	}
	
	// обробка натиснення гравця на поле на дошці
	private handleClick(i: number) {

		let copy_squares = [...this.state.squares];

		if(this.state.pieces_selection) {
			const kingSelected = this.state.selectedPiece?.id?.toLowerCase() === "k";
			const checked_squares = [...this.state.squares];

			if (!this.state.selectedPiece) {
				return;
			} else if (
				this.state.selectedPiece.id === "c" && 
				copy_squares[i].player === this.state.selectedPiece.player
				) {
				copy_squares[i] = new PieceFiller();
				// не більше одного короля в одного гравця
			} else if (
				copy_squares.find(
					(p) => 
						p.id?.toLowerCase() === "k" && 
						kingSelected && 
						p.player === this.state.selectedPiece?.player
				)
			) {
				return;
			} else if (
				this.referee.pieceCount("q", checked_squares, this.state) >= 9 || 
				this.referee.pieceCount("b", checked_squares, this.state) >= 10 || 
				this.referee.pieceCount("n", checked_squares, this.state) >= 10 || 
				this.referee.pieceCount("r", checked_squares, this.state) >= 10 || 
				this.referee.pieceCount("p", checked_squares, this.state) >= 8
				) {
				return;
			}
			else if (kingSelected && !this.referee.kingSettedCorrectly(copy_squares, i)) {
				return;
			}
			else if (this.state.selectedPiece.id !== "c") {
				checked_squares[i] = this.state.selectedPiece as PieceType;
				const secondPlayer = this.state.turn === "w" ? "b" : "w";
				
				if (this.referee.inCheck(secondPlayer, checked_squares, this.state)) {
					return;
				}
			}
			
			if(this.state.selectedPiece.id !== "c") {
				copy_squares[i] = this.state.selectedPiece as PieceType;
			}


			this.setState({
				squares: copy_squares,
			});

			return;
		}

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
				copy_squares = [...this.highlighter.clearCheckHighlight(copy_squares, this.state.turn)];
				// і підсвічуємо фігуру, що взята
				copy_squares[i].highlight = 1;

				// підсвічуємо куди можна піти
				for (let j = 0; j < 64; j++) {
					if (this.referee.pieceCanMoveThere(i, j, copy_squares, this.state))
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
				copy_squares = [...this.highlighter.clearPossibleMoveHighlight(copy_squares)];
				// підсвічуємо ходи, які тепер можна зробити, після цього ходу
				for (let j = 0; j < 64; j++) {
					if (this.referee.pieceCanMoveThere(i, j, copy_squares, this.state))
						copy_squares[j].possible = 1;
				}
				// встановлюємо source на поле, на яке було натиснуто
				this.setState({
					source: i,
					squares: copy_squares,
				});
				// рокіровка (або може є ще щось, не знаю)
			} else {
				if(!this.state.bot_first_move) {
					// Якщо не можна зробити рокіровку то треба додати підсвітку і змінити певні пропси
					if (!this.referee.pieceCanMoveThere(this.state.source, i, copy_squares, this.state)) {
						// не підсвічуати поля, якщо обрано неможливий хід
						copy_squares[this.state.source].highlight = 0;
						copy_squares = [...this.highlighter.clearPossibleMoveHighlight(copy_squares)];
						// якщо користувач під шахом, виділіть короля червоним кольором, якщо користувач намагається зробити хід, який не виведе його з шаху
						if (
							// означає, що друге натиснення і король під шахом
							i !== this.state.source &&
							this.referee.inCheck(this.state.turn, copy_squares, this.state) === true
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
					}

				// виклик бота
				if (this.state.against_bot) {
					let search_depth = 3;
					setTimeout(() => {
						this.bot.execute_bot(
							search_depth, 
							this.state.squares, 
							this.state.mated,
							this.state.first_pos,
							this.state.second_pos,
							this.state, 
							this.movePiece.bind(this));
					}, 700);
				}
				if (this.state.bot_first_move) {
					this.setState({
						bot_first_move: false
					})
				}
			}
		}
	}

	// рендеринг панелі для вибору фігур у тренувальному режимі
	private renderPanel(player: "w" | "b") {
		let square_corner;
		const panel_elements = player === "w" ? this.state.whitePanel : this.state.blackPanel; 
		let pieces_array: JSX.Element[] = [];

		for (let i=0; i < 7; i++) {
			if (i === 0 && player === "w") square_corner = " bottom_left_square ";
			else if (i === 6 && player === "w") square_corner = " bottom_right_square ";
			else if (i === 0 && player === "b") square_corner = " top_left_square ";
			else if (i === 6 && player === "b") square_corner = " top_right_square ";
			else square_corner = " "

			pieces_array.push(
				this.squareRenderer.showSquare({
					key: i,
					value: panel_elements[i],
					size: "square_piece_selection ",
					color: this.boardManager.calcColorTrainingPiece(panel_elements[i], this.state),
					corner: square_corner,
					cursor: "pointer",
					onClick: () => {
						this.handlePanelPieceChoose(panel_elements[i])
					}
				})
			)
		}
		return pieces_array;
	}

	render() {
		const row_nums = Array.from({ length: 8 }, (_, i) => (
				<Label 
					key={i} 
					value={8 - i} 
					size={this.state.pieces_selection ? "label_piece_selection" : "label"} 
				/>
		));

		const col_letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
		const col_nums = col_letters.map((letter) => (
				<Label
					key={letter}
					value={letter}
					size={this.state.pieces_selection ? "label_piece_selection" : "label"}
				/>
		))

		const board = [];
		for (let i = 0; i < 8; i++) {
			const squareRows = [];
			for (let j = 0; j < 8; j++) {
				const square_corner =
					(i === 0 && j === 0) ? " top_left_square " :
					(i === 0 && j === 7) ? " top_right_square " :
					(i === 7 && j === 0) ? " bottom_left_square " :
					(i === 7 && j === 7) ? " bottom_right_square " :
					" ";

				const copy_squares = [...this.state.squares];
				const square_color = this.boardManager.calcSquareColor(i, j, copy_squares);
				let square_cursor = (this.state.turn === copy_squares[i * 8 + j].player && !this.state.bot_running) ? "pointer" : "default";
				if (this.state.bot_running === 1 && !this.state.mated) square_cursor = "bot_running";
				if (this.state.mated) square_cursor = "default";
				if(this.state.pieces_selection) square_cursor = "pointer";
				const square_size = this.state.pieces_selection ? "square_piece_selection " : "square ";

				squareRows.push(
					this.squareRenderer.showSquare({
						key: i * 8 + j,
						value: copy_squares[i * 8 + j],
						size: square_size,
						color: square_color,
						corner: square_corner,
						cursor: square_cursor,
						onClick: () => {
							if (this.state.game_started || this.state.pieces_selection) {
								this.handleClick(i * 8 + j);
							}
						}})
				);
			}
			board.push(<div key={i}>{squareRows}</div>);
		}

		const table_class = this.state.pieces_selection ? "table_piece_selection" : "table";
		const col_class = this.state.pieces_selection ? "col_label_piece_selection" : "col_label";
		const row_class = this.state.pieces_selection ? "row_label_piece_selection" : "row_label";

		return (
			<div>
				<div className="main_container">
					<div className="left_screen bounceInDown">
						{ this.state.pieces_selection &&
							<div className="black_panel">{this.renderPanel("b")}</div> }
						<div className={row_class}> {row_nums} </div>
						<div className={table_class}> {board} </div>
						<div className={col_class}> {col_nums} </div>
						{ this.state.pieces_selection &&
							<div className="white_panel">{this.renderPanel("w")}</div> }
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
								<div className={!this.state.player_selection ? "start" : "start selection_start"}>

									{/* Дошка відкрита перший раз або відбулось очищення дошки */}
									{this.state.first_render &&
										<>
											<button
											className="button all_pieces"
											onClick={() => {
												this.setState({
													setting_way_choosed: true,
													first_render: false,
													squares: this.boardManager.initializeBoard()
												})
											}}
											>
												<p className="button_font">All pieces</p>
											</button>
											<button
											className="button choose_pieces"
											onClick={() => {
												this.setState({
													setting_way_choosed: true,
													player_selection: true,
													first_render: false
												})
											}}
											>
												<p className="button_font">Choose pieces</p>
											</button>
										</>
									}

									{/* Вибір режиму гри, після чого гра починається */}
									{this.state.setting_way_choosed && !this.state.player_selection && !this.state.game_started &&
										<>
											<button
												className="button against_bot"	
												onClick={() => {
													this.checkTwoKings() &&
													this.setState({
														against_bot: true,
														pieces_selection: false,
														selectedPiece: null,
														game_started: true,
													})
													if(this.state.turn === "b") {
														this.setState({
															source: 1,
															bot_first_move: true
														})
														setTimeout(() => {
															this.handleClick(1);
														}, 1000)
													}
												}}
											>
												<p className="button_font">Against Bot</p>
											</button>
											<button
												className="button two_players"
												onClick={() => {
													this.checkTwoKings() &&
													this.setState({
														against_bot: false,
														pieces_selection: false,
														selectedPiece: null,
														game_started: true
													})
												}}
											>
												<p className="button_font">Two players</p>
											</button>
										</>
									}

									{/* Вибір гравця, що ходитиме першим у тренувальному режимі */}
									{this.state.player_selection && <div className="player_selection">
										<button
										className="button player_button"
										onClick={() => {
											this.setState({
												pieces_selection: true,
												player_selection: false,
												turn: "w",
												blackPanel: this.boardManager.createTrainingPiecesArray("b"),
												whitePanel: this.boardManager.createTrainingPiecesArray("w"),
											})
										}}
										>
											<p className="button_font">White</p>
										</button>
										<div className="first_player">Moves first</div>
										<button
										className="button player_button"
										onClick={() => {
											this.setState({
												pieces_selection: true,
												player_selection: false,
												turn: "b",
												blackPanel: this.boardManager.createTrainingPiecesArray("b"),
												whitePanel: this.boardManager.createTrainingPiecesArray("w"),
											})
										}}
										>
											<p className="button_font">Black</p>
										</button>
									</div>}

									{/* Очищення дошки */}
									{this.state.game_started && <button
										className="button restart"
										onClick={() => this.reset()}>
										<p className="button_font">Restart Game</p>
									</button>}

								</div>
									
								{/* Збереження та відновлення гри */}
								{ ((this.state.setting_way_choosed && this.state.game_started) || this.state.first_render) && <div className="load_save">
									{!this.state.first_render && <button
										className="button save"
										onClick={() => this.saver.handleSaveFile(this.state)}
									>
										<p className="button_font">Save</p>
									</button>}
									<label htmlFor="file-upload" className="button load">
										<p className="button_font">Load</p>
									</label>
									<input id="file-upload" style={{ display: "none" }} className="button" key={this.state.key} type="file" onChange={(e) => {
										this.setState((prevState) => ({
											key: prevState.key + 1,
										}));

										this.saver.handleLoadFile(e, this.loadState.bind(this));
									}} />
								</div>}

							</div>

							{ (this.state.game_started || this.state.error) && <div className="mate_wrapper">
								{!this.state.error &&
								<>
									<p className="small_font">
										{this.referee.inCheck("w", this.state.squares, this.state) &&
											!this.referee.checkmate("w", this.state.squares, this.state) === true
											? "White player is in check!"
											: ""}
									</p>
									<p className="small_font">
										{this.referee.inCheck("b", this.state.squares, this.state) &&
											!this.referee.checkmate("b", this.state.squares, this.state) === true
											? "Black player is in check."
											: ""}
									</p>
									<p className="small_font">
										{this.referee.checkmate("b", this.state.squares, this.state) === true
											? "White player won by checkmate!"
											: ""}
									</p>
									<p className="small_font">
										{this.referee.checkmate("w", this.state.squares, this.state) === true
											? "Black player won by checkmate."
											: ""}
									</p>
									<p className="small_font">
										{(this.referee.stalemate("w", this.state.squares, this.state) &&
											this.state.turn === "w") === true
											? "White player is in stalemate. Game over."
											: ""}
									</p>
									<p className="small_font">
										{(this.referee.stalemate("b", this.state.squares, this.state) &&
											this.state.turn === "b") === true
											? "Black player is in stalemate. Game over."
											: ""}
									</p>
								</>
								}
								<p className="small_font">{this.state.error}</p>
							</div> }

						</div>
					</div>
				</div>
			</div>
		);
	}
}