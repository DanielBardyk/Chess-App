import { ISquareProps } from "../SquareRenderer/SquareRenderer";

export function Square(props: ISquareProps) {
	if (props.value != null) {
		return (
			<button
				className={props.size + props.color + props.corner + props.cursor}
				onClick={props.onClick}
			>
				{props.value.icon}
			</button>
		);
	} else {
		return (
			<button
				className={props.size + props.color + props.corner + props.cursor}
				onClick={props.onClick}
			>
				{" "}
			</button>
		);
	}
}
