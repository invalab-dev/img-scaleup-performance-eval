"use server";

import postgres from "postgres";
import {uploadImage as localUploadImage, checkProgress as localCheckProgress} from "@/app/local_gpu";
import {uploadImage as cloudUploadImage, checkProgress as cloudCheckProgress} from "@/app/cloud_gpu";
import {uploadImage as nestUploadImage, checkProgress as nestCheckProgress} from "@/app/cloud_gpu_and_nest_js";
import {Version, ProgressResponse, UploadResponse} from "@/app/class";

// TODO: cloud server로 변경 필요
const sql = postgres(process.env.POSTGRES_URL!);

export async function uploadImages(formData: FormData) {
  const images = formData.getAll("images") as File[];
  const count = formData.getAll("count").map((e) => parseInt(e as string));
  const version = formData.get("version") as string;

  let uploadResponses!: UploadResponse[];
  const requestTime = new Date().toISOString();
  if (version == Version.LOCAL_GPU) {
    uploadResponses = await _uploadImages(images, count, localUploadImage);
  } else if (version == Version.CLOUD_GPU) {
    uploadResponses = await _uploadImages(images, count, cloudUploadImage);
  } else if (version == Version.CLOUD_GPU_AND_NEXT_JS) {
    uploadResponses = await _uploadImages(images, count, nestUploadImage);
  } else {
    throw `${version}: 없는 버전입니다.`;
  }
  const responseTime = new Date().toISOString();

  const sqlResult1 = await sql`INSERT INTO job(version, request, response)
                               VALUES (${version}, ${requestTime}, ${responseTime}) RETURNING id`;
  const jobId = sqlResult1.at(0)!.id as string;

  await sql`INSERT INTO test_data ${sql(uploadResponses.map((uploadResponse) => {
    return {
      job_id: jobId,
      filename: uploadResponse.filename,
      image_size: uploadResponse.imageSize,
      request: new Date().toISOString()
    };
  }))}`;

  return {
    uploadResponses: uploadResponses,
    version: version
  };
}

export async function checkProgress(version: Version, filename: string) {
  let progressResponse!: ProgressResponse;
  if(version == Version.LOCAL_GPU) {
    progressResponse = await localCheckProgress(filename);
  } else if(version == Version.CLOUD_GPU) {
    progressResponse = await cloudCheckProgress(filename);
  } else if(version == Version.CLOUD_GPU_AND_NEXT_JS) {
    progressResponse = await nestCheckProgress(filename);
  } else {
    throw `${version}: 없는 버전입니다.`;
  }

  if(progressResponse.status == "done") {
    await sql`UPDATE test_data SET success = true, response = ${new Date().toISOString()} WHERE filename = ${filename}`;
  } else if(progressResponse.status == "error") {
    await sql`UPDATE test_data SET success = false WHERE filename = ${filename}`;
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