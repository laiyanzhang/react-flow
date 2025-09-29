import { request } from './request';

export type ResourceType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
export type Domain = 'A' | 'B';
export type SortOrder = 'asc' | 'desc';

export interface MaterialParams {
  domain?: Domain;
  type?: ResourceType;
  page?: number;
  size?: number;
  sortField?: string;
  sortOrder?: SortOrder;
}

export interface MaterialItem {
  id: number;
  repoId: number;
  userId: number;
  domain: Domain;
  resourceType: ResourceType;
  title: string;
  thumbnailUrl: string;
  originUrl: string;
  attrConfig: string;
  size: number;
  format: string;
  createTime: string;
  updateTime: string;
}

export interface MaterialResponse {
  total: number;
  dataList: MaterialItem[];
}

// 获取素材列表
export const getMaterialList = (params: MaterialParams) => {
  return request<MaterialResponse>('resources', params, {
    method: 'GET',
  });
};

// 删除素材
export const deleteMaterial = (id: number) => {
  return request(`resources/${id}`, null, {
    method: 'DELETE',
  });
};

// 上传素材
export const uploadMaterial = (data: any) => {
  return request('resources', { ...data, domain: 'B' });
};
