import WhiteKingImage from '../../assets/images/white_king.png'
import BlackKingImage from '../../assets/images/black_king.png'
import WhiteQueenImage from '../../assets/images/white_queen.png'
import BlackQueenImage from '../../assets/images/black_queen.png'
import WhiteKnightImage from '../../assets/images/white_knight.png'
import BlackKnightImage from '../../assets/images/black_knight.png'
import WhiteBishopImage from '../../assets/images/white_bishop.png'
import BlackBishopImage from '../../assets/images/black_bishop.png'
import BlackPawnImage from '../../assets/images/black_pawn.png'
import WhitePawnImage from '../../assets/images/white_pawn.png'
import WhiteRookImage from '../../assets/images/white_rook.png'
import BlackRookImage from '../../assets/images/black_rook.png'

export abstract class Piece {
	protected _highlight: number;
	protected _possible: number;
	protected _icon: React.ReactElement | null;

	constructor(
		protected _player: "w" | "b" | null,
		imageSrc: string | null,
		protected _id: string | null
	) {
		this._highlight = 0;
		this._possible = 0;
		if (imageSrc) this._icon = <img alt='' src={imageSrc} className="piece" />;
		else this._icon = null;
	}

	public abstract pieceCanMove(start: number, end: number): boolean;

	public set highlight(highlight: number) {
		this._highlight = highlight;
	}

	public get highlight(): number {
		return this._highlight;
	}

	public set possible(possible: number) {
		this._possible = possible;
	}

	public get possible(): number {
		return this._possible;
	}

	public set icon(icon: React.ReactElement | null) {
		this._icon = icon;
	}

	public get icon(): React.ReactElement | null {
		return this._icon;
	}

	public set player(player: "w" | "b" | null) {
		this._player = player;
	}

	public get player(): "w" | "b" | null {
		return this._player;
	}

	public set id(id: string | null) {
		this._id = id;
	}

	public get id(): string | null {
		return this._id;
	}
}

export class Pawn extends Piece {
	constructor(player: "w" | "b") {
		const imageSrc = player === "w" ? WhitePawnImage : BlackPawnImage;
		super(player, imageSrc, player === "w" ? "p" : "P");
	}

	public pieceCanMove(start: number, end: number): boolean {
		const start_row = 8 - Math.floor(start / 8);
		const start_col = (start % 8) + 1;
		const end_row = 8 - Math.floor(end / 8);
		const end_col = (end % 8) + 1;

		const row_diff = end_row - start_row;
		const col_diff = end_col - start_col;

		if (this._player === "w") {
			return (
				col_diff === 0 && (row_diff === 1 || row_diff === 2) ||
				(col_diff === -1 || col_diff === 1) && row_diff === 1
			);
		} else {
			return (
				col_diff === 0 && (row_diff === -2 || row_diff === -1) ||
				(col_diff === -1 || col_diff === 1) && row_diff === -1
			);
		}
	}
}

export class King extends Piece {
	private _checked: number;
	private _inCheck: number;
	constructor(player: "w" | "b") {
		const imageSrc = player === "w" ? WhiteKingImage : BlackKingImage;
		super(player, imageSrc, player === "w" ? "k" : "K")
		this._checked = 0;
		this._inCheck = 0;
	}

	public pieceCanMove(start: number, end: number): boolean {
		const start_row = 8 - Math.floor(start / 8);
		const start_col = (start % 8) + 1;
		const end_row = 8 - Math.floor(end / 8);
		const end_col = (end % 8) + 1;

		const row_diff = end_row - start_row;
		const col_diff = end_col - start_col;

		return (
			(row_diff === 1 && col_diff === -1) ||
			(row_diff === 1 && col_diff === 0) ||
			(row_diff === 1 && col_diff === 1) ||
			(row_diff === 0 && col_diff === 1) ||
			(row_diff === -1 && col_diff === 1) ||
			(row_diff === -1 && col_diff === 0) ||
			(row_diff === -1 && col_diff === -1) ||
			(row_diff === 0 && col_diff === -1) ||
			(row_diff === 0 && col_diff === 2) ||
			(row_diff === 0 && col_diff === -2)
		);
	}

