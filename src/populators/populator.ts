import { CherrytwistClient } from '@cherrytwist/client-lib';
import { Logger } from 'winston';
import { AbstractDataAdapter } from '../adapters/data-adapter';
import { AbstractPopulator } from './abstract-populator';
import { ActorPopulator } from './actor-populator';
import { ChallengePopulator } from './challenge-populator';
import { EcoversePopulator } from './ecoverse-populator';
import { GroupPopulator } from './group-populator';
import { OpportunityPopulator } from './opportunity-populator';
import { OrganizationPopulator } from './organisation-populator';
import { UserPopulator } from './user-populator';

export class Populator extends AbstractPopulator {
  // Create the ecoverse with enough defaults set/ members populated
  constructor(
    client: CherrytwistClient,
    data: AbstractDataAdapter,
    logger: Logger,
    profiler: Logger
  ) {
    super(client, data, logger, profiler);
  }

  async populate() {
    if (!this.data) throw new Error('No data to populate');
    const groupPopulator = new GroupPopulator(
      this.client,
      this.data,
      this.logger,
      this.profiler
    );

    const userPopulator = new UserPopulator(
      this.client,
      this.data,
      this.logger,
      this.profiler
    );

    const challengePopulator = new ChallengePopulator(
      this.client,
      this.data,
      this.logger,
      this.profiler
    );

    const organizationPopulator = new OrganizationPopulator(
      this.client,
      this.data,
      this.logger,
      this.profiler
    );

    const opportunityPopulator = new OpportunityPopulator(
      this.client,
      this.data,
      this.logger,
      this.profiler
    );

    const actorPopulator = new ActorPopulator(
      this.client,
      this.data,
      this.logger,
      this.profiler
    );

    const ecoversePopulator = new EcoversePopulator(
      this.client,
      this.data,
      this.logger,
      this.profiler
    );

    // organisations first as they are needed for Ecoverse + Challenges
    await organizationPopulator.populate();

    await ecoversePopulator.populate();
    await challengePopulator.populate();
    await opportunityPopulator.populate();
    await actorPopulator.populate();
    await groupPopulator.populate();
    await userPopulator.populate();
  }
}
