import { PROTO_PATH } from '@artemscinemaservice/contracts';
import { GrpcOptions } from '@nestjs/microservices';

export const grpcPackages: string[] = ['auth.v1'];

export const grpcProtoPaths: string[] = [PROTO_PATH.AUTH];

export const grpcLoader: NonNullable<GrpcOptions['options']['loader']> = {
	keepCase: false,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
};
