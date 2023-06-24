import React from "react";
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
	squares: PieceType[],
	blackPanel: PanelType[],
	whitePanel: PanelType[],
	selectedPiece: PanelType | null;
	source: number,
	turn: "w" | "b",
	firstPos: number, // Bot
	secondPos: number, // Bot
	repetition: number, // Bot
	whiteKingHasMoved: number, // Referee
	blackKingHasMoved: number, // Referee
	leftBlackRookHasMoved: number, // Referee
	rightBlackRookHasMoved: number, // Referee
	leftWhiteRookHasMoved: number, // Referee
	rightWhiteRookHasMoved: number, // Referee
	passantPos: number,
	botRunning: number,
	error: string | null,
	firstRender: boolean,
	gameStarted: boolean,
	piecesSelection: boolean,
	playerSelection: boolean,
	settingWayChoosed: boolean,
	againstBot: boolean,
	botFirstMove: boolean,
	mated: boolean,
	checkHighlighted: boolean,
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
			firstPos: 0,
			secondPos: 0,
			repetition: 0,
			whiteKingHasMoved: 0,
			blackKingHasMoved: 0,
			leftBlackRookHasMoved: 0,
			rightBlackRookHasMoved: 0,
			leftWhiteRookHasMoved: 0,
			rightWhiteRookHasMoved: 0,
			passantPos: 65,
			botRunning: 0,
			error: null,
			firstRender: true,
			gameStarted: false,
			piecesSelection: false,
			playerSelection: false,
			settingWayChoosed: false,
			againstBot: false,
			botFirstMove: false,
			mated: false,
			checkHighlighted: false,
			just_clicked: false,
			key: 0
		};
		this.referee = new Referee()
		this.bot = new Bot(this.referee)
	}

	private reset() {
		if (
			this.state.againstBot
			&& this.state.turn === "b"
			&& !this.state.mated
		)
			return "cannot reset";

		this.setState({
			squares: this.boardManager.initializeEmptyBoard(),
			source: -1,
			turn: "w",
			firstPos: 0,
			secondPos: 0,
			repetition: 0,
			whiteKingHasMoved: 0,
			blackKingHasMoved: 0,
			leftBlackRookHasMoved: 0,
			rightBlackRookHasMoved: 0,
			leftWhiteRookHasMoved: 0,
			rightWhiteRookHasMoved: 0,
			passantPos: 65,
			botRunning: 0,
			error: null,
			firstRender: true,
			gameStarted: false,
			piecesSelection: false,
			playerSelection: false,
			settingWayChoosed: false,
			againstBot: false,
			mated: false,
			checkHighlighted: false,
			just_clicked: false,
			key: 0
		});
	}

	// переміщення фігури на дошці
	private movePiece(player: "w" | "b", squares: PieceType[], start: number, end: number) {
		let copySquares = [...squares];

		copySquares = [...this.highlighter.clearHighlight(copySquares)];
		if (!(this.state.againstBot && player === "b")) {
			copySquares = [...this.highlighter.clearPossibleMoveHighlight(copySquares)];
			for (let j = 0; j < 64; j++) {
				if (copySquares[start].id === (player === "w" ? "k" : "K")) {
					let king = copySquares[j] as King;
					king.inCheck = 0;
					copySquares[j] = king;
					break;
				}
			}
		}

		if (copySquares[start].id === (player === "w" ? "k" : "K")) {
			if (player === "w") {
				this.setState({
					whiteKingHasMoved: 1,
				});
			} else {
				this.setState({
					blackKingHasMoved: 1,
				});
			}
		}

		if (copySquares[start].id === (player === "w" ? "r" : "R")) {
			// якщо походила ліва тура, то змінюємо пропс, який буде вказувати, що рокіровку через ферзевий фланг більше зробити не можна
			if (start === (player === "w" ? 56 : 0)) {
				if (player === "w") {
					this.setState({
						leftWhiteRookHasMoved: 1,
					});
				} else {
					this.setState({
						leftBlackRookHasMoved: 1,
					});
				}
				// якщо походила права тура, то змінюємо пропс, який буде вказувати, що рокіровку через королівський фланг більше зробити не можна
			} else if (start === (player === "w" ? 63 : 7)) {
				if (player === "w") {
					this.setState({
						rightWhiteRookHasMoved: 1,
					});
				} else {
					this.setState({
						rightBlackRookHasMoved: 1,
					});
				}
			}
		}

		const playerComponent = new Player()
		copySquares = [...playerComponent.makePossibleMove(copySquares, start, end, this.state.passantPos)];

		var passant_true =
			player === "w"
				? copySquares[end].id === "p" &&
				start >= 48 &&
				start <= 55 &&
				end - start === -16
				: copySquares[end].id === "P" &&
				start >= 8 &&
				start <= 15 &&
				end - start === 16;
		let passant = passant_true ? end : 65;

		if (player === "w") {
			copySquares = [...this.highlighter.highlightMate(
				"b",
				copySquares,
				this.referee.checkmate("b", copySquares, this.state),
				this.referee.stalemate("b", copySquares, this.state)
			)];
		} else {
			copySquares = [...this.highlighter.highlightMate(
				"w",
				copySquares,
				this.referee.checkmate("w", copySquares, this.state),
				this.referee.stalemate("w", copySquares, this.state)
			)];
		}

		let check_mated =
			this.referee.checkmate("w", copySquares, this.state) || this.referee.checkmate("b", copySquares, this.state);
		let stale_mated =
			(this.referee.stalemate("w", copySquares, this.state) && player === "b") ||
			(this.referee.stalemate("b", copySquares, this.state) && player === "w");

		this.setState({
			passantPos: passant,
			squares: copySquares,
			source: -1,
			mated: check_mated || stale_mated ? true : false,
			turn: player === "b" ? "w" : "b",
			// true_turn: player === "b" ? "w" : "b",
			botRunning: (this.state.againstBot && player === "w") ? 1 : 0,
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

	private handleFirstClick(i: number, squares: PieceType[]) {
		if (squares[i].player !== this.state.turn) return 1;

		if (squares[i].player !== null) {
			this.setState({
				checkHighlighted: false,
				just_clicked: false,
			});

			squares = [...this.highlighter.clearCheckHighlight(squares, this.state.turn)];
			squares[i].highlight = 1;

			for (let j = 0; j < 64; j++) {
				if (this.referee.pieceCanMoveThere(i, j, squares, this.state))
				squares[j].possible = 1;
			}

			this.setState({
				source: i,
				squares: squares,
			});
		}
	}

	private highlightCheck(squares: PieceType[]) {
		for (let j = 0; j < 64; j++) {
			if ((this.state.turn === "w" && squares[j].id === "k")
				|| (this.state.turn === "b" && squares[j].id === "K")) {
				let king = squares[j] as King;
				king.inCheck = 1;
				squares[j] = king;
				break;
			}
		}
	}

	private handleSamePieceTwice(i: number, squares: PieceType[]) {
		squares[i].highlight = 1;
		squares[this.state.source].highlight = 0;
		squares = [...this.highlighter.clearPossibleMoveHighlight(squares)];
		
		for (let j = 0; j < 64; j++) {
			if (this.referee.pieceCanMoveThere(i, j, squares, this.state))
			squares[j].possible = 1;
		}

		this.setState({
			source: i,
			squares: squares,
		});
	}

	private handleSecondClick(i: number, squares: PieceType[]) {
		// ця змінна true, якщо гравець на другому натисканні вибрав його фігуру
		const isPlayerPiece = squares[i].player === this.state.turn;

		// this.state.source !== i перевіряє чи не натиснув гравець на його ж фігуру ще раз (інакше рокіровка, або може є ще щось, не знаю)
		if (isPlayerPiece === true && this.state.source !== i) {
			this.handleSamePieceTwice(i, squares);
		} else { // рокіровка
			if(!this.state.botFirstMove) {
				// Якщо хід зробити неможливо то треба змінити підсвітку
				if (!this.referee.pieceCanMoveThere(this.state.source, i, squares, this.state)) {
					squares[this.state.source].highlight = 0;
					squares = [...this.highlighter.clearPossibleMoveHighlight(squares)];
					// якщо хід не виводить із шаху підсвічуємо
					if (i !== this.state.source && this.referee.inCheck(this.state.turn, squares, this.state)) {
						this.highlightCheck(squares);
						this.setState({
							checkHighlighted: true,
						});
					}
					// source: -1 відміняє попередні натискання, через те що рокіровка неможлива. Тепер користувач повинен знову зробити два натискання
					this.setState({
						source: -1,
						squares: squares,
					});
					return "invalid move";
				}

				this.movePiece(this.state.turn, squares, this.state.source, i);
			}

			if (this.state.againstBot) {
				let search_depth = 3;
				setTimeout(() => {
					this.bot.execute_bot(
						search_depth, 
						this.state.squares, 
						this.state.mated,
						this.state.firstPos,
						this.state.secondPos,
						this.state, 
						this.movePiece.bind(this));
				}, 700);
			}
			
			if (this.state.botFirstMove) {
				this.setState({
					botFirstMove: false
				})
			}
		}
	}

	private handlePieceSelection(i: number, squares: PieceType[]) {
		const kingSelected = this.state.selectedPiece?.id?.toLowerCase() === "k";
			const checked_squares = [...this.state.squares];

			if (!this.state.selectedPiece) {
				return;
			} else if (
				this.state.selectedPiece.id === "c" && 
				squares[i].player === this.state.selectedPiece.player
				) {
					squares[i] = new PieceFiller();
				// не більше одного короля в одного гравця
			} else if (
				squares.find(
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
			else if (kingSelected && !this.referee.kingSettedCorrectly(squares, i)) {
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
				squares[i] = this.state.selectedPiece as PieceType;
			}

			this.setState({
				squares: squares,
			});

			return;
	}
	
	// обробка натиснення гравця на поле на дошці
	private handleClick(i: number) {

		let copySquares = [...this.state.squares];

		if(this.state.piecesSelection) {
			this.handlePieceSelection(i, copySquares);
		} else if (this.state.mated) {
			return "game-over"
		} else if (this.state.source === -1 && this.state.botRunning === 0) {
			this.handleFirstClick(i, copySquares);
		} else if (this.state.source > -1) {
			this.handleSecondClick(i, copySquares);
		}
	}

	private getSquareCorner(i: number, j: number) {
		if (i === 0 && j === 0) return " top_left_square ";
		if (i === 0 && j === 7) return " top_right_square ";
		if (i === 7 && j === 0) return " bottom_left_square ";
		if (i === 7 && j === 7) return " bottom_right_square ";
		return " ";
	}

	private getSquareCursor(i: number, j: number, copySquares: PieceType[]) {
		let squareCursor = (this.state.turn === copySquares[i * 8 + j].player && !this.state.botRunning) ? "pointer" : "default";
		if (this.state.botRunning === 1 && !this.state.mated) squareCursor = "bot_running";
		if (this.state.mated) squareCursor = "default";
		if(this.state.piecesSelection) squareCursor = "pointer";

		return squareCursor;
	}

	private getPanelSquareCorner(i: number, player: "w" | "b") {
		if (i === 0 && player === "w") return " bottom_left_square ";
			else if (i === 6 && player === "w") return " bottom_right_square ";
			else if (i === 0 && player === "b") return " top_left_square ";
			else if (i === 6 && player === "b") return " top_right_square ";
			else return " "
	}

	private createCurrentBoard() {
		const board = [];
		for (let i = 0; i < 8; i++) {
			const squareRows = [];
			for (let j = 0; j < 8; j++) {

				const squareCorner = this.getSquareCorner(i, j);
				const copySquares = [...this.state.squares];
				const squareColor = this.boardManager.calcSquareColor(i, j, copySquares);
				const squareCursor = this.getSquareCursor(i, j, copySquares);
				const squareSize = this.state.piecesSelection ? "square_piece_selection " : "square ";

				squareRows.push(
					this.squareRenderer.showSquare({
						key: i * 8 + j,
						value: copySquares[i * 8 + j],
						size: squareSize,
						color: squareColor,
						corner: squareCorner,
						cursor: squareCursor,
						onClick: () => {
							if (this.state.gameStarted || this.state.piecesSelection) {
								this.handleClick(i * 8 + j);
							}
						}
					})
				);
			}
			board.push(<div key={i}>{squareRows}</div>);
		}
		return board;
	}

	// рендеринг панелі для вибору фігур у тренувальному режимі
	private renderPanel(player: "w" | "b") {
		const panel_elements = player === "w" ? this.state.whitePanel : this.state.blackPanel; 
		let pieces_array: JSX.Element[] = [];

		for (let i=0; i < 7; i++) {
			const squareCorner = this.getPanelSquareCorner(i, player);

			pieces_array.push(
				this.squareRenderer.showSquare({
					key: i,
					value: panel_elements[i],
					size: "square_piece_selection ",
					color: this.boardManager.calcColorTrainingPiece(panel_elements[i], this.state),
					corner: squareCorner,
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

		const { rowNums, colLetters } = this.boardManager.generateLabels(this.state);
		const board = this.createCurrentBoard();
		

		const table_class = this.state.piecesSelection ? "table_piece_selection" : "table";
		const col_class = this.state.piecesSelection ? "col_label_piece_selection" : "col_label";
		const row_class = this.state.piecesSelection ? "row_label_piece_selection" : "row_label";

		return (
			<div>
				<div className="main_container">
					<div className="left_screen bounceInDown">
						{ this.state.piecesSelection &&
							<div className="black_panel">{this.renderPanel("b")}</div> }
						<div className={row_class}> {rowNums} </div>
						<div className={table_class}> {board} </div>
						<div className={col_class}> {colLetters} </div>
						{ this.state.piecesSelection &&
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
								<div className={!this.state.playerSelection ? "start" : "start selection_start"}>

									{/* Дошка відкрита перший раз або відбулось очищення дошки */}
									{this.state.firstRender &&
										<>
											<button
											className="button all_pieces"
											onClick={() => {
												this.setState({
													settingWayChoosed: true,
													firstRender: false,
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
													settingWayChoosed: true,
													playerSelection: true,
													firstRender: false
												})
											}}
											>
												<p className="button_font">Choose pieces</p>
											</button>
										</>
									}

									{/* Вибір режиму гри, після чого гра починається */}
									{this.state.settingWayChoosed && !this.state.playerSelection && !this.state.gameStarted &&
										<>
											<button
												className="button againstBot"	
												onClick={() => {
													this.checkTwoKings() &&
													this.setState({
														againstBot: true,
														piecesSelection: false,
														selectedPiece: null,
														gameStarted: true,
													})
													if(this.state.turn === "b") {
														this.setState({
															source: 1,
															botFirstMove: true
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
														againstBot: false,
														piecesSelection: false,
														selectedPiece: null,
														gameStarted: true
													})
												}}
											>
												<p className="button_font">Two players</p>
											</button>
										</>
									}

									{/* Вибір гравця, що ходитиме першим у тренувальному режимі */}
									{this.state.playerSelection && <div className="player_selection">
										<button
										className="button player_button"
										onClick={() => {
											this.setState({
												piecesSelection: true,
												playerSelection: false,
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
												piecesSelection: true,
												playerSelection: false,
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
									{this.state.gameStarted && <button
										className="button restart"
										onClick={() => this.reset()}>
										<p className="button_font">Restart Game</p>
									</button>}

								</div>
									
								{/* Збереження та відновлення гри */}
								{ ((this.state.settingWayChoosed && this.state.gameStarted) || this.state.firstRender) && <div className="load_save">
									{!this.state.firstRender && <button
										className="button save"
										onClick={() => this.saver.handleSaveFile(this.state)}
									>
										<p className="button_font">Save</p>
									</button>}
									<label htmlFor="file-upload" className="button load">
										<p className="button_font">Load</p>
									</label>
									<input id="file-upload" style={{ display: "none" }} className="button" key={this.state.key} type="file" onChange={(e) => {
										// змінюємо key для перерисовки <input>
										this.setState((prevState) => ({
											key: prevState.key + 1,
										}));

										this.saver.handleLoadFile(e, this.loadState.bind(this));
									}} />
								</div>}

							</div>

							{ (this.state.gameStarted || this.state.error) && <div className="mate_wrapper">
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