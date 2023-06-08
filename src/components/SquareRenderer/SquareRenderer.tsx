import { PieceType } from "../Board/Board";
import { PanelType } from "../BoardManager/BoardManager";
import { Square } from "../Square/Square";

export interface ISquareProps {
	key: number,
	value: PieceType | PanelType,
	size: string,
	color: string,
	corner: string,
	cursor: string,
	onClick: () => void
}

export default class SquareRenderer {
	public showSquare(props: ISquareProps) {
		return <Square {...props} />;
	}
}