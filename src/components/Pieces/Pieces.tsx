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
export class Pawn {
	player: "w" | "b";
	highlight: number;
	possible: number;
	icon: any;
	ascii: string;
	constructor(player: "w" | "b") {
		this.player = player;
		this.highlight = 0;
		this.possible = 0;
		this.icon =
			player === "w" ? (
				<img alt='' src={WhitePawnImage} className="piece"></img>
			) : (
				<img alt='' src={BlackPawnImage} className="piece"></img>
			);
		this.ascii = player === "w" ? "p" : "P";
	}

	// function that defines piece's valid move shape
	can_move(start: number, end: number) {
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;

		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;

		if (this.player === "w") {
			if (col_diff === 0) {
				if (row_diff === 1 || row_diff === 2) return true;
			} else if (col_diff === -1 || col_diff === 1) {
				if (row_diff === 1) return true;
			}
		} else {
			if (col_diff === 0) {
				if (row_diff === -2 || row_diff === -1) return true;
			} else if (col_diff === -1 || col_diff === 1) {
				if (row_diff === -1) return true;
			}
		}
		return false;
	}
}
export class King {
	player: "w" | "b";
	highlight: number;
	possible: number;
	checked: number;
	in_check: number;
	icon: any;
	ascii: string;
	constructor(player: "w" | "b") {
		this.player = player;
		this.highlight = 0;
		this.possible = 0;
		this.checked = 0;
		this.in_check = 0;
		this.icon =
			player === "w" ? (
				<img alt='' src={WhiteKingImage} className="piece"></img>
			) : (
				<img alt='' src={BlackKingImage} className="piece"></img>
			);
		this.ascii = player === "w" ? "k" : "K";
	}

	// function that defines piece's valid move shape
	can_move(start: number, end: number) {
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;

		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;

		if (row_diff === 1 && col_diff === -1) {
			return true;
		} else if (row_diff === 1 && col_diff === 0) {
			return true;
		} else if (row_diff === 1 && col_diff === 1) {
			return true;
		} else if (row_diff === 0 && col_diff === 1) {
			return true;
		} else if (row_diff === -1 && col_diff === 1) {
			return true;
		} else if (row_diff === -1 && col_diff === 0) {
			return true;
		} else if (row_diff === -1 && col_diff === -1) {
			return true;
		} else if (row_diff === 0 && col_diff === -1) {
			return true;
		} else if (row_diff === 0 && col_diff === 2) {
			return true;
		} else if (row_diff === 0 && col_diff === -2) {
			return true;
		}
		return false;
	}
}
export class Queen {
	player: "w" | "b";
	highlight: number;
	possible: number;
	icon: any;
	ascii: string;
	constructor(player: "w" | "b") {
		this.player = player;
		this.highlight = 0;
		this.possible = 0;
		this.icon =
			player === "w" ? (
				<img alt='' src={WhiteQueenImage} className="piece"></img>
			) : (
				<img alt='' src={BlackQueenImage} className="piece"></img>
			);
		this.ascii = player === "w" ? "q" : "Q";
	}

	// function that defines piece's valid move shape
	can_move(start: number, end: number) {
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;

		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;

		if (row_diff > 0 && col_diff === 0) {
			return true;
		} else if (row_diff === 0 && col_diff > 0) {
			return true;
		} else if (row_diff < 0 && col_diff === 0) {
			return true;
		} else if (row_diff === 0 && col_diff < 0) {
			return true;
		} else if (row_diff === col_diff) {
			return true;
		} else if (row_diff === -col_diff) {
			return true;
		}
		return false;
	}
}
export class Bishop {
	player: "w" | "b";
	highlight: number;
	possible: number;
	icon: any;
	ascii: string;
	constructor(player: "w" | "b") {
		this.player = player;
		this.highlight = 0;
		this.possible = 0;
		this.icon =
			player === "w" ? (
				<img alt='' src={WhiteBishopImage} className="piece"></img>
			) : (
				<img alt='' src={BlackBishopImage} className="piece"></img>
			);
		this.ascii = player === "w" ? "b" : "B";
	}

	// function that defines piece's valid move shape
	can_move(start: number, end: number) {
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;

		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;

		if (row_diff === col_diff) {
			return true;
		} else if (row_diff === -col_diff) {
			return true;
		}
		return false;
	}
}
export class Knight {
	player: "w" | "b";
	highlight: number;
	possible: number;
	icon: any;
	ascii: string;
	constructor(player: "w" | "b") {
		this.player = player;
		this.highlight = 0;
		this.possible = 0;
		this.icon =
			player === "w" ? (
				<img alt='' src={WhiteKnightImage} className="piece"></img>
			) : (
				<img alt='' src={BlackKnightImage} className="piece"></img>
			);
		this.ascii = player === "w" ? "n" : "N";
	}

	// function that defines piece's valid move shape
	can_move(start: number, end: number) {
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;

		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;

		if (row_diff === 1 && col_diff === -2) {
			return true;
		} else if (row_diff === 2 && col_diff === -1) {
			return true;
		} else if (row_diff === 2 && col_diff === 1) {
			return true;
		} else if (row_diff === 1 && col_diff === 2) {
			return true;
		} else if (row_diff === -1 && col_diff === 2) {
			return true;
		} else if (row_diff === -2 && col_diff === 1) {
			return true;
		} else if (row_diff === -2 && col_diff === -1) {
			return true;
		} else if (row_diff === -1 && col_diff === -2) {
			return true;
		}
		return false;
	}
}
export class Rook {
	player: "w" | "b";
	highlight: number;
	possible: number;
	icon: any;
	ascii: string;
	constructor(player: "w" | "b") {
		this.player = player;
		this.highlight = 0;
		this.possible = 0;
		this.icon =
			player === "w" ? (
				<img alt='' src={WhiteRookImage} className="piece"></img>
			) : (
				<img alt='' src={BlackRookImage} className="piece"></img>
			);
		this.ascii = player === "w" ? "r" : "R";
	}

	// function that defines piece's valid move shape
	can_move(start: number, end: number) {
		var start_row = 8 - Math.floor(start / 8);
		var start_col = (start % 8) + 1;
		var end_row = 8 - Math.floor(end / 8);
		var end_col = (end % 8) + 1;

		var row_diff = end_row - start_row;
		var col_diff = end_col - start_col;

		if (row_diff > 0 && col_diff === 0) {
			return true;
		} else if (row_diff === 0 && col_diff > 0) {
			return true;
		} else if (row_diff < 0 && col_diff === 0) {
			return true;
		} else if (row_diff === 0 && col_diff < 0) {
			return true;
		}
		return false;
	}
}
export class filler_piece {
	player: "w" | "b" | null;
	highlight: number;
	possible: number;
	icon: null;
	ascii: null;
	constructor(player: "w" | "b" | null) {
		this.player = player;
		this.highlight = 0;
		this.possible = 0;
		this.icon = null;
		this.ascii = null;
	}

	// function that defines piece's valid move shape
	can_move(start: number, end: number) {
		return false;
	}
}
