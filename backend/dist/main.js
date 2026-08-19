"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
        envLines.forEach((line) => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
            if (match) {
                const key = match[1];
                const value = match[2];
                if (!process.env[key]) {
                    process.env[key] = value.trim();
                }
            }
        });
    }
}
catch (e) { }
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || origin.includes('localhost') || origin.includes('vercel.app') || (process.env.FRONTEND_URL && origin.includes(process.env.FRONTEND_URL))) {
                callback(null, true);
            }
            else {
                callback(null, true);
            }
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('EduTrack SaaS API')
        .setDescription('The school management system API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`Backend server running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map