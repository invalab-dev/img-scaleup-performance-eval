import {ProgressResponse, UploadResponse} from "@/app/class";


const baseUrl = "http://localhost:3001"; // 10.0.2.6

export async function uploadImage(image: File): Promise<UploadResponse> {
    const imageSize = image.size;
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch(`${baseUrl}/upload`, {
        method: "POST",
        body: formData
    });

    return {...await response.json(), imageSize } as UploadResponse;
}

export async function checkProgress(filename: string) {
    const response = await fetch(`${baseUrl}/progress/${filename}`, {
        method: "GET",
    });
    return await response.json() as ProgressResponse;
}