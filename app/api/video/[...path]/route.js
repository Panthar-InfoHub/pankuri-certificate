import { s3Client } from '@/lib/clientS3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';


export async function GET(request, { params }) {
    try {
        const { path } = await params;
        const filePath = path.join('/');
        console.debug("\n filePath: ", filePath)

        // Fetch from Spaces
        const command = new GetObjectCommand({
            Bucket: process.env.DO_PROCESSED_BUCKET,
            Key: filePath,
        });

        const response = await s3Client.send(command);
        const body = await response.Body?.transformToByteArray();

        return new NextResponse(body, {
            headers: {
                'Content-Type': response.ContentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}
