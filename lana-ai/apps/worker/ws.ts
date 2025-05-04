import type { VscodeMessagePayload } from "common/types";

export class RelayWebsocket {
  private static instance: RelayWebsocket;
  private ws: WebSocket;
  private callbacks: Map<string, (data: VscodeMessagePayload) => void>;

  private constructor(url: string) {
    this.ws = new WebSocket(url);
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      console.log(event);
      const { callbackId, ...data } = JSON.parse(event.data);
      const callback = this.callbacks.get(callbackId);
      if (callback) {
        callback(data);
      }
    };

    this.ws.onopen = () => {
      this.send(
        JSON.stringify({
          event: "api_subscribe",
        })
      );
    };
  }

  private waitForOpen(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      if (this.ws.readyState !== WebSocket.CONNECTING)
        return reject(new Error("WebSocket is not connecting"));

      this.ws.addEventListener("open", () => resolve(), { once: true });
      this.ws.addEventListener(
        "error",
        () => reject(new Error("WebSocket failed to open")),
        { once: true }
      );
    });
  }

  static getInstance() {
    if (!RelayWebsocket.instance) {
      RelayWebsocket.instance = new RelayWebsocket(
        process.env.WS_RELAYER_URL || "ws://localhost:9093"
      );
    }
    return RelayWebsocket.instance;
  }

  send(message: string) {
    this.ws.send(message);
  }

  async sendAndAwaitResponse(message: {
    event: string;
    data: {
      type: string;
      callbackId: string;
      p_name?: string;
    };
  }): Promise<VscodeMessagePayload> {
    console.log("reached before open");
    await this.waitForOpen();

    console.log("reached after open");
    this.ws.send(JSON.stringify({ ...message }));
    console.log("reached after send");
    return new Promise((resolve, reject) => {
      this.callbacks.set(message.data.callbackId, resolve);
    });
  }
}
