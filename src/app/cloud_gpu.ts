import {Result} from "@/app/class";


export async function uploadImage(host: string, image: File): Promise<Result> {
  const imageSize = image.size;
  const formData = new FormData();
  formData.append("file", image);

  const response = await fetch(`${host}/upload`, {
    method: "POST",
    body: formData
  });

  const json = await response.json();
  return new Result(json.task_id, imageSize, json.success);
}