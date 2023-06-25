import { IStateBoard } from "../Board/Board.types";
import BotEngine from "../BotEngine/BotEngine";
import PieceEvaluator from "../PieceEvaluator/PieceEvaluator";
import { PieceType } from "../Pieces/Pieces";
import Player from "../Player/Player";
import Referee from "../Referee/Referee";

export default class Bot extends Player {
	private repetition: number;
	protected pieceEvaluator: PieceEvaluator;
	private botEngine: BotEngine;

	constructor(private referee: Referee) {
		super()
		this.repetition = 0;
		this.pieceEvaluator = new PieceEvaluator();
		this.botEngine = new BotEngine(this.referee, this.pieceEvaluator);
	}

	private shuffle(passedInArray: number[]) {
		const array = [...passedInArray];
		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	private findBestMove(
			moves: number[], 
			firstPos: number, 
			secondPos: number, 
			passedInSquares: PieceType[], 
			boardState: IStateBoard, 
			depth: number, 
			raOfStarts: number[], 
			raOfEnds: number[]
		) {
		// Якщо minimax не змінить це значення, не зміниться значення randEnd, отже бот отримав мат
		let bestValue = -9999;
		let randStart = 100;
		let randEnd = 100;

		for (let i = 0; i < moves.length; i += 2) {
			let start = moves[i];
			let end = moves[i + 1];
			
			if (moves.length > 2 && this.repetition >= 2 && start === secondPos && end === firstPos) {
				this.repetition = 0
			} else {
				const testSquares = [...passedInSquares];
				const testSquares2 = this.makePossibleMove(testSquares, start, end, boardState.passantPos);

				let passantPos = 65;
				if (testSquares[start].id === "P" && start >= 8 && start <= 15 && end - start === 16)
					passantPos = end;

				let boardEval = this.botEngine.minimax(
					depth - 1,
					false,
					-1000, // передаємо найгіршу оцінку для alpha (alpha зберігає максимальне значення). Це значення буде передаватися до макимальної глибини.
					1000, // передаємо найгіршу оцінку для beta (beta зберігає мінімальне значення). Це значення буде передаватися до макимальної глибини.
					testSquares2, // передаємо стан шахової дошки після виконання ходу
					raOfStarts,
					raOfEnds,
					passantPos,
					boardState,
					this.makePossibleMove
				);

				if (boardEval >= bestValue) {
					bestValue = boardEval;
					randStart = start;
					randEnd = end;
				}
			}
		}
		return { randStart, randEnd }
	}

	public executeBot(depth: number,
			passedInSquares: PieceType[],
			mated: boolean,
			firstPos: number,
			secondPos: number,
			boardState: IStateBoard,
			movePiece: (player: "b" | "w", squares: PieceType[], start: number, end: number) => void)
		{
		if (mated) return;

		const copySquares = [...passedInSquares];

		const { raOfStarts, raOfEnds } = this.generateRandomPositions();

		const moves = this.generateMoves(copySquares, raOfStarts, raOfEnds, boardState);

		const { randStart, randEnd } = this.findBestMove(
			moves, 
			firstPos, 
			secondPos, 
			passedInSquares, 
			boardState, 
			depth, 
			raOfStarts, 
			raOfEnds
		);

		// Якщо бот не отримав мат
		if (randEnd !== 100) {
			if (randStart === secondPos && randEnd === firstPos) {
				this.repetition += 1;
			} else {
				this.repetition = 0
			}
			movePiece("b", copySquares, randStart, randEnd);
		}
	}

	private generateRandomPositions() {
		let raOfStarts = [];
		let raOfEnds = [];
		
		for (let i = 0; i < 64; i++) {
		  raOfStarts.push(i);
		  raOfEnds.push(i);
		}
		
		raOfStarts = this.shuffle(raOfStarts);
		raOfEnds = this.shuffle(raOfEnds);
		
		return { raOfStarts, raOfEnds };
	}

	private generateMoves(copySquares: PieceType[], raOfStarts: number[], raOfEnds: number[], boardState: IStateBoard) {
		const moves = [];
		
		for (let i = 0; i < 64; i++) {
			const start = raOfStarts[i];
			const isBlackPiece = copySquares[start].id !== null && copySquares[start].player === "b";
		
			if (isBlackPiece) {
			for (let j = 0; j < 64; j++) {
				const end = raOfEnds[j];
				if (this.referee.pieceCanMoveThere(start, end, copySquares, boardState) === true) {
					moves.push(start);
					moves.push(end);
				}
			 }
		  }
		}
		return moves;
	}
}