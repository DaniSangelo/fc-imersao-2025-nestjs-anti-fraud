import { Module } from '@nestjs/common';
import { FraudService } from './fraud/fraud.service';
import { FrequentHighValueSpecification } from './fraud/specifications/frequent-high-value.specification';
import { UnusualAmountSpecification } from './fraud/specifications/unusual-amount.specification';
import { SuspiciousAccountSpecification } from './fraud/specifications/suspicious-account.specification';
import { FraudAggregateSpecification } from './fraud/specifications/fraud-aggregate.specification';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';

@Module({
  providers: [
    FraudService,
    FrequentHighValueSpecification,
    UnusualAmountSpecification,
    SuspiciousAccountSpecification,
    FraudAggregateSpecification,
    {
      provide: 'FRAUD_SPECIFICATIONS',
      useFactory: (
        frequentHighValueSpecification: FrequentHighValueSpecification,
        unusualAmountSpecification: UnusualAmountSpecification,
        suspiciousAccountSpecification: SuspiciousAccountSpecification,
      ) => {
        return [
          frequentHighValueSpecification,
          unusualAmountSpecification,
          suspiciousAccountSpecification,
        ];
      },
      inject: [
        FrequentHighValueSpecification,
        UnusualAmountSpecification,
        SuspiciousAccountSpecification,
      ],
    },
    InvoicesService,
  ],
  controllers: [InvoicesController]
})
export class InvoicesModule {}
