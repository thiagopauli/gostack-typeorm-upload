import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}
class CreateTransactionService {
  public async execute({ title, value, type, categoryName }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    // Verify if type is equals to "outcome" or "income"
    if (type !== 'outcome' && type !== 'income') {
      throw new AppError('Type param only accept "outcome" and "income" values.', 400);
    }

    // If type equals "outcome", verifies if total balance is higher than value
    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('Outcome value is higher than your balance.', 400);
      }
    }

    // Verify if category exists
    const categoryExists = await categoryRepository.findOne({
      where: { title: categoryName },
    });
    const category = categoryExists || categoryRepository.create({ title: categoryName });

    if (!categoryExists) {
      await categoryRepository.save(category);
    }

    // Create and save transaction
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
