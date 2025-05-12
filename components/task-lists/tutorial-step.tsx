import { Checkbox } from "../ui/checkbox-read";

export function TutorialStep({
  title,
  children,
  checked,
}: {
  title: string;
  children: React.ReactNode;
  checked: boolean;
}) {
  return (
    <li className="relative">
      <Checkbox
        id={title}
        name={title}
        className={`absolute top-[3px] mr-2 peer`}
        checked={checked}
      />
      <label
        htmlFor={title}
        className={`relative text-base text-foreground peer-checked:line-through font-medium`}
      >
        <span className={`ml-8 ${checked ? "line-through" : ""}`}>{title}</span>
        {!checked && (
          <div
            className={`ml-8 text-sm peer-checked:line-through font-normal text-muted-foreground`}
          >
            {children}
          </div>
        )}
      </label>
    </li>
  );
}
