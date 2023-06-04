import React from "react";
import Board from "../Board/Board";
import SquareRenderer from "../SquareRenderer/SquareRenderer";
import Saver from "../Saver/Saver";

export default class ChessGame extends React.Component {
	protected _squareRenderer = new SquareRenderer();
	protected _saver = new Saver();
		render() {
			return <Board squareRenderer={this._squareRenderer} saver={this._saver} />;
		}
	}