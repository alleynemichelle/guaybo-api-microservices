import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { CreateUserResponseDataDto } from './create-user-response.dto';
import { AuthSessionResponseDto } from './session-response.dto';

export class CreateSessionResponseDto extends ResponseDto {
    @ApiProperty({
        type: CreateUserResponseDataDto,
        example: {
            user: {
                recordId: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                timezone: 'America/Caracas',
                status: 'ACTIVE',
                defaultLanguage: 'ES',
                registered: true,
                federated: false,
                verifiedEmail: true,
                createdAt: '2024-09-06T01:28:42.181Z',
                lastAccess: '2024-11-07T10:15:30.123Z',
                hosts: [
                    {
                        createdAt: '2024-09-06T01:28:42.181Z',
                        hostId: '22b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
                        role: 'ADMIN',
                        status: 'ACTIVE',
                        alias: 'John Doe',
                    },
                ],
            },
            session: {
                tokenId: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
                accessToken: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
                refreshToken: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
                expiresIn: 86400,
            },
            requiredAction: false,
        },
    })
    data: CreateUserResponseDataDto;
}

export class RequiredAuthActionResponse extends ResponseDto {
    @ApiProperty({
        description: 'Required auth action response.',
        type: AuthSessionResponseDto,
        example: {
            requiredAction: true,
            session: {
                accessToken:
                    'eyJraWQiOiJWdE43MVJGa3JhTFZudVFpNDRNSDEzXC82aUtLVVJvQ3VpNUVyY3hKdVptOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJkNDA4NDQwOC1iMGIxLTcwMDEtMTk1OC05MmFjOTcyYzgyODMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV91TDdNeTNpdEQiLCJjbGllbnRfaWQiOiI0MzkxZHRiOWFoZW0wZmY1dnVkYm1naXFmcCIsIm9yaWdpbl9qdGkiOiJhMjQxYzZmZC05ZjAyLTQ4NjYtODAwNy1lNDk5ZDJlOGUzN2MiLCJldmVudF9pZCI6IjY2NzBkOTI5LTU5ZmUtNDI5Yy1iN2ExLTU5YjJjZGNiYTcxNyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3MzA5NDA2NjQsImV4cCI6MTczMTAyNzA2NCwiaWF0IjoxNzMwOTQwNjY0LCJqdGkiOiI1ZGIxNGRkNS04MjEwLTRlNjQtODk3OS03NWMxMmUyMTlkMTciLCJ1c2VybmFtZSI6ImQ0MDg0NDA4LWIwYjEtNzAwMS0xOTU4LTkyYWM5NzJjODI4MyJ9.MwbgnkOnsMR_vN9kckzDJW_RD0j4FpnHJEsv1mzMDW5gA5JxMkvU2-qbb7dMRcBaxIHx3hVtkKn6CM84L_xcidNyV4ENBNyvjLixZCM64SvSRJNneMAV9vOARbw9Be__14rq3l81_8kniIeRuVvr6e_iXHEbPCQRzgCeg-SaC1br4QhFYyX-ESlFVHX-5mRDrCP2NPOcYFvEMuR9XmuyOcqQbViwbtLlDC50qwsa283qxsmAMRuidCmT681OunxPmV-LFY26PJHvpepEXjlzo0_zBjOaZvqje62PfB0-oIU4O_z96Rx1pk1ypV2Z72_8hw92lG8ynEKntZLQRTlfug',
                refreshToken:
                    'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.mJfwHc0LDmzoIgkLePDMQLsN_rYFOHw56bsyNhk_9thLheN4AW1IRoLCuUKNB6zKpcAn-SmDxoVxHXVbyMN6EIJj-Vpzyp3dbHZLLVMUOFkiJRoJQYq2PQ5wf6x3nf7olLV4UFkBDrp5XQKYOFkbECglLikHzJbP7xfhZNLizpxSTWf9qpD1OOshT3FmnHIjpN7k2LMJ2xTcs-Jzy5UcJX3AkjRqbTJLXCYqIOAtGjvNCyhPGuxbVeIFgtFmhGvKXN9OsirRHG7vHynLIKKYk9agiulGLSj8KyYMXHAGxoSM7d2Bg9bXr3TyDIek8hN95t_eqQ6e_okHZKREKrdW2A.PT1QVrL2w9XG0r1e.rlXNtEoFoDYgt2F7LFVKuUcHsUFy_gSszfxFKLtGKSRyDF4OxWzLtB_YA4lOYGRjIHV6O25f1DNN0rY02WdYSzXePDSnA3mEV9cz467pnol7bDUVXpOYEf1cpQeikUJGS4AMUjabPgUMyn7_aWPkxrSWIh6R5PptF2vR6252VMSszzDZgWIIrbx0gbG0vQNtkYf3lEFUWjz1hzhiCbbJ7XZZ3NUIyvFikUibkJ0s6WL6siq3KRwaqZR79qOxl28fw0xFd-KIfGkgiQWGPFoQddMHMUFkwxxyC9VXEHDabrFeQD9ZBtifgdnqAgnPxIpk2Nov4dQxaXjmKhlDLFu7M0SCV3gc56W60VRAb_E7a1FrdInR0GyD4tiM4LZyiWDUFpniTDh7SZn8Fknl12BHJdV3l2yqBbTM9tYwlUW_8G1zrNiRlNGNBQ8cAv27wJ3Y_SouQlZgRK16ppXZPShXLbxe0JZjSTZArHi7DMhoMs6al2uewCybSmg6zqVbGSHIwKbe3UNxPtL8fDByJFj-1jqUlwJj328QDGWyNRohkDYUnhMx_KjuzUStx2U5Q1i8fuC7mkJZj9Cio54KMrHEMieTMlplQ8CyKCN1eJE8SoVRZyOtE79VqZozKh5TegeXI1m27YZiJTrUrCG1A0YmI99H4DEPsL5dec9patxFx_hcnnoBe-nqM9pCX8GQwoprL2O6lrGvTPQsZGp_FOlhTQlvO1ynUOBLl_whAqctxOJAmZrIa5u9GjvNVVuEWRv45LBHibDi08u_kKJ_aAr_3Nn4T7rUScMlPbQ289w_sBschYZb0jLFz2lpef1ZKAPOXynz8oXzbNk2Ytxmf17_hR9s4iyFLla454gy-bLyLucoQFAnfXe17lDRxbjcSqGnSa1_n9vgusDjINiCUjlLg-WtY6Oi4bCdNYNtokzYG6OMPDHXBvZEzASihKglWtrPbKuwPn-tOQ4W5JzwEUoUvcWAX6Z7Sc28kzpxDb7CsVNlcChlLqkC1VstzpUP-SyPOvgGB10nnrwCVcfDv1b6dt9XPrtR-voJveaIqy_BNn0F-2jx7GD6cfVTGnYcixoUYZkEitpEE_bGJSfSjBQP_hQm1eJb6JWxdC-KQPcn67OceOyfwoqXKe8MIcJGhPaUuajsbNBWrvyGhNooh0tem81A7PWBDKt_8SGxoess6dEnK7_W9s2DpThbR5_1oIYbHuS7RGydVagLWaClC773wDnlwnYxQUGPRmTMs6NHqAlkv1LkSURMSsBiKs9vyltKBXzQuCwtD1JLRBSz5LZk4xYB1m2qz_dHpfCzAv7nkbshTi_J0lvdpeJbyg.dd-5L-hFvnT5yR0xMAlqZg',
                expiresIn: 86400,
            },
        },
    })
    data: AuthSessionResponseDto;
}
