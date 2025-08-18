interface CDNInfo {
    cdn: string;
    isFreeTraffic: boolean;
    useHttps: boolean;
}

interface AtlasCoverSize {
    w: number;
    h: number;
}

interface Atlas {
    music: string;
    volume: number;
    cdnList: CDNInfo[];
    type: number;
    size: AtlasCoverSize[];
    list: string[];
}

interface SinglePicture {
    music: string;
    volume: number;
    cdnList: CDNInfo[];
    type: number;
    size: AtlasCoverSize[];
    list: string[];
}

function createAtlas(SinglePicture: SinglePicture): Atlas {
    return {
        music: SinglePicture.music,
        volume: SinglePicture.volume,
        cdnList: SinglePicture.cdnList,
        type: 1,
        size: SinglePicture.size,
        list: SinglePicture.list,
    };
}

export function formatSingleToAtlas(sourcePhoto: any): any {
    const photo = sourcePhoto;
    const SinglePicture = photo.ext_params?.single as SinglePicture;
    const atlas = createAtlas(SinglePicture);
    photo.ext_params.atlas = atlas;
    return photo;
}
