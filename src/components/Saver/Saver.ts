import { IStateBoard, IStateSerialized } from "../../components/Board/Board";

export default class Saver {
	private saveObjectAsFile(object: IStateBoard) {
		const serializeSquares = object.squares.map(square => ({ name: square.constructor.name, player: square.player }))
		const json = JSON.stringify({ ...object, squares: serializeSquares });
		const blob = new Blob([json], { type: 'application/json' });

		const reader = new FileReader();
		reader.onloadend = () => {
			const arrayBuffer = reader.result as ArrayBuffer;
			const dataView = new DataView(arrayBuffer);
			const blobData = new Blob([dataView], { type: 'application/json' });

			const link = document.createElement('a');
			link.href = URL.createObjectURL(blobData);
			const name = prompt('Enter the file name')
			if (name) {
				link.download = name
				link.click();
			}
		};
		reader.readAsArrayBuffer(blob);
	}

	private readFileAsObject(file: File, callback: (state: IStateSerialized) => void) {
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const object = JSON.parse(content);
				callback(object);
			} catch(e) {
				alert("Reading error. File must be in JSON format and have the board state");
			}
		};
		reader.readAsText(file);
	}

	public handleSaveFile(state: IStateBoard) {
		this.saveObjectAsFile(state);
	};

	public handleLoadFile(event: React.ChangeEvent<HTMLInputElement>, callback: (state: IStateSerialized) => void) {
		const file = event.target.files?.[0];
		if (file) {
			this.readFileAsObject(file, callback);
		}
	}
}