	get checked(): number {
		return this._checked;
	}

	set checked(value: number) {
		this._checked = value;
	}

	get inCheck(): number {
		return this._inCheck;
	}

	set inCheck(value: number) {
		this._inCheck = value;
	}
}

export class Queen extends Piece {
	constructor(player: "w" | "b") {
		const imageSrc = player === "w" ? WhiteQueenImage : BlackQueenImage;
		super(player, imageSrc, player === "w" ? "q" : "Q");
	}

	public pieceCanMove(start: number, end: number): boolean {
		const start_row = 8 - Math.floor(start / 8);
		const start_col = (start % 8) + 1;
		const end_row = 8 - Math.floor(end / 8);
		const end_col = (end % 8) + 1;

		const row_diff = end_row - start_row;
		const col_diff = end_col - start_col;

		return (
			(row_diff > 0 && col_diff === 0) ||
			(row_diff === 0 && col_diff > 0) ||
			(row_diff < 0 && col_diff === 0) ||
			(row_diff === 0 && col_diff < 0) ||
			row_diff === col_diff ||
			row_diff === -col_diff
		);
	}
}

export class Bishop extends Piece {
	constructor(player: "w" | "b") {
		const imageSrc = player === "w" ? WhiteBishopImage : BlackBishopImage;
		super(player, imageSrc, player === "w" ? "b" : "B");
	}

	public pieceCanMove(start: number, end: number): boolean {
		const start_row = 8 - Math.floor(start / 8);
		const start_col = (start % 8) + 1;
		const end_row = 8 - Math.floor(end / 8);
		const end_col = (end % 8) + 1;

		const row_diff = end_row - start_row;
		const col_diff = end_col - start_col;

		return row_diff === col_diff || row_diff === -col_diff;
	}
}

export class Knight extends Piece {
	constructor(player: "w" | "b") {
		const imageSrc = player === "w" ? WhiteKnightImage : BlackKnightImage;
		super(player, imageSrc, player === "w" ? "n" : "N");
	}

	public pieceCanMove(start: number, end: number): boolean {
		const start_row = 8 - Math.floor(start / 8);
		const start_col = (start % 8) + 1;
		const end_row = 8 - Math.floor(end / 8);
		const end_col = (end % 8) + 1;

		const row_diff = end_row - start_row;
		const col_diff = end_col - start_col;

		return (
			(row_diff === 1 && col_diff === -2) ||
			(row_diff === 2 && col_diff === -1) ||
			(row_diff === 2 && col_diff === 1) ||
			(row_diff === 1 && col_diff === 2) ||
			(row_diff === -1 && col_diff === 2) ||
			(row_diff === -2 && col_diff === 1) ||
			(row_diff === -2 && col_diff === -1) ||
			(row_diff === -1 && col_diff === -2)
		);
	}
}

export class Rook extends Piece {
	constructor(player: "w" | "b") {
		const imageSrc = player === "w" ? WhiteRookImage : BlackRookImage;
		super(player, imageSrc, player === "w" ? "r" : "R");
	}

	public pieceCanMove(start: number, end: number): boolean {
		const start_row = 8 - Math.floor(start / 8);
		const start_col = (start % 8) + 1;
		const end_row = 8 - Math.floor(end / 8);
		const end_col = (end % 8) + 1;

		const row_diff = end_row - start_row;
		const col_diff = end_col - start_col;

		return (
			(row_diff > 0 && col_diff === 0) ||
			(row_diff === 0 && col_diff > 0) ||
			(row_diff < 0 && col_diff === 0) ||
			(row_diff === 0 && col_diff < 0)
		);
	}
}

export class PieceFiller extends Piece {
	constructor() {
		super(null, null, null)
	}

	public pieceCanMove(start: number, end: number) {
		return false;
	}
}
