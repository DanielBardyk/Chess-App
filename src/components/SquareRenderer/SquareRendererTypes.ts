import { PanelType } from "../BoardManager/BoardManagerTypes";
import { PieceType } from "../Pieces/Pieces";

export interface ISquareProps {
	key: number,
	value: PieceType | PanelType,
	size: string,
	color: string,
	corner: string,
	cursor: string,
	onClick: () => void
}