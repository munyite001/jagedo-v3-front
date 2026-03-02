import { MessageComposer } from "./MessageComposer";
import { RecipientsPanel } from "./RecipientsPanel";

export const ComposeTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MessageComposer />
      <RecipientsPanel />
    </div>
  );
};