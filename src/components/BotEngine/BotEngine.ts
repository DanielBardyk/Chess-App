import { IStateBoard, PieceType } from "../Board/Board";
import PieceEvaluator from "../PieceEvaluator/PieceEvaluator";
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

		// коли depth = 0, то ми досягли глибини рекурсії (тобто знайшли усі можливі розвитки партії на 3 ходи вперед). Тепер для них усіх треба зробити оцінку (ця оцінка робиться за к-стю чорних фігур на дошці). Коли depth = 0, ми досягли глибини рекурсії, тепер робимо рекурсивне повернення й кожен раз повертаємо оцінку стану шахового поля для чорного гравця в даному виклику ф-ії. Після повернення цієї функції, ми будемо на рівень вище у дереві (тобто depth = depth + 1). Тому після цього код нижче виконається, в якому знову викличеться minimax, і знову depth = 0. Вже на четвертий раз не викличеться. Тобто викличеться аж коли на три рівні вгорі буде.
		if (depth === 0) {
			return this.evaluateBlack(copySquares);
		}

		let bestValue = isBlackPlayer ? -9999 : 9999;
		// пройти по всіх можливих початкових позиціях
		for (let i = 0; i < 64; i++) {
			let start = raOfStarts[i];
			// перевірка, чи є на полі фігура
			let isPlayerPiece =
				copySquares[start].id !== null && copySquares[start].player === (isBlackPlayer ? "b" : "w");

			// якщо поле не пусте, то
			if (isPlayerPiece) {
				// для кожної можливої кінцевої позиції
				for (let j = 0; j < 64; j++) {
					let end = raOfEnds[j];
					if ( // якщо можна зробити хід з поля start на поле end
						this.referee.pieceCanMoveThere(start, end, copySquares, boardState, passantPos) === true
					) { // робимо хід. Метод makePossibleMove повертає стан дошки після зробленого ходу
						const testSquares = [...squares];
						const testSquares2 = [...makePossibleMove(
							testSquares,
							start,
							end,
							boardState.passantPos,
							passantPos
						)];
						// перевіряє, чи зроблений хід є взяттям на проході. Це треба для ф-ії pieceCanMoveThere (без цього вона б оцінювала взяття на прохід як неможливий хід).
						// якщо це значення не зміниться, то ф-ія pieceCanMoveThere буде знати, що даний рух, який перевіряється, не є взяттям на проході
						let passant = 65;
						// якщо цей хід був взяттям на проході, то passant = end
						if (
							testSquares[end].id === (isBlackPlayer ? "P" : "p") &&
							start >= (isBlackPlayer ? 8 : 48) &&
							start <= (isBlackPlayer ? 15 : 55) &&
							end - start === (isBlackPlayer ? 16 : -16)
						) {
							passant = end;
						}

						// визиваємо ф-ію мінімакс, але вже для іншого гравця
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
						// чорний гравець максимізує значення, білий гравець мінімізує значення
						if (isBlackPlayer) {
							// якщо отримане значення (яке повернулось на минулій ітерації ф-ією мінімакс) більше (так як чорний гравець максимізує значення) за попереднє значення (яке було повернуте ще раніше ніж на минулій ітерації), то bestValue дорівнює цьому значенню
							bestValue = Math.max(value, bestValue);
							// для альфа-бета відсікання. Обирає найкраще значення (а тобто, найбільше, бо чорний гравець максимізує) для чорного гравця
							alpha = Math.max(alpha, bestValue);
							// якщо для білих вже був кращий хід, то інша гілка відсікається (тобто не буде робитись оцінка на рівень нижче для білого гравця, бо вже краще для білого на рівень вижче не буде). beta показує найкраще значення для білого гравця, а alpha для чорного, тому якщо на рівень (або декілька рівнів) вижче у білого вже є краща (менша) оцінка beta, то так як чорний вибере на цьому рівні більшу оцінку (alpha), то кращої оцінки вже для білого не буде.
							if (beta <= alpha) return bestValue;
						} else {
							// якщо отримане значення (яке повернулось на минулій ітерації ф-ією мінімакс) менше (так як білий гравець мінімізує значення) за попереднє значення (яке було повернуте ще раніше ніж на минулій ітерації), то bestValue дорівнює цьому значення
							bestValue = Math.min(value, bestValue);
							// для альфа-бета відсікання. Обирає найкраще значення (а тобто, найменше, бо білий гравець мінімізує) для чорного гравця
							beta = Math.min(beta, bestValue);
							// якщо для чорних вже був кращий хід, то інша гілка відсікається (тобто не буде робитись оцінка на рівень нижче для чорного гравця гравця, бо вже краще для чорного на рівень (або декілька рівнів) вижче не буде). beta показує найкраще значення для білого гравця, а alpha для чорного, тому якщо на рівень вижче у чорного вже є краща (більша) оцінка beta, то так як білий вибере на цьому рівні більшу оцінку (alpha), то кращої оцінки вже для чорного не буде.
							if (beta <= alpha) return bestValue;
						}
					}
				}
			}
		}

		return bestValue;
	}
}