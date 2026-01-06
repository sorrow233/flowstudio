import { localDataService } from './LocalDataService';
import { cloudDataService } from './CloudDataService';

export const DataServiceFactory = {
    getService: (user, isGuest) => {
        if (!isGuest && user) {
            return cloudDataService;
        }
        return localDataService;
    }
};
