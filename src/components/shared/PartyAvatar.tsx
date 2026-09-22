import type { CSSProperties } from "react";
import type { Character } from "../../types/game";
import RoleIcon from "./RoleIcon";
import { avatarColor } from "../../systems/visuals";

const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ringColor(health: number): string {
  if (health >= 60) return "var(--good)";
  if (health >= 30) return "var(--gold)";
  return "var(--bad)";
}

export default function PartyAvatar({ character, size = 44 }: { character: Character; size?: number }) {
  const isDead = character.status === "dead";
  const healthFrac = Math.max(0, Math.min(1, character.health / 100));
  const dash = `${(healthFrac * CIRCUMFERENCE).toFixed(1)} ${CIRCUMFERENCE.toFixed(1)}`;

  return (
    <div
      className={`party-avatar ${isDead ? "dead" : ""}`}
      style={{ width: size, height: size, "--avatar-color": avatarColor(character.id) } as CSSProperties}
      title={`${character.name} — ${character.role}`}
    >
      <svg className="avatar-ring" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={RADIUS} className="avatar-ring-track" />
        {!isDead && (
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            className="avatar-ring-fill"
            stroke={ringColor(character.health)}
            strokeDasharray={dash}
            transform="rotate(-90 22 22)"
          />
        )}
      </svg>
      <div className="avatar-circle">
        <RoleIcon role={character.role} className="avatar-icon" />
      </div>
      {isDead && <span className="avatar-dead">✕</span>}
    </div>
  );
}
