import type { RiskAssessment } from "../../types/game";

export default function RiskDisplay({
  assessment,
  successLabel = "chance of success",
  dangerLabel = "chance of danger",
}: {
  assessment: RiskAssessment;
  successLabel?: string;
  dangerLabel?: string;
}) {
  const label = assessment.frame === "success" ? successLabel : dangerLabel;

  return (
    <div className={`risk-display frame-${assessment.frame}`}>
      <div className="risk-chance">
        {assessment.chance}% {label}
      </div>
      {assessment.factors.length > 0 && (
        <ul className="risk-factors">
          {assessment.factors.map((f, i) => {
            const good = assessment.frame === "success" ? f.delta > 0 : f.delta < 0;
            return (
              <li key={i} className={good ? "good" : "bad"}>
                {f.label}: {f.delta > 0 ? "+" : ""}
                {f.delta}%
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
