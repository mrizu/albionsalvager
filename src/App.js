import logo from './logo.svg';
import './App.css';
import MainTable from "./components/MainTable";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="Title">Albion Salvager</h1>
      </header>
      <div className="App-content">
        <MainTable/>
      </div>
    </div>
  );
}

export default App;
