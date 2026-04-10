import { StreamChat } from "stream-chat";

let serverClient: StreamChat | null = null;

export function getStreamServer() {
  if (!serverClient) {
    serverClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    );
  }
  return serverClient;
}
