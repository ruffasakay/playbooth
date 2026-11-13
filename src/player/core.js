import { createPlayer } from '@videojs/react';
import { videoFeatures } from '@videojs/react/video';

/** The one Video.js player in the booth. */
export const { Player, usePlayer } = createPlayer({ features: videoFeatures });
