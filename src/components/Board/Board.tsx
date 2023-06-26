import React from "react";
import { Pawn, King, Queen, Bishop, Knight, Rook, PieceFiller, PieceType } from "../Pieces/Pieces"
import Saver from "../Saver/Saver";
import BoardManager from "../BoardManager/BoardManager";
import Highlighter from "../Highlighter/Highlighter";
import SquareRenderer from "../SquareRenderer/SquareRenderer";
import Referee from "../Referee/Referee";
import Bot from "../Bot/Bot";
import Player from "../Player/Player";
import StylesCalculator from "../StylesCalculator/StylesCalculator";
import { PanelType } from "../BoardManager/BoardManager.types";
import { IBoardProps, IStateBoard, IStateSerialized } from "./Board.types";

export default class Board extends React.Component<IBoardProps, IStateBoard> {
	private boardManager: BoardManager = new BoardManager();
	private referee: Referee;
	private saver: Saver;
	private squareRenderer: SquareRenderer;
	private bot: Bot;
	private highlighter: Highlighter = new Highlighter();
	private stylesCalculator: StylesCalculator = new StylesCalculator();

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
			whiteKingHasMoved: false,
			blackKingHasMoved: false,
			leftBlackRookHasMoved: false,
			rightBlackRookHasMoved: false,
			leftWhiteRookHasMoved: false,
			rightWhiteRookHasMoved: false,
			passantPos: 65,
			error: null,
			botRunning: false,
			firstRender: true,
			gameStarted: false,
			piecesSelection: false,
			playerSelection: false,
			settingWayChoosed: false,
			againstBot: false,
			mated: false,
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
			return;

