import { Square } from "../Square/Square";
import { ISquareProps } from "./SquareRendererTypes";

export default class SquareRenderer {
	public showSquare(props: ISquareProps) {
		return <Square {...props} />;
	}
}