"use server";

import postgres from "postgres";
import {uploadImage as localUploadImage, checkProgress as localCheckProgress} from "@/app/local_gpu";
import {uploadImage as cloudUploadImage, checkProgress as cloudCheckProgress} from "@/app/local_gpu";
import {Option, ProgressResponse, UploadResponse} from "@/app/class";

// TODO: cloud server로 변경 필요
const sql = postgres(process.env.POSTGRES_URL!);

export async function uploadImages(formData: FormData) {
  const images = formData.getAll("images") as File[];
  const count = formData.getAll("count").map((e) => parseInt(e as string));
  const option = formData.get("option") as string;

  let uploadResponses!: UploadResponse[];
  const requestTime = new Date().toISOString();
  if (option == Option["local GPU"]) {
    uploadResponses = await _uploadImages(images, count, localUploadImage);
  } else if (option == Option["cloud GPU"]) {
    uploadResponses = await _uploadImages(images, count, cloudUploadImage);
  } else if (option == Option["cloud GPU + nest.js"]) {

  } else {
    throw `${option}: 없는 옵션입니다.`;
  }
  const responseTime = new Date().toISOString();

  const sqlResult1 = await sql`INSERT INTO job(option, request, response)
                               VALUES (${option}, ${requestTime}, ${responseTime}) RETURNING id`;
  const jobId = sqlResult1.at(0)!.id as string;
  await sql`INSERT INTO test_data ${sql(uploadResponses.map((uploadResponse) => {
    return {
      job_id: jobId,
      task_id: uploadResponse.taskId,
      image_size: uploadResponse.imageSize,
      ...(uploadResponse.taskId == null && ({success: false}))
    };
  }))}`;

  return {
    uploadResponses: uploadResponses,
    option: option
  };
}

export async function checkProgress(option: Option, taskId: string) {
  let progressResponse!: ProgressResponse;
  if(option == Option["local GPU"]) {
    progressResponse = await localCheckProgress(taskId);
  } else if(option == Option["cloud GPU"]) {
    progressResponse = await cloudCheckProgress(taskId);
  } else if(option == Option["cloud GPU + nest.js"]) {

  } else {
    throw `${option}: 없는 옵션입니다.`;
  }

  if(progressResponse.status == "done") {
    await sql`UPDATE test_data SET success = true WHERE task_id = ${taskId}`;
  } else if(progressResponse.status == "error") {
    await sql`UPDATE test_data SET success = false WHERE task_id = ${taskId}`;
  }

  return progressResponse;
}

async function _uploadImages(images: File[], count: number[], uploadImage: (image: File) => Promise<UploadResponse>): Promise<UploadResponse[]> {
  const tasks = [];
  for(let i = 0; i < count.length; i++) {
    for(let j = 0; j < count[i]; j++) {
      tasks.push(images[i]);
    }
  }

  return await Promise.all(tasks.map((task) => uploadImage(task)));
}