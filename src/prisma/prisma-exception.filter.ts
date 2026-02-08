import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    if (exception.code === 'P2002') {
      const target = (exception.meta as any)?.target;
      const field = Array.isArray(target) ? target.join(', ') : target;

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: `${field || 'Unique field'} already exists`,
        error: 'Bad Request',
      });
    }

    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: 400,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
