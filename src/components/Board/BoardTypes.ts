import { PanelType } from "../BoardManager/BoardManagerTypes";
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
	firstPos: number, // Bot
	secondPos: number, // Bot
	repetition: number, // Bot
	whiteKingHasMoved: number, // Referee
	blackKingHasMoved: number, // Referee
	leftBlackRookHasMoved: number, // Referee
	rightBlackRookHasMoved: number, // Referee
	leftWhiteRookHasMoved: number, // Referee
	rightWhiteRookHasMoved: number, // Referee
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