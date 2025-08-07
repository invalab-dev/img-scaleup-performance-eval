import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            // .node 파일(네이티브 바이너리 파일)을 externals 처리해서 빌드(번들링)에서 제외합니다.
            // 런타임에서 해당 파일이 사용될 때, 직접 로드됩니다.
            config.externals.push('zlib-sync');
        }

        return config
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    // 앱 빌드 시, 필요한 최소 파일만 추려서 .next/standalone/ 폴더에 모아줍니다.
    output: "standalone"
};

export default nextConfig;

