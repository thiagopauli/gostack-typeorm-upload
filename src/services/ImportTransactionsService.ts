import path from 'path';
import fs from 'fs';
import csv from 'csvtojson';

import AppError from '../errors/AppError';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}

interface TransactionParams {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({ fileName }: Request): Promise<Transaction[]> {
    const transactionsFilePath = path.join(uploadConfig.directory, fileName);
    const transactionsFileExists = await fs.promises.stat(transactionsFilePath);

    if (!transactionsFileExists) {
      throw new AppError('File not found.', 500);
    }

    const createTransaction = new CreateTransactionService();

    const transactions = await csv().fromFile(transactionsFilePath);

    async function processArray(array: TransactionParams[]): Promise<Transaction[]> {
      const transactionList = [];

      for (const item of array) {
        const { title, type, value, category } = item;

        const transaction = await createTransaction.execute({
          title,
          type: type === 'income' ? 'income' : 'outcome',
          value,
          categoryName: category,
        });

        transactionList.push(transaction);
      }

      return transactionList;
    }

    const savedTransactions = await processArray(transactions);

    await fs.promises.unlink(transactionsFilePath);

    return savedTransactions;
  }
}

export default ImportTransactionsService;
