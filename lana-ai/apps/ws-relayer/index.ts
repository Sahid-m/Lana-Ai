import type { ServerWebSocket } from "bun";
import type { MessagePayload } from "common/types";

//TODO: Add auth
const SUBSCRIPTIONS: ServerWebSocket<unknown>[] = [];

const API_SUBSCRIPTIONS: ServerWebSocket<unknown>[] = [];

let bufferedMessages: any[] = [];

Bun.serve({
  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    message(ws, message) {
      const IncData: MessagePayload = JSON.parse(message.toString());

      console.log(message.toString());
      if (IncData.event === "subscribe") {
        SUBSCRIPTIONS.push(ws);
        if (bufferedMessages.length) {
          SUBSCRIPTIONS.forEach((ws) =>
            ws.send(JSON.stringify(bufferedMessages.shift()))
          );
          bufferedMessages = [];
        }
      } else if (IncData.event === "admin") {
        const data = IncData.data;
        if (!SUBSCRIPTIONS.length) {
          bufferedMessages.push(data);
        } else {
          SUBSCRIPTIONS.forEach((ws) => ws.send(JSON.stringify(data)));
          console.log("sent thingssss to vs code");
        }
      } else if (IncData.event === "api_subscribe") {
        console.log("api sub req rec");
        API_SUBSCRIPTIONS.push(ws);
      } else if (IncData.event === "vscode_diff") {
        console.log("recirved vscode things");
        API_SUBSCRIPTIONS.forEach((ws) => ws.send(JSON.stringify(IncData)));
      }
    },
    open(ws) {
      console.log("open");
    },
    close(ws) {
      console.log("close");
    },
  },
  port: 9093,
});
