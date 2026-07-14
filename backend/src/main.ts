import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Ensure uploads folder exists in workspace
const uploadsDir = join(__dirname, '..', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    expressApp.use(express.json({ limit: '10mb' }));
    expressApp.use(express.urlencoded({ limit: '10mb', extended: true }));
    
    // Serve static uploaded files
    expressApp.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), { bodyParser: false });

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

// For Vercel serverless functions
export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};

// For local running
if (!process.env.VERCEL) {
  async function startLocal() {
    const app = await NestFactory.create(AppModule, { bodyParser: false });
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3001;

    await app.listen(port);
    console.log(`EduTrack SaaS Backend running locally on: http://localhost:${port}`);
  }
  startLocal();
}

