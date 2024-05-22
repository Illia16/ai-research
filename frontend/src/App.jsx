import "./App.css";
import GenerateReactComponent from "./components/GenerateReactComponent";
import GenerateImage from "./components/GenerateImage";

const App = () => {
    return (
        <div className="App">
            <main className="App-main">
                <GenerateReactComponent />
                <GenerateImage />
            </main>
        </div>
    );
};

export default App;
