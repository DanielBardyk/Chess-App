import './App.css';
import './components/StylesCalculator/StylesCalculator.css'
import './components/BoardManager/BoardManager.css'
import ChessGame from './components/ChessGame/ChessGame';

export default function App() {
	return (
		<div id='app'>
			<ChessGame />
		</div>
	);
}
