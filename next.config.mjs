/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['www.servizing.com','svz-data.s3.ap-south-1.amazonaws.com'], // 👈 Add this line
      },
};

export default nextConfig;
