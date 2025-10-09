










import { Module } from '@nestjs/common';
import { PrismaService } from './utils/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { AirportComplianceModule } from './airport-compliance.module';
import { AuditLogModule } from './audit-log.module';
import { RulePacksModule } from './rule-packs/rule-packs.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PaymentsModule,
    AirportComplianceModule,
    AuditLogModule,
    RulePacksModule
  ],
  providers: [PrismaService],
})
export class AppModule {}










