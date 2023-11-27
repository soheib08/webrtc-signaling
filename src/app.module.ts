import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./web-socket.gateway";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [WebsocketGateway],
  exports: [],
})
export class AppModule {}
