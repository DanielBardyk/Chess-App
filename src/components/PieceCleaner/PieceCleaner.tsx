import RedCross from "../../assets/images/piece_cleaner.png"
import { PieceType } from "../Board/Board";

export class PieceCleaner {
	private _icon: React.ReactElement = <img alt='' src = {RedCross} className = "piece" />;
	private _highlight: number = 0;
	private _id: string = "c";
	constructor(
		private _player: "w" | "b",
	) {
	}

	public set highlight(highlight: number) {
		this._highlight = highlight;
	}

	public get highlight(): number {
		return this._highlight;
	}

	public get icon() {
		return this._icon;
	}

	public get id(): string {
		return this._id;
	}

	public get player(): string {
		return this._player;
	}
}
