import RedCross from "../../assets/images/piece_cleaner.png"
import { PieceType } from "../Board/Board";

export class PieceCleaner {
	private _icon: React.ReactElement = <img alt='' src = {RedCross} className = "piece" />;
	constructor(
		private _player: "w" | "b",
	) {
	}

	public removePieceFromBoard(squares: PieceType[], index: number) {

	}

	public get icon() {
		return this._icon;
	}
}
