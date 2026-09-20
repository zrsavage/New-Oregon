import { useState } from "react";
import { useGameStore } from "./state/gameStore";
import TitleScreen from "./components/TitleScreen";
import OutfittingScreen from "./components/OutfittingScreen";
import TravelScreen from "./components/TravelScreen";
import EndingScreen from "./components/EndingScreen";
import "./styles/theme.css";

function App() {
  const phase = useGameStore((s) => s.phase);
  const [showTitle, setShowTitle] = useState(true);

  if (showTitle) {
    return <TitleScreen onDismiss={() => setShowTitle(false)} />;
  }

  if (phase === "outfitting") return <OutfittingScreen />;
  if (phase === "travel") return <TravelScreen />;
  if (phase === "ending") return <EndingScreen onReturnToTitle={() => setShowTitle(true)} />;

  return <TitleScreen onDismiss={() => setShowTitle(false)} />;
}

export default App;