		this.setState({
			squares: this.boardManager.initializeEmptyBoard(),
			source: -1,
			turn: "w",
			firstPos: 0,
			secondPos: 0,
			repetition: 0,
			whiteKingHasMoved: false,
			blackKingHasMoved: false,
			leftBlackRookHasMoved: false,
			rightBlackRookHasMoved: false,
			leftWhiteRookHasMoved: false,
			rightWhiteRookHasMoved: false,
			passantPos: 65,
			error: null,
			botRunning: false,
			firstRender: true,
			gameStarted: false,
			piecesSelection: false,
			playerSelection: false,
			settingWayChoosed: false,
			againstBot: false,
			mated: false,
			key: 0
		});
	}

	private updateKingHasMoved(player: "w" | "b") {
		if (player === "w") {
			 this.setState({
				whiteKingHasMoved: true,
			});
		} else {
			 this.setState({
				blackKingHasMoved: true,
			});
		}
	}

	private updateRookHasMoved(player: "w" | "b", start: number) {
		if (start === (player === "w" ? 56 : 0)) {
			if (player === "w") {
				this.setState({
					leftWhiteRookHasMoved: true,
				});
			} else {
				this.setState({
					leftBlackRookHasMoved: true,
				});
			}
		} else if (start === (player === "w" ? 63 : 7)) {
			if (player === "w") {
				this.setState({
					rightWhiteRookHasMoved: true,
				});
			} else {
				this.setState({
					rightBlackRookHasMoved: true,
				});
			}
		}
	}

	private movePiece(player: "w" | "b", squares: PieceType[], start: number, end: number) {
		let copySquares = this.highlighter.clearHighlight([...squares]);

		if (!(this.state.againstBot && player === "b")) {
			copySquares = this.highlighter.clearOnBotMoveHighlight(copySquares, start, player);
		}

		if (copySquares[start].id === (player === "w" ? "k" : "K")) {
			this.updateKingHasMoved(player);
		}

		if (copySquares[start].id === (player === "w" ? "r" : "R")) {
			this.updateRookHasMoved(player, start)
		}

		const playerComponent = new Player();
		copySquares = playerComponent.makePossibleMove(copySquares, start, end, this.state.passantPos);

		const passant = this.referee.checkMoveForPassant(player, copySquares, start, end);

		this.highlighter.highlightMate(copySquares, player, this.state);

		const { checkMated, staleMated } = this.referee.checkForMateStatus(copySquares, player, this.state);

		this.setState({
			passantPos: passant,
			squares: copySquares,
			source: -1,
			mated: checkMated || staleMated ? true : false,
			turn: player === "b" ? "w" : "b",
			botRunning: (this.state.againstBot && player === "w") ? true : false,
		});
	}

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

	private runBot() {
		if (this.state.againstBot) {
			let searchDepth = 3;
			setTimeout(() => {
				this.bot.execute(
					searchDepth, 
					this.state.squares,
					this.state.firstPos,
					this.state.secondPos,
					this.state, 
					this.movePiece.bind(this));
			}, 1200);
		}
	}

	private handleInvalidMove(i: number, squares: PieceType[]) {
		squares[this.state.source].highlight = 0;
		squares = [...this.highlighter.clearPossibleMoveHighlight(squares)];

		// якщо хід не виводить із шаху підсвічуємо
		if (i !== this.state.source && this.referee.inCheck(this.state.turn, squares, this.state)) {
			squares = this.highlighter.highlightCheck(squares, this.state.turn);
		}

		this.setState({
			source: -1,
			squares: squares,
		});
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
		const isPlayerPiece = squares[i].player === this.state.turn;

		if (isPlayerPiece && this.state.source !== i) {
			this.handleSamePieceTwice(i, squares);
		}
		else if (!this.referee.pieceCanMoveThere(this.state.source, i, squares, this.state)) {
			this.handleInvalidMove(i, squares);
		}
		else {
			this.movePiece(this.state.turn, squares, this.state.source, i);
			if(this.state.mated) return;
			this.runBot();
		}
	}

	private handleFirstClick(i: number, squares: PieceType[]) {
		if (squares[i].player !== this.state.turn) return 1;

		if (squares[i].player !== null) {
			squares = this.highlighter.clearCheckHighlight(squares, this.state.turn);

			squares[i].highlight = 1;

			for (let j = 0; j < 64; j++) {
				if (this.referee.pieceCanMoveThere(i, j, squares, this.state)) {
					squares[j].possible = 1;
				}
			}

			this.setState({
				source: i,
				squares: squares,
			});
		}
	}

	private handlePieceSelection(i: number, squares: PieceType[]) {
		const kingSelected = this.state.selectedPiece?.id?.toLowerCase() === "k";
		const checkedSquares = [...this.state.squares];

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
		} else if (!this.referee.isPieceNumValid(checkedSquares, this.state)) {
			return;
		}
		else if (kingSelected && !this.referee.kingSettedCorrectly(squares, i)) {
			return;
		}
		else if (this.state.selectedPiece.id !== "c") {
			checkedSquares[i] = this.boardManager.copyPanelPiece(this.state.selectedPiece) as PieceType;
			const secondPlayer = this.state.turn === "w" ? "b" : "w";
			
			if (this.referee.inCheck(secondPlayer, checkedSquares, this.state)) {
				return;
			}
		}
		
		if(this.state.selectedPiece.id !== "c") {
			squares[i] = this.boardManager.copyPanelPiece(this.state.selectedPiece) as PieceType;
		}

		this.setState({
			squares: squares,
		});

		return;
	}
	
	private handleClick(i: number) {

		let copySquares = [...this.state.squares];

		if(this.state.piecesSelection) {
			this.handlePieceSelection(i, copySquares);
		} else if (this.state.mated) {
			return;
		} else if (this.state.source === -1 && !this.state.botRunning) {
			this.handleFirstClick(i, copySquares);
		} else if (this.state.source > -1) {
			this.handleSecondClick(i, copySquares);
		}
	}

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

	private createCurrentBoard() {
		const board = [];
		for (let i = 0; i < 8; i++) {
			const squareRows = [];
			for (let j = 0; j < 8; j++) {

				const squareCorner = this.stylesCalculator.calcSquareCorner(i, j);
				const copySquares = [...this.state.squares];
				const squareColor = this.stylesCalculator.calcSquareColor(i, j, copySquares);
				const squareCursor = this.stylesCalculator.calcSquareCursor(i, j, copySquares, this.state);
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

	private renderPanel(player: "w" | "b") {
		const panelElements = player === "w" ? this.state.whitePanel : this.state.blackPanel; 
		let piecesArray: JSX.Element[] = [];

		for (let i=0; i < 7; i++) {
			const squareCorner = this.stylesCalculator.calcPanelSquareCorner(i, player);

			piecesArray.push(
				this.squareRenderer.showSquare({
					key: i,
					value: panelElements[i],
					size: "square_piece_selection ",
					color: this.stylesCalculator.calcColorTrainingPiece(panelElements[i], this.state),
					corner: squareCorner,
					cursor: "pointer_cursor",
					onClick: () => {
						this.handlePanelPieceChoose(panelElements[i]);
					}
				})
			)
		}
		return piecesArray;
	}

	render() {

		const { rowNums, colLetters } = this.boardManager.generateLabels(this.state);
		const board = this.createCurrentBoard();
		

		const tableClass = this.state.piecesSelection ? "table_piece_selection" : "table";
		const colClass = this.state.piecesSelection ? "col_label_piece_selection" : "col_label";
		const rowClass = this.state.piecesSelection ? "row_label_piece_selection" : "row_label";

		return (
			<div>
				<div className="main_container">
					<div className="left_screen bounceInDown">
						{ this.state.piecesSelection &&
							<div className="black_panel">{this.renderPanel("b")}</div> }
						<div className={rowClass}> {rowNums} </div>
						<div className={tableClass}> {board} </div>
						<div className={colClass}> {colLetters} </div>
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
														})
														setTimeout(() => {
															this.runBot();
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