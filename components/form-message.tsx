export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"error" in message && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded p-2 mb-2">
          {message.error}
        </div>
      )}
      {"success" in message && (
        <div className="bg-green-100 border border-green-300 text-green-700 rounded p-2 mb-2">
          {message.success}
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 px-4">{message.message}</div>
      )}
    </div>
  );
}
