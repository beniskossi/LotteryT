import { FC } from "react";
import BallNumber from "./BallNumber";
import { LotteryDraw } from "@shared/schema";
import { Trash2 } from "lucide-react";

interface DrawResultProps {
  draw: LotteryDraw;
  highlightBall?: number;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

const DrawResult: FC<DrawResultProps> = ({
  draw,
  highlightBall,
  onDelete,
  showActions = true,
}) => {
  const balls = [draw.ball1, draw.ball2, draw.ball3, draw.ball4, draw.ball5];
  
  // Format date to YYYY-MM-DD
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  return (
    <tr className="hover:bg-muted">
      <td className="px-4 py-3 text-sm">{formatDate(draw.drawDate)}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {balls.map((ball, index) => (
            <BallNumber
              key={index}
              number={ball}
              highlight={highlightBall === ball}
              colorIndex={index}
            />
          ))}
        </div>
      </td>
      {showActions && onDelete && (
        <td className="px-4 py-3">
          <button
            onClick={() => onDelete(draw.id)}
            className="text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </td>
      )}
    </tr>
  );
};

export default DrawResult;
