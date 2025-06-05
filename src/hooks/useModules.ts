import { useAsyncState } from './useAsyncState';
import { modulesApi, type ModuleFilters } from '../api/modules';

export function useModules(filters?: ModuleFilters) {
  return useAsyncState(
    () => modulesApi.getAll(filters),
    [JSON.stringify(filters)]
  );
}

export function useModule(id: string | undefined) {
  return useAsyncState(
    () => {
      if (!id) throw new Error('Module ID is required');
      return modulesApi.getById(id);
    },
    [id],
    { immediate: !!id }
  );
}

export function useModulesByType(mtype: string | undefined) {
  return useAsyncState(
    () => {
      if (!mtype) throw new Error('Module type is required');
      return modulesApi.getByType(mtype);
    },
    [mtype],
    { immediate: !!mtype }
  );
}