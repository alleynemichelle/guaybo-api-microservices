import { v4 as uuidv4 } from 'uuid';

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { Role } from 'apps/libs/common/enums/role.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';

import { Base } from '../common/base.entity';

export class UserHost extends Base {
    @ApiProperty({
        description: 'Host identifier',
        example: '22b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
    })
    @IsNotEmpty()
    @IsString()
    hostId: string;

    @ApiProperty({
        description: 'User identifier',
        example: 'd67de089-39b2-4771-ab11-9e726ff35440',
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'Role of the host',
        enum: Role,
        example: Role.HOST,
    })
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;

    @ApiProperty({
        description: 'Status of the host',
        example: 'ACTIVE',
    })
    @IsNotEmpty()
    @IsEnum(Status)
    status: string;

    constructor(userHost: Partial<UserHost>) {
        super();
        Object.assign(this, userHost);

        this.recordId = uuidv4();
        this.createdAt = getUTCDate().toISOString();
        this.updatedAt = getUTCDate().toISOString();
        this.status = Status.ACTIVE;
        this.recordType = DatabaseKeys.USER_HOST;
    }
}
