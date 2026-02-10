"use server"
import { CompleteMultipartUploadCommand, CreateMultipartUploadCommand, PutObjectCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./client-s3";

//Get upload ID for multipart upload
export async function createMultipartUpload(bucketName, key, contentType) {
    const command = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
        ACL: "private",
    });

    const response = await s3Client.send(command);
    return response.UploadId;
}

//Generate presigned URLs for each part
export async function generatePresignedUrls(bucketName, key, uploadId, totalParts) {
    const presignedUrls = [];

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const command = new UploadPartCommand({
            Bucket: bucketName,
            Key: key,
            PartNumber: partNumber,
            UploadId: uploadId,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
        presignedUrls.push({ partNumber, url });
    }

    console.debug("===== Inside generatePresignedUrls =====")
    console.debug("\n presignedUrlsData ", presignedUrls)
    return presignedUrls;
}

//Complete multipart upload
export async function completeMultipartUpload(bucketName, key, uploadId, parts) {

    console.debug("===== Inside completeMultipartUpload =====")
    // Console the argument
    console.log("\nBucket Name:", bucketName);
    console.log("\nKey:", key);
    console.log("\nUpload ID:", uploadId);
    console.log("\nParts:", parts);

    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber)

    console.log("Completing upload with parts:", sortedParts)

    try {
        const command = new CompleteMultipartUploadCommand({
            Bucket: bucketName,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: { Parts: sortedParts }
        });

        return await s3Client.send(command);
    } catch (error) {
        console.error("Error completing multipart upload:", error);
        throw error;
    }
}

export async function generatePresignedUrlForImage(bucketName, key, contentType) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
        ACL: "public-read",
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });
    return { url };
}


export async function getVideoPlaybackUrl(playbackUrl) {
    try {
        const cleanPath = playbackUrl.replace(/^\//, '');
        console.log("cleanPath ==> ", cleanPath)
        const proxyUrl = `/api/video/${cleanPath}`;
        return { success: true, url: proxyUrl };

    } catch (error) {
        console.error('getVideoPlaybackUrl Error:', error);
        return {
            success: false,
            error: 'Failed to generate playback URL'
        };
    }
}