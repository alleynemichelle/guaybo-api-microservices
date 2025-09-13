import { v4 as uuidv4 } from 'uuid';
import { IsString, IsNumber, IsObject, IsUrl, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '../common/base.entity';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { KYCStatus } from 'apps/libs/common/enums/kyc-status.enum';

export class KycSession extends Base {
    @ApiProperty({
        description: 'Host identifier',
        example: '11111111-2222-3333-4444-555555555555',
    })
    @IsUUID()
    hostId: string;

    @ApiProperty({
        description: 'User identifier',
        example: '11111111-2222-3333-4444-555555555555',
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Session identifier',
        example: '11111111-2222-3333-4444-555555555555',
    })
    @IsUUID()
    sessionId: string;

    @ApiProperty({
        description: 'Session number',
        example: 1234,
    })
    @IsNumber()
    sessionNumber: number;

    @ApiProperty({
        description: 'Session token',
        example: 'abcdef123456',
    })
    @IsString()
    sessionToken: string;

    @ApiProperty({
        description: 'Vendor specific data',
        example: 'user-123',
    })
    @IsString()
    vendorData: string;

    @ApiProperty({
        description: 'Additional metadata',
        example: {
            userType: 'premium',
            accountId: 'ABC123',
        },
    })
    @IsObject()
    metadata: Record<string, any>;

    @ApiProperty({
        description: 'Current status of the session',
        example: KYCStatus.NOT_STARTED,
    })
    @IsEnum(KYCStatus)
    status: KYCStatus;

    @ApiProperty({
        description: 'Workflow identifier',
        example: '11111111-2222-3333-4444-555555555555',
    })
    @IsUUID()
    workflowId: string;

    @ApiProperty({
        description: 'Callback URL',
        example: 'https://example.com/verification/callback',
    })
    @IsUrl()
    callback: string;

    @ApiProperty({
        description: 'Verification URL',
        example: 'https://verify.didit.me/session/abcdef123456',
    })
    @IsUrl()
    url: string;

    constructor(data: Partial<KycSession>) {
        super();
        Object.assign(this, data);

        this.recordId = uuidv4();
        this.createdAt = getUTCDate().toISOString();
        this.recordType = DatabaseKeys.KYC_SESSION;
        this.recordStatus = Status.ACTIVE;
    }
}
