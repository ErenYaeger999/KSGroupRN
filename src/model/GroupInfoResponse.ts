import { KSBaseResponse } from './KSBaseResponse';

export interface GroupInfo {
    icon: string;
    name: string;
    desc: string; // 小组描述
    participantsCount: number; // 参与人数
    photoCount: number; // 讨论人数
    isParticipant: 0 | 1; // 0没有加入 1已经加入
    bgImage: string; // 背景图
}

export interface GroupInfoResponse extends KSBaseResponse {
    group: GroupInfo;
}
