export class UploadResponse {
  constructor(public readonly success: boolean,
              public readonly taskId: string | null = null,
              public readonly imageSize: number | null = null,) {}
}

export class ProgressResponse {
  constructor(public readonly progress: number,
              public readonly filename: string,
              public readonly status: string) {}
}

export enum Option {
  LOCAL_GPU = "local GPU",
  CLOUD_GPU = "cloud GPU",
  CLOUD_GPU_AND_NEXT_JS = "cloud GPU + nest.js",
}