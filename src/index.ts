import { Request, RequestHandler, Response } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

export class ExpressAsyncStorage<Store extends Record<PropertyKey, any>> {
  readonly #storage = new AsyncLocalStorage<Partial<Store>>();

  get store(): Partial<Store> | undefined {
    return this.#storage.getStore();
  }

  get<Key extends keyof Store>(key: Key): Store[Key] | undefined {
    return this.store?.[key];
  }

  middleware(
    createStore?: (req: Request, res: Response) => Partial<Store>,
  ): RequestHandler {
    return (req, res, next) => {
      const store: Partial<Store> = createStore ? createStore(req, res) : {};
      return this.#storage.run(store, () => next());
    };
  }

  set<Key extends keyof Store, Value extends Store[Key] = Store[Key]>(
    key: Key,
    value: Value,
  ): Value {
    if (this.store) this.store[key] = value;
    return value;
  }
}
