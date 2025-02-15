export interface IUser {
    userId: string;
    ip: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
    browser: string;
    theme: string;
    ui: string;
}

export interface ICodeInfo {
    status?: string;
    problemName?: string;
    problemUrl: string;
    code: string;
    codeLanguage: string;
    createdAt: Date;
    userId?: string;
}