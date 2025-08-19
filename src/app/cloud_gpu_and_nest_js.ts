import {ProgressResponse, UploadResponse} from "@/app/class";


const host = "http://localhost:3001"; // 10.0.2.6

export async function uploadImage(image: File): Promise<UploadResponse> {
    const imageSize = image.size;
    const formData = new FormData();
    formData.append("images", image);

    const response = await fetch(`${host}/upload`, {
        method: "POST",
        body: formData
    });

    const result = {...await response.json(), imageSize } as UploadResponse;
    console.log(`result: ${JSON.stringify(result)}`);
    return result;
}

export async function checkProgress(filename: string) {
    const response = await fetch(`${host}/progress/${filename}`, {
        method: "GET",
    });
    return await response.json() as ProgressResponse;
}