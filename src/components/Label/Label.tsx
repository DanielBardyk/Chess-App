export default function Label(props: any) {
	return <button className={props.size}> {props.value} </button>;
}