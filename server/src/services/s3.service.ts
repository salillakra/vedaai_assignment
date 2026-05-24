import { S3Client } from "bun";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import * as fs from "fs/promises";
import * as path from "path";

export class S3Service {
  private static s3Client: S3Client | null = null;

  private static getClient(): S3Client | null {
    if (this.s3Client) return this.s3Client;

    if (
      env.S3_ENDPOINT &&
      env.S3_ACCESS_KEY_ID &&
      env.S3_SECRET_ACCESS_KEY &&
      env.S3_BUCKET_NAME
    ) {
      logger.info("Initializing S3 Client...");
      this.s3Client = new S3Client({
        endpoint: env.S3_ENDPOINT,
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        bucket: env.S3_BUCKET_NAME,
        region: "auto",
      });
      return this.s3Client;
    }

    return null;
  }

  static async uploadPDF(paperId: string, pdfBuffer: Buffer): Promise<string> {
    const filename = `paper-${paperId}.pdf`;
    const client = this.getClient();

    if (client) {
      try {
        logger.info(`Uploading PDF to S3: ${filename}`);
        
        const s3file = client.file(`papers/${filename}`);
        await s3file.write(pdfBuffer, {
          type: "application/pdf",
        });

        if (env.S3_PUBLIC_URL) {
          const baseUrl = env.S3_PUBLIC_URL.replace(/\/$/, "");
          return `${baseUrl}/papers/${filename}`;
        }

        // fallback to presigned url if no public gateway
        const presignedUrl = s3file.presign({
          expiresIn: 60 * 60 * 24 * 7,
        });
        logger.info(`Successfully uploaded to S3: ${presignedUrl}`);
        return presignedUrl;
      } catch (error: any) {
        const errorDetails = {
          message: error.message,
          stack: error.stack,
          name: error.name,
          code: error.code,
          statusCode: error.statusCode,
          status: error.status,
          cause: error.cause,
        };
        logger.error(`S3/R2 Upload failed for ${filename}, falling back to local:`, errorDetails);

        try {
          const testRes = await fetch(`${env.S3_ENDPOINT}/${env.S3_BUCKET_NAME}`).catch(() => null);
          if (testRes) {
            const bodyText = await testRes.text().catch(() => "");
            logger.error(`S3 Direct Diagnostic HTTP Status: ${testRes.status} ${testRes.statusText}`);
            logger.error(`S3 Direct Diagnostic XML Response: ${bodyText}`);
          } else {
            logger.error(`S3 Direct Diagnostic: Endpoint is completely unreachable.`);
          }
        } catch (diagErr) {
          logger.error(`Failed to run S3 diagnostics fetch:`, diagErr);
        }
      }
    }

    // fallback to local if s3 fucks up
    try {
      const publicDir = path.join(process.cwd(), "public", "pdfs");
      logger.info(`Saving PDF locally to fallback directory: ${publicDir}`);

      await fs.mkdir(publicDir, { recursive: true });

      const filePath = path.join(publicDir, filename);
      await fs.writeFile(filePath, pdfBuffer);

      const localUrl = `/pdfs/${filename}`;
      logger.info(`Saved PDF locally: ${localUrl}`);
      return localUrl;
    } catch (error) {
      logger.error("Failed to save PDF locally:", error);
      throw new Error("Failed to store generated PDF");
    }
  }
}
