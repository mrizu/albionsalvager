import "./App.css";
import MainTable from "./components/MainTable";
import CitySelector from "./components/CitySelector";

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<h1 className="Title">Albion Salvager</h1>
				<div className="citySelector">
					<CitySelector />
				</div>
			</header>
			<div className="App-content">
				<MainTable />
			</div>
		</div>
	);
}

export default App;
