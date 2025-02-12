export interface IUser {
    ip: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
}

export interface ICodeInfo {
    status: string;
    problemUrl: string;
    code: string;
    codeLanguage: string;
    browser: string;
    createdAt: Date;
    userId?: string;
}