export class Result {
  public job_id!: string;
  constructor(public readonly task_id: string | null,
              public readonly image_size: number,
              public readonly success: boolean) {}
}

export enum Option {
  local_GPU = "local GPU",
  cloud_GPU = "cloud GPU",
  cloud_GPU_and_nestjs = "cloud GPU + nest.js"
}