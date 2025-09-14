import { Analytics } from 'apps/libs/domain/hosts/analytics.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { HostAnalytics, NewHostAnalytics, HostAnalyticsWithStatus } from '../types';

export class HostAnalyticsMapper {
    static toDomain(row: HostAnalyticsWithStatus): Analytics {
        const analytics = new Analytics();
        analytics.id = row.id;
        analytics.recordId = row.recordId;
        analytics.provider = row.provider;
        analytics.trackerId = row.trackerId;
        analytics.trackerName = row.trackerName ?? '';
        analytics.status = (row.status?.name as Status) ?? Status.ACTIVE;
        analytics.recordStatus = (row.status?.name as Status) ?? Status.ACTIVE;
        analytics.recordType = DatabaseKeys.HOST_ANALYTICS;
        analytics.createdAt = row.createdAt?.toISOString();
        analytics.updatedAt = row.updatedAt?.toISOString();

        return analytics;
    }

    static toPersistence(entity: Analytics, hostId: number, statusId: number): NewHostAnalytics {
        return {
            recordId: entity.recordId,
            hostId: hostId,
            provider: entity.provider,
            trackerId: entity.trackerId,
            trackerName: entity.trackerName,
            configuration: undefined, // Not available in domain entity
            statusId: statusId,
        };
    }
}
