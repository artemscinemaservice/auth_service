import { PROTO_PATH } from '@artemscinemaservice/contracts';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AllConfigs } from '@/config';

import { grpcLoader, grpcPackages, grpcProtoPaths } from './grpc.options';

export function createGrpcServer(
	app: INestApplication,
	config: ConfigService<AllConfigs>
) {
	const host = config.get('grpc.host', { infer: true });
	const port = config.get('grpc.port', { infer: true });

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: grpcPackages,
			protoPath: grpcProtoPaths,
			url: `${host}:${port}`,
			loader: grpcLoader,
		},
	});
}
