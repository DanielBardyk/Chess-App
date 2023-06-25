
import { IStateBoard } from "../Board/Board.types";
import PieceEvaluator from "../PieceEvaluator/PieceEvaluator";
import { PieceType } from "../Pieces/Pieces";
import Referee from "../Referee/Referee";

export default class BotEngine {
	constructor(private referee: Referee, private pieceEvaluator: PieceEvaluator) {}

	private evaluateBlack(squares: PieceType[]) {
		let totalEval = 0;
		for (let i = 0; i < 64; i++) totalEval += this.pieceEvaluator.getPieceValue(squares[i], i);
		return totalEval;
	}
	// мінімакс алгоритм для визначення ходу бота
	public minimax(
		depth: number,
		isBlackPlayer: boolean,
		alpha: number, // поточне найкраще значення, яке може досягти чорний гравець, який максимізує (для альфа-бета відсікання)
		beta: number, // поточне найкраще значення, яке може досягти білий гравець, який мінімізує (для альфа-бета відсікання)
		squares: PieceType[], // приймаємо стан шахової дошки після виконання ходу
		raOfStarts: number[],
		raOfEnds: number[],
		passantPos: number | null,
		boardState: IStateBoard,
		makePossibleMove: (squares: PieceType[], start: number, end: number, statePassantPos: number, passantPos?: number | null) => PieceType[]
	) {
		const copySquares = [...squares];

		if (depth === 0) {
			return this.evaluateBlack(copySquares);
		}

		let bestValue = isBlackPlayer ? -9999 : 9999;

		for (let i = 0; i < 64; i++) {
			let start = raOfStarts[i];

			let isPlayerPiece = copySquares[start].id !== null && copySquares[start].player === (isBlackPlayer ? "b" : "w");

			if (isPlayerPiece) {
				for (let j = 0; j < 64; j++) {
					let end = raOfEnds[j];
					if (this.referee.pieceCanMoveThere(start, end, copySquares, boardState, passantPos)) {
						const testSquares = [...squares];
						const testSquares2 = makePossibleMove(
							testSquares,
							start,
							end,
							boardState.passantPos,
							passantPos
						);
						let passant = 65;
						
						if (
							testSquares[end].id === (isBlackPlayer ? "P" : "p") &&
							start >= (isBlackPlayer ? 8 : 48) &&
							start <= (isBlackPlayer ? 15 : 55) &&
							end - start === (isBlackPlayer ? 16 : -16)
						) {
							passant = end;
						}

						let value = this.minimax(
							depth - 1,
							!isBlackPlayer,
							alpha,
							beta,
							testSquares2,
							raOfStarts,
							raOfEnds,
							passant,
							boardState,
							makePossibleMove
						);
						if (isBlackPlayer) {
							bestValue = Math.max(value, bestValue);
							alpha = Math.max(alpha, bestValue);
							if (beta <= alpha) return bestValue;
						} else {
							bestValue = Math.min(value, bestValue);
							beta = Math.min(beta, bestValue);
							if (beta <= alpha) return bestValue;
						}
					}
				}
			}
		}

		return bestValue;
	}
}