import {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../../../src/lib/errors';

describe('AppError', () => {
  it('sets message, statusCode and name', () => {
    const err = new AppError('test', 500);
    expect(err.message).toBe('test');
    expect(err.statusCode).toBe(500);
    expect(err.name).toBe('AppError');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('has statusCode 400 and is instance of AppError', () => {
    const err = new ValidationError('campo inválido');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('campo inválido');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('NotFoundError', () => {
  it('formats message with entity name and has statusCode 404', () => {
    const err = new NotFoundError('Workshop');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Workshop não encontrado');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('ConflictError', () => {
  it('has statusCode 409 and is instance of AppError', () => {
    const err = new ConflictError('já existe');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('já existe');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('UnauthorizedError', () => {
  it('has statusCode 401 with default message', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Não autorizado');
    expect(err).toBeInstanceOf(AppError);
  });
});
