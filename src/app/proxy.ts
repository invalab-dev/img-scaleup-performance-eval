"use server";

import postgres from "postgres";
import {uploadImage as localUploadImage } from "@/app/local_gpu";
import {uploadImage as cloudUploadImage } from "@/app/local_gpu";
import {Option, Result, UploadResponse} from "@/app/class";

// TODO: cloud server로 변경 필요
const sql = postgres(process.env.POSTGRES_URL!);

export async function request(formData: FormData) {
  const images = formData.getAll("images") as File[];
  const count = formData.getAll("count").map((e) => parseInt(e as string));
  const option = formData.get("option") as string;

   try {
     let uploadResponses!: UploadResponse[];
     const requestTime = new Date().toISOString();
     if(option == Option.local_GPU) {
       uploadResponses = await uploadImages(images, count, localUploadImage);
     } else if(option == Option.cloud_GPU) {
       uploadResponses = await uploadImages(images, count, cloudUploadImage);
     } else if(option == Option.cloud_GPU_and_nestjs) {

     } else {
       throw `${option}: 없는 옵션입니다.`;
     }
     const responseTime = new Date().toISOString();

     const sqlResult1 = await sql`INSERT INTO job(option, request, response) VALUES (${option}, ${requestTime}, ${responseTime}) RETURNING id`;
     const jobId = sqlResult1.at(0)!.id;

     return {
       job_id: jobId,
       task_ids: JSON.stringify(uploadResponses),
     };
     // await sql`INSERT INTO test_data ${sql(results, "job_id", "task_id", "image_size", "success")}`;
   } catch(e) {
     console.log(e);
   }
}

async function uploadImages(images: File[], count: number[], uploadImage: (image: File) => Promise<UploadResponse>): Promise<UploadResponse[]> {
  const tasks = [];
  for(let i = 0; i < count.length; i++) {
    for(let j = 0; j < count[i]; j++) {
      tasks.push(images[i]);
    }
  }

  return await Promise.all(tasks.map((task) => uploadImage(task)));
}