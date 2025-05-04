export type MessagePayload =
  | {
      event: "subscribe";
      data?: null;
    }
  | {
      event: "admin";
      data: {
        type: "command" | "update-file" | "prompt-start" | "prompt-end";
        content: string;
        path?: string;
      };
      callbackId?: string;
    }
  | {
      event: "vscode_diff";
      diff: string;
      callbackId: string;
      pubkey: string;
    }
  | {
      event: "api_subscribe";
      data?: null;
    };

export type VscodeMessagePayload = {
  event: "vscode_diff";
  diff: string;
  callbackId: string;
  pubkey: string;
};
