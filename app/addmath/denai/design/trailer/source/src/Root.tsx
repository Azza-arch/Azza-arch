import React from 'react';
import { Composition } from 'remotion';
import { Trailer } from './Trailer';
export const Root: React.FC = () => <Composition id="DenaiTrailer" component={Trailer} durationInFrames={900} fps={30} width={1920} height={1080} />;
