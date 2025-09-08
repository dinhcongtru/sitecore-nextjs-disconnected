import {
  LayoutService,
  RestLayoutService,
  GraphQLLayoutService,
  constants,
  LayoutServiceData,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { IncomingMessage, ServerResponse } from 'http';
import config from 'temp/config';
import clientFactory from 'lib/graphql-client-factory';

// Disconnected layout service
class DisconnectedLayoutService implements LayoutService {
  async fetchLayoutData(
    itemPath: string,
    language?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _req?: IncomingMessage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _res?: ServerResponse
  ): Promise<LayoutServiceData> {
    try {
      const lang = language || 'en';
      // Skip loading for Next.js static assets and system routes
      if (
        itemPath.startsWith('/_next/') ||
        itemPath.includes('.css') ||
        itemPath.includes('.js') ||
        itemPath.includes('.webpack') ||
        itemPath.startsWith('/.well-known/') ||
        itemPath.includes('devtools') ||
        itemPath.includes('favicon')
      ) {
        throw new Error('Static asset route');
      }

      // Map route paths to JSON files
      if (itemPath === '/' || itemPath === '') {
        const layoutData = await import(`../data/routes-data/en.json`);
        return layoutData.default || layoutData;
      } else {
        // Clean path and use as route file name
        const cleanPath = itemPath.replace(/^\/+/, '').replace(/\/+/g, '-') || 'home';
        const routeFile = `${cleanPath}-${lang}`;

        try {
          const layoutData = await import(`../data/routes-data/${routeFile}.json`);
          return layoutData.default || layoutData;
        } catch (error) {
          const layoutData = await import(`../data/routes-data/en.json`);
          return layoutData.default || layoutData;
        }
      }
    } catch (error) {
      // Skip console warnings for system/dev requests
      if (
        !itemPath.includes('.well-known') &&
        !itemPath.includes('devtools') &&
        !itemPath.includes('webpack')
      ) {
        console.warn(`No layout data found for path: ${itemPath}, language: ${language}`);
      }

      // Return minimal layout structure for 404
      return {
        sitecore: {
          context: {
            pageEditing: false,
            site: { name: config.sitecoreSiteName },
            language: language || 'en',
          },
          route: null,
        },
      };
    }
  }
}

/**
 * Factory responsible for creating a LayoutService instance
 */
export class LayoutServiceFactory {
  /**
   * @param {string} siteName site name
   * @returns {LayoutService} service instance
   */
  create(siteName: string): LayoutService {
    // In disconnected mode, use the disconnected service
    if (config.sitecoreApiKey === 'DISCONNECTED-MODE') {
      return new DisconnectedLayoutService();
    }

    return process.env.FETCH_WITH === constants.FETCH_WITH.GRAPHQL
      ? new GraphQLLayoutService({
          siteName,
          clientFactory,
          /*
            GraphQL endpoint may reach its rate limit with the amount of requests it receives and throw a rate limit error.
            GraphQL Dictionary and Layout Services can handle rate limit errors from server and attempt a retry on requests.
            For this, specify the number of 'retries' the GraphQL client will attempt.
            By default it is set to 3. You can disable it by configuring it to 0 for this service.

            Additionally, you have the flexibility to customize the retry strategy by passing a 'retryStrategy'.
            By default it uses the `DefaultRetryStrategy` with exponential back-off factor of 2 and handles error codes 429,
            502, 503, 504, 520, 521, 522, 523, 524, 'ECONNRESET', 'ETIMEDOUT' and 'EPROTO' . You can use this class or your own implementation of `RetryStrategy`.
          */
          retries: (process.env.GRAPH_QL_SERVICE_RETRIES &&
            parseInt(process.env.GRAPH_QL_SERVICE_RETRIES, 10)) as number,
        })
      : new RestLayoutService({
          apiHost: config.sitecoreApiHost,
          apiKey: config.sitecoreApiKey,
          siteName,
          configurationName: config.layoutServiceConfigurationName,
        });
  }
}

/** LayoutServiceFactory singleton */
export const layoutServiceFactory = new LayoutServiceFactory();
