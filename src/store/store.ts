import { create } from 'zustand';

interface SharedStoreState {
    refreshing: boolean;
    setRefreshing: (value: boolean) => void;

    groupId: number;
    setGroupId: (id: number) => void;

    groupName: string;
    setGroupName: (name: string) => void;

    navigationTitle: string;
    setNavigationTitle: (title: string) => void;

    currentTabIndex: number;
    setCurrentTabIndex: (index: number) => void;

    headerHeight: number;
    onHeaderLayout: (height: number) => void;
}

export const useSharedStore = create<SharedStoreState>((set) => ({
    refreshing: false,
    setRefreshing: (value) => set({ refreshing: value }),

    groupId: 0,
    setGroupId: (id) => set({ groupId: id }),

    groupName: '',
    setGroupName: (name) => set({ groupName: name }),

    navigationTitle: '图文小组',
    setNavigationTitle: (title) => set({ navigationTitle: title }),

    currentTabIndex: 0,
    setCurrentTabIndex: (index) => set({ currentTabIndex: index }),

    headerHeight: 0,
    onHeaderLayout: (height) => set({ headerHeight: height }),
}));
