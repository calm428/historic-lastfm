import axios from 'axios';

import { createBackendUrl } from '../utils/api';
import {
  FORBIDDEN,
  OK,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from '../utils/statusCodes';

const cache = {};

export async function handler({ queryStringParameters: { name } }, context) {
  if (!name) {
    return {
      statusCode: FORBIDDEN,
    };
  }

  if (cache[name]) {
    return {
      body: cache[name],
      statusCode: OK,
    };
  }

  const body = {
    '12month': [],
    '1month': [],
    '3month': [],
    '6month': [],
    '7day': [],
    overall: [],
  };

  try {
    await Promise.all(
      Object.keys(body).map(async period => {
        const endpoint = createBackendUrl('user.gettoptracks', {
          limit: 15,
          period,
          user: name,
        });

        try {
          const {
            data: { toptracks },
          } = await axios.get(endpoint);

          body[period] = toptracks.track.map(({ artist, name, playcount }) => {
            return {
              artist: artist.name,
              playCount: playcount,
              track: name,
            };
          });
        } catch (error) {
          // ignore the error, fallback defined in body will be fine
        }
      })
    );

    const json = JSON.stringify(body);

    cache[name] = json;

    return {
      body: json,
      statusCode: OK,
    };
  } catch (error) {
    return {
      statusCode: error.message.includes(NOT_FOUND)
        ? NOT_FOUND
        : INTERNAL_SERVER_ERROR,
    };
  }
}
