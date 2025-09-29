import { useInfiniteQuery } from '@tanstack/react-query';
import { getMaterialList } from '@/api/material';
import type { ResourceType } from '@/api/material';

const PAGE_SIZE = 40;

const fetchMaterialList = async ({
  pageParam = 1,
  queryKey,
}: {
  pageParam: number;
  queryKey: (string | ResourceType | any)[];
}) => {
  const [, activeTab] = queryKey;
  const params: any = {
    domain: 'B',
    page: pageParam,
    size: PAGE_SIZE,
    sortField: 'createTime',
    sortOrder: 'desc',
  };
  activeTab === 'ALL' ? '' : (params.type = activeTab);

  const response: any = await getMaterialList(params as any);

  if (response?.code === 'SUCCESS' && response?.data) {
    return response.data;
  }

  throw new Error(response?.msg || '获取素材列表失败');
};

/**
 * @param activeTab 当前选中的素材类型
 */
export const useMaterials = (activeTab: ResourceType | 'ALL') => {
  return useInfiniteQuery({
    queryKey: ['materials', activeTab],
    queryFn: fetchMaterialList,
    initialPageParam: 1,
    staleTime: 1 * 1000, // 新增配置：数据在 1 秒内被认为是新鲜的
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap(page => page.dataList || []).length;
      const hasMoreData =
        (lastPage.dataList?.length || 0) > 0 && totalLoaded < lastPage.total;

      return hasMoreData ? allPages.length + 1 : undefined;
    },
  });
};
