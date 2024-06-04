import "./App.css";
import GenerateReactComponent from "./components/GenerateReactComponent";
import GenerateImage from "./components/GenerateImage";
import EditImage from "./components/EditImage";
import VariationImage from "./components/VariationImage";

const App = () => {
    return (
        <div className="App">
            <main className="App-main">
                <GenerateReactComponent />
                <GenerateImage />
                <EditImage />
                <VariationImage />
            </main>
        </div>
    );
};

export default App;
