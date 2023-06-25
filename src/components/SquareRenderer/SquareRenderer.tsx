import { Square } from "../Square/Square";
import { ISquareProps } from "./SquareRenderer.types";

export default class SquareRenderer {
	public showSquare(props: ISquareProps) {
		return <Square {...props} />;
	}
}