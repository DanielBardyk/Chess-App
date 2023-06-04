import { Square } from "../Square/Square";
class SquareRenderer {
	showSquare(props: any) {
		return <Square {...props} />;
	}
}
export default SquareRenderer