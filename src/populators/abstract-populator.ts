import { Logger } from 'winston';
import { AbstractDataAdapter } from '../adapters/data-adapter';
import { BaseDataAdapter } from '../adapters/base-adapter';
import { createLogger, createProfiler } from '../utils/create-logger';
import { CherrytwistClient } from '@cherrytwist/client-lib';

export abstract class AbstractPopulator {
  protected client: CherrytwistClient;
  protected data: AbstractDataAdapter;
  protected logger: Logger;
  protected profiler: Logger;
  protected name: string;

  // Create the ecoverse with enough defaults set/ members populated
  constructor(
    client: CherrytwistClient,
    data?: AbstractDataAdapter,
    logger?: Logger,
    profiler?: Logger
  ) {
    this.client = client;
    this.data = data || new BaseDataAdapter();
    this.logger = logger || createLogger();
    this.profiler = profiler || createProfiler();
    this.name = 'abstract-populator';
  }

  abstract populate(): void;
}
