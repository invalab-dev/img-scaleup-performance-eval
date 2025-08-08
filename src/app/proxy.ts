"use server";

import postgres from "postgres";
import {options} from "@/app/constant";

// TODO: cloud server로 변경 필요
const sql = postgres(process.env.POSTGRES_URL!);

export async function request(formData: FormData) {
  const images = formData.getAll("images") as File[];
  const count = formData.getAll("count").map((e) => parseInt(e as string));
  const optionName = formData.get("option_name") as string;
  const host = options[optionName];

  const requestTime = new Date().toISOString();
  const results = await uploadImages(host, images, count);
  const responseTime = new Date().toISOString();

  const sqlResult1 = await sql`INSERT INTO job(option, request, response) VALUES (${optionName}, ${requestTime}, ${responseTime}) RETURNING id`;
  const jobId = sqlResult1.at(0)!.id;
  results.forEach((result) => result.job_id = jobId);

  await sql`INSERT INTO test_data ${sql(results, "job_id", "task_id", "image_size", "success")}`;
}

async function uploadImages(host: string, images: File[], count: number[]): Promise<Result[]> {
  const tasks = [];
  for(let i = 0; i < count.length; i++) {
    for(let j = 0; j < count[i]; j++) {
      tasks.push(images[i]);
    }
  }

  return await Promise.all(tasks.map((task) => uploadImage(host, task)));
}

class Result {
  public job_id!: string;
  constructor(public readonly task_id: string | null,
              public readonly image_size: number,
              public readonly success: boolean) {}
}

async function uploadImage(host: string, image: File): Promise<Result> {
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