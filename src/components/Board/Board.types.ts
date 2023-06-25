import { PanelType } from "../BoardManager/BoardManager.types";
import { PieceType } from "../Pieces/Pieces";
import Saver from "../Saver/Saver";
import SquareRenderer from "../SquareRenderer/SquareRenderer";

export interface IStateBoard {
	squares: PieceType[],
	blackPanel: PanelType[],
	whitePanel: PanelType[],
	selectedPiece: PanelType | null;
	source: number,
	turn: "w" | "b",
	firstPos: number,
	secondPos: number,
	repetition: number,
	whiteKingHasMoved: boolean,
	blackKingHasMoved: boolean,
	leftBlackRookHasMoved: boolean,
	rightBlackRookHasMoved: boolean,
	leftWhiteRookHasMoved: boolean,
	rightWhiteRookHasMoved: boolean,
	passantPos: number,
	error: string | null,
	botRunning: boolean,
	firstRender: boolean,
	gameStarted: boolean,
	piecesSelection: boolean,
	playerSelection: boolean,
	settingWayChoosed: boolean,
	againstBot: boolean,
	mated: boolean,
	key: number
};

export interface IBoardProps {
	squareRenderer: SquareRenderer;
	saver: Saver;
}

export interface ISquaresSerialized {
	name: string, player: 'w' | 'b' | null
}

// Omit це службовий тип для перетворення одного інтерфейсу в інший, другим параметром якого передається властивість, яку треба видалити
export interface IStateSerialized extends Omit<IStateBoard, "squares"> {
	squares: ISquaresSerialized[]
}