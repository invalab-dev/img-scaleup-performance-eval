export class Result {
  public job_id!: string;
  constructor(public readonly task_id: string | null,
              public readonly image_size: number,
              public readonly success: boolean) {}
}

export class UploadResponse {
  constructor(public readonly success: boolean,
              public readonly task_id: string) {}
}

export class ProgressResponse {
  constructor(public readonly progress: number,
              public readonly filename: string,
              public readonly status: string) {}
}

export enum Option {
  local_GPU = "local GPU",
  cloud_GPU = "cloud GPU",
  cloud_GPU_and_nestjs = "cloud GPU + nest.js"
}