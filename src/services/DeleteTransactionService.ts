import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const [transaction] = await transactionRepository.find({
      where: { id },
    });

    if (!transaction) {
      throw new AppError('Transaction not found.', 404);
    }

    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
