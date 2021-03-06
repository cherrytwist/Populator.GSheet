import { AlkemioClient } from '@alkemio/client-lib';
import { Logger } from 'winston';
import { AbstractDataAdapter } from '../adapters/data-adapter';
import { Opportunity } from '../models';
import { ReferencesCreator } from '../utils/references-creator';
import { AbstractPopulator } from './abstract-populator';

export class OpportunityPopulator extends AbstractPopulator {
  // Create the ecoverse with enough defaults set/ members populated
  constructor(
    client: AlkemioClient,
    data: AbstractDataAdapter,
    logger: Logger,
    profiler: Logger
  ) {
    super(client, data, logger, profiler);
  }

  async populate() {
    this.logger.info('Processing opportunities');

    const opportunities = this.data.opportunities();

    if (opportunities.length === 0) {
      this.logger.warn('No opportunities to import!');
      return;
    }

    for (const opportunityData of opportunities) {
      if (!opportunityData.displayName) {
        // End of valid opportunities
        break;
      }

      // start processing
      this.logger.info(
        `Processing opportunity: ${opportunityData.displayName}....`
      );
      const opportunityProfileID = '===> opportunityCreation - FULL';
      this.profiler.profile(opportunityProfileID);

      if (!opportunityData.challenge) {
        this.logger.warn(
          `Skipping opportunity '${opportunityData.displayName}'. Missing challenge '${opportunityData.challenge}'!`
        );
        continue;
      }

      const existingOpportunity = await this.client.opportunityByNameID(
        this.ecoverseID,
        opportunityData.nameID
      );

      try {
        if (existingOpportunity) {
          this.logger.info(
            `Opportunity ${opportunityData.displayName} already exists! Updating`
          );
          await this.updateOpportunity(opportunityData, existingOpportunity);
        } else {
          await this.createOpportunity(opportunityData);
        }
      } catch (e) {
        if (e.response && e.response.errors) {
          this.logger.error(
            `Unable to create/update opportunity (${opportunityData.displayName}): ${e.response.errors[0].message}`
          );
        } else {
          this.logger.error(`Could not create/update opportunity: ${e}`);
        }
      } finally {
        this.profiler.profile(opportunityProfileID);
      }
    }
  }

  async createOpportunity(opportunityData: Opportunity) {
    await this.client.createOpportunity({
      challengeID: opportunityData.challenge,
      displayName: opportunityData.displayName,
      nameID: opportunityData.nameID,
      context: {
        background: opportunityData.background,
        impact: opportunityData.impact,
        who: opportunityData.who,
        vision: opportunityData.vision,
        tagline: opportunityData.tagline,
        visual: {
          avatar: opportunityData.visualAvatar,
          background: opportunityData.visualBackground,
          banner: opportunityData.visualBanner,
        },
        references: this.getReferences(opportunityData),
      },
      tags: opportunityData.tags || [],
    });

    this.logger.info(`...added opportunity: ${opportunityData.displayName}`);
  }

  private getReferences(opportunityData: Opportunity) {
    const references = new ReferencesCreator();
    references.addReference(
      'video',
      opportunityData.refVideo,
      'Video explainer for the opportunity'
    );
    references.addReference(
      'jitsi',
      opportunityData.refJitsi,
      'Jitsi meeting space for the opportunity'
    );
    return references.getReferences();
  }

  async updateOpportunity(
    opportunityData: Opportunity,
    existingOpportunity: any
  ) {
    await this.client.updateOpportunity({
      ID: existingOpportunity.id,
      displayName: opportunityData.displayName,
      context: {
        background: opportunityData.background,
        impact: opportunityData.impact,
        who: opportunityData.who,
        vision: opportunityData.vision,
        tagline: opportunityData.tagline,
        visual: {
          avatar: opportunityData.visualAvatar,
          background: opportunityData.visualBackground,
          banner: opportunityData.visualBanner,
        },
      },
      tags: opportunityData.tags || [],
    });

    this.logger.info(`...updated opportunity: ${opportunityData.displayName}`);
  }
}
