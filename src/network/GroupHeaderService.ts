import { NativeModules } from 'react-native';
import { parse } from 'json-bigint';
import { useInfiniteQuery, useQuery } from 'react-query';
// 为避免路径问题，这里直接内联 QueryKey 常量
const IMAGE_GROUP_PAGE_KEY = 'image_group_page_key';
const IMAGE_GROUP_QUERY_KEY = 'image_group_query_key';
const GROUP_INFO_QUERY_KEY = 'group_info_query_key';
import { KSBaseResponse } from '@/model/KSBaseResponse';
import { GroupListResponse } from '@/model/GroupListResponse';
import { GroupInfoResponse } from '@/model/GroupInfoResponse';


export function useFetchGroupInfo(groupId?: number) {
    return useQuery<GroupInfoResponse, KSBaseResponse>(
        [GROUP_INFO_QUERY_KEY, groupId],
        () => {
            console.log('start-useFetchGroupInfo, groupId:', groupId);
            return NativeModules.KSURCTNetworkInterface.request({
                businessName: 'api',
                method: 'POST',
                url: '/rest/n/gemini/group/info',
                responseType: 'string',
                returnPromise: false,
                params: {
                    id: groupId,
                },
            }).then((res: string) => {
                return parse(res);
            });
        },
        {
            enabled: !!groupId, // 只有当 groupId 存在时才执行查询
            // 防止 Header 因为重建而频繁二次拉取
            staleTime: 60 * 1000,
            cacheTime: 5 * 60 * 1000,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            onSuccess: (data) => {
                console.log('useFetchGroupInfo onSuccess---');
            },
            onError: (err) => {
                console.log('useFetchGroupInfo error---', err);
            },
        },
    );
}

export function useFetchGroupFeeds(groupId: number, tabIdx : number, options?: { enabled?: boolean }) {
    return useInfiniteQuery<GroupListResponse, KSBaseResponse>(
        [IMAGE_GROUP_PAGE_KEY, IMAGE_GROUP_QUERY_KEY, tabIdx, groupId],
        (queryParams) => {
            return NativeModules.KSURCTNetworkInterface.request({
                businessName: 'api',
                method: 'POST',
                url: '/rest/n/gemini/group/feed',
                responseType: 'string',
                returnPromise: false,
                params: {
                    pcursor: queryParams?.pageParam?.pcursor,
                    count: 10,
                    groupId: groupId,
                    mode: tabIdx + 1,
                },
            }).then((res: string) => parse(res));
        },
        {
            ...(options ?? {}),
            getNextPageParam: (lastPage) => {
                if (lastPage?.pcursor && lastPage.pcursor !== 'no_more') {
                    return { pcursor: lastPage.pcursor };
                }
                return undefined;
            },
        },
    );
}

export function joinGroup(groupId: number): Promise<KSBaseResponse> {
    return NativeModules.KSURCTNetworkInterface.request({
        businessName: 'api',
        method: 'POST',
        url: '/rest/n/gemini/group/join',
        responseType: 'string',
        returnPromise: false,
        params: { id: groupId },
    }).then((res: string) => parse(res));
}