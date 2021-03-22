export interface IPackagistApiItem {
    name: string;
    description: string;
    keywords: string[];
    homepage: string;
    version: string;
    version_normalized: string;
    license: string[];
    authors: any[];
    source: any;
    dist: any;
    type: string;
    funding: any;
    time: Date;
    autoload: any;
    extra: any;
    require: any;
    'require-dev': any;
    suggest: any;
    provide: any;
    support: any;
}
