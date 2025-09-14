import { User } from 'apps/libs/domain/users/user.entity';
import { SEBulkResult } from 'apps/libs/integrations/opensearch/se-bulk-result.entity';

export interface IUsersSearchDB {
    insert(users: Partial<User>[]): Promise<SEBulkResult>;
    update(userId: string, data: Partial<User>): Promise<void>;
}
