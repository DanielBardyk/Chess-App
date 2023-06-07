import { Square } from "../Square/Square";
export default class SquareRenderer {
	public showSquare(props: any) {
		return <Square {...props} />;
	}
}