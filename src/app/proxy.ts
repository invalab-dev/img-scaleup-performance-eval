"use server";

import postgres from "postgres";
import {uploadImage as localUploadImage } from "@/app/local_gpu";
import {uploadImage as cloudUploadImage } from "@/app/local_gpu";
import {Option, Result} from "@/app/class";

// TODO: cloud server로 변경 필요
const sql = postgres(process.env.POSTGRES_URL!);

export async function request(formData: FormData) {
  const images = formData.getAll("images") as File[];
  const count = formData.getAll("count").map((e) => parseInt(e as string));
  const option = formData.get("option") as string;

  let results!: Result[];
  const requestTime = new Date().toISOString();
  if(option == Option.local_GPU) {
    results = await uploadImages("http://superres.invalab.com", images, count, localUploadImage);
  } else if(option == Option.cloud_GPU) {
    results = await uploadImages("http://10.0.2.8:81", images, count, localUploadImage);
  } else if(option == Option.cloud_GPU_and_nestjs) {

  } else {
    throw `${option}: 없는 옵션입니다.`;
  }
  const responseTime = new Date().toISOString();

  const sqlResult1 = await sql`INSERT INTO job(option, request, response) VALUES (${option}, ${requestTime}, ${responseTime}) RETURNING id`;
  const jobId = sqlResult1.at(0)!.id;
  results.forEach((result) => result.job_id = jobId);

  await sql`INSERT INTO test_data ${sql(results, "job_id", "task_id", "image_size", "success")}`;
}

async function uploadImages(host: string, images: File[], count: number[], uploadImage: (host: string, image: File) => Promise<Result>): Promise<Result[]> {
  const tasks = [];
  for(let i = 0; i < count.length; i++) {
    for(let j = 0; j < count[i]; j++) {
      tasks.push(images[i]);
    }
  }

  return await Promise.all(tasks.map((task) => uploadImage(host, task)));
}