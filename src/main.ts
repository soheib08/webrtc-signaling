import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle("call  Backend")
    .setVersion("1.0")
    .addBearerAuth({ in: "header", type: "http" })
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup("api", app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  const configService = app.get(ConfigService);
  const port = 3001;

  await app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
}

bootstrap();
