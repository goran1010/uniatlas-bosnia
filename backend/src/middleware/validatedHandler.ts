import { z } from "zod";

import { RequestValidationError } from "../errors/RequestValidationError.js";

import type { NextFunction, Request, RequestHandler, Response } from "express";

export type ValidatedRouteHandler<TSchema extends z.ZodType> = (
  req: Request,
  res: Response,
  next: NextFunction,
  validated: z.output<TSchema>,
) => void | Promise<void>;

export function validatedHandler<const TSchema extends z.ZodType>(
  schema: TSchema,
  controller: ValidatedRouteHandler<TSchema>,
): RequestHandler {
  return async (req, res, next) => {
    const requestInput = {
      body: req.body as unknown,
      params: req.params,
      query: req.query,
    };

    const result = await schema.safeParseAsync(requestInput);

    if (!result.success) {
      next(new RequestValidationError(result.error));
      return;
    }

    try {
      await controller(req, res, next, result.data);
    } catch (error) {
      next(error);
    }
  };
}
