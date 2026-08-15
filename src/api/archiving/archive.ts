// src/api/archiving/archive.ts

import api from '../axios';

import type { ArchiveData, ArchiveResponse, GetArchiveParams } from '../../types/Archiving/archive';

export const getArchive = async (params: GetArchiveParams = {}): Promise<ArchiveData> => {
  const response = await api.get<ArchiveResponse>('/archive', {
    params: {
      status: params.status,
      keyword: params.keyword,
      page: params.page ?? 1,
      size: params.size ?? 100,
    },
  });

  return response.data.data;
};
