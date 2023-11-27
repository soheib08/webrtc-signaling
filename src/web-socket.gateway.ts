import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  allowEIO3: true,
})
export class WebsocketGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  users = [];
  constructor() {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log("server start listening on port 3001");
  }

  handleDisconnect(client: Socket) {}

  async handleConnection(client: Socket) {
    console.log(client.id, "is connected");
  }

  @SubscribeMessage("offer")
  async handleMessage(
    @MessageBody() message: any,
    @ConnectedSocket() socket: Socket
  ) {
    const data = JSON.parse(message.utf8Data);
    console.log(data);
    const user = this.findUser(data.name);

    switch (data.type) {
      case "store_user":
        if (user != null) {
          //our user exists
          socket.send(
            JSON.stringify({
              type: "user already exists",
            })
          );
          return;
        }

        const newUser = {
          name: data.name,
          conn: socket,
        };
        this.users.push(newUser);
        break;

      case "start_call":
        let userToCall = this.findUser(data.target);

        if (userToCall) {
          socket.send(
            JSON.stringify({
              type: "call_response",
              data: "user is ready for call",
            })
          );
        } else {
          socket.send(
            JSON.stringify({
              type: "call_response",
              data: "user is not online",
            })
          );
        }

        break;

      case "create_offer":
        let userToReceiveOffer = this.findUser(data.target);

        if (userToReceiveOffer) {
          userToReceiveOffer.conn.send(
            JSON.stringify({
              type: "offer_received",
              name: data.name,
              data: data.data.sdp,
            })
          );
        }
        break;

      case "create_answer":
        let userToReceiveAnswer = this.findUser(data.target);
        if (userToReceiveAnswer) {
          userToReceiveAnswer.conn.send(
            JSON.stringify({
              type: "answer_received",
              name: data.name,
              data: data.data.sdp,
            })
          );
        }
        break;

      case "ice_candidate":
        let userToReceiveIceCandidate = this.findUser(data.target);
        if (userToReceiveIceCandidate) {
          userToReceiveIceCandidate.conn.send(
            JSON.stringify({
              type: "ice_candidate",
              name: data.name,
              data: {
                sdpMLineIndex: data.data.sdpMLineIndex,
                sdpMid: data.data.sdpMid,
                sdpCandidate: data.data.sdpCandidate,
              },
            })
          );
        }
        break;
    }
  }
  private findUser = (username) => {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].name === username) return this.users[i];
    }
  };
}
