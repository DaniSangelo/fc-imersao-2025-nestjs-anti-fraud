import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProcessInvoiceFraudDto } from '../dto/process-invoice-fraud.dto';
import { Account, FraudReason, InvoiceStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { FraudAggregateSpecification } from './specifications/fraud-aggregate.specification';

@Injectable()
export class FraudService {
  constructor(
    private prismaService: PrismaService,
    // private configService: ConfigService,
    private specifications: FraudAggregateSpecification,
  ) {}

  async processInvoice(proccessInvoiceFraudDto: ProcessInvoiceFraudDto) {
    const { invoice_id, account_id, amount } = proccessInvoiceFraudDto;

    const foundInvoice = await this.prismaService.invoice.findUnique({
      where: {
        id: invoice_id,
      },
    });

    if (foundInvoice) {
      throw new Error('Invoice has already been processed');
    }

    const account = await this.prismaService.account.upsert({
      where: {
        id: account_id,
      },
      update: {},
      create: {
        id: account_id,
      },
    });

    const fraudResult = await this.specifications.detectFraud({
      account,
      amount,
      invoiceId: invoice_id
    });

    const invoice = await this.prismaService.invoice.create({
      data: {
        id: invoice_id,
        accountId: account_id,
        amount,
        ...(fraudResult.hasFraud && {
          fraudHistory: {
            create: {
              reason: fraudResult.reason!,
              description: fraudResult?.description,
            },
          },
        }),
        status: fraudResult.hasFraud
          ? InvoiceStatus.REJECTED
          : InvoiceStatus.APPROVED,
      },
    });

    return {
      invoice: invoice,
      fraudResult,
    };
  }
}
