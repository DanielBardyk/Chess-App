import React from "react";
import Board from "../Board/Board";
import SquareRenderer from "../SquareRenderer/SquareRenderer";

export default class ChessGame extends React.Component {
	protected _SquareRenderer = new SquareRenderer();
		render() {
			return <Board squareRenderer={this._SquareRenderer} />;
		}
	}