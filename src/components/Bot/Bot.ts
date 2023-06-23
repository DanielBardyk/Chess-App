import { IStateBoard, PieceType } from "../Board/Board";
import BotEngine from "../BotEngine/BotEngine";
import PieceEvaluator from "../PieceEvaluator/PieceEvaluator";
import Player from "../Player/Player";
import Referee from "../Referee/Referee";

export default class Bot extends Player {
	private repetition: number
	protected pieceEvaluator: PieceEvaluator = new PieceEvaluator()
	private botEngine: BotEngine = new BotEngine(this.referee, this.pieceEvaluator)

	constructor(private referee: Referee) {
		super()
		this.repetition = 0
	}

	private shuffle(passed_in_array: number[]) {
		const array = [...passed_in_array];
		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	public execute_bot(depth: number,
		passed_in_squares: PieceType[],
		mated: boolean,
		firstPos: number,
		secondPos: number,
		boardState: IStateBoard,
		movePiece: (player: "b" | "w", squares: PieceType[], start: number, end: number) => void
		)
		{
		// якщо мат, то виходимо
		if (mated) return "bot cannot run";
		const copy_squares = [...passed_in_squares];

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
		RA_of_starts = this.shuffle(RA_of_starts);
		RA_of_ends = this.shuffle(RA_of_ends);

		// створюємо масив з можливих ходів (масив буде виглядати так: [початок1, перший кінець для початок1, початок1, другий кінець для початок1, третій кінець для початок1....., початок63, перший кінець для початок63, початок63, другий кінець для початок63....])
		let moves = [];
		// у цьому циклі спочатку беремо початкове поле (поле "A")
		for (let i = 0; i < 64; i++) {
			// беремо початкове поле
			let start = RA_of_starts[i];
			// ця зміння true, якщо на цьому полі стоїть фігура бота, інакше false
			let isBlackPiece =
				copy_squares[start].id !== null && copy_squares[start].player === "b";
			// якщо фігура бота, то
			if (isBlackPiece) {
				// для кожного кінцевого поля (поля "B")
				for (let j = 0; j < 64; j++) {
					// беремо кінцеве поле (квадрат)
					let end = RA_of_ends[j];
					// перевіряємо чи можна походити з поля "A" на поле "B"
					if (this.referee.pieceCanMoveThere(start, end, copy_squares, boardState) === true) {
						// якщо можна, додаємо поля "A" та "B"
						moves.push(start);
						moves.push(end);
					}
				}
			}
		}

		// це значення треба буде для того, щоб порівняти його з оцінкою дошки. Цю оцінку дошки поверне ф-ія minimax. Після порівняння, якщо minimax поверне значення менше ніж це, не зміниться значення rand_end, що означатиме що бот отримав мат, інакше все ок й найкращий хід знайдено
		let best_value = -9999;
		// для кожного можливого ходу. Тут ми беремо кожен хід, це завжди верхній рівень дерева, для якого ми визначаємо оцінку, а в мінімакс спочатку оцінюються майбутні ходи після цього ходу, і після цього повертається оцінка цього ходу.
		for (let i = 0; i < moves.length; i += 2) {
			// початкова позиція
			let start = moves[i];
			// кінцева позиція
			let end = moves[i + 1];
			// повторення ходів для нічиї (3 рази один і той самий хід) боту не дозволено, якщо він два рази повторив хід, тоді на третій раз оберається якийсь інший
			if ( // якщо є якийсь інший хід, беремо його (не точно, зовсім зрозумів)
				moves.length > 2 &&
				this.repetition >= 2 &&
				// дві умови нижче визначають, що відбувся повтор
				// означає, що початкова позиція зараз дорівнює попередній кінцевій
				start === secondPos &&
				// означає, що кінцева позиція зараз дорівнює попередній початковій
				end === firstPos
			) { // щоб не допустити нічиї (але не зрозумів, по цій ж лозіці наче бот буде знову повторювати ходи просто)

				this.repetition = 0

			} else {
				const test_squares = [...passed_in_squares];
				// робимо хід
				const test_squares_2 = [...this.makePossibleMove(test_squares, start, end, boardState.passant_pos)];
				// для взяття на проході
				var passant_pos = 65;
				if (
					test_squares[start].id === "P" &&
					start >= 8 &&
					start <= 15 &&
					end - start === 16
				)
					passant_pos = end;
				// оцінюємо цей хід. Для цього в мінімаксі оцінюються всі майбутні ходи, і після цього мінімакс повертає оцінку цього ходу.
				let board_eval = this.botEngine.minimax(
					depth - 1,
					false, // тому перший виклик функції minimax буде для білого гравця
					-1000, // передаємо найгіршу оцінку для alpha (бо воно зберігає максимальне значення). Це значення буде передаватися до макимальної глибини.
					1000, // передаємо найгіршу оцінку для beta(бо воно зберігає мінімальне значення). Це значення буде передаватися до макимальної глибини.
					test_squares_2, // передаємо стан шахової дошки після виконання ходу
					RA_of_starts,
					RA_of_ends,
					passant_pos,
					boardState,
					this.makePossibleMove
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
				// ці умови вказують на те, що відбувся повтор ходів
				rand_start === secondPos &&
				rand_end === firstPos
			) {
				let reps = this.repetition + 1;
				this.repetition = reps
				// це для того, коли ходи повторювались, але перестали
			} else {
				this.repetition = 0
			}

			movePiece("b", copy_squares, rand_start, rand_end);
		}
	}

}