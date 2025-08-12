import {ProgressResponse, UploadResponse} from "@/app/class";

const HOST = "http://superres.invalab.com";

export async function uploadImage(image: File): Promise<UploadResponse> {
  const imageSize = image.size;
  const formData = new FormData();
  formData.append("file", image);

  const response = await fetch(`${HOST}/upload`, {
    method: "POST",
    body: formData
  });

  return {...await response.json(), imageSize} as UploadResponse;
}

export async function checkProgress(taskId: string) {
  const response = await fetch(`${HOST}/progress/${taskId}`, {
    method: "GET",
  });
  return await response.json() as ProgressResponse;
}