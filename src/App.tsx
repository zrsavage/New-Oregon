import { useState } from "react";
import { useGameStore } from "./state/gameStore";
import TitleScreen from "./components/TitleScreen";
import OutfittingScreen from "./components/OutfittingScreen";
import TravelScreen from "./components/TravelScreen";
import EndingScreen from "./components/EndingScreen";
import SketchyFilters from "./components/shared/SketchyFilters";
import "./styles/theme.css";

function App() {
  const phase = useGameStore((s) => s.phase);
  const [showTitle, setShowTitle] = useState(true);

  let screen;
  if (showTitle) {
    screen = <TitleScreen onDismiss={() => setShowTitle(false)} />;
  } else if (phase === "outfitting") {
    screen = <OutfittingScreen />;
  } else if (phase === "travel") {
    screen = <TravelScreen />;
  } else if (phase === "ending") {
    screen = <EndingScreen onReturnToTitle={() => setShowTitle(true)} />;
  } else {
    screen = <TitleScreen onDismiss={() => setShowTitle(false)} />;
  }

  return (
    <>
      <SketchyFilters />
      {screen}
    </>
  );
}

export default App;
