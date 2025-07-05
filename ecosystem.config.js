module.exports = {
    apps: [
      {
        name: 'resident',
        script: 'npm',
        args: 'start',
        exec_mode: 'cluster',
        instances: 'max',
        env: {
          PM2_PUBLIC_PORT: 3003,
          NODE_ENV: 'production',
        },
      },
    ],
  };
  