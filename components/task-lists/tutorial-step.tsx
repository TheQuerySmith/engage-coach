import { Checkbox } from "../ui/checkbox-read";

type StepType = "setup" | "surveys" | "optional" | "resources";

interface TutorialStepProps {
  title: string;
  children: React.ReactNode;
  checked: boolean;
  stepType?: StepType;
  time?: string; // New prop for time badge, e.g., "5 min"
}

export function TutorialStep({
  title,
  children,
  checked,
  stepType = "setup",
  time,
}: TutorialStepProps) {
  // Determine badge classes and label based on step type
  let badgeLabel = "";
  let badgeClasses = "text-xs font-semibold px-2 py-1 rounded mr-2";
  switch (stepType) {
    case "setup":
      badgeLabel = "Setup";
      badgeClasses += " bg-blue-100 text-blue-800";
      break;
    case "surveys":
      badgeLabel = "Surveys";
      badgeClasses += " bg-green-100 text-green-800";
      break;
    case "optional":
      badgeLabel = "Optional";
      badgeClasses += " bg-yellow-100 text-yellow-800";
      break;
    case "resources":
      badgeLabel = "Resources";
      badgeClasses += " bg-purple-100 text-purple-800";
      break;
    default:
      break;
  }

  // Define simple time badge styling
  const timeBadge = time ? (
    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-800">
      {time}
    </span>
  ) : null;
  const typeBadge = stepType ? (
    <span className={badgeClasses}>{badgeLabel}</span>
  ) : null;

  return (
    <li className="relative flex items-start space-x-2">
      <Checkbox id={title} name={title} className="mt-1" checked={checked} />
      <div>
        <div className="flex items-center space-x-2">
          <label
            htmlFor={title}
            className={`text-base text-foreground font-medium ${checked ? "line-through" : ""}`}
          >
            {title} {!checked && typeBadge}{!checked && timeBadge} 
            
          </label>
        </div>
        {!checked && (
          <div className="ml-10 text-sm font-normal text-muted-foreground">
            {children}
          </div>
        )}
      </div>
    </li>
  );
}