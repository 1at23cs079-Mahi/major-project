declare const _default: () => {
    nodeEnv: string;
    port: number;
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        refreshSecret: string | undefined;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    logging: {
        level: string;
    };
    encryption: {
        key: string | undefined;
    };
    cors: {
        origins: string[];
    };
    swagger: {
        enabled: boolean;
    };
};
export default _default;
