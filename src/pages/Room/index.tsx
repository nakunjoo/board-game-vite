import { useLocation } from "react-router-dom";
import GangRoom from "./gang";
import SpiceRoom from "./spice";
import SkulkingRoom from "./skulking";
import BlackjackRoom from "./blackjack";

interface LocationState {
  gameType?: string;
}

export default function Room() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const gameType = state?.gameType ?? "gang";

  if (gameType === "spice") {
    return <SpiceRoom />;
  }

  if (gameType === "skulking") {
    return <SkulkingRoom />;
  }

  if (gameType === "blackjack") {
    return <BlackjackRoom />;
  }

  return <GangRoom />;
}
