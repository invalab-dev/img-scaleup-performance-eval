export class UploadResponse {
  constructor(public readonly filename: string | null = null,
              public readonly imageSize: number | null = null,
              public readonly success: boolean) {}
}

export class ProgressResponse {
  constructor(public readonly progress: number,
              public readonly status: string) {}
}

export enum Version {
  LOCAL_GPU = "local GPU",
  CLOUD_GPU = "cloud GPU",
  CLOUD_GPU_AND_NEXT_JS = "cloud GPU + nest.js",
}