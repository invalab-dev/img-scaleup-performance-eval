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
  if(!json.success) {
    return new Result(null, imageSize, false);
  }
  const taskId = json.task_id;

  return await new Promise<Result>((resolve) => {
    const cancel = setInterval(async function() {
      const response = await fetch(`${host}/progress/${taskId}`, {
        method: "GET",
      });
      const json = await response.json();

      if(json.status == "done") {
        clearInterval(cancel);
        const result = new Result(taskId, imageSize, true);
        console.log(`result: ${JSON.stringify(result)}`);
        resolve(result);
      }
    }, 500);
  });
}