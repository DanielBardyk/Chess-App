export function Square(props: any) {
	if (props.value != null) {
		return (
			<button
				className={"square " + props.color + props.corner + props.cursor}
				onClick={props.onClick}
			>
				{props.value.icon}
			</button>
		);
	} else {
		return (
			<button
				className={"square " + props.color + props.corner + props.cursor}
				onClick={props.onClick}
			>
				{" "}
			</button>
		);
	}
}
