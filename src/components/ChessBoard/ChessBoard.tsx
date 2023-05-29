import { useRef, useState } from 'react';
import Tile from '../Tile/Tile';
import "./ChessBoard.css";
import Referee from "../../referee/Referee";

export enum PieceType {
	PAWN,
	BISHOP,
	KNIGHT,
	ROOK,
	QUEEN,
	KING
}

export enum TeamType {
	OPONENT,
	OUR
}

interface Piece {
	image: string;
	x: number;
	y: number;
	type: PieceType;
	team: TeamType;
}

export default function ChessBoard() {
	const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
	const [gridX, setGridX] = useState(0);
	const [gridY, setGridY] = useState(0);
	const chessBoardRef = useRef<HTMLDivElement>(null);
	const referee = new Referee();
	const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

	const InitialBoardState: Piece[] = [];

	for (let p = 0; p < 2; p++) {
		const teamType = (p === 0) ? TeamType.OPONENT : TeamType.OUR;
		const type = (teamType === TeamType.OPONENT) ? "b" : "w";
		const y = (teamType === TeamType.OPONENT) ? 7 : 0;
	
		InitialBoardState.push({
			image: `assets/images/rook_${type}.png`,
			x: 0,
			y,
			type: PieceType.ROOK,
			team: teamType
		});
		InitialBoardState.push({
			image: `assets/images/rook_${type}.png`,
			x: 7,
			y,
			type: PieceType.ROOK,
			team: teamType
		});
		InitialBoardState.push({
			image: `assets/images/knight_${type}.png`,
			x: 1,
			y,
			type: PieceType.KNIGHT,
			team: teamType
		});
		InitialBoardState.push({
			image: `assets/images/knight_${type}.png`,
			x: 6,
			y,
			type: PieceType.KNIGHT,
			team: teamType
		});
		InitialBoardState.push({
			image: `assets/images/bishop_${type}.png`,
			x: 2,
			y,
			type: PieceType.BISHOP,
			team: teamType
		});
		InitialBoardState.push({
			image: `assets/images/bishop_${type}.png`,
			x: 5,
			y,
			type: PieceType.BISHOP,
			team: teamType
		});
		InitialBoardState.push({
			image: `assets/images/queen_${type}.png`,
			x: 3,
			y,
			type: PieceType.QUEEN,
			team: teamType
		});
		InitialBoardState.push({
			image: `assets/images/king_${type}.png`,
			x: 4,
			y,
			type: PieceType.KING,
			team: teamType
		});
	}
	
	for (let i=0; i < 8; i++) {
		InitialBoardState.push({
			image: "assets/images/pawn_b.png",
			x: i,
			y: 6,
			type: PieceType.PAWN,
			team: TeamType.OPONENT
		})
	}
	
	for (let i=0; i < 8; i++) {
		InitialBoardState.push({
			image: "assets/images/pawn_w.png",
			x: i,
			y: 1,
			type: PieceType.PAWN,
			team: TeamType.OUR
		})
	}

	const [pieces, setPieces] = useState<Piece[]>(InitialBoardState);

	function grabPiece(e: React.MouseEvent) {
		const element = e.target as HTMLElement;
		const chessBoard = chessBoardRef.current;
		if(element.classList.contains("chess-piece") && chessBoard) {
			setGridX(Math.floor((e.clientX - chessBoard.offsetLeft) / 100));
			setGridY(Math.abs(Math.ceil((e.clientY - chessBoard.offsetTop - 800) / 100)));
			const x = e.clientX - 50;
			const y = e.clientY - 50;
			element.style.position = "absolute";
			element.style.left = `${x}px`;
			element.style.top = `${y}px`;

			setActivePiece(element);
		}
	}

	function movePiece(e: React.MouseEvent) {
		const chessBoard = chessBoardRef.current;
		if(activePiece && chessBoard) {
			const minX = chessBoard.offsetLeft - 25;
			const minY = chessBoard.offsetTop - 25;
			const maxX = chessBoard.offsetLeft + chessBoard.clientWidth - 75;
			const maxY = chessBoard.offsetTop + chessBoard.clientHeight - 75;
			const x = e.clientX - 50;
			const y = e.clientY - 50;
			activePiece.style.position = "absolute";

			if (x < minX) {
				activePiece.style.left = `${minX}px`;
			} else if(x > maxX) {
				activePiece.style.left = `${maxX}px`;
			// if y is in the constraints
			} else {
				activePiece.style.left = `${x}px`;
			}

			if (y < minY) {
				activePiece.style.top = `${minY}px`;
			} else if(y > maxY) {
				activePiece.style.top = `${maxY}px`;
			} else {
				activePiece.style.top = `${y}px`;
			}
		}
	}

	function dropPiece(e: React.MouseEvent) {
		const chessBoard = chessBoardRef.current;
		if (activePiece && chessBoard) {
			const x = Math.floor((e.clientX - chessBoard.offsetLeft) / 100);
			const y = Math.abs(Math.ceil((e.clientY - chessBoard.offsetTop - 800) / 100));

			//UPDATES THE PIECE POSITION
			setPieces(value => {
				const pieces = value.map(p => {
					if(p.x === gridX && p.y === gridY) {
						const validMove =  referee.isValidMove(gridX, gridY, x, y, p.type, p.team);

						if(validMove) {
							p.x = x;
							p.y = y;
						} else {
							activePiece.style.position = 'relative';
							activePiece.style.removeProperty("top");
							activePiece.style.removeProperty("left");
						}
					}
					return p;
				})
				return pieces;
			});
			setActivePiece(null);
		}
	}

	let board = [];
	for (let j = horizontalAxis.length-1; j >= 0; j--) {
		for (let i=0; i < horizontalAxis.length; i++) {
			const number = j + i + 2;
			let image = undefined;

			pieces.forEach(p => {
				if(p.x === i && p.y === j) {
					image = p.image;
				}
			})

			board.push(<Tile key={`${j}, ${i}`} image={image} number={number} />);
		}
	}

	return (
		<div
			onMouseMove={(e) => movePiece(e)}
			onMouseDown={(e) => grabPiece(e)}
			onMouseUp={(e) => dropPiece(e)}
			id="chessboard"
			ref={chessBoardRef}
		>
			{board}
		</div>
	)
}