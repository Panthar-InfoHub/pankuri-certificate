// "use server"

// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { s3Client } from "./clientS3";

// export async function generatePresignedUrlForCertificate(bucketName, key, contentType) {
//     const command = new PutObjectCommand({
//         Bucket: bucketName,
//         Key: key,
//         ContentType: contentType,
//         ACL: "public-read",
//     });

//     const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });
//     return { url };
// }